from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.hashtag import HashtagRequest
from app.services.hashtag_service import generate_hashtags
from app.services.subscription_service import SubscriptionService
from app.services.history_service import HistoryService
from app.services.profile_service import ProfileService
from app.database import get_async_db
from app.models.user import User
from app.utils.security import get_current_user
from app.utils.rate_limit import check_rate_limit

router = APIRouter(prefix="/hashtag", tags=["Hashtag Generator"])


@router.post("/generate")
async def generate_hashtag(
    request: HashtagRequest,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    # 0. Check Rate Limit
    await check_rate_limit(str(user.id))
    
    # 1. Fetch Profile
    profile = await ProfileService.get_profile(db, user.id)
    
    async with SubscriptionService.credit_session(db, user, amount=1) as sub:
        # 2. Async call with profile
        result = await generate_hashtags(request, profile)
        
        # 3. Save to history
        await HistoryService.save_history(
            db=db,
            user_id=user.id,
            tool_name="hashtag",
            input_data=request.dict(),
            output_content=result
        )
        
        # 4. Remaining credits
        remaining_val = (sub.usage_limit - sub.usage_count) if sub.usage_limit is not None else -1
        
        return {
            "success": True,
            "data": {
                "hashtags": result
            },
            "remaining": remaining_val
        }