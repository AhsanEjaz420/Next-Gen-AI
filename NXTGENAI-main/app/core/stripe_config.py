import stripe
from app.core.config import settings

# Initialize Stripe with your secret key (if available)
if settings.STRIPE_SECRET_KEY and not settings.STRIPE_SECRET_KEY.startswith("sk_test_your"):
    stripe.api_key = settings.STRIPE_SECRET_KEY
else:
    print("⚠️  Stripe not configured - Payment features will be disabled")

# Plan pricing configuration
PLAN_PRICES = {
    "free": {
        "name": "Free Plan",
        "price": 0.00,
        "usage_limit": 10,
        "stripe_price_id": None,  # No Stripe for free
        "features": [
            "10 uses per day",
            "Basic caption generation",
            "Basic hashtag suggestions",
            "Community support"
        ]
    },
    "premium": {
        "name": "Premium Plan",
        "price": 9.99,
        "usage_limit": 1000,
        "stripe_price_id": getattr(settings, 'STRIPE_PREMIUM_PRICE_ID', None),  # Optional - Set in .env
        "features": [
            "1000 uses per day",
            "Advanced AI models",
            "Priority support",
            "Email support",
            "Custom tone options",
            "No advertisements"
        ]
    }
}

def get_plan_info(plan: str):
    """Get plan information including price"""
    return PLAN_PRICES.get(plan, PLAN_PRICES["free"])