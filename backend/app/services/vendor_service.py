"""
Vendor profile management service
Handles CRUD operations, multilingual profile setup, and voice input support
"""

import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID

from app.core.database import get_supabase
from app.core.redis_client import get_redis
from app.schemas.vendor import VendorProfile, VendorProfileUpdate, VendorProfileCreate

logger = logging.getLogger(__name__)

class VendorService:
    """Vendor profile business logic"""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.redis = get_redis()
        
        # Supported languages for multilingual profiles
        self.supported_languages = ['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or']
        
        # Default profile completion requirements
        self.required_fields = ['name', 'market_location', 'preferred_language', 'role']
        self.optional_fields = ['stall_id', 'email', 'state', 'district']
    
    async def get_vendor_profile(self, vendor_id: str) -> Optional[VendorProfile]:
        """Get vendor profile by ID"""
        try:
            result = self.supabase.table("vendors").select("*").eq("id", vendor_id).execute()
            
            if not result.data:
                return None
            
            vendor_data = result.data[0]
            
            # Cache profile in Redis for faster access
            cache_key = f"vendor_profile:{vendor_id}"
            await self.redis.setex(cache_key, 3600, vendor_data)  # 1 hour cache
            
            return VendorProfile(**vendor_data)
            
        except Exception as e:
            logger.error(f"Failed to get vendor profile {vendor_id}: {e}")
            return None
    
    async def create_vendor_profile(self, vendor_data: VendorProfileCreate) -> Optional[VendorProfile]:
        """Create new vendor profile"""
        logger.info(f"Creating vendor profile for {vendor_data.name} (Role: {vendor_data.role})")
        try:
            # Validate language preference
            if vendor_data.preferred_language not in self.supported_languages:
                raise ValueError(f"Unsupported language: {vendor_data.preferred_language}")
            
            # Prepare vendor data
            profile_data = {
                "name": vendor_data.name,
                "stall_id": vendor_data.stall_id,
                "market_location": vendor_data.market_location,
                "phone_number": vendor_data.phone_number,
                "email": vendor_data.email,
                "role": vendor_data.role,
                "state": vendor_data.state,
                "district": vendor_data.district,
                "preferred_language": vendor_data.preferred_language,
                "points": 0,
                "status": "active",
                "last_active": datetime.now().isoformat(),
                "created_at": datetime.now().isoformat()
            }
            
            # Remove None values
            profile_data = {k: v for k, v in profile_data.items() if v is not None}
            
            result = self.supabase.table("vendors").insert(profile_data).execute()
            
            if not result.data:
                raise Exception("Failed to create vendor profile")
            
            created_vendor = result.data[0]
            
            # Cache the new profile
            cache_key = f"vendor_profile:{created_vendor['id']}"
            await self.redis.setex(cache_key, 3600, created_vendor)
            
            # Log profile creation
            await self._log_profile_action(created_vendor['id'], "profile_created", {}, created_vendor)
            
            return VendorProfile(**created_vendor)
            
        except Exception as e:
            logger.error(f"Failed to create vendor profile: {e}")
            raise Exception(f"Failed to create profile: {str(e)}")
    
    async def update_vendor_profile(self, vendor_id: str, updates: VendorProfileUpdate) -> Optional[VendorProfile]:
        """Update vendor profile"""
        logger.debug(f"Updating vendor {vendor_id} with data: {updates.model_dump(exclude_unset=True)}")
        try:
            # Get current profile for comparison
            current_profile = await self.get_vendor_profile(vendor_id)
            if not current_profile:
                raise Exception("Vendor profile not found")
            
            # Prepare update data
            update_data = {}
            
            if updates.name is not None:
                update_data["name"] = updates.name
            
            if updates.stall_id is not None:
                update_data["stall_id"] = updates.stall_id
            
            if updates.market_location is not None:
                update_data["market_location"] = updates.market_location
            
            if updates.email is not None:
                update_data["email"] = updates.email
            
            if updates.preferred_language is not None:
                if updates.preferred_language not in self.supported_languages:
                    raise ValueError(f"Unsupported language: {updates.preferred_language}")
                update_data["preferred_language"] = updates.preferred_language

            if updates.role is not None:
                update_data["role"] = updates.role
            
            if updates.state is not None:
                update_data["state"] = updates.state
                
            if updates.district is not None:
                update_data["district"] = updates.district
            
            if not update_data:
                return current_profile  # No changes to make
            
            # Add updated timestamp
            update_data["updated_at"] = datetime.now().isoformat()
            
            # Update in database
            result = self.supabase.table("vendors").update(update_data).eq("id", vendor_id).execute()
            
            if not result.data:
                raise Exception("Failed to update vendor profile")
            
            updated_vendor = result.data[0]
            
            # Update cache
            cache_key = f"vendor_profile:{vendor_id}"
            await self.redis.setex(cache_key, 3600, updated_vendor)
            
            # Log profile update
            await self._log_profile_action(vendor_id, "profile_updated", current_profile.model_dump(), updated_vendor)
            
            return VendorProfile(**updated_vendor)
            
        except Exception as e:
            logger.error(f"Failed to update vendor profile {vendor_id}: {e}")
            raise Exception(f"Failed to update profile: {str(e)}")
    
    async def delete_vendor_profile(self, vendor_id: str) -> bool:
        """Delete vendor profile (soft delete by setting status to inactive)"""
        try:
            # Get current profile for logging
            current_profile = await self.get_vendor_profile(vendor_id)
            if not current_profile:
                raise Exception("Vendor profile not found")
            
            # Soft delete by updating status
            update_data = {
                "status": "inactive",
                "updated_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table("vendors").update(update_data).eq("id", vendor_id).execute()
            
            if not result.data:
                raise Exception("Failed to delete vendor profile")
            
            # Remove from cache
            cache_key = f"vendor_profile:{vendor_id}"
            await self.redis.delete(cache_key)
            
            # Log profile deletion
            await self._log_profile_action(vendor_id, "profile_deleted", current_profile.model_dump(), {})
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete vendor profile {vendor_id}: {e}")
            return False
    
    async def check_profile_completion(self, vendor_id: str) -> Dict[str, Any]:
        """Check if vendor profile is complete and return completion status"""
        try:
            profile = await self.get_vendor_profile(vendor_id)
            if not profile:
                return {
                    "is_complete": False,
                    "completion_percentage": 0,
                    "missing_fields": self.required_fields,
                    "next_step": "create_profile"
                }
            
            # Check required fields
            missing_required = []
            for field in self.required_fields:
                value = getattr(profile, field, None)
                if not value or (isinstance(value, str) and value.strip() == ""):
                    missing_required.append(field)
            
            # Check optional fields for completion percentage
            completed_optional = []
            for field in self.optional_fields:
                value = getattr(profile, field, None)
                if value and (not isinstance(value, str) or value.strip() != ""):
                    completed_optional.append(field)
            
            # Calculate completion percentage
            total_fields = len(self.required_fields) + len(self.optional_fields)
            completed_fields = (len(self.required_fields) - len(missing_required)) + len(completed_optional)
            completion_percentage = int((completed_fields / total_fields) * 100)
            
            is_complete = len(missing_required) == 0
            
            # Determine next step
            next_step = None
            if missing_required:
                next_step = f"complete_{missing_required[0]}"
            elif len(completed_optional) < len(self.optional_fields):
                remaining_optional = [f for f in self.optional_fields if f not in completed_optional]
                next_step = f"add_{remaining_optional[0]}"
            else:
                next_step = "profile_complete"
            
            return {
                "is_complete": is_complete,
                "completion_percentage": completion_percentage,
                "missing_fields": missing_required,
                "completed_optional": completed_optional,
                "next_step": next_step
            }
            
        except Exception as e:
            logger.error(f"Failed to check profile completion for {vendor_id}: {e}")
            return {
                "is_complete": False,
                "completion_percentage": 0,
                "missing_fields": self.required_fields,
                "next_step": "error"
            }
    
    async def get_vendors_by_market(self, market_location: str, limit: int = 50) -> List[VendorProfile]:
        """Get vendors in a specific market location"""
        try:
            result = self.supabase.table("vendors").select("*").eq("market_location", market_location).eq("status", "active").limit(limit).execute()
            
            if not result.data:
                return []
            
            return [VendorProfile(**vendor) for vendor in result.data]
            
        except Exception as e:
            logger.error(f"Failed to get vendors by market {market_location}: {e}")
            return []
    
    async def search_vendors(self, query: str, limit: int = 20) -> List[VendorProfile]:
        """Search vendors by name or market location"""
        try:
            # Use ilike for case-insensitive search
            result = self.supabase.table("vendors").select("*").or_(
                f"name.ilike.%{query}%,market_location.ilike.%{query}%"
            ).eq("status", "active").limit(limit).execute()
            
            if not result.data:
                return []
            
            return [VendorProfile(**vendor) for vendor in result.data]
            
        except Exception as e:
            logger.error(f"Failed to search vendors with query '{query}': {e}")
            return []
    
    async def update_vendor_activity(self, vendor_id: str) -> bool:
        """Update vendor's last activity timestamp"""
        try:
            update_data = {
                "last_active": datetime.now().isoformat()
            }
            
            result = self.supabase.table("vendors").update(update_data).eq("id", vendor_id).execute()
            
            # Update cache if exists
            cache_key = f"vendor_profile:{vendor_id}"
            cached_profile = await self.redis.get(cache_key)
            if cached_profile:
                cached_profile["last_active"] = update_data["last_active"]
                await self.redis.setex(cache_key, 3600, cached_profile)
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Failed to update vendor activity for {vendor_id}: {e}")
            return False
    
    async def get_vendor_statistics(self, vendor_id: str) -> Dict[str, Any]:
        """Get vendor statistics (points, submissions, etc.)"""
        try:
            # Get basic profile
            profile = await self.get_vendor_profile(vendor_id)
            if not profile:
                return {}
            
            # Get price submissions count
            submissions_result = self.supabase.table("price_submissions").select("id", count="exact").eq("vendor_id", vendor_id).execute()
            submissions_count = submissions_result.count or 0
            
            # Get FPC count
            fpc_result = self.supabase.table("fair_price_certificates").select("id", count="exact").eq("vendor_id", vendor_id).execute()
            fpc_count = fpc_result.count or 0
            
            # Get achievements count
            achievements_result = self.supabase.table("achievements").select("id", count="exact").eq("vendor_id", vendor_id).execute()
            achievements_count = achievements_result.count or 0
            
            return {
                "vendor_id": vendor_id,
                "points": profile.points,
                "submissions_count": submissions_count,
                "fpc_count": fpc_count,
                "achievements_count": achievements_count,
                "member_since": profile.created_at,
                "last_active": profile.last_active,
                "status": profile.status
            }
            
        except Exception as e:
            logger.error(f"Failed to get vendor statistics for {vendor_id}: {e}")
            return {}
    
    async def _log_profile_action(self, vendor_id: str, action: str, old_values: Dict, new_values: Dict):
        """Log profile actions for audit trail"""
        try:
            audit_data = {
                "user_id": vendor_id,
                "user_type": "vendor",
                "action": action,
                "resource_type": "vendor_profile",
                "resource_id": vendor_id,
                "old_values": old_values,
                "new_values": new_values,
                "created_at": datetime.now().isoformat()
            }
            
            self.supabase.table("audit_logs").insert(audit_data).execute()
            
        except Exception as e:
            logger.error(f"Failed to log profile action: {e}")
            # Don't raise exception for logging failures
    
    async def validate_profile_data(self, profile_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Validate profile data and return validation errors"""
        errors = {}
        
        # Validate name
        if 'name' in profile_data:
            name = profile_data['name']
            if not name or len(name.strip()) < 2:
                errors['name'] = ['Name must be at least 2 characters long']
            elif len(name) > 255:
                errors['name'] = ['Name must be less than 255 characters']
        
        # Validate market location
        if 'market_location' in profile_data:
            location = profile_data['market_location']
            if not location or len(location.strip()) < 2:
                errors['market_location'] = ['Market location must be at least 2 characters long']
            elif len(location) > 255:
                errors['market_location'] = ['Market location must be less than 255 characters']
        
        # Validate stall ID
        if 'stall_id' in profile_data and profile_data['stall_id']:
            stall_id = profile_data['stall_id']
            if len(stall_id) > 100:
                errors['stall_id'] = ['Stall ID must be less than 100 characters']
        
        # Validate email
        if 'email' in profile_data and profile_data['email']:
            email = profile_data['email']
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                errors['email'] = ['Invalid email format']
        
        # Validate language
        if 'preferred_language' in profile_data:
            language = profile_data['preferred_language']
            if language not in self.supported_languages:
                errors['preferred_language'] = [f'Unsupported language. Supported: {", ".join(self.supported_languages)}']
        
        return errors