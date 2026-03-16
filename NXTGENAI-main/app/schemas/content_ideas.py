from pydantic import BaseModel

class ContentIdeasRequest(BaseModel):
    niche: str
    platforms: str
    audience: str
    goal: str