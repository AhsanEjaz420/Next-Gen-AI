import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_async_db
from app.models.user import User
from app.models.user_session import UserSession
from app.core.config import settings
from app.utils.cache import user_cache

# ================================
# ENV CONFIG
# ================================
JWT_SECRET_KEY = settings.JWT_SECRET_KEY
JWT_ALGORITHM = settings.JWT_ALGORITHM
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
JWT_REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", JWT_SECRET_KEY + "_refresh")
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7

# ================================
# PASSWORD HASHING
# ================================
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        password_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False

# ================================
# JWT TOKEN
# ================================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, algorithm=JWT_ALGORITHM)

# ================================
# CURRENT USER DEPENDENCY
# ================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db)
):
    # Try getting token from Header or Cookie
    auth_token = token or request.cookies.get("access_token")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired session",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not auth_token:
        raise credentials_exception

    try:
        payload = jwt.decode(auth_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        session_id: str = payload.get("session_id")
        token_type: str = payload.get("type")
        
        if not user_id or not session_id or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Check Cache
    cache_key = f"user_{user_id}_{session_id}"
    cached_user = user_cache.get(cache_key)
    if cached_user:
        return cached_user

    # Verify session is active
    stmt = select(UserSession).filter(UserSession.id == session_id, UserSession.is_active == True)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    
    if not session:
        raise credentials_exception

    # Fetch user
    stmt_user = select(User).filter(User.id == user_id)
    result_user = await db.execute(stmt_user)
    user = result_user.scalar_one_or_none()
    
    if not user:
        raise credentials_exception
    
    # Refresh user object to load relationships properly if needed
    # (In async, we might need selectinload for sub-attributes)
    
    # Attach remaining credits
    sub = await user.awaitable_attrs.subscription if hasattr(user, "awaitable_attrs") else user.subscription
    remaining = (
        sub.usage_limit - sub.usage_count
        if sub and sub.usage_limit is not None
        else "unlimited"
    )
    setattr(user, "remaining_credits", remaining)

    # Cache
    user_cache.set(cache_key, user)
    return user
