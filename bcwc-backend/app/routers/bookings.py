from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_customer
from app.database.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.job import Job, JobStatus
from app.models.notification import NotificationType
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate
from app.services.notification_service import notify

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post(
    "",
    response_model=BookingOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a booking directly (CUSTOMER role only)",
)
def create_booking(payload: BookingCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    """
    Bookings are usually created automatically when a customer accepts a
    worker's application (see PUT /api/applications/{id}). This endpoint
    exists for cases where a customer books a worker directly without a
    separate application step.
    """
    job = db.get(Job, payload.job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only book workers for your own jobs")

    worker = db.get(User, payload.worker_id)
    if worker is None or worker.role.value != "WORKER":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="worker_id does not belong to a valid worker")

    booking = Booking(
        job_id=payload.job_id,
        customer_id=current_user.id,
        worker_id=payload.worker_id,
        scheduled_date=payload.scheduled_date,
        scheduled_time=payload.scheduled_time,
        price=payload.price,
        status=BookingStatus.PENDING,
    )
    db.add(booking)
    job.status = JobStatus.ACCEPTED
    db.commit()
    db.refresh(booking)

    notify(
        db,
        user_id=payload.worker_id,
        type=NotificationType.BOOKING_CREATED,
        title="Booking confirmed",
        message=f"You have a new booking for \"{job.title}\".",
        related_type="booking",
        related_id=booking.id,
    )

    return booking


@router.get("", response_model=list[BookingOut], summary="List your own bookings")
def list_my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns bookings where you are either the customer or the worker."""
    return (
        db.query(Booking)
        .filter(or_(Booking.customer_id == current_user.id, Booking.worker_id == current_user.id))
        .order_by(Booking.created_at.desc())
        .all()
    )


@router.get("/{booking_id}", response_model=BookingOut, summary="Get a booking's details")
def get_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if current_user.id not in (booking.customer_id, booking.worker_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this booking")
    return booking


@router.put("/{booking_id}/status", response_model=BookingOut, summary="Update a booking's status")
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Either party (customer or worker) on the booking may update its status.
    Marking a booking COMPLETED also marks its underlying job COMPLETED,
    which unlocks the customer's ability to leave a review."""
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if current_user.id not in (booking.customer_id, booking.worker_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this booking")

    booking.status = payload.status

    if payload.status == BookingStatus.COMPLETED:
        job = db.get(Job, booking.job_id)
        if job is not None:
            job.status = JobStatus.COMPLETED
            notify(
                db,
                user_id=job.customer_id,
                type=NotificationType.JOB_COMPLETED,
                title="Job completed",
                message=f"Your job \"{job.title}\" has been marked complete. You can now leave a review.",
                related_type="job",
                related_id=job.id,
                commit=False,
            )

    other_party_id = booking.worker_id if current_user.id == booking.customer_id else booking.customer_id
    notify(
        db,
        user_id=other_party_id,
        type=NotificationType.BOOKING_STATUS_CHANGED,
        title="Booking updated",
        message=f"Booking #{booking.id} status changed to {payload.status.value}.",
        related_type="booking",
        related_id=booking.id,
        commit=False,
    )

    db.commit()
    db.refresh(booking)
    return booking
