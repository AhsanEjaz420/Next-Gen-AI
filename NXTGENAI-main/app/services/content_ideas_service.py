from app.core.llm import client, generate_text
from app.prompts.content_ideas_prompt import CONTENT_IDEAS_SYSTEM_PROMPT

async def generate_content_ideas(data, profile=None):
    prompt = f"""
    Niche: {data.niche}
    Platforms: {data.platforms}
    Audience: {data.audience}
    Goal: {data.goal}
    """

    brand_context = ""
    if profile:
        if profile.business_niche:
            brand_context += f"\nBusiness Niche: {profile.business_niche}"
        if profile.target_audience:
            brand_context += f"\nTarget Audience: {profile.target_audience}"
        if profile.brand_description:
            brand_context += f"\nBrand Description: {profile.brand_description}"

    full_system_prompt = CONTENT_IDEAS_SYSTEM_PROMPT
    if brand_context:
        full_system_prompt += f"\n\nADDITIONAL BRAND CONTEXT:\n{brand_context}\nGenerate ideas that align with this brand's mission and audience."

    return await generate_text(
        system_prompt=full_system_prompt,
        user_prompt=prompt,
        temperature=0.85,
        max_tokens=1500
    )