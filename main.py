import json
import re
from fastapi import FastAPI, UploadFile, File, Form,HTTPException
from typing import Optional
from dotenv import load_dotenv
from services.grading import generate_grading_response
from fastapi.middleware.cors import CORSMiddleware
from model.base import Base
from core.db import engine 
from routes.analytics import router as analytics_router  
from routes.lesson import router as lession_router
load_dotenv()

app = FastAPI()
app.include_router(analytics_router, tags=["analytics"])
app.include_router(lession_router, tags=["lession"])

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
app.include_router(lession_router,  tags=["lession-generator"])

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# for intialization testing
@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/")
def read_root():
    return {"Hello": "World"}



 
# grading
RULES_FILE = "rule/grading_rule.txt"
 
 
def load_rules() -> str:
    with open(RULES_FILE, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()
 
rules = load_rules()
 
@app.post("/grading")
async def grading_endpoint(
    marks: int = Form(10),
    text: Optional[str] = Form(None),                  
 
    # ── Answer sheet images (required: at least one) ──────────────────────────
    image1: Optional[UploadFile] = File(None),
    image2: Optional[UploadFile] = File(None),
    image3: Optional[UploadFile] = File(None),
    image4: Optional[UploadFile] = File(None),
 
    # ── Question paper images (required: at least one) ────────────────────────
    qimage1: Optional[UploadFile] = File(None),
    qimage2: Optional[UploadFile] = File(None),
    qimage3: Optional[UploadFile] = File(None),
    qimage4: Optional[UploadFile] = File(None),
):
    async def read(f: Optional[UploadFile]) -> Optional[bytes]:
        return await f.read() if f else None
 
    # ── Validate: question paper is now required ───────────────────────────────
    if not any([qimage1, qimage2, qimage3, qimage4]):
        raise HTTPException(
            status_code=422,
            detail="Question paper is required. Please upload at least one question paper image.",
        )
 
    # ── Validate: answer sheet is required ────────────────────────────────────
    if not any([image1, image2, image3, image4]):
        raise HTTPException(
            status_code=422,
            detail="Answer sheet is required. Please upload at least one answer sheet image.",
        )
 
    # ── Read all images concurrently ──────────────────────────────────────────
    (
        img1, img2, img3, img4,
        qimg1, qimg2, qimg3, qimg4,
    ) = (
        await read(image1),
        await read(image2),
        await read(image3),
        await read(image4),
        await read(qimage1),
        await read(qimage2),
        await read(qimage3),
        await read(qimage4),
    )
 

    # ── Build effective rules: base rules + custom on top ─────────────────────
    effective_rules = rules
    if text and text.strip():
        effective_rules = (
            f"{rules}\n\n"
            f"=== CUSTOM INSTRUCTOR RULES (HIGHEST PRIORITY) ===\n"
            f"{text.strip()}\n"
            f"=== END CUSTOM RULES ==="
        )
 
    response = await generate_grading_response(
        # answer sheets
        image1=img1,
        image2=img2,
        image3=img3,
        image4=img4,
        # question paper
        qimage1=qimg1,
        qimage2=qimg2,
        qimage3=qimg3,
        qimage4=qimg4,
        rules=effective_rules,
        mark=marks,
    )
 
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", response.strip())
    parsed = json.loads(cleaned)
    return parsed