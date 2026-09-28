def _job_payload(service_id):
    return {
        "title": "Home wiring",
        "description": "Need wiring fixed",
        "location": "Hyderabad",
        "service_id": service_id,
        "budget_min": 500,
        "budget_max": 1000,
    }


def test_customer_can_create_job(client, customer_token, service_id):
    resp = client.post("/api/jobs", json=_job_payload(service_id), headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 201
    assert resp.json()["status"] == "OPEN"


def test_worker_cannot_create_job(client, worker_token_and_id, service_id):
    token, _ = worker_token_and_id
    resp = client.post("/api/jobs", json=_job_payload(service_id), headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_negative_budget_rejected(client, customer_token, service_id):
    payload = _job_payload(service_id)
    payload["budget_min"] = -100
    resp = client.post("/api/jobs", json=payload, headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 422


def test_budget_max_below_min_rejected(client, customer_token, service_id):
    payload = _job_payload(service_id)
    payload["budget_min"] = 1000
    payload["budget_max"] = 500
    resp = client.post("/api/jobs", json=payload, headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 422


def _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id):
    job_resp = client.post("/api/jobs", json=_job_payload(service_id), headers={"Authorization": f"Bearer {customer_token}"})
    job_id = job_resp.json()["id"]
    app_resp = client.post(
        f"/api/jobs/{job_id}/apply",
        json={"message": "I can help", "proposed_price": 700},
        headers={"Authorization": f"Bearer {worker_token}"},
    )
    return job_id, app_resp.json()["id"]


def test_worker_can_apply_to_open_job(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_id, app_id = _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id)
    assert app_id is not None


def test_worker_cannot_apply_twice(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_id, _ = _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id)
    resp = client.post(f"/api/jobs/{job_id}/apply", json={"message": "again"}, headers={"Authorization": f"Bearer {worker_token}"})
    assert resp.status_code == 409


def test_customer_cannot_apply_to_job(client, customer_token, service_id):
    job_resp = client.post("/api/jobs", json=_job_payload(service_id), headers={"Authorization": f"Bearer {customer_token}"})
    job_id = job_resp.json()["id"]
    resp = client.post(f"/api/jobs/{job_id}/apply", json={"message": "hi"}, headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 403


def test_accepting_application_creates_booking(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_id, app_id = _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id)

    resp = client.put(f"/api/applications/{app_id}", json={"status": "ACCEPTED"}, headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 200

    bookings = client.get("/api/bookings", headers={"Authorization": f"Bearer {customer_token}"}).json()
    assert len(bookings) == 1
    assert bookings[0]["job_id"] == job_id
    assert bookings[0]["worker_id"] == worker_id


def test_only_owning_customer_can_accept_application(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_id, app_id = _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id)

    resp = client.put(f"/api/applications/{app_id}", json={"status": "ACCEPTED"}, headers={"Authorization": f"Bearer {worker_token}"})
    assert resp.status_code == 403


def test_completed_booking_enables_review(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_id, app_id = _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id)
    client.put(f"/api/applications/{app_id}", json={"status": "ACCEPTED"}, headers={"Authorization": f"Bearer {customer_token}"})

    bookings = client.get("/api/bookings", headers={"Authorization": f"Bearer {customer_token}"}).json()
    booking_id = bookings[0]["id"]

    resp = client.put(f"/api/bookings/{booking_id}/status", json={"status": "COMPLETED"}, headers={"Authorization": f"Bearer {customer_token}"})
    assert resp.status_code == 200

    review_resp = client.post(
        "/api/reviews",
        json={"worker_id": worker_id, "job_id": job_id, "rating": 5, "comment": "Great!"},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert review_resp.status_code == 201


def test_cannot_review_without_completed_booking(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_id, app_id = _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id)
    client.put(f"/api/applications/{app_id}", json={"status": "ACCEPTED"}, headers={"Authorization": f"Bearer {customer_token}"})

    resp = client.post(
        "/api/reviews",
        json={"worker_id": worker_id, "job_id": job_id, "rating": 5},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert resp.status_code == 400


def test_duplicate_review_rejected(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_id, app_id = _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id)
    client.put(f"/api/applications/{app_id}", json={"status": "ACCEPTED"}, headers={"Authorization": f"Bearer {customer_token}"})
    bookings = client.get("/api/bookings", headers={"Authorization": f"Bearer {customer_token}"}).json()
    booking_id = bookings[0]["id"]
    client.put(f"/api/bookings/{booking_id}/status", json={"status": "COMPLETED"}, headers={"Authorization": f"Bearer {customer_token}"})

    payload = {"worker_id": worker_id, "job_id": job_id, "rating": 5}
    r1 = client.post("/api/reviews", json=payload, headers={"Authorization": f"Bearer {customer_token}"})
    r2 = client.post("/api/reviews", json=payload, headers={"Authorization": f"Bearer {customer_token}"})
    assert r1.status_code == 201
    assert r2.status_code == 409


def test_rating_out_of_range_rejected(client, customer_token, worker_token_and_id, service_id):
    worker_token, worker_id = worker_token_and_id
    job_id, app_id = _setup_job_and_application(client, customer_token, worker_token, worker_id, service_id)
    client.put(f"/api/applications/{app_id}", json={"status": "ACCEPTED"}, headers={"Authorization": f"Bearer {customer_token}"})
    bookings = client.get("/api/bookings", headers={"Authorization": f"Bearer {customer_token}"}).json()
    booking_id = bookings[0]["id"]
    client.put(f"/api/bookings/{booking_id}/status", json={"status": "COMPLETED"}, headers={"Authorization": f"Bearer {customer_token}"})

    resp = client.post(
        "/api/reviews",
        json={"worker_id": worker_id, "job_id": job_id, "rating": 7},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert resp.status_code == 422
