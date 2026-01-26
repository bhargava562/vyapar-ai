"""
Authentication schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    phone_or_email: str
    
class OTPVerifyRequest(BaseModel):
    token: str
    otp: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    vendor_id: str
    
class TokenRefreshRequest(BaseModel):
    refresh_token: str