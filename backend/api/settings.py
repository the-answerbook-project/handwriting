import os
from pathlib import Path

DEV_ASSESSMENTS_DIR = Path(__file__).parent.parent / "dev_data"

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    environment: str = os.getenv("ENVIRONMENT", "development")
    testing: bool = bool(os.getenv("TESTING", 0))
