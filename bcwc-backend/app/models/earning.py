import enum
from datetime import datetime

from sqlalchemy import Float, DateTime, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"


class Earning(Base):
    """One row per completed booking, recording what the worker is owed/paid.
    Created automatically when a booking's status is set to COMPLETED."""
    __tablename__ = "earnings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    worker_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_status: Mapped[PaymentStatus] = mapped_column(SAEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
