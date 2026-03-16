from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.schemas.subscription import SubscriptionResponse, SubscriptionUpdate


class UserAdminResponse(BaseModel):
    id: UUID
    username: str
    email: str
    role: str
    is_active: bool
    subscription: Optional[SubscriptionResponse]  # nested subscription info

    class Config:
        from_attributes = True