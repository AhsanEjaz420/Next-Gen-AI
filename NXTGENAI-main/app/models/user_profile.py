from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    
    business_niche = Column(String(255), nullable=True)
    brand_tone = Column(String(100), nullable=True)
    target_audience = Column(Text, nullable=True)
    brand_description = Column(Text, nullable=True)

    # Relationship
    user = relationship("User", back_populates="profile")
