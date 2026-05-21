"""merge shopping cart with users branch

Revision ID: f69090cc1ddb
Revises: 97d35d05f272, d1e2f3a4b5c6
Create Date: 2026-05-10 18:14:33.958266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f69090cc1ddb'
down_revision: Union[str, Sequence[str], None] = ('97d35d05f272', 'd1e2f3a4b5c6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass