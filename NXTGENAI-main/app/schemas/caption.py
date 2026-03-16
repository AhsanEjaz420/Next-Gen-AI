from pydantic import BaseModel

class CaptionRequest(BaseModel):
    topic: str
    platform: str
    tone: str
    keywords: str | None = None