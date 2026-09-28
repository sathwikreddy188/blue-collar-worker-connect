def test_register_customer(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Priya", "email": "priya@test.com", "phone": "9000000010", "password": "password123", "role": "CUSTOMER"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["user"]["role"] == "CUSTOMER"
    assert "access_token" in body
    assert "password" not in body["user"]
    assert "password_hash" not in body["user"]


def test_register_duplicate_email_rejected(client):
    payload = {"name": "A", "email": "dup@test.com", "phone": "9000000011", "password": "password123", "role": "WORKER"}
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409


def test_register_weak_password_rejected(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "A", "email": "weak@test.com", "phone": "9000000012", "password": "short", "role": "WORKER"},
    )
    assert resp.status_code == 422


def test_register_invalid_role_rejected(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "A", "email": "badrole@test.com", "phone": "9000000013", "password": "password123", "role": "ADMIN"},
    )
    assert resp.status_code == 422


def test_login_success(client, customer_token):
    assert customer_token is not None and len(customer_token) > 10


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={"name": "B", "email": "b@test.com", "phone": "9000000014", "password": "password123", "role": "CUSTOMER"},
    )
    resp = client.post("/api/auth/login", json={"email": "b@test.com", "password": "wrongpassword"})
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/api/auth/login", json={"email": "nobody@test.com", "password": "password123"})
    assert resp.status_code == 401


def test_get_me_requires_auth(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_get_me_with_token(client, customer_token):
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "arun@test.com"


def test_get_me_with_invalid_token(client):
    resp = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert resp.status_code == 401
