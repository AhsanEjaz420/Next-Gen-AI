from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user_profile import UserProfile
from app.schemas.user_profile import UserProfileUpdate

class ProfileService:
    @staticmethod
    async def get_profile(db: AsyncSession, user_id: str):
        stmt = select(UserProfile).filter(UserProfile.user_id == user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            # Create a blank profile if it doesn't exist
            profile = UserProfile(user_id=user_id)
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
        
        return profile

    @staticmethod
    async def update_profile(db: AsyncSession, user_id: str, profile_data: UserProfileUpdate):
        stmt = select(UserProfile).filter(UserProfile.user_id == user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.add(profile)
        
        # Update fields
        for key, value in profile_data.dict(exclude_unset=True).items():
            setattr(profile, key, value)
            
        await db.commit()
        await db.refresh(profile)
        return profile
