from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.caption import CaptionRequest
from app.services.caption_service import generate_captions
from app.services.subscription_service import SubscriptionService
from app.services.history_service import HistoryService
from app.services.profile_service import ProfileService
from app.database import get_async_db
from app.models.user import User
from app.utils.security import get_current_user
from app.utils.rate_limit import check_rate_limit

router = APIRouter(prefix="/caption", tags=["Caption Generator"])


@router.post("/generate")
async def generate_caption(
    request: CaptionRequest,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    # 0. Check Rate Limit
    await check_rate_limit(str(user.id))
    
    # 1. Fetch Profile for Smart Injection
    profile = await ProfileService.get_profile(db, user.id)
    
    async with SubscriptionService.credit_session(db, user, amount=1) as sub:
        # 2. Async call with profile context
        result = await generate_captions(request, profile)
        
        # 3. Save to history
        await HistoryService.save_history(
            db=db,
            user_id=user.id,
            tool_name="caption",
            input_data=request.dict(),
            output_content=result
        )
        
        # 4. Remaining credits
        remaining_val = (sub.usage_limit - sub.usage_count) if sub.usage_limit is not None else -1 # -1 for unlimited
        
        return {
            "success": True,
            "data": {
                "captions": result
            },
            "remaining": remaining_val
        }