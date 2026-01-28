"""
Authentication service with Supabase OTP support
Implements phone/email OTP generation, verification, rate limiting, and session management
"""

import secrets
import string
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
import re
import logging
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.database import get_supabase
from app.core.redis_client import get_redis
from app.schemas.auth import AuthResponse

logger = logging.getLogger(__name__)

class AuthService:
    """Authentication business logic with OTP support"""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.redis = get_redis()
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Rate limiting configuration
        self.otp_rate_limit = 5  # 5 OTPs per hour
        self.login_rate_limit = 10  # 10 login attempts per hour
        self.lockout_duration = 15 * 60  # 15 minutes in seconds
        
        # OTP configuration
        self.otp_length = 6
        self.otp_expiry = 5 * 60  # 5 minutes in seconds
        self.max_otp_attempts = 3
    
    def _generate_otp(self) -> str:
        """Generate a secure 6-digit OTP"""
        return ''.join(secrets.choice(string.digits) for _ in range(self.otp_length))
    
    def _is_valid_phone(self, phone: str) -> bool:
        """Validate Indian phone number format"""
        # Indian phone number: +91XXXXXXXXXX or 10 digits
        phone_pattern = r'^(\+91|91)?[6-9]\d{9}$'
        return bool(re.match(phone_pattern, phone.replace(' ', '').replace('-', '')))
    
    def _is_valid_email(self, email: str) -> bool:
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, email))
    
    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone number to standard format"""
        # Remove spaces and dashes
        clean_phone = phone.replace(' ', '').replace('-', '')
        
        # Add +91 if not present
        if clean_phone.startswith('91') and len(clean_phone) == 12:
            return f"+{clean_phone}"
        elif clean_phone.startswith('+91'):
            return clean_phone
        elif len(clean_phone) == 10:
            return f"+91{clean_phone}"
        
        return clean_phone
    
    async def _check_rate_limit(self, identifier: str, limit_type: str) -> Tuple[bool, int]:
        """Check rate limiting for OTP requests or login attempts"""
        cache_key = f"rate_limit:{limit_type}:{identifier}"
        
        try:
            current_count = await self.redis.get(cache_key)
            current_count = int(current_count) if current_count else 0
            
            limit = self.otp_rate_limit if limit_type == "otp" else self.login_rate_limit
            
            if current_count >= limit:
                # Check if user is in lockout
                lockout_key = f"lockout:{identifier}"
                lockout_time = await self.redis.get(lockout_key)
                
                if lockout_time:
                    remaining_time = int(lockout_time) - int(datetime.now().timestamp())
                    if remaining_time > 0:
                        return False, remaining_time
                    else:
                        # Lockout expired, reset counters
                        await self.redis.delete(cache_key)
                        await self.redis.delete(lockout_key)
                        return True, 0
                else:
                    # Set lockout
                    lockout_until = int(datetime.now().timestamp()) + self.lockout_duration
                    await self.redis.setex(lockout_key, self.lockout_duration, lockout_until)
                    return False, self.lockout_duration
            
            return True, 0
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            return True, 0  # Allow on error to prevent blocking legitimate users
    
    async def _increment_rate_limit(self, identifier: str, limit_type: str):
        """Increment rate limit counter"""
        cache_key = f"rate_limit:{limit_type}:{identifier}"
        
        try:
            current_count = await self.redis.get(cache_key)
            current_count = int(current_count) if current_count else 0
            
            # Set TTL to 1 hour for rate limiting window
            await self.redis.setex(cache_key, 3600, current_count + 1)
            
        except Exception as e:
            logger.error(f"Failed to increment rate limit: {e}")
    
    async def _store_otp(self, identifier: str, otp: str) -> str:
        """Store OTP in database and return verification token"""
        try:
            # Generate verification token
            token = secrets.token_urlsafe(32)
            
            # Hash OTP for storage
            otp_hash = self.pwd_context.hash(otp)
            
            # Store in database
            expires_at = datetime.now() + timedelta(seconds=self.otp_expiry)
            
            result = self.supabase.table("otp_verifications").insert({
                "phone_or_email": identifier,
                "otp_code": otp_hash,
                "attempts": 0,
                "verified": False,
                "expires_at": expires_at.isoformat()
            }).execute()
            
            if not result.data:
                raise Exception("Failed to store OTP in database")
            
            otp_id = result.data[0]["id"]
            
            # Store token mapping in Redis
            token_key = f"otp_token:{token}"
            await self.redis.setex(token_key, self.otp_expiry, otp_id)
            
            return token
            
        except Exception as e:
            logger.error(f"Failed to store OTP: {e}")
            raise Exception("Failed to generate OTP")
    
    async def _send_otp_notification(self, identifier: str, otp: str) -> bool:
        """Send OTP via SMS or email (mock implementation for now)"""
        try:
            # In production, integrate with SMS gateway (Twilio, AWS SNS) or email service
            # For now, just log the OTP for development
            if self._is_valid_phone(identifier):
                logger.info(f"SMS OTP for {identifier}: {otp}")
                # TODO: Integrate with SMS gateway
            else:
                logger.info(f"Email OTP for {identifier}: {otp}")
                # TODO: Integrate with email service
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send OTP notification: {e}")
            return False
    
    def _generate_jwt_tokens(self, vendor_id: str) -> Tuple[str, str]:
        """Generate JWT access and refresh tokens"""
        now = datetime.utcnow()
        
        # Access token (1 hour)
        access_payload = {
            "sub": vendor_id,
            "type": "access",
            "iat": now,
            "exp": now + timedelta(hours=1)
        }
        access_token = jwt.encode(access_payload, settings.JWT_SECRET, algorithm="HS256")
        
        # Refresh token (30 days)
        refresh_payload = {
            "sub": vendor_id,
            "type": "refresh",
            "iat": now,
            "exp": now + timedelta(days=30)
        }
        refresh_token = jwt.encode(refresh_payload, settings.JWT_SECRET, algorithm="HS256")
        
        return access_token, refresh_token
    
    async def _create_vendor_session(self, vendor_id: str, access_token: str, refresh_token: str):
        """Create vendor session in database"""
        try:
            expires_at = datetime.now() + timedelta(days=30)
            
            # Store session in database
            result = self.supabase.table("vendor_sessions").insert({
                "vendor_id": vendor_id,
                "session_token": access_token,
                "refresh_token": refresh_token,
                "expires_at": expires_at.isoformat()
            }).execute()
            
            if not result.data:
                raise Exception("Failed to create session")
            
            # Cache session in Redis for fast lookup
            session_key = f"vendor_session:{access_token}"
            session_data = {
                "vendor_id": vendor_id,
                "expires_at": expires_at.isoformat()
            }
            await self.redis.setex(session_key, 24 * 3600, session_data)  # 24 hours cache
            
        except Exception as e:
            logger.error(f"Failed to create vendor session: {e}")
            raise Exception("Failed to create session")
    
    async def send_otp(self, phone_or_email: str) -> Dict[str, Any]:
        """Send OTP for authentication"""
        try:
            # Validate input format
            if self._is_valid_phone(phone_or_email):
                identifier = self._normalize_phone(phone_or_email)
                contact_type = "phone"
            elif self._is_valid_email(phone_or_email):
                identifier = phone_or_email.lower()
                contact_type = "email"
            else:
                raise ValueError("Invalid phone number or email format")
            
            # Check rate limiting
            allowed, remaining_time = await self._check_rate_limit(identifier, "otp")
            if not allowed:
                raise Exception(f"Rate limit exceeded. Try again in {remaining_time // 60} minutes")
            
            # Generate OTP
            otp = self._generate_otp()
            
            # Store OTP and get verification token
            token = await self._store_otp(identifier, otp)
            
            # Send OTP notification
            sent = await self._send_otp_notification(identifier, otp)
            if not sent:
                raise Exception("Failed to send OTP")
            
            # Increment rate limit counter
            await self._increment_rate_limit(identifier, "otp")
            
            return {
                "success": True,
                "message": f"OTP sent to {contact_type}",
                "token": token,
                "expires_in": self.otp_expiry
            }
            
        except ValueError as e:
            logger.warning(f"Invalid input for OTP request: {e}")
            raise Exception(str(e))
        except Exception as e:
            logger.error(f"Failed to send OTP: {e}")
            raise Exception("Failed to send OTP. Please try again.")
    
    async def verify_otp(self, token: str, otp: str) -> AuthResponse:
        """Verify OTP and create session"""
        try:
            # Get OTP ID from token
            token_key = f"otp_token:{token}"
            otp_id = await self.redis.get(token_key)
            
            if not otp_id:
                raise Exception("Invalid or expired verification token")
            
            # Get OTP record from database
            result = self.supabase.table("otp_verifications").select("*").eq("id", otp_id).execute()
            
            if not result.data:
                raise Exception("OTP verification record not found")
            
            otp_record = result.data[0]
            
            # Check if OTP is expired
            expires_at = datetime.fromisoformat(otp_record["expires_at"].replace('Z', '+00:00'))
            if datetime.now(expires_at.tzinfo) > expires_at:
                raise Exception("OTP has expired")
            
            # Check if already verified
            if otp_record["verified"]:
                raise Exception("OTP already used")
            
            # Check attempt limit
            if otp_record["attempts"] >= self.max_otp_attempts:
                raise Exception("Maximum OTP attempts exceeded")
            
            # Verify OTP
            if not self.pwd_context.verify(otp, otp_record["otp_code"]):
                # Increment attempts
                self.supabase.table("otp_verifications").update({
                    "attempts": otp_record["attempts"] + 1
                }).eq("id", otp_id).execute()
                
                remaining_attempts = self.max_otp_attempts - (otp_record["attempts"] + 1)
                raise Exception(f"Invalid OTP. {remaining_attempts} attempts remaining")
            
            # Mark OTP as verified
            self.supabase.table("otp_verifications").update({
                "verified": True,
                "attempts": otp_record["attempts"] + 1
            }).eq("id", otp_id).execute()
            
            # Get or create vendor
            identifier = otp_record["phone_or_email"]
            vendor = await self._get_or_create_vendor(identifier)
            
            # Generate JWT tokens
            access_token, refresh_token = self._generate_jwt_tokens(vendor["id"])
            
            # Create session
            await self._create_vendor_session(vendor["id"], access_token, refresh_token)
            
            # Clean up token
            await self.redis.delete(token_key)
            
            return AuthResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                vendor_id=vendor["id"]
            )
            
        except Exception as e:
            logger.error(f"OTP verification failed: {e}")
            raise Exception(str(e))
    
    async def _get_or_create_vendor(self, identifier: str) -> Dict[str, Any]:
        """Get existing vendor or create new one"""
        try:
            # Check if vendor exists
            if self._is_valid_phone(identifier):
                result = self.supabase.table("vendors").select("*").eq("phone_number", identifier).execute()
            else:
                result = self.supabase.table("vendors").select("*").eq("email", identifier).execute()
            
            if result.data:
                # Update last_active
                vendor = result.data[0]
                self.supabase.table("vendors").update({
                    "last_active": datetime.now().isoformat()
                }).eq("id", vendor["id"]).execute()
                
                return vendor
            
            # Create new vendor
            vendor_data = {
                "name": "",  # Will be set during profile setup
                "market_location": "",  # Will be set during profile setup
                "preferred_language": "hi",  # Default to Hindi
                "status": "active",
                "last_active": datetime.now().isoformat()
            }
            
            if self._is_valid_phone(identifier):
                vendor_data["phone_number"] = identifier
            else:
                vendor_data["email"] = identifier
                # Generate a placeholder phone number for database constraint
                vendor_data["phone_number"] = f"+91{secrets.randbelow(9000000000) + 1000000000}"
            
            result = self.supabase.table("vendors").insert(vendor_data).execute()
            
            if not result.data:
                raise Exception("Failed to create vendor")
            
            return result.data[0]
            
        except Exception as e:
            logger.error(f"Failed to get or create vendor: {e}")
            raise Exception("Failed to process vendor account")
    
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token"""
        try:
            # Verify refresh token
            payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=["HS256"])
            
            if payload.get("type") != "refresh":
                raise Exception("Invalid token type")
            
            vendor_id = payload.get("sub")
            if not vendor_id:
                raise Exception("Invalid token payload")
            
            # Check if session exists and is valid
            result = self.supabase.table("vendor_sessions").select("*").eq("refresh_token", refresh_token).execute()
            
            if not result.data:
                raise Exception("Session not found")
            
            session = result.data[0]
            expires_at = datetime.fromisoformat(session["expires_at"].replace('Z', '+00:00'))
            
            if datetime.now(expires_at.tzinfo) > expires_at:
                # Clean up expired session
                self.supabase.table("vendor_sessions").delete().eq("id", session["id"]).execute()
                raise Exception("Session expired")
            
            # Generate new access token
            access_token, _ = self._generate_jwt_tokens(vendor_id)
            
            # Update session with new access token
            self.supabase.table("vendor_sessions").update({
                "session_token": access_token,
                "last_used": datetime.now().isoformat()
            }).eq("id", session["id"]).execute()
            
            # Update Redis cache
            session_key = f"vendor_session:{access_token}"
            session_data = {
                "vendor_id": vendor_id,
                "expires_at": expires_at.isoformat()
            }
            await self.redis.setex(session_key, 24 * 3600, session_data)
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 3600
            }
            
        except JWTError as e:
            logger.warning(f"JWT error during token refresh: {e}")
            raise Exception("Invalid refresh token")
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            raise Exception("Failed to refresh token")
    
    async def logout(self, access_token: str) -> Dict[str, str]:
        """Logout user and invalidate session"""
        try:
            # Remove session from database
            result = self.supabase.table("vendor_sessions").delete().eq("session_token", access_token).execute()
            
            # Remove from Redis cache
            session_key = f"vendor_session:{access_token}"
            await self.redis.delete(session_key)
            
            return {"message": "Logged out successfully"}
            
        except Exception as e:
            logger.error(f"Logout failed: {e}")
            raise Exception("Failed to logout")
    
    async def validate_session(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Validate session and return vendor info"""
        try:
            # Check Redis cache first
            session_key = f"vendor_session:{access_token}"
            cached_session = await self.redis.get(session_key)
            
            if cached_session:
                expires_at = datetime.fromisoformat(cached_session["expires_at"].replace('Z', '+00:00'))
                if datetime.now(expires_at.tzinfo) <= expires_at:
                    return cached_session
            
            # Verify JWT token
            payload = jwt.decode(access_token, settings.JWT_SECRET, algorithms=["HS256"])
            
            if payload.get("type") != "access":
                return None
            
            vendor_id = payload.get("sub")
            
            # Get session from database
            result = self.supabase.table("vendor_sessions").select("*").eq("session_token", access_token).execute()
            
            if not result.data:
                return None
            
            session = result.data[0]
            expires_at = datetime.fromisoformat(session["expires_at"].replace('Z', '+00:00'))
            
            if datetime.now(expires_at.tzinfo) > expires_at:
                # Clean up expired session
                self.supabase.table("vendor_sessions").delete().eq("id", session["id"]).execute()
                await self.redis.delete(session_key)
                return None
            
            # Update last_used
            self.supabase.table("vendor_sessions").update({
                "last_used": datetime.now().isoformat()
            }).eq("id", session["id"]).execute()
            
            return {
                "vendor_id": vendor_id,
                "expires_at": expires_at.isoformat()
            }
            
        except JWTError:
            return None
        except Exception as e:
            logger.error(f"Session validation failed: {e}")
            return None