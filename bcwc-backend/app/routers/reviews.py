from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user, require_customer
from app.database.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.job import Job
from app.models.notification import NotificationType
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewDetail, ReviewOut, ReviewUpdate
from app.models.user import User
from app.services.notification_service import notify

router = APIRouter(tags=["Reviews"])


@router.post(
    "/api/reviews",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
    summary="Leave a review for a worker after a completed job (CUSTOMER role only)",
)
def create_review(payload: ReviewCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    job = db.get(Job, payload.job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only review jobs you posted")

    completed_booking = (
        db.query(Booking)
        .filter(
            Booking.job_id == payload.job_id,
            Booking.worker_id == payload.worker_id,
            Booking.customer_id == current_user.id,
            Booking.status == BookingStatus.COMPLETED,
        )
        .first()
    )
    if completed_booking is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only review a worker after a completed booking with them for this job",
        )

    existing = db.query(Review).filter(Review.customer_id == current_user.id, Review.job_id == payload.job_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this job")

    review = Review(
        customer_id=current_user.id,
        worker_id=payload.worker_id,
        job_id=payload.job_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    notify(
        db,
        user_id=payload.worker_id,
        type=NotificationType.NEW_REVIEW,
        title="New review",
        message=f"You received a {payload.rating}-star review from {current_user.name}.",
        related_type="review",
        related_id=review.id,
    )

    return review


@router.get(
    "/api/workers/{worker_id}/reviews",
    response_model=list[ReviewDetail],
    summary="List a worker's reviews (public)",
)
def list_worker_reviews(worker_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.customer))
        .filter(Review.worker_id == worker_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews


@router.put("/api/reviews/{review_id}", response_model=ReviewOut, summary="Edit your own review (owning CUSTOMER only)")
def update_review(review_id: int, payload: ReviewUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own reviews")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(review, field, value)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/api/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete your own review (owning CUSTOMER only)")
def delete_review(review_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own reviews")

    db.delete(review)
    db.commit()
