from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_customer
from app.database.database import get_db
from app.models.saved_worker import SavedWorker
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.schemas.common import Message
from app.schemas.saved_worker import SavedWorkerOut
from app.services.worker_service import get_worker_jobs_completed, get_worker_rating
from app.schemas.worker import WorkerListItem

router = APIRouter(prefix="/api/saved-workers", tags=["Saved Workers"])


@router.post(
    "/{worker_id}",
    response_model=SavedWorkerOut,
    status_code=status.HTTP_201_CREATED,
    summary="Save a worker as a favorite (CUSTOMER role only)",
)
def save_worker(worker_id: int, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    worker = db.query(User).filter(User.id == worker_id, User.role == UserRole.WORKER).first()
    if worker is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

    existing = db.query(SavedWorker).filter(SavedWorker.customer_id == current_user.id, SavedWorker.worker_id == worker_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Worker already saved")

    saved = SavedWorker(customer_id=current_user.id, worker_id=worker_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)

    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker_id).first()
    worker_item = WorkerListItem(
        id=worker.id,
        name=worker.name,
        profession=profile.profession if profile else "",
        experience_years=profile.experience_years if profile else 0,
        location=profile.location if profile else "",
        rating=get_worker_rating(db, worker.id),
        jobs_completed=get_worker_jobs_completed(db, worker.id),
        hourly_rate=profile.hourly_rate if profile else 0,
        availability=profile.availability if profile else False,
        profile_image=profile.profile_image if profile else None,
    )
    return SavedWorkerOut(id=saved.id, worker=worker_item, created_at=saved.created_at)


@router.delete("/{worker_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Unsave a worker (CUSTOMER role only)")
def unsave_worker(worker_id: int, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    saved = db.query(SavedWorker).filter(SavedWorker.customer_id == current_user.id, SavedWorker.worker_id == worker_id).first()
    if saved is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This worker is not in your saved list")

    db.delete(saved)
    db.commit()


@router.get("", response_model=list[SavedWorkerOut], summary="List your saved workers (CUSTOMER role only)")
def list_saved_workers(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    saved_rows = db.query(SavedWorker).filter(SavedWorker.customer_id == current_user.id).order_by(SavedWorker.created_at.desc()).all()

    results = []
    for saved in saved_rows:
        worker = db.get(User, saved.worker_id)
        profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == saved.worker_id).first()
        worker_item = WorkerListItem(
            id=worker.id,
            name=worker.name,
            profession=profile.profession if profile else "",
            experience_years=profile.experience_years if profile else 0,
            location=profile.location if profile else "",
            rating=get_worker_rating(db, worker.id),
            jobs_completed=get_worker_jobs_completed(db, worker.id),
            hourly_rate=profile.hourly_rate if profile else 0,
            availability=profile.availability if profile else False,
            profile_image=profile.profile_image if profile else None,
        )
        results.append(SavedWorkerOut(id=saved.id, worker=worker_item, created_at=saved.created_at))
    return results
