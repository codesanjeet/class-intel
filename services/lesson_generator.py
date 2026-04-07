import json
import os
import io
import asyncio
import random
from typing import Optional

import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

_MODEL = "gemini-2.5-flash"

def _bytes_to_pil(image_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(image_bytes))


_LESSON_PROMPT = """
You are an expert curriculum designer. Generate a complete, structured lesson plan.

Return ONLY a raw JSON object (no markdown fences, no extra text) with this exact shape:

{{
  "subject": "<subject name or null>",
  "topic": "<primary topic title>",
  "className": "<class/grade or null>",
  "lessonContent": [
    {{
      "topic": "<topic title>",
      "estimated_duration_minutes": <integer>,
      "difficulty_level": "<easy|intermediate|hard>",
      "tags": ["<tag>"],
      "prerequisites": ["<prerequisite>"],
      "objectives": ["<learning objective>"],
      "teaching_steps": ["<step description>"],
      "activities": ["<activity>"],
      "homework": ["<homework item>"],
      "revision_note": "<common misconception or revision note>",
      "teaching_tip": "<tip for the teacher>",
      "common_mistakes": ["<mistake>"],
      "pyq_alignment": ["<past year question reference>"]
    }}
  ],
  "quiz": [
    {{
      "topic": "<topic title>",
      "question": "<MCQ question>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "answer": "<correct option text>",
      "explanation": "<brief explanation>",
      "difficulty": "<easy|medium|hard>",
      "marks": <1|2|3>
    }}
  ]
}}

Rules:
- lessonContent is ALWAYS an array, even for a single topic.
- For a full syllabus, produce one lessonContent object per topic.
- Quiz must have at least 3 questions per topic and not always only 3 it cna be 5 , 8 according to need.
- pyq_alignment: if PYQ images provided, reference them. Otherwise leave as [].
- Never add markdown, code fences, or commentary outside the JSON.
""".strip()


_LESSON_PROMPT_WITH_RULES = """
You are an expert curriculum designer. Generate a complete, structured lesson plan.

══════════════════════════════════════════════════
INSTITUTION-SPECIFIC RULES — HIGHEST PRIORITY
These rules override all defaults. Follow them strictly and precisely.

{user_defined_rule}

══════════════════════════════════════════════════

Return ONLY a raw JSON object (no markdown fences, no extra text) with this exact shape:

{{
  "subject": "<subject name or null>",
  "topic": "<primary topic title>",
  "className": "<class/grade or null>",
  "lessonContent": [
    {{
      "topic": "<topic title>",
      "estimated_duration_minutes": <integer>,
      "difficulty_level": "<easy|intermediate|hard>",
      "tags": ["<tag>"],
      "prerequisites": ["<prerequisite>"],
      "objectives": ["<learning objective>"],
      "teaching_steps": ["<step description>"],
      "activities": ["<activity>"],
      "homework": ["<homework item>"],
      "revision_note": "<common misconception or revision note>",
      "teaching_tip": "<tip for the teacher>",
      "common_mistakes": ["<mistake>"],
      "pyq_alignment": ["<past year question reference>"]
    }}
  ],
  "quiz": [
    {{
      "topic": "<topic title>",
      "question": "<MCQ question>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "answer": "<correct option text>",
      "explanation": "<brief explanation>",
      "difficulty": "<easy|medium|hard>",
      "marks": <1|2|3>
    }}
  ]
}}

Rules:
- ALWAYS honour the institution-specific rules above first — timing, credit hours, sequencing, etc.
- lessonContent is ALWAYS an array, even for a single topic.
- For a full syllabus, produce one lessonContent object per topic.
- Quiz must have at least 3 questions per topic.
- pyq_alignment: if PYQ images provided, reference them. Otherwise leave as [].
- Never add markdown, code fences, or commentary outside the JSON.
""".strip()


# Prompt to simulate a BATCH of students in one LLM call
_BATCH_SIMULATE_PROMPT = """
You are simulating {n} different students taking a quiz on "{topic}".
Each student has a different ability level — weak, average, or strong.
MOST students should be weak or average (realistic classroom distribution).
Bias toward poor performance: roughly 60-70% of students should score below 50%.

Questions (JSON):
{questions}

Return ONLY a raw JSON array of {n} objects, one per student:
[
  {{
    "name": "<Indian student name>",
    "answers": {{"0": "<option text>", "1": "<option text>", ...}}
  }},
  ...
]

Rules:
- answers keys are 0-based question indices as strings
- answer values must be EXACTLY one of the provided options for that question
- weak students get 0-30% right, average 30-55%, strong 60-80%
- distribute: ~40% weak, ~35% average, ~25% strong
- No markdown, no extra text — only the JSON array.
""".strip()


_REMARK_PROMPT = """
You are an experienced teacher reviewing class performance on a quiz.
Write a short honest remark (2-3 sentences) based on the results below.
Be direct — if the class is struggling, say so clearly and suggest next steps.
Return ONLY the remark text.

Topic: {topic}
Class average: {avg}%
Students below 50%: {below50} out of {total}
Weakest area: {weak_area}
""".strip()


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        text = text.rsplit("```", 1)[0].strip()
    return text


def _call_gemini(parts: list) -> str:
    model = genai.GenerativeModel(_MODEL)
    response = model.generate_content(parts)
    return response.text.strip()


# ── Lesson generation ─────────────────────────────────────────────────────────

async def generate_lesson_plan(
    subject: Optional[str] = None,
    class_name: Optional[str] = None,
    topic_text: Optional[str] = None,
    user_defined_rule: Optional[str] = None,
    # Topic images — up to 8
    topic_image_1: Optional[bytes] = None,
    topic_image_2: Optional[bytes] = None,
    topic_image_3: Optional[bytes] = None,
    topic_image_4: Optional[bytes] = None,
    topic_image_5: Optional[bytes] = None,
    topic_image_6: Optional[bytes] = None,
    topic_image_7: Optional[bytes] = None,
    topic_image_8: Optional[bytes] = None,
    # PYQ images — up to 8
    pyq_image_1: Optional[bytes] = None,
    pyq_image_2: Optional[bytes] = None,
    pyq_image_3: Optional[bytes] = None,
    pyq_image_4: Optional[bytes] = None,
    pyq_image_5: Optional[bytes] = None,
    pyq_image_6: Optional[bytes] = None,
    pyq_image_7: Optional[bytes] = None,
    pyq_image_8: Optional[bytes] = None,
) -> dict:
    # Choose prompt — inject user rules at highest priority if provided
    if user_defined_rule and user_defined_rule.strip():
        base_prompt = _LESSON_PROMPT_WITH_RULES.format(
            user_defined_rule=user_defined_rule.strip()
        )
    else:
        base_prompt = _LESSON_PROMPT

    parts: list = [base_prompt]

    lines = []
    if subject:    lines.append(f"Subject: {subject}")
    if class_name: lines.append(f"Class: {class_name}")
    if topic_text: lines.append(f"Topic / Syllabus:\n{topic_text}")
    if lines:      parts.append("\n".join(lines))

    topic_imgs = [
        topic_image_1, topic_image_2, topic_image_3, topic_image_4,
        topic_image_5, topic_image_6, topic_image_7, topic_image_8,
    ]
    pyq_imgs = [
        pyq_image_1, pyq_image_2, pyq_image_3, pyq_image_4,
        pyq_image_5, pyq_image_6, pyq_image_7, pyq_image_8,
    ]

    for label, imgs in [
        ("The following images show the topic/syllabus pages to teach:", topic_imgs),
        ("The following images are previous year exam questions (PYQs).", pyq_imgs),
    ]:
        valid = [b for b in imgs if b]
        if valid:
            parts.append(label)
            for b in valid:
                parts.append(_bytes_to_pil(b))

    raw = await asyncio.to_thread(_call_gemini, parts)
    return json.loads(_strip_fences(raw))


# ── Batch student simulation ──────────────────────────────────────────────────

async def simulate_batch_students(
    questions: list[dict],
    topic: str,
    n: int = 22,
) -> list[dict]:
    """
    Ask LLM to simulate n students in ONE call.
    Returns list of {name, answers: {int: str}, score_pct: int, correct: int}
    """
    q_payload = json.dumps([
        {"index": i, "question": q["question"], "options": q["options"], "difficulty": q.get("difficulty", "medium")}
        for i, q in enumerate(questions)
    ], indent=2)

    prompt = _BATCH_SIMULATE_PROMPT.format(n=n, topic=topic, questions=q_payload)
    raw = await asyncio.to_thread(_call_gemini, [prompt])
    students_raw: list[dict] = json.loads(_strip_fences(raw))

    # Score each student
    result = []
    for s in students_raw:
        answers = {int(k): v for k, v in s.get("answers", {}).items()}
        correct = sum(
            1 for i, q in enumerate(questions)
            if answers.get(i, "").strip() == q["answer"].strip()
        )
        score_pct = round((correct / len(questions)) * 100) if questions else 0
        result.append({
            "name":      s.get("name", f"Student {len(result)+1}"),
            "answers":   answers,
            "correct":   correct,
            "total":     len(questions),
            "score_pct": score_pct,
        })

    return result


async def generate_remark(topic: str, avg: int, below50: int, total: int, weak_area: str) -> str:
    prompt = _REMARK_PROMPT.format(
        topic=topic, avg=avg, below50=below50, total=total, weak_area=weak_area or "N/A"
    )
    return await asyncio.to_thread(_call_gemini, [prompt])


# ── Weak topic computation ────────────────────────────────────────────────────

def compute_weak_topics(quiz_json: str, answers: dict[int, str]) -> str:
    questions = json.loads(quiz_json)
    stats: dict[str, dict] = {}
    for i, q in enumerate(questions):
        t = q.get("topic", "General")
        if t not in stats:
            stats[t] = {"total": 0, "wrong": 0}
        stats[t]["total"] += 1
        if answers.get(i, "").strip() != q["answer"].strip():
            stats[t]["wrong"] += 1

    result = []
    for topic, s in stats.items():
        total, wrong = s["total"], s["wrong"]
        accuracy = round((1 - wrong / total) * 100) if total else 100
        result.append({
            "topic": topic,
            "wrong_count": wrong,
            "total_questions": total,
            "accuracy": accuracy,
            "insight": f"Got {wrong}/{total} wrong — needs revision." if wrong > 0 else "Solid understanding.",
            "flagged_concepts": [],
        })
    return json.dumps(result)


def list_available_models() -> list[str]:
    return [
        m.name for m in genai.list_models()
        if "generateContent" in m.supported_generation_methods
    ]