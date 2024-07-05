import os
from typing import List, Dict
import json

import requests

def convertStrokes(canvasStrokes: List[Dict]) -> Dict[str, List[List[float]]]:
  strokes = {
    "x": [],
    "y": [],
  }

  for stroke in canvasStrokes:
    new_stroke_x = []
    new_stroke_y = []
    for point in stroke["paths"]:
      new_stroke_x.append(point["x"])
      new_stroke_y.append(point["y"])

    strokes["x"].append(new_stroke_x)
    strokes["y"].append(new_stroke_y)

  return strokes

def react_canvas_to_mathpix_strokes(canvasStrokes: List[Dict]) -> Dict[str, List[List[float]]]:
	strokes = convertStrokes(canvasStrokes)
    
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