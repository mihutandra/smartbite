from fastapi import FastAPI
from fastapi import Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.exceptions.exceptions import DomainError
from app.routers.product import router as product_router
from app.routers.supermarket_product import router as supermarket_product_router
from app.routers.supermarket import router as supermarket_router
from app.routers.auth import router as auth_router
from app.routers.reservation import router as reservation_router
from app.routers.shopping_cart import router as shopping_cart_router
from app.routers.profile import router as profile_router
from app.routers.user_admin import router as user_admin_router

app = FastAPI(title="SmartBite Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError):
    status_map = {
        "not_found": 404,
        "already_exists": 409,
        "validation_error": 422,
        "invalid_state": 409,
        "status_error": 409,
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

#app.include_router(auth_router)
app.include_router(product_router)
app.include_router(supermarket_product_router)
app.include_router(supermarket_router)
app.include_router(shopping_cart_router)
app.include_router(reservation_router)
app.include_router(profile_router)


app.include_router(auth_router)
app.include_router(user_admin_router)
