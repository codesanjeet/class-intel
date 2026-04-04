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
    image1: Optional[bytes] = None,
    image2: Optional[bytes] = None,
    image3: Optional[bytes] = None,
    image4: Optional[bytes] = None,
    text: Optional[str] = None,
    mark: int = 10,
):
    model = genai.GenerativeModel("gemini-2.5-flash")

    content_parts = [rules]

    for image_bytes in [image1, image2, image3, image4]:
        if image_bytes is not None:
            content_parts.append(bytes_to_pil(image_bytes))

    if text is not None:
        content_parts.append(f"{text}\n\nGiven mark is: {mark}")
    else:
        content_parts.append(f"Given mark is: {mark}")

    response = model.generate_content(content_parts)
    return response.text