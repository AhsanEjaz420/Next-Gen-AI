from pydantic import BaseModel, Field
from typing import List, Optional

class CompetitorAnalysisRequest(BaseModel):
    url: Optional[str] = Field(None, example="https://competitor.com/blog-post")
    content_raw: Optional[str] = Field(None, description="Raw text if URL is not provided")
    focus_areas: List[str] = Field(default=["tone", "keywords", "value_proposition"])

class CompetitorAnalysisResponse(BaseModel):
    competitor_tone: str
    key_selling_points: List[str]
    perceived_audience: str
    content_gaps: List[str]
    suggested_counter_strategy: str
    raw_analysis: str
