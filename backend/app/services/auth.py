from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.jwt_utils import create_jwt_token, revoke_jwt_token
from app.core.security import hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.exceptions.exceptions import Unauthorized
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    ChangePasswordOut,
    ChangePasswordRequest,
    DeleteAccountOut,
    LogoutOut,
    ProfileUpdateRequest,
    TokenOut,
    UserOut,
    UserRegisterRequest,
    UserUpdate,
)
import logging

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, session: Session):
        self.repo = UserRepository(session)

    def _get_active_user_or_404(self, id: UUID) -> User:
        user = self.repo.get_by_id(id)
        if user is None or user.is_deleted:
            logger.warning(f"User id={id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    # ── Auth ─────────────────────────────────────────────────────────────────

    def register(self, payload: UserRegisterRequest, role: UserRole = UserRole.USER) -> UserOut:
        logger.debug(f"Registering user email={payload.email} role={role}")
        if self.repo.email_exists(payload.email):
            logger.warning(f"Registration failed - email already exists: {payload.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            role=role,
            phone=payload.phone,
            location=payload.location,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        created = self.repo.create(user)
        logger.info(f"User registered id={created.id} email={created.email} role={created.role}")
        return UserOut.model_validate(created)

    def login(self, email: str, password: str) -> TokenOut:
        logger.debug(f"Login attempt email={email}")
        user = self.repo.get_by_email(email)
        if user is None or not verify_password(password, user.password_hash):
            logger.warning(f"Login failed for email={email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = create_jwt_token(user_id=str(user.id), role=user.role)
        logger.info(f"Login successful id={user.id} email={user.email}")
        return TokenOut(access_token=token)

    def logout(self, token: str) -> LogoutOut:
        revoke_jwt_token(token)
        logger.info("User logged out and token revoked")
        return LogoutOut(message="Logged out successfully")

    def delete_account(self, id: UUID, token: str) -> DeleteAccountOut:
        logger.debug(f"Deleting account id={id}")
        user = self.repo.get_by_id(id)
        if user is None or user.is_deleted:
            logger.warning(f"Delete account failed, user id={id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        anon_suffix = uuid4().hex
        user.name = "Deleted User"
        user.email = f"deleted_{anon_suffix}@deleted.local"
        user.password_hash = hash_password(uuid4().hex)
        user.phone = None
        user.location = None
        user.latitude = None
        user.longitude = None
        user.role = UserRole.USER
        user.is_deleted = True
        user.deleted_at = datetime.now(timezone.utc)

        self.repo.update(user)
        try:
            revoke_jwt_token(token)
        except Unauthorized:
            logger.warning(f"Account deleted id={id} but token revocation failed", exc_info=True)
        logger.info(f"Account soft-deleted and anonymized id={id}")
        return DeleteAccountOut(message="Account deleted successfully")

    # ── User management ──────────────────────────────────────────────────────

    def get_by_id(self, id: UUID) -> UserOut:
        logger.debug(f"Fetching user id={id}")
        user = self._get_active_user_or_404(id)
        return UserOut.model_validate(user)

    def list_all(self, page: int, page_size: int) -> list[UserOut]:
        logger.debug(f"Listing all users page={page} page_size={page_size}")
        offset = (page - 1) * page_size
        users = self.repo.get_all(limit=page_size, offset=offset)
        logger.info(f"Retrieved {len(users)} user(s)")
        return [UserOut.model_validate(u) for u in users]

    def list_by_role(self, role: UserRole, page: int, page_size: int) -> list[UserOut]:
        logger.debug(f"Listing users role={role} page={page} page_size={page_size}")
        offset = (page - 1) * page_size
        users = self.repo.get_all_by_role(role=role, limit=page_size, offset=offset)
        logger.info(f"Retrieved {len(users)} user(s) with role={role}")
        return [UserOut.model_validate(u) for u in users]

    def update_user(self, id: UUID, user_data: UserUpdate) -> UserOut:
        logger.debug(f"Updating user id={id}")
        user = self._get_active_user_or_404(id)
        if user_data.name is not None:
            user.name = user_data.name
        if user_data.phone is not None:
            user.phone = user_data.phone
        if user_data.location is not None:
            user.location = user_data.location
        if user_data.latitude is not None:
            user.latitude = user_data.latitude
        if user_data.longitude is not None:
            user.longitude = user_data.longitude
        updated = self.repo.update(user)
        logger.info(f"User updated id={id}")
        return UserOut.model_validate(updated)

    def update_profile(self, id: UUID, profile_data: ProfileUpdateRequest) -> UserOut:
        logger.debug(f"Updating profile id={id}")
        user = self._get_active_user_or_404(id)
        fields_set = profile_data.model_fields_set

        if (
            "email" in fields_set
            and profile_data.email is not None
            and profile_data.email != user.email
        ):
            existing = self.repo.get_by_email(profile_data.email)
            if existing is not None and existing.id != user.id:
                logger.warning(f"Profile update failed - email already exists: {profile_data.email}")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered",
                )
            user.email = profile_data.email

        if "name" in fields_set and profile_data.name is not None:
            user.name = profile_data.name
        if "phone" in fields_set:
            user.phone = profile_data.phone
        if "location" in fields_set:
            user.location = profile_data.location
        if "latitude" in fields_set:
            user.latitude = profile_data.latitude
        if "longitude" in fields_set:
            user.longitude = profile_data.longitude

        updated = self.repo.update(user)
        logger.info(f"Profile updated id={id}")
        return UserOut.model_validate(updated)

    def change_password(self, id: UUID, password_data: ChangePasswordRequest) -> ChangePasswordOut:
        logger.debug(f"Changing password id={id}")
        user = self._get_active_user_or_404(id)
        if not verify_password(password_data.current_password, user.password_hash):
            logger.warning(f"Password change failed for id={id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user.password_hash = hash_password(password_data.new_password)
        self.repo.update(user)
        logger.info(f"Password changed id={id}")
        return ChangePasswordOut(message="Password changed successfully")

    def promote_to_admin(self, id: UUID) -> UserOut:
        logger.debug(f"Promoting user id={id} to ADMIN")
        user = self.repo.promote_to_admin(id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        logger.info(f"User id={id} promoted to ADMIN")
        return UserOut.model_validate(user)

    def promote_to_manager(self, id: UUID) -> UserOut:
        logger.debug(f"Promoting user id={id} to MANAGER")
        user = self.repo.promote_to_manager(id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        logger.info(f"User id={id} promoted to MANAGER")
        return UserOut.model_validate(user)

    def demote_to_user(self, id: UUID) -> UserOut:
        logger.debug(f"Demoting user id={id} to USER")
        user = self.repo.demote_to_user(id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        logger.info(f"User id={id} demoted to USER")
        return UserOut.model_validate(user)
