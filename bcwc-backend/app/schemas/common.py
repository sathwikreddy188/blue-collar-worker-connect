from pydantic import BaseModel


class Message(BaseModel):
    """Generic success/info message envelope."""
    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
