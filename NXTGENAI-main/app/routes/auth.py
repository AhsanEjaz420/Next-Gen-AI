from fastapi import APIRouter, Depends, status, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from jose import jwt, JWTError
from uuid import UUID
from typing import Optional

from app.database import get_async_db
from app.schemas.auth import UserCreate, UserResponse, Token
from app.services.auth_service import AuthService
from app.utils.security import (
    get_current_user, 
    oauth2_scheme, 
    create_access_token, 
    JWT_ALGORITHM, 
    JWT_SECRET_KEY, 
    JWT_REFRESH_SECRET_KEY,
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models.user import User
from app.models.user_session import UserSession
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ================================
# REGISTER
# ================================
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncSession = Depends(get_async_db)):
    return await AuthService.register_user(user, db)

# ================================
# LOGIN
# ================================
@router.post("/login", response_model=Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_async_db)
):
    return await AuthService.login_user_form(form_data, db, response)

# ================================
# REFRESH TOKEN
# ================================
@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_async_db)
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        payload = jwt.decode(refresh_token, JWT_REFRESH_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Check session in DB
    stmt = select(UserSession).filter(
        UserSession.user_id == user_id, 
        UserSession.refresh_token == refresh_token,
        UserSession.is_active == True
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()

    if not session or (session.expires_at and session.expires_at.replace(tzinfo=None) < datetime.utcnow()):
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    # Create new access token
    new_access_token = create_access_token(data={"sub": user_id, "session_id": str(session.id)})
    
    # Set new cookie
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        max_age=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False
    )

    return {"access_token": new_access_token, "token_type": "bearer"}

# ================================
# CURRENT USER
# ================================
@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "remaining": getattr(current_user, "remaining_credits", 0),
        "subscription_plan": (await current_user.awaitable_attrs.subscription).plan if current_user.subscription else "free"
    }

# ================================
# LOGOUT
# ================================
@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_async_db)
):
    access_token = request.cookies.get("access_token")
    if access_token:
        try:
            payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            session_id = payload.get("session_id")
            if session_id:
                stmt = select(UserSession).filter(UserSession.id == session_id)
                result = await db.execute(stmt)
                session = result.scalar_one_or_none()
                if session:
                    session.is_active = False
                    session.ended_at = datetime.utcnow()
                    await db.commit()
        except:
            pass

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}
