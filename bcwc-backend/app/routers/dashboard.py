from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.dependencies import require_customer, require_worker
from app.database.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.booking import Booking, BookingStatus
from app.models.job import Job, JobStatus
from app.models.message import Message, Conversation
from app.models.notification import Notification
from app.models.saved_worker import SavedWorker
from app.models.user import User
from app.models.worker import WorkerProfile
from app.schemas.dashboard import CustomerDashboard, WorkerDashboard
from app.services.worker_service import (
    get_profile_completion,
    get_worker_jobs_completed,
    get_worker_rating,
    get_worker_total_earnings,
)

router = APIRouter(tags=["Dashboard"])


def _unread_message_count(db: Session, user_id: int) -> int:
    conversation_ids = [
        c.id
        for c in db.query(Conversation.id).filter(
            or_(Conversation.participant_one_id == user_id, Conversation.participant_two_id == user_id)
        )
    ]
    if not conversation_ids:
        return 0
    return (
        db.query(func.count(Message.id))
        .filter(Message.conversation_id.in_(conversation_ids), Message.sender_id != user_id, Message.is_read == False)  # noqa: E712
        .scalar()
        or 0
    )


@router.get("/api/customer/dashboard", response_model=CustomerDashboard, summary="Customer dashboard summary (CUSTOMER role only)")
def customer_dashboard(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    jobs_query = db.query(Job).filter(Job.customer_id == current_user.id)
    total_jobs = jobs_query.count()
    active_jobs = jobs_query.filter(Job.status.in_([JobStatus.REQUESTED, JobStatus.ACCEPTED, JobStatus.IN_PROGRESS])).count()
    completed_jobs = jobs_query.filter(Job.status == JobStatus.COMPLETED).count()

    job_ids = [j.id for j in jobs_query.with_entities(Job.id)]
    pending_requests = (
        db.query(func.count(Application.id))
        .filter(Application.job_id.in_(job_ids), Application.status == ApplicationStatus.PENDING)
        .scalar()
        if job_ids
        else 0
    )

    bookings = db.query(func.count(Booking.id)).filter(Booking.customer_id == current_user.id).scalar() or 0
    saved = db.query(func.count(SavedWorker.id)).filter(SavedWorker.customer_id == current_user.id).scalar() or 0
    unread_notifications = (
        db.query(func.count(Notification.id))
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)  # noqa: E712
        .scalar()
        or 0
    )

    return CustomerDashboard(
        customer_name=current_user.name,
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        completed_jobs=completed_jobs,
        pending_requests=pending_requests or 0,
        bookings=bookings,
        saved_workers=saved,
        unread_messages=_unread_message_count(db, current_user.id),
        unread_notifications=unread_notifications,
    )


@router.get("/api/worker/dashboard", response_model=WorkerDashboard, summary="Worker dashboard summary (WORKER role only)")
def worker_dashboard(current_user: User = Depends(require_worker), db: Session = Depends(get_db)):
    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()

    new_requests = (
        db.query(func.count(Application.id))
        .filter(Application.worker_id == current_user.id, Application.status == ApplicationStatus.PENDING)
        .scalar()
        or 0
    )
    active_jobs = (
        db.query(func.count(Booking.id))
        .filter(Booking.worker_id == current_user.id, Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]))
        .scalar()
        or 0
    )

    return WorkerDashboard(
        worker_name=current_user.name,
        new_requests=new_requests,
        active_jobs=active_jobs,
        completed_jobs=get_worker_jobs_completed(db, current_user.id),
        total_earnings=get_worker_total_earnings(db, current_user.id),
        rating=get_worker_rating(db, current_user.id),
        unread_messages=_unread_message_count(db, current_user.id),
        profile_completion=get_profile_completion(profile) if profile else 0,
        availability=profile.availability if profile else False,
    )
