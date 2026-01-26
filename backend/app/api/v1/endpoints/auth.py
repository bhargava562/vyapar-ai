"""
Authentication endpoints with OTP support, rate limiting, and session management
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from app.schemas.auth import LoginRequest, OTPVerifyRequest, AuthResponse, TokenRefreshRequest
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

# Dependency to get auth service
def get_auth_service() -> AuthService:
    return AuthService()

# Dependency to get current vendor from token
async def get_current_vendor(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> dict:
    """Get current authenticated vendor"""
    try:
        session = await auth_service.validate_session(credentials.credentials)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return session
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@router.post("/login")
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Send OTP for phone/email authentication
    
    Supports both Indian phone numbers (+91XXXXXXXXXX) and email addresses.
    Implements rate limiting (5 OTPs per hour) and brute force protection.
    """
    try:
        result = await auth_service.send_otp(request.phone_or_email)
        return {
            "success": True,
            "message": result["message"],
            "token": result["token"],
            "expires_in": result["expires_in"]
        }
    except Exception as e:
        logger.warning(f"Login attempt failed for {request.phone_or_email}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(
    request: OTPVerifyRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Verify OTP and authenticate user
    
    Creates JWT tokens and vendor session upon successful verification.
    Implements attempt limiting (3 attempts per OTP) and automatic lockout.
    """
    try:
        auth_response = await auth_service.verify_otp(request.token, request.otp)
        return auth_response
    except Exception as e:
        logger.warning(f"OTP verification failed for token {request.token}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refresh")
async def refresh_token(
    request: TokenRefreshRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Refresh access token using refresh token
    
    Generates new access token while keeping the same refresh token.
    Updates session last_used timestamp for activity tracking.
    """
    try:
        result = await auth_service.refresh_token(request.refresh_token)
        return result
    except Exception as e:
        logger.warning(f"Token refresh failed: {e}")
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout(
    current_vendor: dict = Depends(get_current_vendor),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Logout user and invalidate session
    
    Removes session from database and Redis cache.
    Requires valid authentication token.
    """
    try:
        result = await auth_service.logout(credentials.credentials)
        return result
    except Exception as e:
        logger.error(f"Logout failed for vendor {current_vendor.get('vendor_id')}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_current_user(
    current_vendor: dict = Depends(get_current_vendor),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Get current authenticated vendor information
    
    Returns vendor profile data for the authenticated user.
    Useful for frontend to get user context after login.
    """
    try:
        # Get vendor details from database
        supabase = auth_service.supabase
        result = supabase.table("vendors").select("*").eq("id", current_vendor["vendor_id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        vendor = result.data[0]
        
        # Remove sensitive information
        vendor.pop("created_at", None)
        vendor.pop("updated_at", None)
        
        return {
            "vendor": vendor,
            "session": {
                "expires_at": current_vendor["expires_at"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get current user: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user information")

@router.post("/validate")
async def validate_token(
    current_vendor: dict = Depends(get_current_vendor)
):
    """
    Validate authentication token
    
    Simple endpoint to check if a token is valid.
    Returns vendor_id and session expiry if valid.
    """
    return {
        "valid": True,
        "vendor_id": current_vendor["vendor_id"],
        "expires_at": current_vendor["expires_at"]
    }