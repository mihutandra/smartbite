from pydantic_settings import BaseSettings, SettingsConfigDict

# Read environment variables, package into Settings object
# for easy access via settings.DATABASE_URL, etc.
class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24
    
    model_config = SettingsConfigDict(
    env_file=".env",
)

# Ignore missing argument here; Pydantic will fetch from env vars at runtime.
settings = Settings() # type: ignore