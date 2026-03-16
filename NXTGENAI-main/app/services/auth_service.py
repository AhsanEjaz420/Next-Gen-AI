from sqlalchemy import or_, select
from fastapi import HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from app.models.user import User
from app.models.user_session import UserSession
from app.models.subscription import Subscription
from app.models.enums import SubscriptionPlan
from app.utils.security import (
    hash_password, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_REFRESH_TOKEN_EXPIRE_DAYS
)


class AuthService:

    @staticmethod
    async def register_user(user_data, db: AsyncSession):
        stmt = select(User).filter(User.email == user_data.email)
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
            role="user"
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        # 2️⃣ Create DEFAULT FREE subscription
        subscription = Subscription(
            user_id=user.id,
            plan=SubscriptionPlan.free,
            usage_limit=10,
            usage_count=0,
            is_active=True
        )

        db.add(subscription)
        await db.commit()

        return user

    @staticmethod
    async def login_user_form(
        form_data: OAuth2PasswordRequestForm,
        db: AsyncSession,
        response: Response
    ):
        # 1️⃣ Find user by username OR email
        stmt = select(User).filter(
            or_(
                User.email == form_data.username,
                User.username == form_data.username
            )
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User does not exist"
            )

        # 2️⃣ Verify password
        if not verify_password(
            form_data.password,
            user.hashed_password
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )

        # 3️⃣ Create session
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        session = UserSession(
            user_id=user.id,
            is_active=True,
            refresh_token=refresh_token,
            expires_at=datetime.utcnow() + timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

        # 4️⃣ Create Access JWT
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "session_id": str(session.id)
            }
        )

        # 5️⃣ Set Cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",
            secure=False  # Set to True in Production with HTTPS
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            samesite="lax",
            secure=False
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": refresh_token
        }
