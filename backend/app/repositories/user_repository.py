from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    # ── Lookups ──────────────────────────────────────────────────────────────

    def get_by_id(self, id: UUID) -> User | None:
        logger.debug(f"Fetching user id={id}")
        stmt = select(User).where(User.id == id)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info(f"Found user id={id} email={result.email}")
        else:
            logger.warning(f"User id={id} not found")
        return result

    def get_by_email(self, email: str) -> User | None:
        logger.debug(f"Fetching user by email={email}")
        stmt = select(User).where(User.email == email)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info(f"Found user email={email}")
        else:
            logger.warning(f"User email={email} not found")
        return result

    def get_by_name(self, name: str) -> User | None:
        logger.debug(f"Fetching user by name={name}")
        stmt = select(User).where(User.name == name)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info(f"Found user name={name}")
        else:
            logger.warning(f"User name={name} not found")
        return result

    # ── Collections ──────────────────────────────────────────────────────────

    def get_all(self, limit: int, offset: int) -> list[User]:
        logger.debug(f"Fetching all users limit={limit}, offset={offset}")
        stmt = select(User).order_by(User.name).limit(limit).offset(offset)
        result = list(self.session.scalars(stmt).all())
        logger.info(f"Retrieved {len(result)} user(s)")
        return result

    def get_all_by_role(self, role: UserRole, limit: int, offset: int) -> list[User]:
        logger.debug(f"Fetching users by role={role} limit={limit}, offset={offset}")
        stmt = (
            select(User)
            .where(User.role == role)
            .order_by(User.name)
            .limit(limit)
            .offset(offset)
        )
        result = list(self.session.scalars(stmt).all())
        logger.info(f"Retrieved {len(result)} user(s) with role={role}")
        return result

    # ── Writes ───────────────────────────────────────────────────────────────

    def create(self, user: User) -> User:
        logger.debug(f"Creating user email={user.email}, role={user.role}")
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        logger.info(f"User created id={user.id} email={user.email}")
        return user

    def update(self, user: User) -> User:
        logger.debug(f"Updating user id={user.id}")
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        logger.info(f"User updated id={user.id}")
        return user

    # ── Role management ──────────────────────────────────────────────────────

    def set_role(self, id: UUID, role: UserRole) -> User | None:
        logger.debug(f"Setting role={role} for user id={id}")
        user = self.get_by_id(id)
        if not user:
            logger.warning(f"User id={id} not found for role update")
            return None
        user.role = role
        self.session.commit()
        self.session.refresh(user)
        logger.info(f"User id={id} role set to {role}")
        return user

    def promote_to_admin(self, id: UUID) -> User | None:
        logger.debug(f"Promoting user id={id} to ADMIN")
        return self.set_role(id, UserRole.ADMIN)

    def promote_to_manager(self, id: UUID) -> User | None:
        logger.debug(f"Promoting user id={id} to MANAGER")
        return self.set_role(id, UserRole.MANAGER)

    def demote_to_user(self, id: UUID) -> User | None:
        logger.debug(f"Demoting user id={id} to USER")
        return self.set_role(id, UserRole.USER)

    # ── Helpers ──────────────────────────────────────────────────────────────

    def email_exists(self, email: str) -> bool:
        return self.get_by_email(email) is not None