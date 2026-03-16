import json
import re
from typing import Dict, Any, List
from app.core.llm import generate_text_with_images
from app.prompts.paid.product_description_prompt import PRODUCT_DESCRIPTION_SYSTEM_PROMPT
from app.schemas.paid.product_description import ProductDescriptionRequest
from pydantic import BaseModel

class ProductDescriptionStructured(BaseModel):
    product_name: str
    short_description: str
    long_description: str
    seo_title: str
    seo_meta_description: str
    suggested_keywords: List[str]

async def generate_product_description(data: ProductDescriptionRequest, profile=None) -> Dict[str, Any]:
    """
    Generates SEO-optimized ecommerce product descriptions using Structured Outputs and Brand Context.
    """
    
    # Smart Fallback
    target_audience = data.target_audience or (profile.target_audience if profile else "General customers")
    tone = data.tone or (profile.brand_tone if profile else "Professional and persuasive")

    # Build feature list in readable format
    features_text = "\n".join([f"- {feature}" for feature in data.key_features])
    
    # Build SEO keywords text
    seo_keywords_text = (
        ", ".join(data.seo_keywords) if data.seo_keywords else "Not provided"
    )
    
    # Build image context if images are provided
    image_context = ""
    if data.product_images and len(data.product_images) > 0:
        image_context = f"\n\nVISUAL CONTEXT:\n{len(data.product_images)} product images provided. Please analyze visual details, style, and build quality from these images to enrich the description."
    
    # Build complete user prompt
    user_prompt = f"""
PRODUCT INFORMATION:

Product Name: {data.product_name}
Product Category: {data.product_category}
Brand Name: {data.brand_name or (profile.business_niche if profile else "Not specified")}
Price Range: {data.price_range or "Not specified"}

KEY FEATURES:
{features_text}

TARGET AUDIENCE: {target_audience}

TONE: {tone}

SEO KEYWORDS (use naturally): {seo_keywords_text}{image_context}

TASK:
Generate compelling, high-converting product descriptions that turn visitors into customers.
"""
    
    # Brand description for system prompt
    brand_context = ""
    if profile and profile.brand_description:
        brand_context = f"\n\nADDITIONAL BRAND CONTEXT:\n{profile.brand_description}"

    # Generate description using vision-capable LLM with Structured Output
    result_obj = await generate_text_with_images(
        system_prompt=PRODUCT_DESCRIPTION_SYSTEM_PROMPT + brand_context,
        user_prompt=user_prompt,
        images=data.product_images if data.product_images else None,
        temperature=1.0,
        response_model=ProductDescriptionStructured
    )
    
    # Return structured response
    return result_obj.dict()
