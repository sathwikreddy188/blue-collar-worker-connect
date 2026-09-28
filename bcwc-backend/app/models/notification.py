import enum
from datetime import datetime

from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class NotificationType(str, enum.Enum):
    JOB_POSTED = "JOB_POSTED"
    JOB_APPLICATION = "JOB_APPLICATION"
    APPLICATION_ACCEPTED = "APPLICATION_ACCEPTED"
    APPLICATION_REJECTED = "APPLICATION_REJECTED"
    BOOKING_CREATED = "BOOKING_CREATED"
    BOOKING_STATUS_CHANGED = "BOOKING_STATUS_CHANGED"
    NEW_MESSAGE = "NEW_MESSAGE"
    JOB_COMPLETED = "JOB_COMPLETED"
    NEW_REVIEW = "NEW_REVIEW"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[NotificationType] = mapped_column(SAEnum(NotificationType), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Generic pointer to whatever triggered this notification (a job, booking, etc.)
    related_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    related_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
