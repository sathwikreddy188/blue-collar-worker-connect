from datetime import datetime, date

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    job_id: int
    worker_id: int
    scheduled_date: date | None = None
    scheduled_time: str | None = None
    price: float

    @field_validator("price")
    @classmethod
    def price_not_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    customer_id: int
    worker_id: int
    scheduled_date: date | None = None
    scheduled_time: str | None = None
    price: float
    status: BookingStatus
    created_at: datetime
    updated_at: datetime
