import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.database.database import get_db
from app.main import app

TEST_DB_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def _fresh_database():
    """Create all tables before each test and drop them afterward, so tests are isolated."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def customer_token(client):
    client.post(
        "/api/auth/register",
        json={"name": "Arun Kumar", "email": "arun@test.com", "phone": "9000000001", "password": "password123", "role": "CUSTOMER"},
    )
    resp = client.post("/api/auth/login", json={"email": "arun@test.com", "password": "password123"})
    return resp.json()["access_token"]


@pytest.fixture()
def worker_token_and_id(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Raj Kumar", "email": "raj@test.com", "phone": "9000000002", "password": "password123", "role": "WORKER"},
    )
    body = resp.json()
    return body["access_token"], body["user"]["id"]


@pytest.fixture()
def service_id(client, customer_token):
    resp = client.post(
        "/api/services",
        json={"name": "Electrician", "description": "Wiring"},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    return resp.json()["id"]
