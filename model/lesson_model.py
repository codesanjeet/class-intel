from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from .base import Base
from datetime import datetime
 
 

class Lesson(Base):
    __tablename__ = "lessons"
 
    id = Column(Integer, primary_key=True, index=True)
 
    # ── Input ──────────────────────────────────────────────────────
    subject   = Column(String, nullable=True)   # e.g. "Mathematics"
    topic     = Column(Text,   nullable=True)   # raw text OR OCR'd from images
    class_    = Column(String, nullable=True)   # e.g. "Grade 10 – A"
    board     = Column(String, nullable=True)   # CBSE / ICSE / JEE / NEET
 
    # ── Generated content ──────────────────────────────────────────
    # JSON array — see schema below. Always an array, even for one topic.
    lesson_content = Column(Text, nullable=True)
    # JSON array — flat list of MCQ objects across all topics
    quiz           = Column(Text, nullable=True)
 
    # ── AI Insight (computed post-quiz, not guessed upfront) ───────
    # JSON array — see compute_weak_topics() in services/lesson_service.py
    weak_topics = Column(Text, nullable=True)
 
    # ── Stats ──────────────────────────────────────────────────────
    avg_score     = Column(Integer, default=0)   # 0–100, recomputed per attempt
    attempt_count = Column(Integer, default=0)
 
    # ── State ──────────────────────────────────────────────────────
    is_completed = Column(Boolean, default=False)
 
    # ── Metadata ───────────────────────────────────────────────────
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
 
 
"""
JSON SCHEMAS
============
 
lesson_content  (Text column — store as JSON string)
──────────────────────────────────────────────────────
Always an array. Single topic → [{...}]. Full syllabus → [{...}, {...}, ...]
 
[
  {
    "topic": "Quadratic Equations",
    "estimated_duration_minutes": 60,
    "difficulty_level": "intermediate",          // easy | intermediate | hard
    "tags": ["algebra", "quadratic"],
    "prerequisites": ["Linear Equations"],
    "objectives": [
      "Understand ax² + bx + c = 0",
      "Apply the quadratic formula"
    ],
    "teaching_steps": [
      "Introduction (10 min) — hook with a real parabola",
      "Direct Instruction (15 min) — derive the formula"
    ],
    "activities": [
      "Pair activity: match equations to parabola graphs"
    ],
    "homework": [
      "Complete Exercise 5.3 Q1–Q10"
    ],
    "revision_note": "Students confuse sign when substituting negative b.",
    "teaching_tip": "Colour-code a, b, c consistently throughout.",
    "common_mistakes": [
      "Forgetting to divide by leading coefficient before applying formula"
    ],
    "pyq_alignment": [
      "2023 CBSE Q4: Solve 2x² - 3x - 2 = 0 — directly covered in step 4"
    ]
  }
]
 
quiz  (Text column — store as JSON string)
───────────────────────────────────────────
Flat array across all topics. "topic" field enables weak_topics grouping.
 
[
  {
    "topic": "Quadratic Equations",
    "question": "What is the discriminant of x² - 5x + 6 = 0?",
    "options": ["1", "25", "24", "49"],
    "answer": "1",
    "explanation": "b² - 4ac = 25 - 24 = 1",
    "difficulty": "easy",     // easy | medium | hard
    "marks": 1
  }
]
 
weak_topics  (Text column — computed by compute_weak_topics(), stored as JSON)
────────────────────────────────────────────────────────────────────────────────
[
  {
    "topic": "Quadratic Equations",
    "wrong_count": 2,
    "total_questions": 3,
    "accuracy": 33,
    "insight": "Got 2/3 wrong — needs revision.",
    "flagged_concepts": ["discriminant", "negative b substitution"]
  }
]
"""