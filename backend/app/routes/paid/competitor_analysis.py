from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db
from app.models.user import User
from app.utils.security import get_current_user
from app.utils.rate_limit import check_rate_limit
from app.schemas.paid.competitor_analysis import CompetitorAnalysisRequest
from app.services.paid.competitor_service import CompetitorService
from app.services.subscription_service import SubscriptionService
from app.services.history_service import HistoryService
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/paid/competitor-analysis", tags=["Paid Tools - Competitor Analysis"])

@router.post("/analyze")
async def analyze_competitor(
    request: CompetitorAnalysisRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    # 0. Check Rate Limit
    await check_rate_limit(str(user.id))

    # 1. Premium subscription check (Advanced tool)
    if not user.subscription or user.subscription.plan != "premium":
        raise HTTPException(
            status_code=403,
            detail="Competitor Analysis is a premium feature. Please upgrade to access."
        )

    # 2. Fetch Profile for context
    profile = await ProfileService.get_profile(db, user.id)

    async with SubscriptionService.credit_session(db, user, amount=5) as sub:
        # 3. Analyze
        result = await CompetitorService.analyze_competitor(request, profile)
        
        # 4. Save to history
        import json
        await HistoryService.save_history(
            db=db,
            user_id=user.id,
            tool_name="competitor_analysis",
            input_data=request.dict(),
            output_content=json.dumps(result.dict())
        )
        
        remaining_val = (sub.usage_limit - sub.usage_count) if sub.usage_limit is not None else -1
        
        return {
            "success": True,
            "data": result,
            "remaining": remaining_val
        }
