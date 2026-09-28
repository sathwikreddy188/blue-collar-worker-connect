from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.common import Message
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer or worker account",
)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user account. `role` must be either CUSTOMER or WORKER.
    Passwords are hashed with bcrypt before storage — never stored in plain text.
    Returns a JWT access token immediately, so the frontend can log the user
    straight in after signup.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse, summary="Log in and receive a JWT access token")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has been deactivated")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut, summary="Get the currently authenticated user")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", response_model=Message, summary="Log out")
def logout(current_user: User = Depends(get_current_user)):
    """
    JWTs are stateless, so there is no server-side session to destroy.
    This endpoint exists for a consistent frontend contract; the client
    should discard its stored token on receiving this response. If you need
    true server-side invalidation (e.g. for compromised tokens), add a
    token-blacklist table and check it in get_current_user.
    """
    return Message(message="Logged out successfully. Please discard your access token.")
