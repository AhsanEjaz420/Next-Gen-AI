import json
from openai import AsyncOpenAI
from app.core.config import settings
from typing import Optional, List, Type, TypeVar
from pydantic import BaseModel

# Type variable for Pydantic models
T = TypeVar("T", bound=BaseModel)

# Initialize the async client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_text(
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 512,
        model: Optional[str] = None,
        response_model: Optional[Type[T]] = None,
) -> str | T:
    """
    Generate text or structured output from the LLM.
    If response_model is provided, uses OpenAI's Structured Outputs (JSON Schema).
    """
    model_name = model or settings.OPENAI_MODEL
    
    if response_model:
        # Use the parsing beta feature for guaranteed JSON schema compliance
        response = await client.beta.chat.completions.parse(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=response_model,
            temperature=temperature,
        )
        return response.choices[0].message.parsed
    else:
        # Standard text generation
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_completion_tokens=max_tokens,
        )
        return response.choices[0].message.content.strip()

async def generate_text_with_images(
        system_prompt: str,
        user_prompt: str,
        images: Optional[List[str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1500,
        model: Optional[str] = None,
        response_model: Optional[Type[T]] = None,
) -> str | T:
    """
    Generate multimodal text or structured output (asynchronous).
    """
    model_name = model or settings.OPENAI_PAID_MODEL
    
    # Build multimodal content
    content = [{"type": "text", "text": user_prompt}]
    if images:
        for img_base64 in images:
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}
            })

    if response_model:
        response = await client.beta.chat.completions.parse(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content},
            ],
            response_format=response_model,
            temperature=temperature,
        )
        return response.choices[0].message.parsed
    else:
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content},
            ],
            temperature=temperature,
            max_completion_tokens=max_tokens,
        )
        return response.choices[0].message.content.strip()
