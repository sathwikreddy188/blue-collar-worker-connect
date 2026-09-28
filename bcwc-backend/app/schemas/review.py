from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.user import UserSummary


class ReviewCreate(BaseModel):
    worker_id: int
    job_id: int
    rating: int
    comment: str | None = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if not (1 <= v <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewUpdate(BaseModel):
    rating: int | None = None
    comment: str | None = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int | None) -> int | None:
        if v is not None and not (1 <= v <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    worker_id: int
    job_id: int
    rating: int
    comment: str | None = None
    created_at: datetime


class ReviewDetail(ReviewOut):
    customer: UserSummary
