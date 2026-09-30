def test_worker_can_set_schedule(client, worker_token_and_id):
    token, worker_id = worker_token_and_id
    resp = client.put(
        "/api/workers/schedule",
        json=[
            {"day": "MONDAY", "start_time": "09:00:00", "end_time": "18:00:00", "is_available": True},
            {"day": "SATURDAY", "start_time": "10:00:00", "end_time": "14:00:00", "is_available": True},
        ],
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    days = {slot["day"] for slot in resp.json()}
    assert days == {"MONDAY", "SATURDAY"}


def test_customer_cannot_set_schedule(client, customer_token):
    resp = client.put(
        "/api/workers/schedule",
        json=[{"day": "MONDAY", "start_time": "09:00:00", "end_time": "18:00:00"}],
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert resp.status_code == 403


def test_schedule_rejects_end_before_start(client, worker_token_and_id):
    token, _ = worker_token_and_id
    resp = client.put(
        "/api/workers/schedule",
        json=[{"day": "MONDAY", "start_time": "18:00:00", "end_time": "09:00:00"}],
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_schedule_rejects_duplicate_day(client, worker_token_and_id):
    token, _ = worker_token_and_id
    resp = client.put(
        "/api/workers/schedule",
        json=[
            {"day": "MONDAY", "start_time": "09:00:00", "end_time": "12:00:00"},
            {"day": "MONDAY", "start_time": "13:00:00", "end_time": "18:00:00"},
        ],
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400


def test_public_can_view_worker_schedule(client, worker_token_and_id):
    token, worker_id = worker_token_and_id
    client.put(
        "/api/workers/schedule",
        json=[{"day": "FRIDAY", "start_time": "09:00:00", "end_time": "17:00:00"}],
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get(f"/api/workers/{worker_id}/schedule")
    assert resp.status_code == 200
    assert resp.json()[0]["day"] == "FRIDAY"


def test_setting_schedule_again_replaces_it(client, worker_token_and_id):
    token, worker_id = worker_token_and_id
    client.put(
        "/api/workers/schedule",
        json=[{"day": "MONDAY", "start_time": "09:00:00", "end_time": "17:00:00"}],
        headers={"Authorization": f"Bearer {token}"},
    )
    client.put(
        "/api/workers/schedule",
        json=[{"day": "TUESDAY", "start_time": "09:00:00", "end_time": "17:00:00"}],
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get(f"/api/workers/{worker_id}/schedule")
    days = {slot["day"] for slot in resp.json()}
    assert days == {"TUESDAY"}


def _job_payload(service_id):
    return {
        "title": "Home wiring",
        "description": "Need wiring fixed",
        "location": "Hyderabad",
        "service_id": service_id,
        "budget_min": 500,
        "budget_max": 1000,
    }


def test_completing_booking_creates_earning(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_resp = client.post("/api/jobs", json=_job_payload(service_id), headers={"Authorization": f"Bearer {customer_token}"})
    job_id = job_resp.json()["id"]
    app_resp = client.post(
        f"/api/jobs/{job_id}/apply", json={"proposed_price": 700}, headers={"Authorization": f"Bearer {worker_token}"}
    )
    app_id = app_resp.json()["id"]
    client.put(f"/api/applications/{app_id}", json={"status": "ACCEPTED"}, headers={"Authorization": f"Bearer {customer_token}"})

    bookings = client.get("/api/bookings", headers={"Authorization": f"Bearer {customer_token}"}).json()
    booking_id = bookings[0]["id"]

    # No earning yet before completion
    earnings_before = client.get("/api/worker/earnings", headers={"Authorization": f"Bearer {worker_token}"}).json()
    assert len(earnings_before) == 0

    client.put(f"/api/bookings/{booking_id}/status", json={"status": "COMPLETED"}, headers={"Authorization": f"Bearer {customer_token}"})

    earnings_after = client.get("/api/worker/earnings", headers={"Authorization": f"Bearer {worker_token}"}).json()
    assert len(earnings_after) == 1
    assert earnings_after[0]["booking_id"] == booking_id
    assert earnings_after[0]["amount"] == 700
    assert earnings_after[0]["payment_status"] == "PENDING"


def test_customer_cannot_see_worker_earnings(client, customer_token):
    resp = client.get("/api/worker/earnings", headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 403
