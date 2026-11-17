import base64
import json

import httpx

from ..config import MISTRAL_API_BASE, settings


class MistralError(Exception):
    pass


def _headers():
    return {"Authorization": f"Bearer {settings.mistral_api_key}"}


async def ocr_image(image_bytes: bytes, mime_type: str) -> str:
    data_uri = f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode()}"
    payload = {
        "model": settings.mistral_ocr_model,
        "document": {"type": "image_url", "image_url": data_uri},
        "include_image_base64": False,
    }
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{MISTRAL_API_BASE}/ocr", json=payload, headers=_headers()
        )
    if resp.status_code != 200:
        raise MistralError(f"OCR Mistral ({resp.status_code}) : {resp.text[:300]}")
    pages = resp.json().get("pages", [])
    return "\n\n".join(p.get("markdown", "") for p in pages).strip()


async def chat_json(system: str, user: str, temperature: float = 0.3) -> dict:
    payload = {
        "model": settings.mistral_chat_model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": temperature,
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{MISTRAL_API_BASE}/chat/completions", json=payload, headers=_headers()
        )
    if resp.status_code != 200:
        raise MistralError(f"Chat Mistral ({resp.status_code}) : {resp.text[:300]}")
    content = resp.json()["choices"][0]["message"]["content"]
    return json.loads(content)
