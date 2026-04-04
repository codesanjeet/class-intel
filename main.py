import json
import re
from fastapi import FastAPI, UploadFile, File, Form
from typing import Optional
from dotenv import load_dotenv
import google.generativeai as genai
import os
from PIL import Image
import io
from services.grading import generate_grading_response
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",   
    "http://127.0.0.1:3000",
    "https://classintel.vercel.app",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,
    allow_methods=["*"],          
    allow_headers=["*"],         
)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))


def load_rules():
    with open("rule/grading_rule.txt", "r", encoding="utf-8", errors="ignore") as file:
        return file.read()

rules = load_rules()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/grading")
async def grading_endpoint(
    marks: int = Form(10),
    text: Optional[str] = Form(None),
    image1: Optional[UploadFile] = File(None),
    image2: Optional[UploadFile] = File(None),
    image3: Optional[UploadFile] = File(None),
    image4: Optional[UploadFile] = File(None),
):
    async def read(f: Optional[UploadFile]) -> Optional[bytes]:
        return await f.read() if f else None

    img1, img2, img3, img4 = (
        await read(image1),
        await read(image2),
        await read(image3),
        await read(image4),
    )

    response = await generate_grading_response(
        image1=img1,
        image2=img2,
        image3=img3,
        image4=img4,
        text=text,
        rules=rules,
        mark=marks,
    )

    # Strip markdown fences if Gemini wraps the JSON
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", response.strip())
    
    # Parse and return as a proper JSON object (not a string)
    parsed = json.loads(cleaned)
    return parsed