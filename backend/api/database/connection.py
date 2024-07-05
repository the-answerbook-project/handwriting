import os

from sqlmodel import create_engine

DEV_URL = "postgresql://user:pass@localhost:5498"
FULL_DB_URL: str = os.environ.get("DB_URL", f"{DEV_URL}/handwriting")

engine = create_engine(FULL_DB_URL)
