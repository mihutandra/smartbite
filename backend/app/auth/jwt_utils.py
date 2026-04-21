import jwt
from datetime import datetime, timedelta, timezone

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.models.enums import UserRole
import logging
from app.exceptions.exceptions import Unauthorized, Forbidden

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def create_jwt_token(user_id: str, role: UserRole | str) -> str:
    role_value = role.value if isinstance(role, UserRole) else role

    payload = {
        "sub": user_id,
        "role": role_value,
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_jwt(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = payload.get("sub")
        role = payload.get("role")

        if not user_id or not role:
            raise Unauthorized(message="Invalid token payload")

        allowed_roles = {r.value for r in UserRole}
        if role not in allowed_roles:
            raise Unauthorized(message="Invalid role in token")

        return {"user_id": user_id, "role": role}

    except jwt.ExpiredSignatureError:
        raise Unauthorized(message="Token expired")

    except jwt.InvalidTokenError:
        raise Unauthorized(message="Invalid token")


def require_role(required_role: UserRole):
    required_value = required_role.value

    def _role_dependency(user=Depends(verify_jwt)):
        if user["role"] != required_value:
            raise Forbidden(message=f"{required_value} role required")
        return user

    return _role_dependency


require_admin = require_role(UserRole.ADMIN)
require_manager = require_role(UserRole.MANAGER)
require_user = require_role(UserRole.USER)