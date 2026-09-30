"""
Seed the database with sample data for frontend development.

Usage (from the backend/ folder):
    python seed.py          # seed only if the database is empty
    python seed.py --reset  # wipe all data first, then seed

All seeded accounts use the password: password123
"""
import sys
from datetime import date, time, timedelta

from app.core.security import hash_password
from app.database.base import Base
from app.database.database import SessionLocal, engine
from app.models import *  # noqa: F401,F403
from app.models.application import Application, ApplicationStatus
from app.models.booking import Booking, BookingStatus
from app.models.job import Job, JobStatus
from app.models.message import Conversation, Message
from app.models.notification import Notification, NotificationType
from app.models.review import Review
from app.models.saved_worker import SavedWorker
from app.models.service import Service, WorkerService
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.models.worker_availability import WorkerAvailability, Weekday
from app.models.earning import Earning

PASSWORD = "password123"

SERVICES = [
    ("Electrician", "electrician", "Wiring, fittings & repairs"),
    ("Plumber", "plumber", "Leaks, pipes & fixtures"),
    ("Carpenter", "carpenter", "Furniture & woodwork"),
    ("Painter", "painter", "Interior & exterior painting"),
    ("Mechanic", "mechanic", "Two & four wheeler repair"),
    ("Cleaner", "cleaner", "Home & office cleaning"),
    ("AC Repair", "ac-repair", "Service, gas fill & install"),
    ("Appliance Repair", "appliance-repair", "Washing machines, fridges"),
    ("Mason", "mason", "Construction & tiling"),
    ("Driver", "driver", "Local & outstation driving"),
    ("Gardener", "gardener", "Lawn & garden upkeep"),
    ("Other Services", "other-services", "Everything else"),
]

# (name, email, phone, profession, service slug, location, years, rate, available, bio, extra services)
WORKERS = [
    ("Raj Kumar", "raj@example.com", "9000000101", "Electrician", "electrician", "Ameerpet, Hyderabad", 6, 500, True,
     "Licensed electrician for residential and commercial wiring.", ["House wiring", "Switchboard repair"]),
    ("Suresh Kumar", "suresh@example.com", "9000000102", "Plumber", "plumber", "Kukatpally, Hyderabad", 9, 400, True,
     "Handles everything from small leaks to full bathroom fittings.", ["Leak repair", "Bathroom fitting"]),
    ("Ravi Kumar", "ravi@example.com", "9000000103", "Carpenter", "carpenter", "Madhapur, Hyderabad", 12, 600, False,
     "Custom furniture and modular kitchens.", ["Custom furniture", "Wardrobe fitting"]),
    ("Mahesh Kumar", "mahesh@example.com", "9000000104", "Painter", "painter", "Miyapur, Hyderabad", 8, 350, True,
     "Interior and exterior painting with careful surface prep.", ["Interior painting", "Waterproofing"]),
]


def reset(db):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if "--reset" in sys.argv:
            db.close()
            reset(None)
            db = SessionLocal()
        elif db.query(User).count() > 0:
            print("Database already has data. Run `python seed.py --reset` to wipe and reseed.")
            return

        # Services
        services = {}
        for name, slug, desc in SERVICES:
            s = Service(name=name, slug=slug, description=desc)
            db.add(s)
            services[slug] = s
        db.flush()

        # Customer
        customer = User(name="Arun Kumar", email="arun@example.com", phone="9000000001",
                        password_hash=hash_password(PASSWORD), role=UserRole.CUSTOMER)
        db.add(customer)

        # Workers
        workers = []
        for name, email, phone, prof, slug, loc, yrs, rate, avail, bio, _extra in WORKERS:
            u = User(name=name, email=email, phone=phone, password_hash=hash_password(PASSWORD), role=UserRole.WORKER)
            db.add(u)
            db.flush()
            db.add(WorkerProfile(user_id=u.id, profession=prof, bio=bio, experience_years=yrs, location=loc,
                                 hourly_rate=rate, availability=avail, is_verified=True))
            db.add(WorkerService(worker_id=u.id, service_id=services[slug].id, price=rate))
            workers.append(u)
        db.flush()
        raj, suresh, ravi, mahesh = workers

        today = date.today()

        # Job 1: OPEN, with two applicants
        job_open = Job(customer_id=customer.id, service_id=services["electrician"].id,
                       title="Need an electrician for home wiring",
                       description="Basic wiring work in a 2BHK flat, including two faulty switchboards.",
                       location="Hyderabad", budget_min=1000, budget_max=2000,
                       preferred_date=today + timedelta(days=3), preferred_time="Morning", status=JobStatus.OPEN)
        # Job 2: ACCEPTED with a confirmed booking
        job_accepted = Job(customer_id=customer.id, service_id=services["plumber"].id,
                           title="Bathroom leak needs urgent repair",
                           description="Water leaking through the ceiling below the bathroom.",
                           location="Hyderabad", budget_min=800, budget_max=1500,
                           preferred_date=today + timedelta(days=1), preferred_time="Afternoon", status=JobStatus.ACCEPTED)
        # Job 3: COMPLETED and reviewed
        job_done = Job(customer_id=customer.id, service_id=services["carpenter"].id,
                       title="Wardrobe fitting for bedroom",
                       description="Custom wardrobe for an odd-shaped room.",
                       location="Hyderabad", budget_min=5000, budget_max=8000,
                       preferred_date=today - timedelta(days=10), preferred_time="Morning", status=JobStatus.COMPLETED)
        db.add_all([job_open, job_accepted, job_done])
        db.flush()

        # Applications
        db.add_all([
            Application(job_id=job_open.id, worker_id=raj.id, message="I can do this tomorrow.", proposed_price=1500,
                        status=ApplicationStatus.PENDING),
            Application(job_id=job_accepted.id, worker_id=suresh.id, message="I can come today.", proposed_price=900,
                        status=ApplicationStatus.ACCEPTED),
            Application(job_id=job_done.id, worker_id=ravi.id, message="Happy to take this on.", proposed_price=6500,
                        status=ApplicationStatus.ACCEPTED),
        ])

        # Bookings
        db.add_all([
            Booking(job_id=job_accepted.id, customer_id=customer.id, worker_id=suresh.id,
                    scheduled_date=today + timedelta(days=1), scheduled_time="Afternoon", price=900,
                    status=BookingStatus.CONFIRMED),
            Booking(job_id=job_done.id, customer_id=customer.id, worker_id=ravi.id,
                    scheduled_date=today - timedelta(days=10), scheduled_time="Morning", price=6500,
                    status=BookingStatus.COMPLETED),
        ])

        # Review for the completed job
        db.add(Review(customer_id=customer.id, worker_id=ravi.id, job_id=job_done.id, rating=5,
                      comment="Built a wardrobe that fit our odd-shaped room perfectly."))

        # Earning for the completed booking (mirrors what the app creates automatically
        # whenever a booking is marked COMPLETED via PUT /api/bookings/{id}/status)
        db.flush()
        completed_booking = db.query(Booking).filter(Booking.job_id == job_done.id).first()
        db.add(Earning(worker_id=ravi.id, booking_id=completed_booking.id, amount=completed_booking.price))

        # Sample weekly availability for one worker
        db.add_all([
            WorkerAvailability(worker_id=raj.id, day=Weekday.MONDAY, start_time=time(9, 0), end_time=time(18, 0)),
            WorkerAvailability(worker_id=raj.id, day=Weekday.TUESDAY, start_time=time(9, 0), end_time=time(18, 0)),
            WorkerAvailability(worker_id=raj.id, day=Weekday.SATURDAY, start_time=time(10, 0), end_time=time(14, 0)),
        ])

        # Saved workers
        db.add_all([SavedWorker(customer_id=customer.id, worker_id=raj.id),
                    SavedWorker(customer_id=customer.id, worker_id=ravi.id)])

        # A conversation with a couple of messages
        a, b = sorted([customer.id, raj.id])
        convo = Conversation(participant_one_id=a, participant_two_id=b, job_id=job_open.id)
        db.add(convo)
        db.flush()
        db.add_all([
            Message(conversation_id=convo.id, sender_id=customer.id, message="Are you available tomorrow?", is_read=True),
            Message(conversation_id=convo.id, sender_id=raj.id, message="Yes, I am available after 10 AM.", is_read=False),
        ])

        # Notifications
        db.add_all([
            Notification(user_id=customer.id, type=NotificationType.JOB_APPLICATION, title="New job application",
                         message="Raj Kumar applied to your job.", related_type="job", related_id=job_open.id),
            Notification(user_id=raj.id, type=NotificationType.NEW_MESSAGE, title="New message",
                         message="Arun Kumar sent you a message.", related_type="conversation", related_id=convo.id),
            Notification(user_id=ravi.id, type=NotificationType.NEW_REVIEW, title="New review",
                         message="You received a 5-star review from Arun Kumar.", related_type="review", related_id=1),
        ])

        db.commit()
        print("Seeded successfully.")
        print("  Customer: arun@example.com")
        print("  Workers:  raj@ / suresh@ / ravi@ / mahesh@example.com")
        print(f"  Password for all: {PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
