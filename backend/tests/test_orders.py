from tests.utils.orders import seed_orders_flow_data


def test_get_my_orders_groups_active_and_done(test_client, db_session):
    data = seed_orders_flow_data(db_session)

    login_response = test_client.post(
        "/api/auth/login",
        json={"email": data["email"], "password": data["password"]},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = test_client.get("/api/orders/", headers=headers)
    assert response.status_code == 200
    body = response.json()

    assert [order["id"] for order in body["active"]] == [data["active_order_id"]]
    assert [order["id"] for order in body["done"]] == [data["done_order_id"]]
    assert data["other_order_id"] not in [order["id"] for order in body["active"]]

    active_order = body["active"][0]
    assert active_order["status"] == "ACTIVE"
    assert active_order["total_amount"] == "11.00"
    assert active_order["items"][0]["quantity"] == 2
    assert active_order["items"][0]["line_total"] == "11.00"
    assert active_order["items"][0]["product_name"] == "Bread"
    assert active_order["items"][0]["supermarket_name"] == "Lidl Orders"


def test_get_my_orders_by_status(test_client, db_session):
    data = seed_orders_flow_data(db_session)

    login_response = test_client.post(
        "/api/auth/login",
        json={"email": data["email"], "password": data["password"]},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    active_response = test_client.get("/api/orders/active", headers=headers)
    assert active_response.status_code == 200
    assert [order["id"] for order in active_response.json()] == [data["active_order_id"]]

    done_response = test_client.get("/api/orders/done", headers=headers)
    assert done_response.status_code == 200
    assert [order["id"] for order in done_response.json()] == [data["done_order_id"]]
