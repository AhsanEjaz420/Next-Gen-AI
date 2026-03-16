from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime, timedelta
from fastapi import HTTPException

from app.models.user import User
from app.models.subscription import Subscription
from app.models.enums import SubscriptionPlan


class AdminService:

    # =========================
    # USERS
    # =========================
    @staticmethod
    async def get_all_users(db: AsyncSession, skip: int, limit: int):
        stmt = select(User).offset(skip).limit(limit)
        result = await db.execute(stmt)
        users = result.scalars().all()

        # Inject usage_today dynamically
        for user in users:
            if user.subscription:
                user.subscription.usage_today = user.subscription.usage_count

        return users

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: UUID):
        stmt = select(User).filter(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.subscription:
            user.subscription.usage_today = user.subscription.usage_count

        return user

    # =========================
    # SUBSCRIPTIONS
    # =========================
    @staticmethod
    async def update_subscription(db: AsyncSession, user_id: UUID, sub_data):
        stmt = select(User).filter(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        stmt_sub = select(Subscription).filter(Subscription.user_id == user.id)
        result_sub = await db.execute(stmt_sub)
        subscription = result_sub.scalar_one_or_none()

        expires_at = (
            datetime.utcnow() + timedelta(days=30)
            if sub_data.plan == SubscriptionPlan.premium
            else None
        )

        if not subscription:
            subscription = Subscription(
                user_id=user.id,
                plan=sub_data.plan,
                usage_limit=sub_data.usage_limit,
                is_active=sub_data.is_active,
                usage_count=0,
                expires_at=expires_at,
            )
            db.add(subscription)
        else:
            subscription.plan = sub_data.plan
            subscription.usage_limit = sub_data.usage_limit
            subscription.is_active = sub_data.is_active
            subscription.expires_at = expires_at

        await db.commit()
        await db.refresh(user)

        # Inject runtime field
        if user.subscription:
            user.subscription.usage_today = user.subscription.usage_count

        return user

    @staticmethod
    async def reset_usage(db: AsyncSession, user_id: UUID):
        stmt = select(Subscription).filter(Subscription.user_id == user_id)
        result = await db.execute(stmt)
        subscription = result.scalar_one_or_none()

        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")

        subscription.usage_count = 0
        await db.commit()

        return True

    # =========================
    # DELETE USER
    # =========================
    @staticmethod
    async def delete_user(db: AsyncSession, user_id: UUID):
        stmt = select(User).filter(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.role == "admin":
            raise HTTPException(status_code=403, detail="Cannot delete admin users")

        await db.delete(user)
        await db.commit()

        return True

    # =========================
    # DASHBOARD STATS
    # =========================
    @staticmethod
    async def get_dashboard_stats(db: AsyncSession):
        stmt_count = select(func.count(User.id)).filter(User.role == "user")
        result_count = await db.execute(stmt_count)
        total_users = result_count.scalar()

        stmt_subs = select(Subscription)
        result_subs = await db.execute(stmt_subs)
        subscriptions = result_subs.scalars().all()

        free_users = sum(1 for s in subscriptions if s.plan == SubscriptionPlan.free)
        premium_users = sum(1 for s in subscriptions if s.plan == SubscriptionPlan.premium)

        active_subscriptions = sum(1 for s in subscriptions if s.is_active)

        revenue_estimate = premium_users * 9.99  # example pricing

        # --- Credit Leakage Tracking ---
        from app.models.content_history import ContentHistory
        
        # 1. Total credits consumed (across all users)
        total_credits_consumed = sum(s.usage_count for s in subscriptions)
        
        # 2. Total actual generations in history
        stmt_history_count = select(func.count(ContentHistory.id))
        result_history_count = await db.execute(stmt_history_count)
        total_generations = result_history_count.scalar() or 0
        
        # Leakage calculation: Credits consumed vs generations saved
        # Note: Some tools might cost more than 1 credit, so this is an estimate
        leakage_score = total_credits_consumed - total_generations 

        return {
            "total_users": total_users,
            "free_users": free_users,
            "premium_users": premium_users,
            "active_subscriptions": active_subscriptions,
            "monthly_revenue_estimate": round(revenue_estimate, 2),
            "credit_metrics": {
                "total_credits_consumed": total_credits_consumed,
                "total_generations_saved": total_generations,
                "potential_leakage_raw": leakage_score
            }
        }

    @staticmethod
    async def get_revenue_report(db: AsyncSession):
        """
        Granular revenue tracking.
        """
        # In a real app, this would query a 'Transactions' table.
        # Since we use usage-based simulation:
        stmt = select(Subscription).filter(Subscription.plan == SubscriptionPlan.premium)
        result = await db.execute(stmt)
        premium_subs = result.scalars().all()
        
        total_revenue = len(premium_subs) * 9.99
        
        # Active vs Expired revenue
        active_revenue = sum(9.99 for s in premium_subs if s.is_active)
        churned_revenue = total_revenue - active_revenue

        return {
            "currency": "USD",
            "total_lifetime_revenue": round(total_revenue, 2),
            "current_mrr": round(active_revenue, 2),
            "churned_revenue": round(churned_revenue, 2),
            "average_revenue_per_user": 9.99 if premium_subs else 0
        }
