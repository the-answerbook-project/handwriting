from typing import List, Dict
import json

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

with open('strokes.json', 'r') as file:
  strokes_data = json.load(file)

strokes_dict = convertStrokes(strokes_data)

with open('output.json', 'w') as file:
  json.dump(strokes_dict, file)
