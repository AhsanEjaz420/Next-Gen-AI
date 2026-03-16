from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.subscription_service import SubscriptionService

def subscription_guard(user: User = Depends(), db: Session = Depends(get_db)):
    """
    Dependency to check subscription and usage limit.
    Call in your tool routes like:
        @router.post("/caption", dependencies=[Depends(subscription_guard)])
    """
    SubscriptionService.check_usage(user)
    return True
