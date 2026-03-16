from pydantic import BaseModel

class HashtagRequest(BaseModel):
    topic: str
    platform: str
    account_size: str
    audience: str