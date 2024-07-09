"""add latex text

Revision ID: 5481e37637f5
Revises: 59b3a06e588f
Create Date: 2024-07-09 11:10:01.907421

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5481e37637f5'
down_revision: Union[str, None] = '59b3a06e588f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('handwriting', sa.Column('latex', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('handwriting', 'latex')
    # ### end Alembic commands ###