from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_async_db
from app.services.history_service import HistoryService
from app.schemas.history import HistoryResponse, RefineRequest
from app.services.subscription_service import SubscriptionService
from app.utils.security import get_current_user

router = APIRouter(prefix="/history", tags=["Content History"])

@router.get("/", response_model=List[HistoryResponse])
async def get_history(
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    limit: int = 20
):
    """
    Retrieve the current user's generation history.
    """
    return await HistoryService.get_user_history(db, user.id, limit)

@router.post("/{history_id}/toggle-favorite", response_model=HistoryResponse)
async def toggle_favorite(
    history_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Toggle favorite status for a history entry.
    """
    entry = await HistoryService.toggle_favorite(db, user.id, history_id)
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    return entry

@router.post("/{history_id}/refine", response_model=HistoryResponse)
async def refine_history_item(
    history_id: int,
    request: RefineRequest,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Refine a previous generation with new instructions.
    Costs 1 credit.
    """
    async with SubscriptionService.credit_session(db, user, amount=1) as sub:
        entry = await HistoryService.refine_content(db, user.id, history_id, request.instruction)
        if not entry:
            raise HTTPException(status_code=404, detail="History entry not found")
        return entry
