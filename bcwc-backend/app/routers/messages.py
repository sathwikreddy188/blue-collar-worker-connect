from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.message import Conversation, Message
from app.models.notification import NotificationType
from app.models.user import User
from app.schemas.message import ConversationCreate, ConversationDetail, MessageCreate, MessageOut
from app.services.notification_service import notify

router = APIRouter(tags=["Messages"])


def _to_detail(db: Session, conversation: Conversation, current_user: User) -> ConversationDetail:
    other_id = (
        conversation.participant_two_id
        if conversation.participant_one_id == current_user.id
        else conversation.participant_one_id
    )
    other_user = db.get(User, other_id)
    last_message = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .first()
    )
    unread_count = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id, Message.sender_id != current_user.id, Message.is_read == False)  # noqa: E712
        .count()
    )
    return ConversationDetail(
        **{
            "id": conversation.id,
            "participant_one_id": conversation.participant_one_id,
            "participant_two_id": conversation.participant_two_id,
            "job_id": conversation.job_id,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
        },
        other_participant=other_user,
        last_message=last_message.message if last_message else None,
        unread_count=unread_count,
    )


@router.post(
    "/api/conversations",
    response_model=ConversationDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Start (or reuse) a conversation with another user",
)
def create_conversation(payload: ConversationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.other_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot start a conversation with yourself")

    other_user = db.get(User, payload.other_user_id)
    if other_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    a, b = sorted([current_user.id, payload.other_user_id])
    existing = (
        db.query(Conversation)
        .filter(
            Conversation.participant_one_id == a,
            Conversation.participant_two_id == b,
            Conversation.job_id == payload.job_id,
        )
        .first()
    )
    if existing:
        return _to_detail(db, existing, current_user)

    conversation = Conversation(participant_one_id=a, participant_two_id=b, job_id=payload.job_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return _to_detail(db, conversation, current_user)


@router.get("/api/conversations", response_model=list[ConversationDetail], summary="List your conversations")
def list_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversations = (
        db.query(Conversation)
        .filter(or_(Conversation.participant_one_id == current_user.id, Conversation.participant_two_id == current_user.id))
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [_to_detail(db, c, current_user) for c in conversations]


def _get_conversation_or_403(conversation_id: int, current_user: User, db: Session) -> Conversation:
    conversation = db.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if current_user.id not in (conversation.participant_one_id, conversation.participant_two_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this conversation")
    return conversation


@router.get(
    "/api/conversations/{conversation_id}/messages",
    response_model=list[MessageOut],
    summary="Get all messages in a conversation",
)
def get_messages(conversation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = _get_conversation_or_403(conversation_id, current_user, db)

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .all()
    )

    # Mark incoming messages as read now that this participant has fetched them.
    for m in messages:
        if m.sender_id != current_user.id and not m.is_read:
            m.is_read = True
    db.commit()

    return messages


@router.post(
    "/api/conversations/{conversation_id}/messages",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
    summary="Send a message in a conversation",
)
def send_message(
    conversation_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = _get_conversation_or_403(conversation_id, current_user, db)

    message = Message(conversation_id=conversation.id, sender_id=current_user.id, message=payload.message)
    db.add(message)
    db.commit()
    db.refresh(message)

    recipient_id = (
        conversation.participant_two_id
        if conversation.participant_one_id == current_user.id
        else conversation.participant_one_id
    )
    notify(
        db,
        user_id=recipient_id,
        type=NotificationType.NEW_MESSAGE,
        title="New message",
        message=f"{current_user.name} sent you a message.",
        related_type="conversation",
        related_id=conversation.id,
    )

    return message
