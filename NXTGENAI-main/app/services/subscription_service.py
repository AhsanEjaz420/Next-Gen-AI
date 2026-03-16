from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, Depends
from datetime import datetime, timedelta
import stripe
from contextlib import asynccontextmanager

from app.models.user import User
from app.models.subscription import Subscription
from app.models.enums import SubscriptionPlan
from app.database import get_async_db
from app.utils.security import get_current_user
from app.utils.cache import user_cache
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class SubscriptionService:
    @staticmethod
    @asynccontextmanager
    async def credit_session(db: AsyncSession, user: User, amount: int = 1):
        """
        Asynchronous context manager for handling credits atomically and safely.
        """
        # 1. Consume credits (atomic row lock)
        sub = await SubscriptionService.consume_credit(db, user, amount)
        try:
            yield sub
        except Exception as e:
            # 2. Refund credits on any error inside the block
            await SubscriptionService.refund_credit(db, user, amount)
            raise e

    @staticmethod
    async def check_usage(user: User):
        """
        Note: This is a synchronous-style check on a pre-loaded user object.
        """
        sub = user.subscription
        if not sub:
            raise HTTPException(status_code=403, detail="No subscription found")
        if not sub.is_active:
            raise HTTPException(status_code=403, detail="Subscription inactive")
        if sub.usage_limit is not None and sub.usage_count >= sub.usage_limit:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": "Usage limit reached. Please upgrade to premium.",
                    "current_usage": sub.usage_count,
                    "limit": sub.usage_limit,
                    "plan": sub.plan
                }
            )

    @staticmethod
    async def consume_credit(db: AsyncSession, user: User, amount: int = 1):
        """
        Asynchronously locks the subscription record and increments usage count.
        """
        # Lock the row to prevent race conditions (SQLAlchemy 2.0 style)
        stmt = select(Subscription).filter(Subscription.user_id == user.id).with_for_update()
        result = await db.execute(stmt)
        sub = result.scalar_one_or_none()
        
        if not sub:
            raise HTTPException(status_code=403, detail="No subscription found")
        
        if not sub.is_active:
            raise HTTPException(status_code=403, detail="Subscription inactive")
            
        if sub.usage_limit is not None and (sub.usage_count + amount) > sub.usage_limit:
             raise HTTPException(
                status_code=403,
                detail={
                    "message": f"Not enough credits. This tool requires {amount} credits.",
                    "current_usage": sub.usage_count,
                    "limit": sub.usage_limit,
                    "plan": sub.plan
                }
            )
        
        sub.usage_count += amount
        await db.commit()
        await db.refresh(sub)
        return sub

    @staticmethod
    async def refund_credit(db: AsyncSession, user: User, amount: int = 1):
        """
        Asynchronously refunds a specific amount of credits if an operation fails.
        """
        stmt = select(Subscription).filter(Subscription.user_id == user.id).with_for_update()
        result = await db.execute(stmt)
        sub = result.scalar_one_or_none()

        if sub and sub.usage_count >= amount:
            sub.usage_count -= amount
            await db.commit()
            await db.refresh(sub)
        return sub

    @staticmethod
    async def upgrade_to_premium(db: AsyncSession, user: User, usage_limit: int = None):
        expires_at = datetime.utcnow() + timedelta(days=30)
        
        stmt = select(Subscription).filter(Subscription.user_id == user.id)
        result = await db.execute(stmt)
        sub = result.scalar_one_or_none()

        if not sub:
            sub = Subscription(
                user_id=user.id,
                plan=SubscriptionPlan.premium,
                usage_limit=usage_limit or 1000,
                usage_count=0,
                is_active=True,
                expires_at=expires_at
            )
            db.add(sub)
        else:
            sub.plan = SubscriptionPlan.premium
            sub.is_active = True
            sub.usage_limit = usage_limit or 1000
            sub.expires_at = expires_at

        await db.commit()
        await db.refresh(sub)
        return sub

    # ================================
    # STRIPE (ONE-TIME PAYMENT)
    # ================================
    @staticmethod
    def create_checkout_session(user: User, plan: str, success_url: str, cancel_url: str):
        # Stripe library is synchronous, but that's fine as it's a single API call
        if plan != "premium":
            raise HTTPException(status_code=400, detail="Invalid plan")

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": "Premium Plan (30 Days)",
                            },
                            "unit_amount": 999,
                        },
                        "quantity": 1,
                    }
                ],
                success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=cancel_url,
                customer_email=user.email,
                metadata={
                    "user_id": str(user.id),
                    "plan": "premium"
                }
            )

            return {
                "checkout_url": checkout_session.url,
                "session_id": checkout_session.id
            }

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_available_plans(current_user: User):
        current_plan = (
            current_user.subscription.plan
            if current_user.subscription
            else "free"
        )

        return [
            {
                "plan": "free",
                "name": "Free",
                "price": 0,
                "usage_limit": 10,
                "features": ["Basic access"],
                "is_current": current_plan == "free",
            },
            {
                "plan": "premium",
                "name": "Premium",
                "price": 9.99,
                "usage_limit": 1000,
                "features": ["Unlimited tools", "Priority access"],
                "is_current": current_plan == "premium",
            }
        ]
