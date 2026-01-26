"""
API v1 router configuration
"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, vendor, ppi, fpc, voice, crowd, admin

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(vendor.router, prefix="/vendor", tags=["vendor"])
api_router.include_router(ppi.router, prefix="/ppi", tags=["ppi"])
api_router.include_router(fpc.router, prefix="/fpc", tags=["fpc"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(crowd.router, prefix="/crowd", tags=["crowdsourced"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])