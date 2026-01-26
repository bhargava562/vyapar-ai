"""
Crowdsourced data schemas
"""

from pydantic import BaseModel
from datetime import datetime

class PriceSubmission(BaseModel):
    vendor_id: str
    product_id: str
    price: float
    quantity: float
    market_location: str
    submission_method: str  # 'voice' or 'manual'

class SubmissionResult(BaseModel):
    id: str
    status: str  # 'pending', 'approved', 'rejected'
    points_awarded: int
    message: str

class LocalPriceData(BaseModel):
    product_id: str
    average_price: float
    price_range: dict
    submission_count: int
    last_updated: datetime