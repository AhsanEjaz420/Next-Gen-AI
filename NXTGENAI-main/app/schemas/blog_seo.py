from pydantic import BaseModel

class BlogSEORequest(BaseModel):
    niche: str
    audience: str
    goal: str
    themes: str | None = None