from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class ServiceBase(BaseModel):
    name: str
    description: str | None = None
    icon: str | None = None


class ServiceCreate(ServiceBase):
    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Service name cannot be empty")
        return v.strip()


class ServiceOut(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime


class WorkerServiceCreate(BaseModel):
    service_id: int
    price: float | None = None

    @field_validator("price")
    @classmethod
    def price_not_negative(cls, v: float | None) -> float | None:
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v


class WorkerServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service: ServiceOut
    price: float | None = None
