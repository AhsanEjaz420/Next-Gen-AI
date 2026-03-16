from pydantic import BaseModel, Field
from typing import List, Optional

# ==============================
# REQUEST SCHEMA (Frontend → API)
# ==============================
class ProductDescriptionRequest(BaseModel):
    product_name: str = Field(..., example="Wireless Bluetooth Headphones")
    product_category: str = Field(..., example="Electronics")
    key_features: List[str] = Field(
        ..., 
        min_items=1,
        max_items=10,
        example=[
            "Noise cancellation",
            "40-hour battery life",
            "Comfortable ear cushions",
            "Foldable design"
        ]
    )
    target_audience: str = Field(..., example="Tech enthusiasts and commuters")
    tone: str = Field(..., example="Professional and persuasive")
    brand_name: Optional[str] = Field(None, example="SoundWave")
    price_range: Optional[str] = Field(None, example="$50-$100")
    seo_keywords: Optional[List[str]] = Field(
        None,
        max_items=10,
        example=["wireless headphones", "bluetooth headphones", "noise cancelling"]
    )
    product_images: Optional[List[str]] = Field(
        None,
        max_items=10,
        description="Base64 encoded images (max 10)",
        example=[]
    )

# ==============================
# RESPONSE STRUCTURE (API → Frontend)
# ==============================
class ProductDescriptionResponse(BaseModel):
    product_name: str
    short_description: str  # 50-100 words for product cards
    long_description: str   # 200-300 words for product pages
    seo_title: str          # SEO-optimized title (under 60 chars)
    seo_meta_description: str  # Meta description (under 160 chars)
    suggested_keywords: List[str]  # Additional SEO keywords (5-8)
    remaining: Optional[int]  # Remaining credits (None if unlimited)