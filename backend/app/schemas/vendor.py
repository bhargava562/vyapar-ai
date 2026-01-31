"""
Vendor schemas
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime

class VendorProfile(BaseModel):
    id: str
    name: str
    stall_id: Optional[str]
    market_location: str
    phone_number: str
    email: Optional[str]
    preferred_language: str
    role: str = "farmer"
    state: Optional[str] = None
    district: Optional[str] = None
    points: int
    status: str
    created_at: datetime
    last_active: datetime
    updated_at: Optional[datetime] = None

class VendorProfileCreate(BaseModel):
    name: str
    stall_id: Optional[str] = None
    market_location: str
    phone_number: str
    email: Optional[str] = None
    role: str = "farmer"
    state: Optional[str] = None
    district: Optional[str] = None
    preferred_language: str = "hi"
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if len(v) > 255:
            raise ValueError('Name must be less than 255 characters')
        return v.strip()
    
    @field_validator('market_location')
    @classmethod
    def validate_market_location(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Market location must be at least 2 characters long')
        if len(v) > 255:
            raise ValueError('Market location must be less than 255 characters')
        return v.strip()
    
    @field_validator('stall_id')
    @classmethod
    def validate_stall_id(cls, v):
        if v and len(v) > 100:
            raise ValueError('Stall ID must be less than 100 characters')
        return v.strip() if v else None
    
    @field_validator('preferred_language')
    @classmethod
    def validate_language(cls, v):
        supported_languages = ['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or']
        if v not in supported_languages:
            raise ValueError(f'Unsupported language. Supported: {", ".join(supported_languages)}')
        return v

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        valid_roles = ['farmer', 'trader', 'buyer']
        if v and v.lower() not in valid_roles:
            raise ValueError(f'Invalid role. Must be one of: {", ".join(valid_roles)}')
        return v.lower() if v else 'farmer'

class VendorProfileUpdate(BaseModel):
    name: Optional[str] = None
    stall_id: Optional[str] = None
    market_location: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    preferred_language: Optional[str] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None:
            if not v or len(v.strip()) < 2:
                raise ValueError('Name must be at least 2 characters long')
            if len(v) > 255:
                raise ValueError('Name must be less than 255 characters')
            return v.strip()
        return v
    
    @field_validator('market_location')
    @classmethod
    def validate_market_location(cls, v):
        if v is not None:
            if not v or len(v.strip()) < 2:
                raise ValueError('Market location must be at least 2 characters long')
            if len(v) > 255:
                raise ValueError('Market location must be less than 255 characters')
            return v.strip()
        return v
    
    @field_validator('stall_id')
    @classmethod
    def validate_stall_id(cls, v):
        if v is not None and len(v) > 100:
            raise ValueError('Stall ID must be less than 100 characters')
        return v.strip() if v else None
    
    @field_validator('preferred_language')
    @classmethod
    def validate_language(cls, v):
        if v is not None:
            supported_languages = ['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or']
            if v not in supported_languages:
                raise ValueError(f'Unsupported language. Supported: {", ".join(supported_languages)}')
        return v

class VendorProfileCompletion(BaseModel):
    is_complete: bool
    completion_percentage: int
    missing_fields: List[str]
    completed_optional: List[str]
    next_step: str

class VendorStatistics(BaseModel):
    vendor_id: str
    points: int
    submissions_count: int
    fpc_count: int
    achievements_count: int
    member_since: datetime
    last_active: datetime
    status: str

class VendorSearchResult(BaseModel):
    vendors: List[VendorProfile]
    total_count: int
    query: str