from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.email_reply import EmailReplyRequest
from app.services.email_reply_service import generate_email_reply
from app.services.subscription_service import SubscriptionService
from app.services.history_service import HistoryService
from app.services.profile_service import ProfileService
from app.database import get_async_db
from app.models.user import User
from app.utils.security import get_current_user
from app.utils.rate_limit import check_rate_limit

router = APIRouter(prefix="/email-reply", tags=["Email Reply Generator"])


@router.post("/generate")
async def generate_reply(
    request: EmailReplyRequest,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    # 0. Check Rate Limit
    await check_rate_limit(str(user.id))
    
    # 1. Fetch Profile
    profile = await ProfileService.get_profile(db, user.id)
    
    async with SubscriptionService.credit_session(db, user, amount=1) as sub:
        # 2. Async call
        result = await generate_email_reply(request, profile)
        
        # 3. Save to history
        await HistoryService.save_history(
            db=db,
            user_id=user.id,
            tool_name="email_reply",
            input_data=request.dict(),
            output_content=result
        )
        
        # 4. Remaining credits
        remaining_val = (sub.usage_limit - sub.usage_count) if sub.usage_limit is not None else -1
        
        return {
            "success": True,
            "data": {
                "email_replies": result
            },
            "remaining": remaining_val
        }
