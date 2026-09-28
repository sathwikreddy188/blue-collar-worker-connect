from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user, require_worker
from app.database.database import get_db
from app.models.service import Service, WorkerService
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.schemas.service import WorkerServiceCreate, WorkerServiceOut
from app.schemas.worker import (
    AvailabilityUpdate,
    WorkerDetail,
    WorkerListItem,
    WorkerProfileCreate,
    WorkerProfileUpdate,
)
from app.services.worker_service import get_worker_jobs_completed, get_worker_rating

router = APIRouter(prefix="/api/workers", tags=["Workers"])


def _to_list_item(db: Session, user: User, profile: WorkerProfile) -> WorkerListItem:
    return WorkerListItem(
        id=user.id,
        name=user.name,
        profession=profile.profession,
        experience_years=profile.experience_years,
        location=profile.location,
        rating=get_worker_rating(db, user.id),
        jobs_completed=get_worker_jobs_completed(db, user.id),
        hourly_rate=profile.hourly_rate,
        availability=profile.availability,
        profile_image=profile.profile_image,
    )


def _get_own_profile(current_user: User, db: Session) -> WorkerProfile:
    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
    return profile


@router.post(
    "/profile",
    response_model=WorkerDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Create your worker profile (WORKER role only)",
)
def create_worker_profile(
    payload: WorkerProfileCreate,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db),
):
    if db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Worker profile already exists")

    profile = WorkerProfile(user_id=current_user.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return WorkerDetail(
        **_to_list_item(db, current_user, profile).model_dump(),
        bio=profile.bio,
        is_verified=profile.is_verified,
        created_at=profile.created_at,
        services=[],
    )


@router.get("/profile", response_model=WorkerDetail, summary="Get your own worker profile (WORKER role only)")
def get_my_worker_profile(current_user: User = Depends(require_worker), db: Session = Depends(get_db)):
    profile = _get_own_profile(current_user, db)
    worker_services = (
        db.query(WorkerService).options(joinedload(WorkerService.service)).filter(WorkerService.worker_id == current_user.id).all()
    )
    return WorkerDetail(
        **_to_list_item(db, current_user, profile).model_dump(),
        bio=profile.bio,
        is_verified=profile.is_verified,
        created_at=profile.created_at,
        services=[WorkerServiceOut.model_validate(ws) for ws in worker_services],
    )


@router.put("/profile", response_model=WorkerDetail, summary="Update your own worker profile (WORKER role only)")
def update_my_worker_profile(
    payload: WorkerProfileUpdate,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db),
):
    profile = _get_own_profile(current_user, db)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return get_my_worker_profile(current_user, db)


@router.put("/availability", response_model=WorkerDetail, summary="Turn your availability on/off (WORKER role only)")
def update_availability(
    payload: AvailabilityUpdate,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db),
):
    profile = _get_own_profile(current_user, db)
    profile.availability = payload.available
    db.commit()
    db.refresh(profile)
    return get_my_worker_profile(current_user, db)


@router.get("", response_model=list[WorkerListItem], summary="Search / list workers")
def list_workers(
    service: str | None = Query(None, description="Service slug or name, e.g. 'electrician'"),
    location: str | None = Query(None, description="Substring match on location"),
    min_experience: int | None = Query(None, ge=0),
    min_rating: float | None = Query(None, ge=0, le=5),
    availability: bool | None = Query(None),
    minimum_price: float | None = Query(None, ge=0),
    maximum_price: float | None = Query(None, ge=0),
    db: Session = Depends(get_db),
):
    """Public endpoint. All filters are optional and combine with AND."""
    query = db.query(User, WorkerProfile).join(WorkerProfile, WorkerProfile.user_id == User.id).filter(
        User.role == UserRole.WORKER, User.is_active == True  # noqa: E712
    )

    if location:
        query = query.filter(WorkerProfile.location.ilike(f"%{location}%"))
    if min_experience is not None:
        query = query.filter(WorkerProfile.experience_years >= min_experience)
    if availability is not None:
        query = query.filter(WorkerProfile.availability == availability)
    if minimum_price is not None:
        query = query.filter(WorkerProfile.hourly_rate >= minimum_price)
    if maximum_price is not None:
        query = query.filter(WorkerProfile.hourly_rate <= maximum_price)

    if service:
        query = query.join(WorkerService, WorkerService.worker_id == User.id).join(
            Service, Service.id == WorkerService.service_id
        ).filter((Service.slug == service) | (Service.name.ilike(f"%{service}%")))

    results = [_to_list_item(db, user, profile) for user, profile in query.all()]

    if min_rating is not None:
        results = [r for r in results if r.rating >= min_rating]

    return results


@router.get("/{worker_id}", response_model=WorkerDetail, summary="Get a worker's public profile")
def get_worker_detail(worker_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == worker_id, User.role == UserRole.WORKER).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker_id).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")

    worker_services = (
        db.query(WorkerService).options(joinedload(WorkerService.service)).filter(WorkerService.worker_id == worker_id).all()
    )

    return WorkerDetail(
        **_to_list_item(db, user, profile).model_dump(),
        bio=profile.bio,
        is_verified=profile.is_verified,
        created_at=profile.created_at,
        services=[WorkerServiceOut.model_validate(ws) for ws in worker_services],
    )


@router.get("/{worker_id}/services", response_model=list[WorkerServiceOut], summary="List a worker's services")
def get_worker_services(worker_id: int, db: Session = Depends(get_db)):
    worker_services = (
        db.query(WorkerService).options(joinedload(WorkerService.service)).filter(WorkerService.worker_id == worker_id).all()
    )
    return [WorkerServiceOut.model_validate(ws) for ws in worker_services]


@router.post(
    "/services",
    response_model=WorkerServiceOut,
    status_code=status.HTTP_201_CREATED,
    summary="Add a service you offer (WORKER role only)",
)
def add_my_service(
    payload: WorkerServiceCreate,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db),
):
    service = db.get(Service, payload.service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service category not found")

    existing = (
        db.query(WorkerService)
        .filter(WorkerService.worker_id == current_user.id, WorkerService.service_id == payload.service_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already offer this service")

    worker_service = WorkerService(worker_id=current_user.id, service_id=payload.service_id, price=payload.price)
    db.add(worker_service)
    db.commit()
    db.refresh(worker_service)
    return WorkerServiceOut.model_validate(worker_service)


@router.delete(
    "/services/{worker_service_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove one of your services (WORKER role only)",
)
def remove_my_service(
    worker_service_id: int,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db),
):
    worker_service = db.get(WorkerService, worker_service_id)
    if worker_service is None or worker_service.worker_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found on your profile")

    db.delete(worker_service)
    db.commit()
