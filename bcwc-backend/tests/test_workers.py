def test_worker_can_create_profile(client, worker_token_and_id):
    token, _ = worker_token_and_id
    resp = client.post(
        "/api/workers/profile",
        json={"profession": "Electrician", "location": "Hyderabad", "experience_years": 5, "hourly_rate": 500},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    assert resp.json()["profession"] == "Electrician"


def test_customer_cannot_create_worker_profile(client, customer_token):
    resp = client.post(
        "/api/workers/profile",
        json={"profession": "Electrician", "location": "Hyderabad"},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert resp.status_code == 403


def test_worker_cannot_create_duplicate_profile(client, worker_token_and_id):
    token, _ = worker_token_and_id
    payload = {"profession": "Electrician", "location": "Hyderabad"}
    client.post("/api/workers/profile", json=payload, headers={"Authorization": f"Bearer {token}"})
    resp = client.post("/api/workers/profile", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 409


def test_worker_can_update_own_profile(client, worker_token_and_id):
    token, _ = worker_token_and_id
    client.post("/api/workers/profile", json={"profession": "Electrician", "location": "Hyderabad"}, headers={"Authorization": f"Bearer {token}"})
    resp = client.put("/api/workers/profile", json={"hourly_rate": 750}, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["hourly_rate"] == 750


def test_worker_can_toggle_availability(client, worker_token_and_id):
    token, _ = worker_token_and_id
    client.post("/api/workers/profile", json={"profession": "Electrician", "location": "Hyderabad"}, headers={"Authorization": f"Bearer {token}"})
    resp = client.put("/api/workers/availability", json={"available": False}, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["availability"] is False


def test_customer_cannot_toggle_availability(client, customer_token):
    resp = client.put("/api/workers/availability", json={"available": False}, headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 403


def test_public_can_search_workers(client, worker_token_and_id):
    token, _ = worker_token_and_id
    client.post("/api/workers/profile", json={"profession": "Electrician", "location": "Hyderabad"}, headers={"Authorization": f"Bearer {token}"})
    resp = client.get("/api/workers")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_worker_detail_hides_password(client, worker_token_and_id):
    token, worker_id = worker_token_and_id
    client.post("/api/workers/profile", json={"profession": "Electrician", "location": "Hyderabad"}, headers={"Authorization": f"Bearer {token}"})
    resp = client.get(f"/api/workers/{worker_id}")
    assert resp.status_code == 200
    body_str = resp.text
    assert "password" not in body_str
