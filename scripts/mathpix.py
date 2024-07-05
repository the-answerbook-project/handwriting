import requests
import os
import json

from dotenv import load_dotenv

load_dotenv()


headers = {
  "app_id": os.getenv("MATHPIX_APP_ID"),
  "app_key": os.getenv("MATHPIX_API_KEY"),
}


with open('output.json', 'r') as file:
  strokes = json.load(file)

response = requests.post(
  "https://api.mathpix.com/v3/strokes", 
  headers=headers, 
  json={"strokes": {"strokes": strokes}}
)

print(response.json())
