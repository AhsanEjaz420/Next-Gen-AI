import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User
from app.models.subscription import Subscription
from app.models.enums import SubscriptionPlan
from app.utils.security import hash_password
import uuid

DATABASE_URL = "sqlite+aiosqlite:///./app.db"

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def setup():
    async with AsyncSessionLocal() as db:
        # Create test user
        email = "test@example.com"
        stmt = select(User).filter(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                id=uuid.uuid4(),
                username="testuser",
                email=email,
                hashed_password=hash_password("password123"),
                role="user"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"Created user: {user.username}")
        else:
            print(f"User already exists: {user.username}")

        # Create/Update Premium Subscription
        stmt = select(Subscription).filter(Subscription.user_id == user.id)
        result = await db.execute(stmt)
        sub = result.scalar_one_or_none()

        if not sub:
            sub = Subscription(
                id=uuid.uuid4(),
                user_id=user.id,
                plan=SubscriptionPlan.premium,
                usage_limit=1000,
                usage_count=0,
                is_active=True
            )
            db.add(sub)
            print("Created premium subscription")
        else:
            sub.plan = SubscriptionPlan.premium
            sub.usage_limit = 1000
            sub.is_active = True
            print("Updated to premium subscription")

        await db.commit()
        print("Setup complete")

if __name__ == "__main__":
    asyncio.run(setup())
