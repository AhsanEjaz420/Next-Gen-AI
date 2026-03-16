from app.core.llm import client, generate_text
from app.prompts.email_reply_prompt import EMAIL_REPLY_SYSTEM_PROMPT

async def generate_email_reply(data, profile=None):
    user_prompt = f"""
Email Content:
{data.email_content}

Tone: {data.tone}
Goal: {data.goal}
Points: {data.points or "None"}
Urgency: {data.urgency or "Normal"}
"""

    brand_context = ""
    if profile:
        if profile.business_niche:
            brand_context += f"\nBusiness Niche: {profile.business_niche}"
        if profile.brand_tone:
            brand_context += f"\nBrand Tone: {profile.brand_tone}"
        if profile.brand_description:
            brand_context += f"\nBrand Description: {profile.brand_description}"

    full_system_prompt = EMAIL_REPLY_SYSTEM_PROMPT
    if brand_context:
        full_system_prompt += f"\n\nADDITIONAL BRAND CONTEXT:\n{brand_context}\nMaintain the brand's voice while addressing the email's goal."

    return await generate_text(
        system_prompt=full_system_prompt,
        user_prompt=user_prompt,
        temperature=0.6,
        max_tokens=700
    )