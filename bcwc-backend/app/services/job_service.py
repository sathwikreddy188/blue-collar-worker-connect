from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.models.application import Application, ApplicationStatus
from app.models.job import Job, JobStatus
from app.models.notification import NotificationType
from app.models.service import Service
from app.models.user import User, UserRole
from app.schemas.job import JobCreate, JobUpdate
from app.services.notification_service import notify


def get_job_or_404(db: Session, job_id: int) -> Job:
    job = db.query(Job).options(selectinload(Job.customer)).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


def create_job(db: Session, customer: User, payload: JobCreate) -> Job:
    service = db.get(Service, payload.service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown service_id")

    job = Job(customer_id=customer.id, **payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def update_job(db: Session, job: Job, current_user: User, payload: JobUpdate) -> Job:
    _assert_job_owner(job, current_user)
    if job.status in (JobStatus.COMPLETED, JobStatus.CANCELLED):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This job can no longer be edited")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job: Job, current_user: User) -> None:
    _assert_job_owner(job, current_user)
    if job.status not in (JobStatus.OPEN,):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only open jobs without an accepted worker can be deleted")
    db.delete(job)
    db.commit()


def _assert_job_owner(job: Job, current_user: User) -> None:
    if job.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage your own jobs")


def apply_to_job(db: Session, job: Job, worker: User, message: str | None, proposed_price: float) -> Application:
    if job.customer_id == worker.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot apply to your own job")
    if job.status != JobStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This job is no longer accepting applications")

    existing = (
        db.query(Application)
        .filter(Application.job_id == job.id, Application.worker_id == worker.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this job")

    application = Application(job_id=job.id, worker_id=worker.id, message=message, proposed_price=proposed_price)
    db.add(application)

    job.status = JobStatus.REQUESTED
    db.commit()
    db.refresh(application)

    notify(
        db,
        user_id=job.customer_id,
        type_=NotificationType.JOB_APPLICATION,
        title="New job request",
        message=f"{worker.name} applied to your job \"{job.title}\".",
        related_id=job.id,
    )
    return application


def decide_application(db: Session, application: Application, customer: User, new_status: ApplicationStatus) -> Application:
    job = get_job_or_404(db, application.job_id)
    _assert_job_owner(job, customer)

    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This application has already been decided")

    if new_status == ApplicationStatus.ACCEPTED:
        already_accepted = (
            db.query(Application)
            .filter(Application.job_id == job.id, Application.status == ApplicationStatus.ACCEPTED)
            .first()
        )
        if already_accepted:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A worker has already been accepted for this job")

        application.status = ApplicationStatus.ACCEPTED
        job.status = JobStatus.ACCEPTED

        # Auto-reject every other pending application for this job.
        others = (
            db.query(Application)
            .filter(Application.job_id == job.id, Application.id != application.id, Application.status == ApplicationStatus.PENDING)
            .all()
        )
        for other in others:
            other.status = ApplicationStatus.REJECTED
            notify(
                db,
                user_id=other.worker_id,
                type_=NotificationType.APPLICATION_REJECTED,
                title="Application not selected",
                message=f"The customer chose another worker for \"{job.title}\".",
                related_id=job.id,
            )

        notify(
            db,
            user_id=application.worker_id,
            type_=NotificationType.APPLICATION_ACCEPTED,
            title="Worker accepted your request",
            message=f"You were accepted for \"{job.title}\".",
            related_id=job.id,
        )
    elif new_status == ApplicationStatus.REJECTED:
        application.status = ApplicationStatus.REJECTED
        notify(
            db,
            user_id=application.worker_id,
            type_=NotificationType.APPLICATION_REJECTED,
            title="Application not selected",
            message=f"The customer chose another worker for \"{job.title}\".",
            related_id=job.id,
        )
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="status must be ACCEPTED or REJECTED")

    db.commit()
    db.refresh(application)
    return application
