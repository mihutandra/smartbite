"""

from fastapi import Depends
from app.services.broker_service import BrokerService
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.repositories.broker_repository import BrokerRepository


def get_broker_repository(db_session: Session = Depends(get_session)) -> BrokerRepository:
    return BrokerRepository(session=db_session)

def get_broker_service(broker_repo: BrokerRepository = Depends(get_broker_repository)) -> BrokerService:
    return BrokerService(broker_repo=broker_repo)
    
"""