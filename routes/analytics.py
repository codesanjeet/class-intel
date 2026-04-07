import json
import google.generativeai as genai
import os
from dotenv import load_dotenv
from fastapi import APIRouter, Form

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

router = APIRouter(prefix="/analytics", tags=["analytics"])

ANALYTICS_RULES = """
You are EduAnalytics AI — an expert academic performance analyst embedded in a school management system.
You receive structured JSON data about a student or class and return precise, actionable JSON insights.

STRICT RULES:
1. Return ONLY valid JSON — absolutely no markdown fences, no backticks, no preamble, no trailing text.
2. Be specific and data-driven. Reference actual names, scores, and percentages from the input.
3. Use warm, encouraging language for students; professional, concise language for teachers.
4. Predictions must be realistic (max ±1.5 points from current avg score).
5. If the input is student data, return the STUDENT shape. If class data, return the CLASS shape.

────────────────────────────────────────────────────────────────────────────────
STUDENT SHAPE (use when input has a single student):
{
  "type": "student",
  "summary": "2-3 sentence personalised summary mentioning the student name and subject.",
  "strengths": ["Specific strength 1 backed by data", "Specific strength 2", "Strength 3"],
  "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
  "areasToImprove": ["Topic/Skill 1", "Topic/Skill 2", "Topic/Skill 3"],
  "performancePrediction": {
    "nextMonthScore": 7.5,
    "trend": "improving",
    "confidence": "high",
    "explanation": "One sentence reason based on test trajectory."
  },
  "actionItems": [
    { "priority": "high",   "action": "Concrete specific action the teacher should take this week." },
    { "priority": "medium", "action": "Secondary follow-up action." }
  ],
  "riskLevel": "low",
  "riskReason": "One sentence. Leave empty string if riskLevel is low.",
  "learningStyle": "visual",
  "recommendedResources": ["Specific resource or activity 1", "Resource 2"]
}

Valid values — trend: "improving"|"stable"|"declining"; riskLevel: "low"|"medium"|"high"; learningStyle: "visual"|"auditory"|"kinesthetic"|"reading-writing"

────────────────────────────────────────────────────────────────────────────────
CLASS SHAPE (use when input has a students array):
{
  "type": "class",
  "summary": "2-3 sentence class-level summary mentioning class name and subject.",
  "topPerformers": ["Name1", "Name2", "Name3"],
  "atRiskStudents": ["Name1", "Name2"],
  "classStrengths": ["Class strength 1", "Class strength 2"],
  "classWeaknesses": ["Class weakness 1", "Class weakness 2"],
  "topicAnalysis": {
    "strongTopics": ["Topic 1", "Topic 2"],
    "weakTopics":   ["Topic 1", "Topic 2"],
    "recommendedFocus": "Most critical single topic to address this week."
  },
  "performancePrediction": {
    "nextMonthAvg": 7.2,
    "trend": "improving",
    "confidence": "high",
    "explanation": "One sentence reason."
  },
  "actionItems": [
    { "priority": "high",   "action": "Specific teacher action.", "targetGroup": "at-risk" },
    { "priority": "medium", "action": "Secondary action.",        "targetGroup": "all"     }
  ],
  "attendanceInsight": "One sentence about attendance-performance correlation.",
  "engagementInsight": "One sentence about activity level impact.",
  "recommendedStrategies": ["Teaching strategy 1", "Strategy 2", "Strategy 3"]
}

Valid values — trend: "improving"|"stable"|"declining"; targetGroup: "all"|"at-risk"|"top"

Return ONLY the JSON object. Nothing before or after it.
"""


async def _call_gemini(user_prompt: str) -> str:
    """Call Gemini 2.5 Flash with analytics rules as system context."""
    model = genai.GenerativeModel("gemini-2.5-flash")
    # Match your existing pattern: rules first, then content
    response = model.generate_content([ANALYTICS_RULES, user_prompt])
    return response.text


def _clean_and_parse(raw: str) -> dict:
    """Strip any accidental markdown fences and parse JSON."""
    text = raw.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) >= 2 else text
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip().rstrip("`").strip())


# ── /analytics/student ────────────────────────────────────────────────────────
@router.post("/student")
async def analyse_student(student_data: str = Form(...)):
    """
    AI analysis for a single student.

    Form field: student_data (JSON string)
    {
        "name": "Rahul Verma", "score": 8.2, "attendance": 88,
        "activity": "High", "tests": [7,8,9,8,9], "submissions": 18,
        "rank": 2, "className": "Class 10-A", "subject": "Mathematics",
        "teacher": "Mrs. Sharma",
        "topicScores": [{"topic":"Algebra","score":72}, ...]
    }
    """
    try:
        data = json.loads(student_data)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in student_data"}

    user_prompt = f"""
Analyse this student and return ONLY the STUDENT JSON shape defined in your rules.

Student Data:
{json.dumps(data, indent=2)}

Context clues:
- score is out of 10
- attendance is a percentage (0-100)
- tests array is chronological — use to detect trend
- submissions out of 20 maximum
- Be personalised: use the student's first name in the summary
"""

    try:
        raw = await _call_gemini(user_prompt)
        return _clean_and_parse(raw)
    except json.JSONDecodeError:
        return {"raw": raw, "error": "Gemini returned non-JSON — check ANALYTICS_RULES prompt"}
    except Exception as e:
        return {"error": str(e)}


# ── /analytics/class ─────────────────────────────────────────────────────────
@router.post("/class")
async def analyse_class(class_data: str = Form(...)):
    """
    AI analysis for an entire class.

    Form field: class_data (JSON string)
    {
        "name": "Class 10-A", "subject": "Mathematics", "teacher": "Mrs. Sharma",
        "totalStudents": 28, "avgScore": 6.4, "avgAttendance": 74,
        "topTopic": "Algebra", "weakTopic": "Trigonometry",
        "monthlyTrend": [{"month":"Jan","score":5.2}, ...],
        "topicScores": [{"topic":"Algebra","score":72}, ...],
        "students": [{"name":"Rahul","score":8.2,"attendance":88,"activity":"High","rank":2}, ...]
    }
    """
    try:
        data = json.loads(class_data)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in class_data"}

    # Slim down student list for token efficiency
    slim_students = [
        {"name": s.get("name"), "score": s.get("score"),
         "attendance": s.get("attendance"), "activity": s.get("activity"), "rank": s.get("rank")}
        for s in data.get("students", [])
    ]
    payload = {**data, "students": slim_students}

    user_prompt = f"""
Analyse this class and return ONLY the CLASS JSON shape defined in your rules.

Class Data:
{json.dumps(payload, indent=2)}

Context clues:
- monthlyTrend = class average score per month (chronological)
- topicScores  = class-wide % performance per topic
- Students with score < 5 are at risk; score >= 8 are top performers
- Identify exactly 3 top performers and 2 at-risk students by name
- Attendance % below 65 is critical
"""

    try:
        raw = await _call_gemini(user_prompt)
        return _clean_and_parse(raw)
    except json.JSONDecodeError:
        return {"raw": raw, "error": "Gemini returned non-JSON — check ANALYTICS_RULES prompt"}
    except Exception as e:
        return {"error": str(e)}