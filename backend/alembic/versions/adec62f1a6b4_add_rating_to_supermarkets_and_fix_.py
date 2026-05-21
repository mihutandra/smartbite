"""add rating to supermarkets and fix users email constraint

Revision ID: adec62f1a6b4
Revises: f69090cc1ddb
Create Date: 2026-05-10 18:17:24.613118

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'adec62f1a6b4'
down_revision: Union[str, Sequence[str], None] = 'f69090cc1ddb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('supermarkets', sa.Column('rating', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('supermarkets', 'rating')
