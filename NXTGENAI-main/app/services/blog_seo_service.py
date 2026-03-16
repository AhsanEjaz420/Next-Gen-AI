from app.core.llm import client, generate_text
from app.prompts.blog_seo_prompt import BLOG_SEO_SYSTEM_PROMPT

async def generate_blog_topics(data, profile=None):
    prompt = f"""
    Niche: {data.niche}
    Audience: {data.audience}
    Goal: {data.goal}
    Themes: {data.themes or "None"}
    """

    brand_context = ""
    if profile:
        if profile.business_niche:
            brand_context += f"\nBusiness Niche: {profile.business_niche}"
        if profile.target_audience:
            brand_context += f"\nTarget Audience: {profile.target_audience}"
        if profile.brand_description:
            brand_context += f"\nBrand Description: {profile.brand_description}"

    full_system_prompt = BLOG_SEO_SYSTEM_PROMPT
    if brand_context:
        full_system_prompt += f"\n\nADDITIONAL BRAND CONTEXT:\n{brand_context}\nEnsure topics and keywords are optimized for this specific brand identity."

    return await generate_text(
        system_prompt=full_system_prompt,
        user_prompt=prompt,
        temperature=0.75,
        max_tokens=1200
    )