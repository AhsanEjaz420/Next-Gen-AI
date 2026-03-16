from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db
from app.models.user import User
from app.utils.security import get_current_user
from app.utils.rate_limit import check_rate_limit
from app.schemas.paid.social_calendar import SocialCalendarRequest
from app.services.paid.social_calendar_service import generate_social_calendar
from app.services.subscription_service import SubscriptionService
from app.services.history_service import HistoryService

from app.services.profile_service import ProfileService

router = APIRouter(
    prefix="/paid/social-calendar",
    tags=["Paid Tools - Social Media Calendar"]
)


@router.post("/generate")
async def generate_social_calendar_tool(
    request: SocialCalendarRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    # 0. Check Rate Limit
    await check_rate_limit(str(user.id))

    # 1. Fetch Profile
    profile = await ProfileService.get_profile(db, user.id)

    # 🔐 Premium check
    if not user.subscription or user.subscription.plan != "premium":
        raise HTTPException(
            status_code=403,
            detail="This tool is available for premium users only"
        )
    
    async with SubscriptionService.credit_session(db, user, amount=2) as sub:
        # 🤖 Generate content (Async) with profile
        result = await generate_social_calendar(request, profile)
        
        # 3. Save to history
        import json
        await HistoryService.save_history(
            db=db,
            user_id=user.id,
            tool_name="social_calendar",
            input_data=request.dict(),
            output_content=json.dumps(result["calendar"])
        )
        
        # Calculate remaining credits
        remaining_val = (sub.usage_limit - sub.usage_count) if sub.usage_limit is not None else -1
        
        return {
            "success": True,
            "data": {
                "pdf_downloadable": result["pdf_base64"],
                "excel_downloadable": result["excel_base64"]
            },
            "remaining": remaining_val
        }
