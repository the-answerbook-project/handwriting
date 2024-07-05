import logging
from api.models.handwriting import Handwriting
from api.services.mathpix import react_canvas_to_mathpix_strokes
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

@api_router.get("/{username}/handwriting")
def handwriting(username: str, session: Session = Depends(get_session)):
    rstmt = select(Handwriting).where(Handwriting.username == username)
    res = session.execute(rstmt).first()

    if res is None:
        return {"error": "Handwriting not found"}
    print(res[0])
    return res[0].handwriting


class HandwritingUpload(BaseModel):
    handwriting: list

@api_router.put("/{username}/handwriting")
def handwriting(username: str, body: HandwritingUpload, session: Session = Depends(get_session)):
    existing_handwriting = session.get(Handwriting, username)
    if existing_handwriting:
        existing_handwriting.handwriting = body.handwriting
    else:
        new_handwriting = Handwriting(username=username, handwriting=body.handwriting)
        session.add(new_handwriting)
    session.commit()
    return {"success": True}

@api_router.get("/{username}/latex")
def latex(username: str, session: Session = Depends(get_session)):
    rstmt = select(Handwriting).where(Handwriting.username == username)
    res = session.execute(rstmt).first()

    if res is None:
        return {"error": "Handwriting not found"}
    
    handwritingraw = res[0]

    return react_canvas_to_mathpix_strokes(handwritingraw.handwriting)



    
