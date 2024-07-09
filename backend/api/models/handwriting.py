from typing import Optional
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class Handwriting(SQLModel, table=True):
    username: str = Field(primary_key=True)
    handwriting: Optional[dict] = Field(sa_column=Column(JSONB), default={})
    latex: Optional[str] = Field(sa_column=Column(JSONB), default="")
