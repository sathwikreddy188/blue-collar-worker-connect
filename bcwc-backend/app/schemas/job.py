from datetime import datetime, date

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

from app.models.job import JobStatus
from app.schemas.user import UserSummary


class JobBase(BaseModel):
    title: str
    description: str
    location: str
    service_id: int
    budget_min: float
    budget_max: float
    preferred_date: date | None = None
    preferred_time: str | None = None

    @field_validator("title", "description", "location")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("This field cannot be empty")
        return v.strip()

    @field_validator("budget_min", "budget_max")
    @classmethod
    def budget_not_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Budget cannot be negative")
        return v

    @model_validator(mode="after")
    def budget_range_valid(self):
        if self.budget_max < self.budget_min:
            raise ValueError("budget_max cannot be less than budget_min")
        return self


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    preferred_date: date | None = None
    preferred_time: str | None = None
    status: JobStatus | None = None


class JobOut(JobBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    status: JobStatus
    created_at: datetime
    updated_at: datetime


class JobDetail(JobOut):
    customer: UserSummary
    applicant_count: int = 0
