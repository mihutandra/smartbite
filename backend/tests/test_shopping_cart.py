from uuid import UUID

from sqlalchemy import select

from app.models.reservation import Reservation
from app.models.supermarket_products import SupermarketProduct
from tests.utils.shopping_cart import seed_shopping_cart_flow_data


def _auth_headers(test_client, email: str, password: str) -> dict[str, str]:
    login_response = test_client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_shopping_cart_allows_multiple_supermarkets_and_returns_images(test_client, db_session):
    data = seed_shopping_cart_flow_data(db_session)
    headers = _auth_headers(test_client, data["email"], data["password"])

    add_lidl_response = test_client.post(
        "/api/shopping-cart/",
        json={
            "supermarket_product_id": data["lidl_item_id"],
            "quantity": 1,
        },
        headers=headers,
    )
    assert add_lidl_response.status_code == 200

    add_kaufland_response = test_client.post(
        "/api/shopping-cart/",
        json={
            "supermarket_product_id": data["kaufland_item_id"],
            "quantity": 2,
        },
        headers=headers,
    )
    assert add_kaufland_response.status_code == 200
    assert add_kaufland_response.json()["cart_replaced"] is False

    cart_response = test_client.get("/api/shopping-cart/", headers=headers)
    assert cart_response.status_code == 200
    cart_items = cart_response.json()

    assert len(cart_items) == 2
    items_by_product = {item["supermarket_product_id"]: item for item in cart_items}
    assert items_by_product[data["lidl_item_id"]]["product_image_url"] == "https://example.com/milk-lidl.png"
    assert items_by_product[data["kaufland_item_id"]]["product_image_url"] == "https://example.com/milk-kaufland.png"
    assert items_by_product[data["kaufland_item_id"]]["quantity"] == 2


def test_shopping_cart_remove_item_requires_user_owned_cart_item(test_client, db_session):
    data = seed_shopping_cart_flow_data(db_session)
    headers = _auth_headers(test_client, data["email"], data["password"])

    add_response = test_client.post(
        "/api/shopping-cart/",
        json={"supermarket_product_id": data["lidl_item_id"], "quantity": 1},
        headers=headers,
    )
    assert add_response.status_code == 200

    cart_item = test_client.get("/api/shopping-cart/", headers=headers).json()[0]
    delete_response = test_client.delete(f"/api/shopping-cart/{cart_item['id']}", headers=headers)
    assert delete_response.status_code == 200

    cart_response = test_client.get("/api/shopping-cart/", headers=headers)
    assert cart_response.status_code == 200
    assert cart_response.json() == []

    second_delete_response = test_client.delete(f"/api/shopping-cart/{cart_item['id']}", headers=headers)
    assert second_delete_response.status_code == 404


def test_confirm_cart_creates_reservation_decrements_stock_and_clears_cart(test_client, db_session):
    data = seed_shopping_cart_flow_data(db_session)
    headers = _auth_headers(test_client, data["email"], data["password"])

    test_client.post(
        "/api/shopping-cart/",
        json={"supermarket_product_id": data["lidl_item_id"], "quantity": 1},
        headers=headers,
    )
    test_client.post(
        "/api/shopping-cart/",
        json={"supermarket_product_id": data["kaufland_item_id"], "quantity": 1},
        headers=headers,
    )

    cart_items = test_client.get("/api/shopping-cart/", headers=headers).json()
    confirm_response = test_client.post(
        "/api/shopping-cart/confirm",
        json={
            "items": [
                {"cart_item_id": cart_items[0]["id"], "quantity": 3},
                {"cart_item_id": cart_items[1]["id"], "quantity": 4},
            ]
        },
        headers=headers,
    )

    assert confirm_response.status_code == 200
    reservation = confirm_response.json()
    assert reservation["status"] == "active"
    assert len(reservation["items"]) == 2

    assert test_client.get("/api/shopping-cart/", headers=headers).json() == []

    lidl_item = db_session.scalars(
        select(SupermarketProduct).where(SupermarketProduct.id == UUID(data["lidl_item_id"]))
    ).one()
    kaufland_item = db_session.scalars(
        select(SupermarketProduct).where(SupermarketProduct.id == UUID(data["kaufland_item_id"]))
    ).one()

    reserved_by_product = {
        item["supermarket_product_id"]: item["quantity"]
        for item in reservation["items"]
    }
    assert lidl_item.stock_quantity == data["lidl_initial_stock"] - reserved_by_product[data["lidl_item_id"]]
    assert kaufland_item.stock_quantity == data["kaufland_initial_stock"] - reserved_by_product[data["kaufland_item_id"]]


def test_user_can_have_multiple_active_reservations(test_client, db_session):
    data = seed_shopping_cart_flow_data(db_session)
    headers = _auth_headers(test_client, data["email"], data["password"])

    reservation_ids = []
    for supermarket_product_id in (data["lidl_item_id"], data["kaufland_item_id"]):
        add_response = test_client.post(
            "/api/shopping-cart/",
            json={"supermarket_product_id": supermarket_product_id, "quantity": 1},
            headers=headers,
        )
        assert add_response.status_code == 200

        cart_item = test_client.get("/api/shopping-cart/", headers=headers).json()[0]
        confirm_response = test_client.post(
            "/api/shopping-cart/confirm",
            json={"items": [{"cart_item_id": cart_item["id"], "quantity": 1}]},
            headers=headers,
        )
        assert confirm_response.status_code == 200
        reservation_ids.append(confirm_response.json()["id"])

    assert len(set(reservation_ids)) == 2
    active_reservations = db_session.scalars(
        select(Reservation).where(Reservation.status == "active")
    ).all()
    assert len(active_reservations) == 2
