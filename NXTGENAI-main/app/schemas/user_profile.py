from pydantic import BaseModel
from typing import Optional

class UserProfileBase(BaseModel):
    business_niche: Optional[str] = None
    brand_tone: Optional[str] = None
    target_audience: Optional[str] = None
    brand_description: Optional[str] = None

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    user_id: str

    class Config:
        from_attributes = True
