from pydantic import BaseModel


class CustomerDashboard(BaseModel):
    customer_name: str
    total_jobs: int
    active_jobs: int
    completed_jobs: int
    pending_requests: int
    bookings: int
    saved_workers: int
    unread_messages: int
    unread_notifications: int


class WorkerDashboard(BaseModel):
    worker_name: str
    new_requests: int
    active_jobs: int
    completed_jobs: int
    total_earnings: float
    rating: float
    unread_messages: int
    profile_completion: int
    availability: bool
