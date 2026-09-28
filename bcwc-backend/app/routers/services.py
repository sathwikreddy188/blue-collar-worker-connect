import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.service import Service
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceOut

router = APIRouter(prefix="/api/services", tags=["Services"])


def _slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


@router.get("", response_model=list[ServiceOut], summary="List all service categories")
def list_services(db: Session = Depends(get_db)):
    """Public endpoint — no authentication required. Used to populate category
    pickers on the frontend (job posting form, worker registration, filters)."""
    return db.query(Service).order_by(Service.name).all()


@router.post(
    "",
    response_model=ServiceOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new service category",
)
def create_service(payload: ServiceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Any authenticated user can add a new category for this demo. In a real
    deployment, restrict this to an ADMIN role — this codebase does not
    define one yet, so treat this endpoint as needing that hardening before
    going to production.
    """
    slug = _slugify(payload.name)
    if db.query(Service).filter(Service.slug == slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A service with this name already exists")

    service = Service(name=payload.name.strip(), slug=slug, description=payload.description, icon=payload.icon)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service
