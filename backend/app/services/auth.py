from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.jwt_utils import create_jwt_token
from app.core.security import hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import TokenOut, UserOut, UserRegisterRequest, UserUpdate
import logging

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, session: Session):
        self.repo = UserRepository(session)

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

    # ── User management ──────────────────────────────────────────────────────

    def get_by_id(self, id: UUID) -> UserOut:
        logger.debug(f"Fetching user id={id}")
        user = self.repo.get_by_id(id)
        if user is None:
            logger.warning(f"User id={id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
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
        user = self.repo.get_by_id(id)
        if user is None:
            logger.warning(f"User id={id} not found for update")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
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