from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_async_db
from app.schemas.admin import UserAdminResponse
from app.schemas.subscription import SubscriptionUpdate
from app.services.admin_service import AdminService
from app.utils.admin_guard import admin_required

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ================================
# GET ALL USERS
# ================================
@router.get("/users", response_model=list[UserAdminResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_db),
    _=Depends(admin_required)
):
    """
    Return all users along with their subscription info and usage.
    Admin-only route.
    """
    return await AdminService.get_all_users(db, skip, limit)


# ================================
# GET SINGLE USER
# ================================
@router.get("/users/{user_id}", response_model=UserAdminResponse)
async def get_user_details(
    user_id: UUID,
    db: AsyncSession = Depends(get_async_db),
    _=Depends(admin_required)
):
    """
    Get detailed information about a specific user.
    Admin-only route.
    """
    return await AdminService.get_user_by_id(db, user_id)


# ================================
# UPDATE USER SUBSCRIPTION
# ================================
@router.put("/users/{user_id}/subscription", response_model=UserAdminResponse)
async def update_user_subscription(
    user_id: UUID,
    sub_data: SubscriptionUpdate,
    db: AsyncSession = Depends(get_async_db),
    _=Depends(admin_required)
):
    """
    Update subscription info for a user.
    Creates subscription if missing.
    Admin-only route.
    """
    return await AdminService.update_subscription(db, user_id, sub_data)


# ================================
# RESET USER USAGE COUNT
# ================================
@router.post("/users/{user_id}/reset-usage")
async def reset_user_usage(
    user_id: UUID,
    db: AsyncSession = Depends(get_async_db),
    _=Depends(admin_required)
):
    """
    Reset usage count for a user's subscription.
    Admin-only route.
    """
    await AdminService.reset_usage(db, user_id)
    return {"message": "Usage count reset successfully", "user_id": str(user_id)}


# ================================
# DELETE USER
# ================================
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_async_db),
    _=Depends(admin_required)
):
    """
    Delete a user and their subscription.
    Cannot delete admin users.
    Admin-only route.
    """
    await AdminService.delete_user(db, user_id)
    return {"message": "User deleted successfully", "user_id": str(user_id)}


# ================================
# DASHBOARD STATISTICS
# ================================
@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_async_db),
    _=Depends(admin_required)
):
    """
    Get statistics for admin dashboard:
    - Total users
    - Users by plan (free/premium)
    - Active subscriptions
    - Revenue estimate
    Admin-only route.
    """
    return await AdminService.get_dashboard_stats(db)

# ================================
# REVENUE REPORT
# ================================
@router.get("/revenue-report")
async def get_revenue_report(
    db: AsyncSession = Depends(get_async_db),
    _=Depends(admin_required)
):
    """
    Get detailed revenue and credit leakage report.
    Admin-only route.
    """
    return await AdminService.get_revenue_report(db)
