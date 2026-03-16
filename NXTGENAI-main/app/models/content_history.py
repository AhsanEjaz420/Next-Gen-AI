from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ContentHistory(Base):
    __tablename__ = "content_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    tool_name = Column(String(50))  # e.g., "caption", "hashtag", "social_calendar"
    
    # Store the input data (topic, tone, etc.)
    input_data = Column(JSON)
    
    # Store the final generated content (text or base64 pointers)
    output_content = Column(Text)
    
    is_favorite = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="history")
