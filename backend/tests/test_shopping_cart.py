from tests.utils.shopping_cart import seed_shopping_cart_flow_data


def test_shopping_cart_single_supermarket_replacement_flow(test_client, db_session):
    data = seed_shopping_cart_flow_data(db_session)

    login_response = test_client.post(
        "/api/auth/login",
        json={"email": data["email"], "password": data["password"]},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    add_lidl_response = test_client.post(
        "/shopping-cart",
        json={
            "supermarket_product_id": data["lidl_item_id"],
            "quantity": 1,
            "confirm_replace": False,
        },
        headers=headers,
    )
    assert add_lidl_response.status_code == 200

    add_kaufland_conflict_response = test_client.post(
        "/shopping-cart",
        json={
            "supermarket_product_id": data["kaufland_item_id"],
            "quantity": 1,
            "confirm_replace": False,
        },
        headers=headers,
    )
    assert add_kaufland_conflict_response.status_code == 409
    conflict_body = add_kaufland_conflict_response.json()
    assert conflict_body["code"] == "invalid_state"
    assert conflict_body["identifier"]["requires_confirmation"] is True
    assert conflict_body["identifier"]["current_supermarket_id"] == data["lidl_supermarket_id"]
    assert conflict_body["identifier"]["new_supermarket_id"] == data["kaufland_supermarket_id"]

    add_kaufland_confirm_response = test_client.post(
        "/shopping-cart",
        json={
            "supermarket_product_id": data["kaufland_item_id"],
            "quantity": 1,
            "confirm_replace": True,
        },
        headers=headers,
    )
    assert add_kaufland_confirm_response.status_code == 200
    confirm_body = add_kaufland_confirm_response.json()
    assert confirm_body["cart_replaced"] is True

    cart_response = test_client.get("/shopping-cart", headers=headers)
    assert cart_response.status_code == 200
    cart_items = cart_response.json()

    assert len(cart_items) == 1
    assert cart_items[0]["supermarket_product_id"] == data["kaufland_item_id"]
    assert cart_items[0]["supermarket_id"] == data["kaufland_supermarket_id"]
    assert cart_items[0]["quantity"] == 1
