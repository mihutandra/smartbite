from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from app.core.database import Base, _engine
from app.models.user import User
from app.exceptions.exceptions import DomainError
from app.routers.auth_router import router as auth_router
from app.routers.admin_router import router as admin_router

app = FastAPI(title="SmartBite Backend")

Base.metadata.create_all(bind=_engine)

app.include_router(auth_router)
app.include_router(admin_router)


@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError):
    status_map = {
        "not_found": 404,
        "already_exists": 409,
        "validation_error": 422,
        "invalid_state": 409,
        "domain_error": 400,
        "unauthorized": 401,
        "forbidden": 403,
    }

    payload = {
        "detail": str(exc),
        "code": exc.code,
        "entity": exc.entity,
        "identifier": exc.identifier,
    }

    return JSONResponse(
        status_code=status_map.get(exc.code, 400),
        content=jsonable_encoder(payload),
    )