from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db
from app.services.history_service import HistoryService
from app.utils.security import get_current_user

router = APIRouter(prefix="/insights", tags=["User Insights"])

@router.get("/")
async def get_user_insights(
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get generation statistics and trends for the current user.
    """
    return await HistoryService.get_user_stats(db, user.id)
