from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import stripe

from app.database import get_async_db
from app.models.user import User
from app.services.subscription_service import SubscriptionService
from app.utils.security import get_current_user

router = APIRouter(prefix="/payment", tags=["Payment"])


# ================================
# GET AVAILABLE PLANS
# ================================
@router.get("/plans")
async def get_plans(current_user: User = Depends(get_current_user)):
    return SubscriptionService.get_available_plans(current_user)


# ================================
# CREATE CHECKOUT SESSION
# ================================
@router.post("/create-checkout-session")
async def create_checkout_session(
    plan: str,
    success_url: str,
    cancel_url: str,
    current_user: User = Depends(get_current_user),
):
    return SubscriptionService.create_checkout_session(
        current_user,
        plan,
        success_url,
        cancel_url
    )


# ================================
# VERIFY PAYMENT (FRONTEND CALLBACK)
# ================================
@router.get("/verify-payment/{session_id}")
async def verify_payment(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    try:
        # Stripe is a blocking call, but it's a network request, usually fine for now
        # For ultimate perf, use 'stripe.Session.retrieve_async' if available in your version
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == "paid":
            await SubscriptionService.upgrade_to_premium(db, current_user)

            return {
                "status": "success",
                "message": "Payment successful! You are now a premium user.",
                "subscription": current_user.subscription
            }

        return {
            "status": "pending",
            "message": "Payment is still processing."
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=str(e))
