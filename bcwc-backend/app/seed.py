"""
Seed the database with sample data for local development and for the
frontend to develop against.

Usage:
    python -m app.seed

Safe to re-run: it checks for existing records by email/name before
inserting, so running it twice won't create duplicates.
"""

from datetime import date, timedelta

from app.core.security import hash_password
from app.database.base import Base
from app.database.database import SessionLocal, engine
from app.models.application import Application, ApplicationStatus
from app.models.booking import Booking, BookingStatus
from app.models.job import Job, JobStatus
from app.models.review import Review
from app.models.service import Service, WorkerService
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile

SERVICES = [
    ("Electrician", "Wiring, fittings & repairs"),
    ("Plumber", "Leaks, pipes & fixtures"),
    ("Carpenter", "Furniture & woodwork"),
    ("Painter", "Interior & exterior painting"),
    ("Mechanic", "Two & four wheeler repair"),
    ("Cleaner", "Home & office cleaning"),
]

WORKERS = [
    {
        "name": "Raj Kumar", "email": "raj.kumar@example.com", "phone": "9000000101",
        "profession": "Electrician", "experience_years": 6, "hourly_rate": 500,
        "bio": "Licensed electrician with six years of residential and commercial wiring experience.",
    },
    {
        "name": "Suresh Kumar", "email": "suresh.kumar@example.com", "phone": "9000000102",
        "profession": "Plumber", "experience_years": 9, "hourly_rate": 400,
        "bio": "Experienced plumber handling everything from small leaks to full bathroom fittings.",
    },
    {
        "name": "Ravi Kumar", "email": "ravi.kumar@example.com", "phone": "9000000103",
        "profession": "Carpenter", "experience_years": 12, "hourly_rate": 600,
        "bio": "Custom furniture and woodwork specialist for wardrobes and modular kitchens.",
    },
    {
        "name": "Mahesh Kumar", "email": "mahesh.kumar@example.com", "phone": "9000000104",
        "profession": "Painter", "experience_years": 8, "hourly_rate": 350,
        "bio": "Interior and exterior painting with careful surface preparation.",
    },
]

CUSTOMER = {"name": "Arun Kumar", "email": "arun.kumar@example.com", "phone": "9000000201"}

PASSWORD = "password123"


def get_or_create_service(db, name, description):
    slug = name.lower()
    service = db.query(Service).filter(Service.slug == slug).first()
    if service:
        return service
    service = Service(name=name, slug=slug, description=description)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


def get_or_create_user(db, name, email, phone, role):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(name=name, email=email, phone=phone, password_hash=hash_password(PASSWORD), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding services...")
        services_by_name = {}
        for name, description in SERVICES:
            services_by_name[name] = get_or_create_service(db, name, description)

        print("Seeding customer...")
        customer = get_or_create_user(db, CUSTOMER["name"], CUSTOMER["email"], CUSTOMER["phone"], UserRole.CUSTOMER)

        print("Seeding workers...")
        worker_users = []
        for w in WORKERS:
            user = get_or_create_user(db, w["name"], w["email"], w["phone"], UserRole.WORKER)
            worker_users.append((user, w))

            profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == user.id).first()
            if not profile:
                profile = WorkerProfile(
                    user_id=user.id,
                    profession=w["profession"],
                    bio=w["bio"],
                    experience_years=w["experience_years"],
                    location="Hyderabad",
                    hourly_rate=w["hourly_rate"],
                    availability=True,
                    is_verified=True,
                )
                db.add(profile)
                db.commit()

            service = services_by_name.get(w["profession"])
            if service:
                existing_ws = (
                    db.query(WorkerService)
                    .filter(WorkerService.worker_id == user.id, WorkerService.service_id == service.id)
                    .first()
                )
                if not existing_ws:
                    db.add(WorkerService(worker_id=user.id, service_id=service.id, price=w["hourly_rate"]))
                    db.commit()

        print("Seeding a sample completed job + booking + review...")
        electrician_user = worker_users[0][0]
        electrician_service = services_by_name["Electrician"]

        job = db.query(Job).filter(Job.customer_id == customer.id, Job.title == "Home wiring repair").first()
        if not job:
            job = Job(
                customer_id=customer.id,
                service_id=electrician_service.id,
                title="Home wiring repair",
                description="Two faulty switchboards need fixing and one new point added.",
                location="Hyderabad",
                budget_min=1000,
                budget_max=2000,
                preferred_date=date.today() + timedelta(days=3),
                preferred_time="Morning",
                status=JobStatus.COMPLETED,
            )
            db.add(job)
            db.commit()
            db.refresh(job)

            application = Application(
                job_id=job.id,
                worker_id=electrician_user.id,
                message="I can help with this, available this week.",
                proposed_price=1500,
                status=ApplicationStatus.ACCEPTED,
            )
            db.add(application)

            booking = Booking(
                job_id=job.id,
                customer_id=customer.id,
                worker_id=electrician_user.id,
                scheduled_date=date.today() + timedelta(days=3),
                scheduled_time="Morning",
                price=1500,
                status=BookingStatus.COMPLETED,
            )
            db.add(booking)
            db.commit()

            review = Review(
                customer_id=customer.id,
                worker_id=electrician_user.id,
                job_id=job.id,
                rating=5,
                comment="Very professional and completed the work quickly.",
            )
            db.add(review)
            db.commit()

        print("Seeding an open job (no applications yet)...")
        plumber_service = services_by_name["Plumber"]
        open_job = db.query(Job).filter(Job.customer_id == customer.id, Job.title == "Bathroom leak needs repair").first()
        if not open_job:
            open_job = Job(
                customer_id=customer.id,
                service_id=plumber_service.id,
                title="Bathroom leak needs repair",
                description="Water leaking from the ceiling below the bathroom.",
                location="Hyderabad",
                budget_min=800,
                budget_max=1500,
                preferred_date=date.today() + timedelta(days=1),
                preferred_time="Afternoon",
                status=JobStatus.OPEN,
            )
            db.add(open_job)
            db.commit()

        print("\nSeed complete.")
        print(f"  Customer login:  {CUSTOMER['email']} / {PASSWORD}")
        print("  Worker logins:")
        for user, w in worker_users:
            print(f"    {w['profession']:<12} {user.email} / {PASSWORD}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
