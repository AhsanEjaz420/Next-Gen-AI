from enum import Enum

class SubscriptionPlan(str, Enum):
    free = "free"
    premium = "premium"