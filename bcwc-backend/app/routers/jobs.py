from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user, require_customer
from app.database.database import get_db
from app.models.application import Application
from app.models.job import Job, JobStatus
from app.models.user import User, UserRole
from app.schemas.job import JobCreate, JobDetail, JobOut, JobUpdate

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


def _to_detail(db: Session, job: Job) -> JobDetail:
    applicant_count = db.query(Application).filter(Application.job_id == job.id).count()
    return JobDetail(
        **JobOut.model_validate(job).model_dump(),
        customer=job.customer,
        applicant_count=applicant_count,
    )


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED, summary="Post a new job (CUSTOMER role only)")
def create_job(payload: JobCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    job = Job(customer_id=current_user.id, status=JobStatus.OPEN, **payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("", response_model=list[JobOut], summary="List jobs")
def list_jobs(
    status_filter: JobStatus | None = Query(None, alias="status"),
    service_id: int | None = Query(None),
    location: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Public browsing endpoint, showing OPEN jobs by default (workers need to
    browse jobs to apply to them). Pass an explicit `status` filter to see
    jobs in other states. Use GET /api/jobs/mine to see your own jobs as a
    customer regardless of status.
    """
    query = db.query(Job)

    if service_id is not None:
        query = query.filter(Job.service_id == service_id)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if status_filter is not None:
        query = query.filter(Job.status == status_filter)
    else:
        query = query.filter(Job.status == JobStatus.OPEN)

    return query.order_by(Job.created_at.desc()).all()


@router.get("/mine", response_model=list[JobOut], summary="List your own posted jobs (CUSTOMER role only)")
def list_my_jobs(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return db.query(Job).filter(Job.customer_id == current_user.id).order_by(Job.created_at.desc()).all()


@router.get("/{job_id}", response_model=JobDetail, summary="Get a job's details")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).options(joinedload(Job.customer)).filter(Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return _to_detail(db, job)


@router.put("/{job_id}", response_model=JobOut, summary="Update a job (owning CUSTOMER only)")
def update_job(job_id: int, payload: JobUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only modify your own jobs")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a job (owning CUSTOMER only)")
def delete_job(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own jobs")

    db.delete(job)
    db.commit()
