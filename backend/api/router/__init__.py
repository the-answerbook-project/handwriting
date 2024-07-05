import logging
from api.models.handwriting import Handwriting
from fastapi import APIRouter, Depends, Request

from api.dependencies import get_session, get_settings
from api.schemas.status import Status
from api.settings import Settings
from pydantic import BaseModel
from sqlmodel import Session, select

api_router = APIRouter()

logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)


@api_router.get(
    "/status",
    tags=["status"],
    response_model=Status,
    summary="Retrieve API Status",
    description="""
Perform status check to determine whether the API is up and running


**Access**: Unrestricted.
    """,
)
def get_status(
    request: Request,
    settings: Settings = Depends(get_settings),
):
    """
    Status check endpoint to determine that the API is up and running

    ACCESS: Unrestricted
    """

    return {
        "status": request.app.title,
        "version": request.app.version,
        "environment": settings.environment,
        "testing": settings.testing,
    }

@api_router.get("/handwriting")
def handwriting(username: str, session: Session = Depends(get_session)):
    rstmt = select(Handwriting).where(Handwriting.username == username)
    res = session.execute(rstmt).first()

    if res is None:
        return {"error": "Handwriting not found"}
    print("MEAP")
    print("MEAP")
    print("MEAP")
    print(res[0])
    return res[0].handwriting


class HandwritingUpload(BaseModel):
    username: str
    handwriting: dict

@api_router.post("/handwriting")
def handwriting(body: HandwritingUpload, session: Session = Depends(get_session)):
    session.add(Handwriting(username=body.username, handwriting=body.handwriting))
    session.commit()
    return {"success": True}

    
