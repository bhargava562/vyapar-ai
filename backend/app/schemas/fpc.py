"""
Fair Price Certificate schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FPCRequest(BaseModel):
    vendor_id: str
    product_id: str
    price: float
    quantity: float
    ppi_reference: Optional[str] = None

class FPCResult(BaseModel):
    id: str
    qr_code: str  # Base64 encoded QR image
    qr_data: str  # Encrypted and signed QR data
    signature: str  # HMAC signature for authenticity
    expires_at: str
    share_url: str

class FPCVerification(BaseModel):
    valid: bool
    fpc_id: Optional[str]
    vendor_name: Optional[str]
    product_name: Optional[str]
    price: Optional[float]
    expires_at: Optional[str]
    message: str