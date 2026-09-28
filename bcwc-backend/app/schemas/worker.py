from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.service import WorkerServiceOut


class WorkerProfileBase(BaseModel):
    profession: str
    bio: str | None = None
    experience_years: int = 0
    location: str
    latitude: float | None = None
    longitude: float | None = None
    hourly_rate: float = 0
    profile_image: str | None = None

    @field_validator("experience_years")
    @classmethod
    def experience_not_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Experience cannot be negative")
        return v

    @field_validator("hourly_rate")
    @classmethod
    def rate_not_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Hourly rate cannot be negative")
        return v

    @field_validator("profession", "location")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("This field cannot be empty")
        return v.strip()


class WorkerProfileCreate(WorkerProfileBase):
    pass


class WorkerProfileUpdate(BaseModel):
    profession: str | None = None
    bio: str | None = None
    experience_years: int | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    hourly_rate: float | None = None
    profile_image: str | None = None


class AvailabilityUpdate(BaseModel):
    available: bool


class WorkerListItem(BaseModel):
    """Compact worker representation used in search/list results."""
    id: int  # this is the worker's User.id
    name: str
    profession: str
    experience_years: int
    location: str
    rating: float
    jobs_completed: int
    hourly_rate: float
    availability: bool
    profile_image: str | None = None


class WorkerDetail(WorkerListItem):
    """Full worker representation used on the worker detail page. No password data, ever."""
    bio: str | None = None
    is_verified: bool
    created_at: datetime
    services: list[WorkerServiceOut] = []
