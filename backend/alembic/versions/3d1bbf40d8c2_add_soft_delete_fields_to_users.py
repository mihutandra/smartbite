"""add soft delete fields to users

Revision ID: 3d1bbf40d8c2
Revises: cde848444f49
Create Date: 2026-04-24 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3d1bbf40d8c2"
down_revision: Union[str, Sequence[str], None] = "cde848444f49"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f("ix_users_is_deleted"), "users", ["is_deleted"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_users_is_deleted"), table_name="users")
    op.drop_column("users", "deleted_at")
    op.drop_column("users", "is_deleted")
