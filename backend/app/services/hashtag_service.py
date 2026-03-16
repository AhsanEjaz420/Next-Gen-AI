from app.core.llm import client, generate_text
from app.prompts.hashtag_prompt import HASHTAG_SYSTEM_PROMPT

async def generate_hashtags(data, profile=None):
    prompt = f"""
Topic: {data.topic}
Platform: {data.platform}
Account Size: {data.account_size}
Audience: {data.audience}
"""
    
    brand_context = ""
    if profile:
        if profile.business_niche:
            brand_context += f"\nBusiness Niche: {profile.business_niche}"
        if profile.target_audience:
            brand_context += f"\nTarget Audience: {profile.target_audience}"

    full_system_prompt = HASHTAG_SYSTEM_PROMPT
    if brand_context:
        full_system_prompt += f"\n\nADDITIONAL BRAND CONTEXT:\n{brand_context}\nUse this context to select hashtags that are highly relevant to this specific brand and audience."

    return await generate_text(
        system_prompt=full_system_prompt,
        user_prompt=prompt,
        temperature=0.7,
        max_tokens=600
)