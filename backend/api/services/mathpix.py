import os
from typing import List, Dict
import json

import logging
logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

import requests

def convertStrokes(canvasStrokes: List[Dict]) -> Dict[str, List[List[float]]]:
  strokes = {
    "x": [],
    "y": [],
  }

  for element in canvasStrokes["excalidraw"]["elements"]:
    
    new_stroke_x = []
    new_stroke_y = []
    for x, y in element["points"]:
      new_stroke_x.append(x + element["x"])
      new_stroke_y.append(y + element["y"])

    strokes["x"].append(new_stroke_x)
    strokes["y"].append(new_stroke_y)

  return strokes

def react_canvas_to_mathpix_strokes(canvasStrokes: List[Dict]) -> Dict[str, List[List[float]]]:
  strokes = convertStrokes(canvasStrokes)
  logger.error(strokes)
    
  headers = {
    "app_id": os.getenv("MATHPIX_APP_ID"),
    "app_key": os.getenv("MATHPIX_API_KEY"),
  }


  response = requests.post(
    "https://api.mathpix.com/v3/strokes", 
    headers=headers, 
    json={"strokes": {"strokes": strokes}}
  )
    
  return response.json()
