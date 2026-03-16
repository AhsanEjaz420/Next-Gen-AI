from app.core.llm import client, generate_text
from app.prompts.caption_prompt import CAPTION_SYSTEM_PROMPT

async def generate_captions(data, profile=None):
    # Base prompt from user input
    user_prompt = f"""
    Topic: {data.topic}
    Platform: {data.platform}
    Tone: {data.tone}
    Keywords: {data.keywords or "None"}
    """

    # Smart Injection: Add Brand Context if available
    brand_context = ""
    if profile:
        if profile.business_niche:
            brand_context += f"\nBusiness Niche: {profile.business_niche}"
        if profile.brand_tone:
            brand_context += f"\nBrand Tone: {profile.brand_tone}"
        if profile.target_audience:
            brand_context += f"\nTarget Audience: {profile.target_audience}"
        if profile.brand_description:
            brand_context += f"\nBrand Description: {profile.brand_description}"

    full_system_prompt = CAPTION_SYSTEM_PROMPT
    if brand_context:
        full_system_prompt += f"\n\nADDITIONAL BRAND CONTEXT:\n{brand_context}\nAlways align the output with this brand identity unless the user prompt explicitly requests otherwise."

    return await generate_text(
        system_prompt=full_system_prompt,
        user_prompt=user_prompt,
        temperature=0.8,
        max_tokens=600
    )