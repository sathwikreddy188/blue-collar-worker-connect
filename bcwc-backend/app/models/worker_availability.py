import enum
from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, Time, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Weekday(str, enum.Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"


class WorkerAvailability(Base):
    """
    A worker's recurring weekly schedule, e.g. "available Monday 9am-5pm".
    This is separate from WorkerProfile.availability, which is a simple
    on/off toggle for "available right now" used by the dashboard switch.
    """
    __tablename__ = "worker_availability"
    __table_args__ = (UniqueConstraint("worker_id", "day", name="uq_worker_availability_day"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    worker_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day: Mapped[Weekday] = mapped_column(SAEnum(Weekday), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
