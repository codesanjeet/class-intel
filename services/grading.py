import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
import io
from typing import Optional

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))


def bytes_to_pil(image_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(image_bytes))


async def generate_grading_response(
    rules: str,
    # answer sheet pages
    image1: Optional[bytes] = None,
    image2: Optional[bytes] = None,
    image3: Optional[bytes] = None,
    image4: Optional[bytes] = None,
    # question paper pages
    qimage1: Optional[bytes] = None,
    qimage2: Optional[bytes] = None,
    qimage3: Optional[bytes] = None,
    qimage4: Optional[bytes] = None,
    mark: int = 10,
):
    model = genai.GenerativeModel("gemini-2.5-flash")

    content_parts = [rules]

    # ── Question paper first so the model sees questions before answers ────────
    q_images = [qimage1, qimage2, qimage3, qimage4]
    has_questions = any(q is not None for q in q_images)

    if has_questions:
        content_parts.append(
            "\n\n=== QUESTION PAPER (use these to identify each question) ==="
        )
        for img_bytes in q_images:
            if img_bytes is not None:
                content_parts.append(bytes_to_pil(img_bytes))

    # ── Answer sheets ──────────────────────────────────────────────────────────
    content_parts.append("\n\n=== STUDENT ANSWER SHEET ===")
    for img_bytes in [image1, image2, image3, image4]:
        if img_bytes is not None:
            content_parts.append(bytes_to_pil(img_bytes))

    # ── Mark context ───────────────────────────────────────────────────────────
    content_parts.append(
        f"\n\nEach question must be graded out of {mark} marks for each question. "
        f"Set scoreOutOf to {mark} for every question."
    )

    response = model.generate_content(content_parts)
    return response.text