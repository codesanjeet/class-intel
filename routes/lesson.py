import json
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,desc

from core.db import get_db
from model.lesson_model import Lesson
from services.lesson_generator import (
    generate_lesson_plan,
    simulate_batch_students,
    generate_remark,
    compute_weak_topics,
)


router = APIRouter(prefix="/lesson-generator", tags=["lesson-generator"])

# ── Schemas ───────────────────────────────────────────────────────────────────

class LessonResponse(BaseModel):
    id: int
    subject: Optional[str]
    topic: Optional[str]
    className: Optional[str]
    lessonContent: list[dict]
    quiz: list[dict]
    class Config:
        from_attributes = True


class StudentRecord(BaseModel):
    name: str
    correct: int
    total: int
    score_pct: int
    answers: dict[str, str]


class SimulateResponse(BaseModel):
    lesson_id: int
    topic: str
    students: list[StudentRecord]
    avg_score: int
    below50_count: int
    needs_revision: bool
    weak_topics: list[dict]
    remark: str


# ── POST /lesson-generator ────────────────────────────────────────────────────

@router.post("", response_model=LessonResponse)
async def create_lesson(
    subject:       Optional[str]        = Form(None),
    class_name:    Optional[str]        = Form(None),
    topic:         Optional[str]        = Form(None),
    topic_image_1: Optional[UploadFile] = File(None),
    topic_image_2: Optional[UploadFile] = File(None),
    topic_image_3: Optional[UploadFile] = File(None),
    topic_image_4: Optional[UploadFile] = File(None),
    pyq_image_1:   Optional[UploadFile] = File(None),
    pyq_image_2:   Optional[UploadFile] = File(None),
    pyq_image_3:   Optional[UploadFile] = File(None),
    pyq_image_4:   Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    has_text   = bool(topic and topic.strip())
    has_images = any(img is not None for img in [topic_image_1, topic_image_2, topic_image_3, topic_image_4])
    if not has_text and not has_images:
        raise HTTPException(status_code=422, detail="Provide at least a topic text or one topic image.")

    async def _read(u: Optional[UploadFile]) -> Optional[bytes]:
        if u is None: return None
        c = await u.read()
        return c if c else None

    t1,t2,t3,t4 = await _read(topic_image_1),await _read(topic_image_2),await _read(topic_image_3),await _read(topic_image_4)
    p1,p2,p3,p4 = await _read(pyq_image_1),  await _read(pyq_image_2),  await _read(pyq_image_3),  await _read(pyq_image_4)

    try:
        result = await generate_lesson_plan(
            subject=subject, class_name=class_name, topic_text=topic,
            topic_image_1=t1, topic_image_2=t2, topic_image_3=t3, topic_image_4=t4,
            pyq_image_1=p1,   pyq_image_2=p2,   pyq_image_3=p3,   pyq_image_4=p4,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {e}")

    lesson_content = result.get("lessonContent", [])
    primary_topic  = (lesson_content[0].get("topic") if lesson_content
                      else result.get("topic") or topic or "Untitled")

    lesson = Lesson(
        subject        = result.get("subject") or subject,
        topic          = primary_topic,
        class_         = result.get("className") or class_name,
        lesson_content = json.dumps(lesson_content),
        quiz           = json.dumps(result.get("quiz", [])),
    )
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)

    return LessonResponse(
        id=lesson.id, subject=lesson.subject, topic=lesson.topic,
        className=lesson.class_, lessonContent=lesson_content, quiz=result.get("quiz", []),
    )


# ── GET /lesson-generator/all ─────────────────────────────────────────────────
# IMPORTANT: this must be defined BEFORE /{lesson_id} so FastAPI
# doesn't try to cast "all" as an integer and return 422.

@router.get("/all")
async def get_all_lessons(db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Lesson).order_by(desc(Lesson.created_at)).limit(50))
    lessons = r.scalars().all()
    return [
        {
            "id":            l.id,
            "topic":         l.topic,
            "subject":       l.subject,
            "className":     l.class_,
            "avg_score":     l.avg_score,
            "attempt_count": l.attempt_count,
            "is_completed":  l.is_completed,
            "created_at":    l.created_at.isoformat() if l.created_at else None,
        }
        for l in lessons
    ]


# ── GET /lesson-generator/{lesson_id} ────────────────────────────────────────

@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(lesson_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = r.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return LessonResponse(
        id=lesson.id, subject=lesson.subject, topic=lesson.topic,
        className=lesson.class_,
        lessonContent=json.loads(lesson.lesson_content or "[]"),
        quiz=json.loads(lesson.quiz or "[]"),
    )


# ── GET /lesson-generator/{lesson_id}/student-record ─────────────────────────

@router.get("/{lesson_id}/student-record")
async def get_student_record(lesson_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = r.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {
        "lesson_id":     lesson.id,
        "avg_score":     lesson.avg_score,
        "attempt_count": lesson.attempt_count,
        "weak_topics":   json.loads(lesson.weak_topics or "[]"),
        "is_completed":  lesson.is_completed,
        "remark":        "",
    }


# ── POST /lesson-generator/{lesson_id}/simulate ──────────────────────────────

@router.post("/{lesson_id}/simulate", response_model=SimulateResponse)
async def simulate_test(lesson_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = r.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    all_questions: list[dict] = json.loads(lesson.quiz or "[]")
    if not all_questions:
        raise HTTPException(status_code=422, detail="No quiz attached to this lesson")

    first_topic = all_questions[0].get("topic", lesson.topic or "Topic")
    questions   = [q for q in all_questions if q.get("topic") == first_topic]

    try:
        students = await simulate_batch_students(questions, first_topic, n=22)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e}")

    avg_score      = round(sum(s["score_pct"] for s in students) / len(students)) if students else 0
    below50        = sum(1 for s in students if s["score_pct"] < 50)
    needs_revision = avg_score < 60

    from collections import Counter
    agg_answers: dict[int, str] = {}
    for qi in range(len(questions)):
        choices     = [s["answers"].get(qi, "") for s in students]
        most_common = Counter(choices).most_common(1)
        agg_answers[qi] = most_common[0][0] if most_common else ""

    weak_json   = compute_weak_topics(json.dumps(questions), agg_answers)
    weak_topics = json.loads(weak_json)
    weakest     = min(weak_topics, key=lambda w: w["accuracy"], default={})
    weak_area   = weakest.get("topic", first_topic)

    try:
        remark = await generate_remark(first_topic, avg_score, below50, len(students), weak_area)
    except Exception:
        remark = f"Class average is {avg_score}%. {'Revision is strongly recommended.' if needs_revision else 'Keep up the good work.'}"

    lesson.avg_score     = avg_score
    lesson.attempt_count = len(students)
    lesson.weak_topics   = weak_json
    lesson.is_completed  = True
    await db.commit()
    await db.refresh(lesson)

    return SimulateResponse(
        lesson_id      = lesson.id,
        topic          = first_topic,
        students       = [
            StudentRecord(
                name=s["name"], correct=s["correct"], total=s["total"],
                score_pct=s["score_pct"],
                answers={str(k): v for k, v in s["answers"].items()},
            ) for s in students
        ],
        avg_score      = avg_score,
        below50_count  = below50,
        needs_revision = needs_revision,
        weak_topics    = weak_topics,
        remark         = remark,
    )