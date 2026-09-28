# Import every model here so that Base.metadata is aware of all tables
# when app.main calls Base.metadata.create_all(), and so Alembic's
# autogenerate can discover them too.

from app.models.user import User, UserRole  # noqa: F401
from app.models.worker import WorkerProfile  # noqa: F401
from app.models.service import Service, WorkerService  # noqa: F401
from app.models.job import Job, JobStatus  # noqa: F401
from app.models.application import Application, ApplicationStatus  # noqa: F401
from app.models.booking import Booking, BookingStatus  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.message import Conversation, Message  # noqa: F401
from app.models.notification import Notification, NotificationType  # noqa: F401
from app.models.saved_worker import SavedWorker  # noqa: F401
