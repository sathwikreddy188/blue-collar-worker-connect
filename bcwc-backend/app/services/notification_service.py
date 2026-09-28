from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType


def notify(
    db: Session,
    *,
    user_id: int,
    type: NotificationType,
    title: str,
    message: str,
    related_type: str | None = None,
    related_id: int | None = None,
    commit: bool = True,
) -> Notification:
    """Create a notification for a user. Called by other services whenever
    something notification-worthy happens (see the notification triggers
    listed in the API spec: job posted, application received, booking
    status changes, new message, review left, etc.)."""
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        related_type=related_type,
        related_id=related_id,
    )
    db.add(notification)
    if commit:
        db.commit()
        db.refresh(notification)
    return notification
