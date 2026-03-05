# Main imports
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# Package-crawling imports
import pkgutil
import importlib
import app.models


# Base class for all ORM models to inherit from
class Base(DeclarativeBase):
    pass

# Set up the database engine and session factory
_engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=_engine)

# Crawl and import all models to register them with Base
for module_info in pkgutil.walk_packages(app.models.__path__, prefix=app.models.__name__ + "."):
    importlib.import_module(module_info.name)

# Generator function to get DB session, for use in FastAPI dependencies
def get_session():
    """
    Get a new SQLAlchemy session.

    Rolls back the session if an exception occurs.
    Does not commit automatically; caller is responsible for committing if needed.
    """
    # Context manager ensures session is closed after use
    with SessionLocal() as session:
        try:
            yield session
            # Optional: commit here if we don't want caller to handle it
            # session.commit()
        except Exception:
            session.rollback()
            raise