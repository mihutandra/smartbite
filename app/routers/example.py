"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.auth.jwt_utils import require_admin
from app.factories.broker import get_broker_service
from app.routers.utils import (
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    PAGE_DESCRIPTION,
    PAGE_SIZE_DESCRIPTION,
)
from app.schemas.broker import BrokerOut, BrokerCreate, BrokerUpdate
from app.services.broker_service import BrokerService
from app.services.logger import LoggerService


logger = LoggerService(__name__)

router = APIRouter(
    prefix="/api/admin/brokers",
    tags=["Admin - Broker Management"],
    dependencies=[Depends(require_admin)],
)


@router.get("/", response_model=list[BrokerOut])
def list_brokers(
    page: int = Query(1, ge=1, description=PAGE_DESCRIPTION),
    page_size: int = Query(
        DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description=PAGE_SIZE_DESCRIPTION
    ),
    service: BrokerService = Depends(get_broker_service),
):

    logger.debug(f"GET /api/admin/brokers page={page}, page_size={page_size}")
    result = service.list_all(page=page, page_size=page_size)
    logger.info(f"Listed {len(result)} broker(s)")
    return result


@router.get("/{id}", response_model=BrokerOut)
def list_broker_by_id(id: UUID, service: BrokerService = Depends(get_broker_service)):
    logger.debug(f"GET /api/admin/brokers/{id}")
    result = service.list_broker_by_id(id=id)
    logger.info(f"Retrieved broker id={id}")
    return result


@router.post("/", response_model=BrokerOut, status_code=status.HTTP_201_CREATED)
def create_broker(
    payload: BrokerCreate, service: BrokerService = Depends(get_broker_service)
):
    logger.debug(f"POST /api/admin/brokers code={payload.code}")
    result = service.create(broker_data=payload)
    logger.info(f"Created broker id={result.id} code={result.code}")
    return result


@router.put("/{id}", response_model=BrokerOut)
def update_broker(
    id: UUID,
    payload: BrokerUpdate,
    service: BrokerService = Depends(get_broker_service),
):
    logger.debug(f"PUT /api/admin/brokers/{id}")
    result = service.update_broker(id=id, broker_data=payload)
    logger.info(f"Updated broker id={id}")
    return result


@router.put("/{id}/activate", response_model=BrokerOut)
def activate(id: UUID, service: BrokerService = Depends(get_broker_service)):
    logger.debug(f"PUT /api/admin/brokers/{id}/activate")
    result = service.set_active(id=id)
    logger.info(f"Activated broker id={id}")
    return result


@router.put("/{id}/deactivate", response_model=BrokerOut)
def deactivate(id: UUID, service: BrokerService = Depends(get_broker_service)):
    logger.debug(f"PUT /api/admin/brokers/{id}/deactivate")
    result = service.set_inactive(id=id)
    logger.info(f"Deactivated broker id={id}")
    return result

"""