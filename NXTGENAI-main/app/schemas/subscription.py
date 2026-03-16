from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class SubscriptionBase(BaseModel):
    plan: str
    usage_limit: int
    usage_count: int
    is_active: bool


class SubscriptionResponse(SubscriptionBase):
    id: UUID
    user_id: UUID
    expires_at: Optional[datetime]
    created_at: datetime
    usage_today: Optional[int] = 0
    
    class Config:
        from_attributes = True


class SubscriptionUpdate(BaseModel):
    plan: str
    usage_limit: int
    is_active: bool


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    role: str
    is_active: bool
    subscription: Optional[SubscriptionResponse] = None