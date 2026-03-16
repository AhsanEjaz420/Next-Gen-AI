from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db
from app.models.user import User
from app.utils.security import get_current_user
from app.utils.rate_limit import check_rate_limit
from app.services.batch_service import BatchService
from app.schemas.batch import BatchResponse
from typing import List

router = APIRouter(prefix="/batch", tags=["Batch Processing"])

@router.post("/product-description", response_model=BatchResponse)
async def batch_product_description(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    # 0. Check Rate Limit
    await check_rate_limit(str(user.id))

    # 1. Validate File Extension
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    # 2. Premium subscription check
    if not user.subscription or user.subscription.plan != "premium":
        raise HTTPException(
            status_code=403,
            detail="Batch processing is available for premium users only."
        )

    try:
        content = await file.read()
        results = await BatchService.process_product_description_csv(content, user, db)
        return {
            "success": True,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/caption", response_model=BatchResponse)
async def batch_caption(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    # 0. Check Rate Limit
    await check_rate_limit(str(user.id))

    # 1. Validate File Extension
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    # 2. Premium subscription check
    if not user.subscription or user.subscription.plan != "premium":
        raise HTTPException(
            status_code=403,
            detail="Batch processing is available for premium users only."
        )

    try:
        content = await file.read()
        results = await BatchService.process_caption_csv(content, user, db)
        return {
            "success": True,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
