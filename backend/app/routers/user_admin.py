from uuid import UUID
import logging

from fastapi import APIRouter, Depends, Query, status

from app.auth.jwt_utils import require_admin
from app.factories.user import get_auth_service
from app.schemas.user import UserOut, UserRegisterRequest, UserUpdate
from app.services.auth import AuthService

logger = logging.getLogger(__name__)

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100
PAGE_DESCRIPTION = "Page number (starts from 1)"
PAGE_SIZE_DESCRIPTION = "Number of items per page"

router = APIRouter(
    prefix="/api/admin/users",
    tags=["Admin - User Management"],
    dependencies=[Depends(require_admin)],
)


@router.get("/", response_model=list[UserOut])
def list_users(
        page: int = Query(1, ge=1, description=PAGE_DESCRIPTION),
        page_size: int = Query(
            DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description=PAGE_SIZE_DESCRIPTION
        ),
        service: AuthService = Depends(get_auth_service),
):
    logger.debug(f"GET /api/admin/users page={page} page_size={page_size}")
    result = service.list_all(page=page, page_size=page_size)
    logger.info(f"Listed {len(result)} user(s)")
    return result


@router.get("/{id}", response_model=UserOut)
def get_user_by_id(id: UUID, service: AuthService = Depends(get_auth_service)):
    logger.debug(f"GET /api/admin/users/{id}")
    result = service.get_by_id(id=id)
    logger.info(f"Retrieved user id={id}")
    return result


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_admin_user(
        payload: UserRegisterRequest,
        service: AuthService = Depends(get_auth_service),
):
    logger.debug(f"POST /api/admin/users email={payload.email}")
    from app.models.enums import UserRole
    result = service.register(payload, role=UserRole.ADMIN)
    logger.info(f"Created admin user id={result.id} email={result.email}")
    return result


@router.put("/{id}", response_model=UserOut)
def update_user(
        id: UUID,
        payload: UserUpdate,
        service: AuthService = Depends(get_auth_service),
):
    logger.debug(f"PUT /api/admin/users/{id}")
    result = service.update_user(id=id, user_data=payload)
    logger.info(f"Updated user id={id}")
    return result


@router.put("/{id}/promote-admin", response_model=UserOut)
def promote_to_admin(id: UUID, service: AuthService = Depends(get_auth_service)):
    logger.debug(f"PUT /api/admin/users/{id}/promote-admin")
    result = service.promote_to_admin(id=id)
    logger.info(f"Promoted user id={id} to ADMIN")
    return result


@router.put("/{id}/promote-manager", response_model=UserOut)
def promote_to_manager(id: UUID, service: AuthService = Depends(get_auth_service)):
    logger.debug(f"PUT /api/admin/users/{id}/promote-manager")
    result = service.promote_to_manager(id=id)
    logger.info(f"Promoted user id={id} to MANAGER")
    return result


@router.put("/{id}/demote", response_model=UserOut)
def demote_user(id: UUID, service: AuthService = Depends(get_auth_service)):
    logger.debug(f"PUT /api/admin/users/{id}/demote")
    result = service.demote_to_user(id=id)
    logger.info(f"Demoted user id={id} to USER")
    return result