from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)

    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    subscription = relationship(
        "Subscription",
        backref="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    sessions = relationship(
        "UserSession",
        backref="user",
        cascade="all, delete-orphan"
    )

    history = relationship(
        "ContentHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )