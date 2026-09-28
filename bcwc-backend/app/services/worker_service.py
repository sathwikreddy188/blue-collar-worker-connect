from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.worker import WorkerProfile


def get_worker_rating(db: Session, worker_id: int) -> float:
    """Average rating (1-5) for a worker across all their reviews. 0 if none yet."""
    avg = db.query(func.avg(Review.rating)).filter(Review.worker_id == worker_id).scalar()
    return round(float(avg), 2) if avg is not None else 0.0


def get_worker_jobs_completed(db: Session, worker_id: int) -> int:
    """Number of bookings this worker has completed."""
    return (
        db.query(func.count(Booking.id))
        .filter(Booking.worker_id == worker_id, Booking.status == BookingStatus.COMPLETED)
        .scalar()
        or 0
    )


def get_worker_total_earnings(db: Session, worker_id: int) -> float:
    """Sum of prices for this worker's completed bookings."""
    total = (
        db.query(func.coalesce(func.sum(Booking.price), 0))
        .filter(Booking.worker_id == worker_id, Booking.status == BookingStatus.COMPLETED)
        .scalar()
    )
    return float(total or 0)


def get_profile_completion(profile: WorkerProfile) -> int:
    """
    Rough 0-100 estimate of how complete a worker's profile is, used to
    nudge workers to fill in more details (mirrors the frontend's progress bar).
    """
    fields = [
        profile.profession,
        profile.bio,
        profile.location,
        profile.profile_image,
        profile.hourly_rate > 0,
        profile.experience_years > 0,
    ]
    filled = sum(1 for f in fields if f)
    return round((filled / len(fields)) * 100)
