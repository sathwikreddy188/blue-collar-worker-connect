from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user, require_customer, require_worker
from app.database.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.booking import Booking, BookingStatus
from app.models.job import Job, JobStatus
from app.models.notification import NotificationType
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationDetail, ApplicationOut, ApplicationStatusUpdate
from app.services.notification_service import notify

router = APIRouter(tags=["Applications"])


@router.post(
    "/api/jobs/{job_id}/apply",
    response_model=ApplicationOut,
    status_code=status.HTTP_201_CREATED,
    summary="Apply for a job (WORKER role only)",
)
def apply_to_job(
    job_id: int,
    payload: ApplicationCreate,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db),
):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job.customer_id == current_user.id:
        # Defensive: customer_id belongs to a different role than worker_id in
        # normal operation, but this guards against role-swapped edge cases.
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot apply to your own job")

    if job.status != JobStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This job is no longer accepting applications")

    existing = db.query(Application).filter(Application.job_id == job_id, Application.worker_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this job")

    application = Application(job_id=job_id, worker_id=current_user.id, **payload.model_dump())
    db.add(application)

    # Note: the job intentionally stays OPEN here so that other workers can
    # also apply. It only moves to ACCEPTED once the customer picks one
    # applicant (see the ACCEPTED branch below), at which point the other
    # pending applications are auto-rejected.
    db.commit()
    db.refresh(application)

    notify(
        db,
        user_id=job.customer_id,
        type=NotificationType.JOB_APPLICATION,
        title="New job application",
        message=f"{current_user.name} applied to your job \"{job.title}\".",
        related_type="job",
        related_id=job.id,
    )

    return application


@router.get(
    "/api/jobs/{job_id}/applications",
    response_model=list[ApplicationDetail],
    summary="List applications for a job (owning CUSTOMER only)",
)
def list_job_applications(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view applications for your own jobs")

    applications = (
        db.query(Application)
        .options(joinedload(Application.worker))
        .filter(Application.job_id == job_id)
        .order_by(Application.created_at.desc())
        .all()
    )
    return applications


@router.get(
    "/api/worker/applications",
    response_model=list[ApplicationOut],
    summary="List your own job applications (WORKER role only)",
)
def list_my_applications(current_user: User = Depends(require_worker), db: Session = Depends(get_db)):
    return (
        db.query(Application)
        .filter(Application.worker_id == current_user.id)
        .order_by(Application.created_at.desc())
        .all()
    )


@router.put(
    "/api/applications/{application_id}",
    response_model=ApplicationOut,
    summary="Accept, reject, or cancel an application",
)
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    - The job's owning customer may set status to ACCEPTED or REJECTED.
    - The applying worker may set status to CANCELLED.
    Accepting an application automatically rejects the other pending
    applications for that job, moves the job to ACCEPTED, and creates a
    PENDING booking.
    """
    application = db.get(Application, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = db.get(Job, application.job_id)

    is_owning_customer = job.customer_id == current_user.id
    is_applying_worker = application.worker_id == current_user.id

    if payload.status in (ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED) and not is_owning_customer:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the job's customer can accept or reject applications")
    if payload.status == ApplicationStatus.CANCELLED and not is_applying_worker:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the applying worker can cancel an application")

    application.status = payload.status

    if payload.status == ApplicationStatus.ACCEPTED:
        job.status = JobStatus.ACCEPTED

        # Reject every other pending application for this job.
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
                type=NotificationType.APPLICATION_REJECTED,
                title="Application not selected",
                message=f"The customer chose another worker for \"{job.title}\".",
                related_type="job",
                related_id=job.id,
                commit=False,
            )

        booking = Booking(
            job_id=job.id,
            customer_id=job.customer_id,
            worker_id=application.worker_id,
            price=application.proposed_price or job.budget_min,
            status=BookingStatus.PENDING,
        )
        db.add(booking)

        notify(
            db,
            user_id=application.worker_id,
            type=NotificationType.APPLICATION_ACCEPTED,
            title="Application accepted",
            message=f"Your application for \"{job.title}\" was accepted.",
            related_type="job",
            related_id=job.id,
            commit=False,
        )

    elif payload.status == ApplicationStatus.REJECTED:
        notify(
            db,
            user_id=application.worker_id,
            type=NotificationType.APPLICATION_REJECTED,
            title="Application not selected",
            message=f"The customer chose another worker for \"{job.title}\".",
            related_type="job",
            related_id=job.id,
            commit=False,
        )

    db.commit()
    db.refresh(application)
    return application
