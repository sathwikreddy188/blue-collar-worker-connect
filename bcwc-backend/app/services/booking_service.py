from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.application import Application, ApplicationStatus
from app.models.booking import Booking, BookingStatus
from app.models.job import Job, JobStatus
from app.models.notification import NotificationType
from app.models.user import User
from app.models.worker import WorkerProfile
from app.schemas.booking import BookingCreate, BookingStatusUpdate
from app.services.notification_service import notify


def create_booking(db: Session, customer: User, payload: BookingCreate) -> Booking:
    job = db.get(Job, payload.job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.customer_id != customer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only book on your own jobs")

    application = db.get(Application, payload.application_id)
    if not application or application.job_id != job.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found for this job")
    if application.status != ApplicationStatus.ACCEPTED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only an accepted application can be booked")

    existing = db.query(Booking).filter(Booking.job_id == job.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A booking already exists for this job")

    booking = Booking(
        job_id=job.id,
        customer_id=customer.id,
        worker_id=application.worker_id,
        scheduled_date=payload.scheduled_date,
        scheduled_time=payload.scheduled_time,
        price=application.proposed_price,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    notify(
        db,
        user_id=booking.worker_id,
        type_=NotificationType.BOOKING_CREATED,
        title="Booking confirmed",
        message=f"A booking was created for \"{job.title}\".",
        related_id=booking.id,
    )
    return booking


def update_booking_status(db: Session, booking: Booking, current_user: User, payload: BookingStatusUpdate) -> Booking:
    if current_user.id not in (booking.customer_id, booking.worker_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not part of this booking")

    booking.status = payload.status
    job = db.get(Job, booking.job_id)

    if payload.status == BookingStatus.IN_PROGRESS and job:
        job.status = JobStatus.IN_PROGRESS
    elif payload.status == BookingStatus.COMPLETED and job:
        job.status = JobStatus.COMPLETED
        worker_profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == booking.worker_id).first()
        if worker_profile:
            worker_profile.completed_jobs_count += 1
        notify(
            db,
            user_id=booking.customer_id,
            type_=NotificationType.JOB_COMPLETED,
            title="Job completed",
            message=f"Your job \"{job.title}\" has been marked complete. Leave a review!",
            related_id=job.id,
        )
    elif payload.status == BookingStatus.CANCELLED and job:
        job.status = JobStatus.CANCELLED

    notify(
        db,
        user_id=booking.worker_id if current_user.id == booking.customer_id else booking.customer_id,
        type_=NotificationType.BOOKING_STATUS_CHANGED,
        title="Booking status updated",
        message=f"Booking #{booking.id} is now {payload.status.value}.",
        related_id=booking.id,
    )

    db.commit()
    db.refresh(booking)
    return booking
