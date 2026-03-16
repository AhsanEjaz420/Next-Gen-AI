from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db
from app.schemas.user_profile import UserProfileUpdate, UserProfileResponse
from app.services.profile_service import ProfileService
from app.utils.security import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("/", response_model=UserProfileResponse)
async def get_profile(
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get the current user's brand profile.
    """
    return await ProfileService.get_profile(db, user.id)

@router.put("/", response_model=UserProfileResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Update the current user's brand profile.
    """
    return await ProfileService.update_profile(db, user.id, profile_data)
