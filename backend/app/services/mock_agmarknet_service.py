"""
Mock AGMARKNET Service
Provides mock data for AGMARKNET API until real API keys are available
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

class MockAgmarknetService:
    """Mock service for AGMARKNET API"""
    
    def __init__(self):
        self.mock_commodities = [
            "Onion", "Potato", "Tomato", "Rice", "Wheat", "Sugar", "Dal", 
            "Apple", "Banana", "Mango", "Carrot", "Cabbage", "Cauliflower",
            "Green Chilli", "Ginger", "Garlic", "Lemon", "Orange"
        ]
        
        self.mock_markets = [
            "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad",
            "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur"
        ]
    
    async def get_commodity_prices(
        self, 
        commodity: str, 
        market: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict:
        """Get mock commodity prices"""
        
        # Generate mock price data
        base_price = random.uniform(10, 500)  # Base price in INR per kg
        
        prices = []
        current_date = date_from or (datetime.now() - timedelta(days=30))
        end_date = date_to or datetime.now()
        
        while current_date <= end_date:
            # Add some realistic price variation
            variation = random.uniform(-0.1, 0.1)  # ±10% variation
            price = base_price * (1 + variation)
            
            prices.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "commodity": commodity,
                "market": market or random.choice(self.mock_markets),
                "min_price": round(price * 0.9, 2),
                "max_price": round(price * 1.1, 2),
                "modal_price": round(price, 2),
                "unit": "Quintal",
                "arrivals": random.randint(50, 500)
            })
            
            current_date += timedelta(days=1)
            base_price = price  # Use previous price as base for next day
        
        return {
            "success": True,
            "data": prices,
            "total_records": len(prices),
            "commodity": commodity,
            "market": market,
            "source": "mock_agmarknet"
        }
    
    async def get_market_trends(self, commodity: str, days: int = 30) -> Dict:
        """Get mock market trends"""
        
        prices = await self.get_commodity_prices(
            commodity=commodity,
            date_from=datetime.now() - timedelta(days=days)
        )
        
        price_data = prices["data"]
        if not price_data:
            return {"success": False, "error": "No data available"}
        
        # Calculate trends
        first_price = price_data[0]["modal_price"]
        last_price = price_data[-1]["modal_price"]
        
        trend_percentage = ((last_price - first_price) / first_price) * 100
        
        return {
            "success": True,
            "commodity": commodity,
            "trend_percentage": round(trend_percentage, 2),
            "trend_direction": "up" if trend_percentage > 0 else "down" if trend_percentage < 0 else "stable",
            "current_price": last_price,
            "previous_price": first_price,
            "volatility": round(random.uniform(5, 25), 2),  # Mock volatility percentage
            "prediction": {
                "next_week": round(last_price * random.uniform(0.95, 1.05), 2),
                "confidence": round(random.uniform(60, 85), 1)
            },
            "source": "mock_agmarknet"
        }
    
    async def get_available_commodities(self) -> List[str]:
        """Get list of available commodities"""
        return self.mock_commodities
    
    async def get_available_markets(self) -> List[str]:
        """Get list of available markets"""
        return self.mock_markets
    
    async def search_commodity(self, query: str) -> List[Dict]:
        """Search for commodities"""
        query_lower = query.lower()
        matches = [
            {
                "name": commodity,
                "category": "Agricultural",
                "unit": "Quintal",
                "seasonal": random.choice([True, False])
            }
            for commodity in self.mock_commodities
            if query_lower in commodity.lower()
        ]
        
        return matches

# Singleton instance
mock_agmarknet_service = MockAgmarknetService()