"""
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.broker import Broker
from app.models.enums import BrokerStatus
from app.services.logger import LoggerService

logger = LoggerService(__name__)

class BrokerRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: UUID) -> Broker | None:
        logger.debug(f"Fetching broker id={id}")
        stmt = select(Broker).where(Broker.id == id)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info(f"Found broker id={id} code={result.code}")
        else:
            logger.warning(f"Broker id={id} not found")
        return result

    def get_by_code(self, code: str) -> Broker | None:
        logger.debug(f"Fetching broker by code={code}")
        stmt = select(Broker).where(Broker.code == code)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info(f"Found broker code={code}")
        else:
            logger.warning(f"Broker code={code} not found")
        return result
    
    def get_by_name(self, name: str) -> Broker | None:
        logger.debug(f"Fetching broker by name={name}")
        stmt = select(Broker).where(Broker.name == name)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info(f"Found broker name={name}")
        else:
            logger.warning(f"Broker name={name} not found")
        return result

    def get_all(self, limit: int, offset: int) -> list[Broker]:
        logger.debug(f"Fetching all brokers limit={limit}, offset={offset}")
        stmt = select(Broker).order_by(Broker.name).limit(limit).offset(offset)
        result = list(self.session.scalars(stmt).all())
        logger.info(f"Retrieved {len(result)} broker(s)")
        return result

    def create(self, broker: Broker) -> Broker:
        logger.debug(f"Creating broker code={broker.code}, name={broker.name}")
        self.session.add(broker)
        self.session.commit()
        self.session.refresh(broker)
        logger.info(f"Broker created id={broker.id} code={broker.code}")
        return broker

    def update(self, broker: Broker) -> Broker:
        logger.debug(f"Updating broker id={broker.id}")
        self.session.add(broker)
        self.session.commit()
        self.session.refresh(broker)
        logger.info(f"Broker updated id={broker.id}")
        return broker

    def set_active(self, id: UUID) -> Broker | None:
        logger.debug(f"Activating broker id={id}")
        broker = self.get_by_id(id)
        if not broker:
            logger.warning(f"Broker id={id} not found for activation")
            return None
        broker.status = BrokerStatus.ACTIVE
        self.session.commit()
        self.session.refresh(broker)
        logger.info(f"Broker activated id={id}")
        return broker

    def set_inactive(self, id: UUID) -> Broker | None:
        logger.debug(f"Deactivating broker id={id}")
        broker = self.get_by_id(id)
        if not broker:
            logger.warning(f"Broker id={id} not found for deactivation")
            return None
        from app.models.enums import BrokerStatus
        broker.status = BrokerStatus.INACTIVE
        self.session.commit()
        self.session.refresh(broker)
        logger.info(f"Broker deactivated id={id}")
        return broker
"""