def test_start_conversation_and_send_message(client, customer_token, worker_token_and_id):
    worker_token, worker_id = worker_token_and_id

    conv_resp = client.post(
        "/api/conversations", json={"other_user_id": worker_id}, headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert conv_resp.status_code == 201
    conversation_id = conv_resp.json()["id"]

    msg_resp = client.post(
        f"/api/conversations/{conversation_id}/messages",
        json={"message": "Are you available tomorrow?"},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert msg_resp.status_code == 201

    worker_view = client.get(
        f"/api/conversations/{conversation_id}/messages", headers={"Authorization": f"Bearer {worker_token}"}
    )
    assert worker_view.status_code == 200
    assert len(worker_view.json()) == 1


def test_stranger_cannot_read_conversation(client, customer_token, worker_token_and_id):
    worker_token, worker_id = worker_token_and_id
    conv_resp = client.post("/api/conversations", json={"other_user_id": worker_id}, headers={"Authorization": f"Bearer {customer_token}"})
    conversation_id = conv_resp.json()["id"]

    stranger_reg = client.post(
        "/api/auth/register",
        json={"name": "Stranger", "email": "stranger@test.com", "phone": "9000000099", "password": "password123", "role": "CUSTOMER"},
    )
    stranger_token = stranger_reg.json()["access_token"]

    resp = client.get(f"/api/conversations/{conversation_id}/messages", headers={"Authorization": f"Bearer {stranger_token}"})
    assert resp.status_code == 403


def test_new_message_generates_notification(client, customer_token, worker_token_and_id):
    worker_token, worker_id = worker_token_and_id
    conv_resp = client.post("/api/conversations", json={"other_user_id": worker_id}, headers={"Authorization": f"Bearer {customer_token}"})
    conversation_id = conv_resp.json()["id"]
    client.post(
        f"/api/conversations/{conversation_id}/messages",
        json={"message": "Hello"},
        headers={"Authorization": f"Bearer {customer_token}"},
    )

    notifications = client.get("/api/notifications", headers={"Authorization": f"Bearer {worker_token}"}).json()
    assert any(n["type"] == "NEW_MESSAGE" for n in notifications)


def test_mark_all_notifications_read(client, customer_token, worker_token_and_id):
    worker_token, worker_id = worker_token_and_id
    conv_resp = client.post("/api/conversations", json={"other_user_id": worker_id}, headers={"Authorization": f"Bearer {customer_token}"})
    conversation_id = conv_resp.json()["id"]
    client.post(
        f"/api/conversations/{conversation_id}/messages", json={"message": "Hello"}, headers={"Authorization": f"Bearer {customer_token}"}
    )

    resp = client.put("/api/notifications/read-all", headers={"Authorization": f"Bearer {worker_token}"})
    assert resp.status_code == 200

    notifications = client.get("/api/notifications", headers={"Authorization": f"Bearer {worker_token}"}).json()
    assert all(n["is_read"] for n in notifications)


def test_saved_workers_flow(client, customer_token, worker_token_and_id):
    worker_token, worker_id = worker_token_and_id
    client.post("/api/workers/profile", json={"profession": "Electrician", "location": "Hyderabad"}, headers={"Authorization": f"Bearer {worker_token}"})

    save_resp = client.post(f"/api/saved-workers/{worker_id}", headers={"Authorization": f"Bearer {customer_token}"})
    assert save_resp.status_code == 201

    list_resp = client.get("/api/saved-workers", headers={"Authorization": f"Bearer {customer_token}"})
    assert len(list_resp.json()) == 1

    unsave_resp = client.delete(f"/api/saved-workers/{worker_id}", headers={"Authorization": f"Bearer {customer_token}"})
    assert unsave_resp.status_code == 204

    list_resp_after = client.get("/api/saved-workers", headers={"Authorization": f"Bearer {customer_token}"})
    assert len(list_resp_after.json()) == 0


def test_worker_cannot_save_workers(client, worker_token_and_id):
    worker_token, worker_id = worker_token_and_id
    resp = client.post(f"/api/saved-workers/{worker_id}", headers={"Authorization": f"Bearer {worker_token}"})
    assert resp.status_code == 403
