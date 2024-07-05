from typing import Dict, Optional
from sqlalchemy import Column
import sqlmodel
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import JSON, Field, SQLModel


class Handwriting(SQLModel, table=True):
    username: str = Field(primary_key=True)
    handwriting: Optional[dict] = Field(sa_column=Column(JSONB), default={})
        
