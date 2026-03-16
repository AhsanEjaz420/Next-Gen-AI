from pydantic import BaseModel

class EmailReplyRequest(BaseModel):
    email_content: str
    tone: str
    goal: str
    points: str | None = None
    urgency: str | None = None