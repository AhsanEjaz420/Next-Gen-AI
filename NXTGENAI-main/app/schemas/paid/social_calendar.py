from pydantic import BaseModel, Field
from typing import List, Optional

# ==============================
# REQUEST SCHEMA (Frontend → API)
# ==============================
class SocialCalendarRequest(BaseModel):
    business_niche: str = Field(..., example="Fitness Coaching")
    goal: str = Field(..., example="Increase engagement and leads")
    tone: str = Field(..., example="Professional but friendly")
    platforms: List[str] = Field(..., example=["Instagram", "LinkedIn"])
    target_audience: Optional[str] = Field(
        None, example="Busy professionals aged 25-40"
    )
    month: Optional[str] = Field(
        None, example="January 2026"
    )
    # Optional brand context (NO scraping)
    business_website: Optional[str] = Field(
        None, example="https://myfitnessbrand.com"
    )
    linkedin_url: Optional[str] = Field(
        None, example="https://linkedin.com/company/mybrand"
    )
    instagram_url: Optional[str] = Field(
        None, example="https://instagram.com/mybrand"
    )

# ==============================
# RESPONSE STRUCTURE (LLM Output)
# ==============================
class DailyPost(BaseModel):
    day: int
    platform: str
    title: str
    description: str
    content_type: str
    cta: str

# ==============================
# RESPONSE STRUCTURE (API → Frontend)
# ==============================
class SocialCalendarResponse(BaseModel):
    pdf_downloadable: str  # Base64 encoded PDF
    excel_downloadable: str  # Base64 encoded Excel
    remaining: Optional[int]  # Remaining credits (None if unlimited)