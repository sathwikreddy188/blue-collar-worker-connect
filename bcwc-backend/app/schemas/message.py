from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.user import UserSummary


class ConversationCreate(BaseModel):
    other_user_id: int
    job_id: int | None = None


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    participant_one_id: int
    participant_two_id: int
    job_id: int | None = None
    created_at: datetime
    updated_at: datetime


class ConversationDetail(ConversationOut):
    other_participant: UserSummary
    last_message: str | None = None
    unread_count: int = 0


class MessageCreate(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message cannot be empty")
        return v.strip()


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_id: int
    message: str
    is_read: bool
    created_at: datetime
