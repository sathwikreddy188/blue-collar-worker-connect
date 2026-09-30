from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_worker
from app.database.database import get_db
from app.models.earning import Earning
from app.models.user import User
from app.models.worker_availability import WorkerAvailability
from app.schemas.worker_extras import AvailabilitySlotCreate, AvailabilitySlotOut, EarningOut

router = APIRouter(tags=["Worker Schedule & Earnings"])


@router.put(
    "/api/workers/schedule",
    response_model=list[AvailabilitySlotOut],
    summary="Set your weekly availability schedule (WORKER role only)",
)
def set_schedule(payload: list[AvailabilitySlotCreate], current_user: User = Depends(require_worker), db: Session = Depends(get_db)):
    """
    Replaces your entire weekly schedule with the slots given (one slot per
    day at most). This is separate from PUT /api/workers/availability, which
    is the simple "available right now" on/off toggle shown on the dashboard.
    """
    days = [slot.day for slot in payload]
    if len(days) != len(set(days)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Each day can only appear once")

    db.query(WorkerAvailability).filter(WorkerAvailability.worker_id == current_user.id).delete()
    slots = [WorkerAvailability(worker_id=current_user.id, **slot.model_dump()) for slot in payload]
    db.add_all(slots)
    db.commit()
    for s in slots:
        db.refresh(s)
    return slots


@router.get("/api/workers/{worker_id}/schedule", response_model=list[AvailabilitySlotOut], summary="Get a worker's weekly schedule (public)")
def get_schedule(worker_id: int, db: Session = Depends(get_db)):
    return db.query(WorkerAvailability).filter(WorkerAvailability.worker_id == worker_id).order_by(WorkerAvailability.day).all()


@router.get("/api/worker/earnings", response_model=list[EarningOut], summary="List your earnings history (WORKER role only)")
def list_my_earnings(current_user: User = Depends(require_worker), db: Session = Depends(get_db)):
    return db.query(Earning).filter(Earning.worker_id == current_user.id).order_by(Earning.created_at.desc()).all()
