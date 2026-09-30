from datetime import datetime, time

from pydantic import BaseModel, ConfigDict, model_validator

from app.models.earning import PaymentStatus
from app.models.worker_availability import Weekday


class AvailabilitySlotCreate(BaseModel):
    day: Weekday
    start_time: time
    end_time: time
    is_available: bool = True

    @model_validator(mode="after")
    def times_in_order(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class AvailabilitySlotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    day: Weekday
    start_time: time
    end_time: time
    is_available: bool


class EarningOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    amount: float
    payment_status: PaymentStatus
    created_at: datetime
