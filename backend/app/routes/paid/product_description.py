from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db
from app.models.user import User
from app.utils.security import get_current_user
from app.utils.rate_limit import check_rate_limit
from app.schemas.paid.product_description import (
    ProductDescriptionRequest,
    ProductDescriptionResponse
)
from app.services.paid.product_description_service import generate_product_description
from app.services.subscription_service import SubscriptionService
from app.services.history_service import HistoryService

from app.services.profile_service import ProfileService

router = APIRouter(
    prefix="/paid/product-description",
    tags=["Paid Tools - Product Description Generator"]
)


@router.post("/generate", response_model=None)
async def generate_product_description_tool(
    request: ProductDescriptionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    # 0. Check Rate Limit
    await check_rate_limit(str(user.id))

    # 1. Fetch Profile
    profile = await ProfileService.get_profile(db, user.id)

    # 🔐 Premium subscription check
    if not user.subscription or user.subscription.plan != "premium":
        raise HTTPException(
            status_code=403,
            detail="This tool is available for premium users only. Please upgrade to access product description generation."
        )
    
    # 🖼️ Validate image count (max 10 images)
    if request.product_images and len(request.product_images) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 product images allowed. Please reduce the number of images."
        )
    
    async with SubscriptionService.credit_session(db, user, amount=2) as sub:
        # 🤖 Generate product descriptions (Async) with profile
        result = await generate_product_description(request, profile)
        
        # 3. Save to history
        import json
        await HistoryService.save_history(
            db=db,
            user_id=user.id,
            tool_name="product_description",
            input_data=request.dict(),
            output_content=json.dumps(result)
        )
        
        # Calculate remaining credits
        remaining_val = (sub.usage_limit - sub.usage_count) if sub.usage_limit is not None else -1
        
        # Return complete response
        return {
            "success": True,
            "data": result,
            "remaining": remaining_val
        }
