"""add reservations

Revision ID: 2c1e9f8a4b70
Revises: adec62f1a6b4
Create Date: 2026-06-02 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2c1e9f8a4b70"
down_revision: Union[str, Sequence[str], None] = "adec62f1a6b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "reservations",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_reservations_status"), "reservations", ["status"], unique=False)
    op.create_index(op.f("ix_reservations_user_id"), "reservations", ["user_id"], unique=False)

    op.create_table(
        "reservation_items",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("reservation_id", sa.UUID(), nullable=False),
        sa.Column("supermarket_product_id", sa.UUID(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("reserved_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("currency", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("quantity > 0", name="ck_reservation_item_quantity_positive"),
        sa.ForeignKeyConstraint(["reservation_id"], ["reservations.id"]),
        sa.ForeignKeyConstraint(["supermarket_product_id"], ["supermarket_products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_reservation_items_reservation_id"), "reservation_items", ["reservation_id"], unique=False)
    op.create_index(
        op.f("ix_reservation_items_supermarket_product_id"),
        "reservation_items",
        ["supermarket_product_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_reservation_items_supermarket_product_id"), table_name="reservation_items")
    op.drop_index(op.f("ix_reservation_items_reservation_id"), table_name="reservation_items")
    op.drop_table("reservation_items")
    op.drop_index(op.f("ix_reservations_user_id"), table_name="reservations")
    op.drop_index(op.f("ix_reservations_status"), table_name="reservations")
    op.drop_table("reservations")
