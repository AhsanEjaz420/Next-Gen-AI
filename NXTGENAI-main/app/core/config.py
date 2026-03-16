from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
import os

load_dotenv()


class Settings(BaseModel):
    # ================================
    # JWT
    # ================================
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    )

    # ================================
    # DATABASE
    # ================================
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    # ================================
    # OPENAI
    # ================================
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_PAID_MODEL: str = os.getenv("OPENAI_PAID_MODEL", "gpt-4o-mini")

    # ================================
    # STRIPE (ONE-TIME PAYMENT)
    # ================================
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY: Optional[str] = os.getenv("STRIPE_PUBLISHABLE_KEY")

    # ================================
    # CORS MIDDLEWARE
    # ================================
    FRONTEND_URL: Optional[str] = os.getenv("FRONTEND_URL")
    FRONTEND_URL_LOCAL: Optional[str] = os.getenv("FRONTEND_URL_LOCAL")


settings = Settings()


# ================================
# VALIDATION
# ================================
if not settings.JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY is not set.")

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL is not set.")

if not settings.OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set.")

if not settings.FRONTEND_URL:
    raise ValueError("FRONTEND_URL is not set (CORS will fail).")

if not settings.STRIPE_SECRET_KEY:
    print("⚠️ WARNING: Stripe payments will not work (STRIPE_SECRET_KEY missing)")