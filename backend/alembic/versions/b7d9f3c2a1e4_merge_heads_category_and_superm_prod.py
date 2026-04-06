"""merge heads category and superm_prod

Revision ID: b7d9f3c2a1e4
Revises: 05ec263e9ef7, c00404e89b81
Create Date: 2026-04-06 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7d9f3c2a1e4"
down_revision: Union[str, Sequence[str], None] = ("05ec263e9ef7", "c00404e89b81")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
