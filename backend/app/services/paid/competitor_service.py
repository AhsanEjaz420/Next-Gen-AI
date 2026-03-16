import httpx
import re
from typing import Dict, Any
from app.core.llm import generate_text
from app.prompts.paid.competitor_analysis_prompt import COMPETITOR_ANALYSIS_SYSTEM_PROMPT
from app.schemas.paid.competitor_analysis import CompetitorAnalysisRequest, CompetitorAnalysisResponse
from fastapi import HTTPException

class CompetitorService:
    @staticmethod
    async def fetch_url_content(url: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                # Basic HTML cleaning (removing tags)
                text = response.text
                text = re.sub(r'<script\b[^>]*>([\s\S]*?)<\/script>', '', text)
                text = re.sub(r'<style\b[^>]*>([\s\S]*?)<\/style>', '', text)
                text = re.sub(r'<[^>]+>', ' ', text)
                text = re.sub(r'\s+', ' ', text).strip()
                
                # Limit to first 5000 chars to avoid token limits in simple RAG
                return text[:5000]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")

    @staticmethod
    async def analyze_competitor(data: CompetitorAnalysisRequest, profile=None) -> CompetitorAnalysisResponse:
        content_to_analyze = data.content_raw or ""
        
        if data.url:
            content_to_analyze = await CompetitorService.fetch_url_content(data.url)
            
        if not content_to_analyze:
            raise HTTPException(status_code=400, detail="No content provided for analysis.")

        user_prompt = f"""
        COMPETITOR CONTENT:
        ---
        {content_to_analyze}
        ---

        FOCUS AREAS: {', '.join(data.focus_areas)}
        
        Analyze this content and provide a structured strategy.
        """

        if profile:
            user_prompt += f"""

OUR BRAND CONTEXT (for counter-strategy):
{profile.brand_description or profile.business_niche}"""

        result = await generate_text(
            system_prompt=COMPETITOR_ANALYSIS_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            response_model=CompetitorAnalysisResponse,
            temperature=0.5
        )
        
        return result
