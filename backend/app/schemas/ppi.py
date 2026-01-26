"""
PPI (Price Power Index) schemas
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PPIFactor(BaseModel):
    type: str  # 'wholesale', 'weather', 'crowdsourced', 'historical'
    weight: float
    value: float
    impact: str  # 'positive', 'negative', 'neutral'
    description: str

class PPIRequest(BaseModel):
    product_id: str
    quantity: float
    market_location: str
    vendor_id: str

class PPIResult(BaseModel):
    ppi: int  # 0-100 scale
    confidence: int  # 0-100 scale
    recommendation: str
    factors: List[PPIFactor]
    expires_at: str

class PPIExplanation(BaseModel):
    ppi_id: str
    explanation: str
    contributing_factors: List[str]
    market_conditions: dict