from fastapi import APIRouter, Depends
from app.auth.jwt_utils import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def admin_dashboard(user=Depends(require_admin)):
    return {"message": "Welcome admin", "user": user}