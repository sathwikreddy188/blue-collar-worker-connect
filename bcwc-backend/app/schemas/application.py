from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.application import ApplicationStatus
from app.schemas.user import UserSummary


class ApplicationCreate(BaseModel):
    message: str | None = None
    proposed_price: float | None = None

    @field_validator("proposed_price")
    @classmethod
    def price_not_negative(cls, v: float | None) -> float | None:
        if v is not None and v < 0:
            raise ValueError("Proposed price cannot be negative")
        return v


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    worker_id: int
    message: str | None = None
    proposed_price: float | None = None
    status: ApplicationStatus
    created_at: datetime


class ApplicationDetail(ApplicationOut):
    worker: UserSummary
