from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.base import Base
from app.database.database import engine
from app.models import *  # noqa: F401,F403 -- ensures every model is registered on Base.metadata
from app.routers import (
    applications,
    auth,
    bookings,
    dashboard,
    jobs,
    messages,
    notifications,
    reviews,
    saved_workers,
    services,
    users,
    worker_extras,
    workers,
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "REST API for Blue Collar Worker Connect — a marketplace connecting local "
        "skilled workers (electricians, plumbers, carpenters, and more) with customers "
        "who need their services. See /docs for interactive API documentation."
    ),
)

# In production, run `alembic upgrade head` as part of deployment instead of
# relying on this. This line is kept for zero-friction local development —
# it creates any tables that don't exist yet, and never drops or alters existing ones.
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Consistent JSON error shape for all HTTPExceptions raised across the app."""
    return JSONResponse(status_code=exc.status_code, content={"success": False, "message": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Consistent JSON error shape for Pydantic/FastAPI request validation errors (422)."""
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation error", "errors": jsonable_encoder(exc.errors())},
    )


@app.get("/", tags=["Health"], summary="Health check")
def root():
    return {"success": True, "message": f"{settings.APP_NAME} v{settings.APP_VERSION} is running.", "docs": "/docs"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(services.router)
app.include_router(workers.router)
app.include_router(worker_extras.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(messages.router)
app.include_router(notifications.router)
app.include_router(saved_workers.router)
app.include_router(dashboard.router)
