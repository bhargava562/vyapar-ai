"""
Vendor management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List

from app.schemas.vendor import (
    VendorProfile, 
    VendorProfileUpdate, 
    VendorProfileCreate,
    VendorProfileCompletion,
    VendorStatistics,
    VendorSearchResult
)
from app.services.vendor_service import VendorService
from app.services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

# Dependency to get current vendor from token
async def get_current_vendor(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract vendor ID from JWT token"""
    auth_service = AuthService()
    session = await auth_service.validate_session(credentials.credentials)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return session["vendor_id"]

@router.get("/profile", response_model=VendorProfile)
async def get_profile(vendor_id: str = Depends(get_current_vendor)):
    """Get vendor profile"""
    vendor_service = VendorService()
    
    profile = await vendor_service.get_vendor_profile(vendor_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    # Update activity timestamp
    await vendor_service.update_vendor_activity(vendor_id)
    
    return profile

@router.put("/profile", response_model=VendorProfile)
async def update_profile(
    profile_update: VendorProfileUpdate,
    vendor_id: str = Depends(get_current_vendor)
):
    """Update vendor profile"""
    vendor_service = VendorService()
    
    try:
        updated_profile = await vendor_service.update_vendor_profile(vendor_id, profile_update)
        if not updated_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found"
            )
        
        return updated_profile
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.post("/profile", response_model=VendorProfile)
async def create_profile(
    profile_data: VendorProfileCreate,
    vendor_id: str = Depends(get_current_vendor)
):
    """Create vendor profile (for completing initial setup)"""
    vendor_service = VendorService()
    
    try:
        # Check if profile already exists
        existing_profile = await vendor_service.get_vendor_profile(vendor_id)
        if existing_profile and existing_profile.name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Profile already exists"
            )
        
        # Update the existing vendor record with profile data
        profile_update = VendorProfileUpdate(
            name=profile_data.name,
            stall_id=profile_data.stall_id,
            market_location=profile_data.market_location,
            email=profile_data.email,
            preferred_language=profile_data.preferred_language
        )
        
        updated_profile = await vendor_service.update_vendor_profile(vendor_id, profile_update)
        if not updated_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found"
            )
        
        return updated_profile
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create profile"
        )

@router.delete("/profile")
async def delete_profile(vendor_id: str = Depends(get_current_vendor)):
    """Delete vendor profile (soft delete)"""
    vendor_service = VendorService()
    
    success = await vendor_service.delete_vendor_profile(vendor_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    return {"message": "Profile deleted successfully"}

@router.get("/profile/completion", response_model=VendorProfileCompletion)
async def get_profile_completion(vendor_id: str = Depends(get_current_vendor)):
    """Get profile completion status"""
    vendor_service = VendorService()
    
    completion_status = await vendor_service.check_profile_completion(vendor_id)
    return VendorProfileCompletion(**completion_status)

@router.get("/statistics", response_model=VendorStatistics)
async def get_vendor_statistics(vendor_id: str = Depends(get_current_vendor)):
    """Get vendor statistics"""
    vendor_service = VendorService()
    
    stats = await vendor_service.get_vendor_statistics(vendor_id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor statistics not found"
        )
    
    return VendorStatistics(**stats)

@router.get("/search", response_model=VendorSearchResult)
async def search_vendors(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results"),
    vendor_id: str = Depends(get_current_vendor)  # Require authentication
):
    """Search vendors by name or market location"""
    vendor_service = VendorService()
    
    vendors = await vendor_service.search_vendors(q, limit)
    
    return VendorSearchResult(
        vendors=vendors,
        total_count=len(vendors),
        query=q
    )

@router.get("/market/{market_location}", response_model=List[VendorProfile])
async def get_vendors_by_market(
    market_location: str,
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    vendor_id: str = Depends(get_current_vendor)  # Require authentication
):
    """Get vendors in a specific market location"""
    vendor_service = VendorService()
    
    vendors = await vendor_service.get_vendors_by_market(market_location, limit)
    return vendors

@router.get("/dashboard")
async def get_dashboard(vendor_id: str = Depends(get_current_vendor)):
    """Get vendor dashboard data"""
    vendor_service = VendorService()
    
    # Get profile and statistics
    profile = await vendor_service.get_vendor_profile(vendor_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    stats = await vendor_service.get_vendor_statistics(vendor_id)
    completion = await vendor_service.check_profile_completion(vendor_id)
    
    # Update activity
    await vendor_service.update_vendor_activity(vendor_id)
    
    return {
        "profile": profile,
        "statistics": stats,
        "completion": completion,
        "dashboard_data": {
            "recent_activity": "No recent activity",  # TODO: Implement in future tasks
            "notifications_count": 0,  # TODO: Implement in future tasks
            "pending_actions": []  # TODO: Implement in future tasks
        }
    }