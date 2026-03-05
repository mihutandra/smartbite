from app.services.logger import LoggerService
from passlib.context import CryptContext

logger = LoggerService(__name__)

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    logger.info("Hashing password")
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    logger.info("Verifying password")
    return pwd_context.verify(password, hashed)
