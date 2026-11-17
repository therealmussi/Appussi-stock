from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import ErrorRecord, NotebookPage
from ..schemas import AnalyzeResponse
from ..services import analyzer, mistral_client
from ..services.demo_data import DEMO_OCR

router = APIRouter(prefix="/api", tags=["analysis"])

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    mime = (file.content_type or "").split(";")[0].lower()
    if mime not in ALLOWED_MIME:
        raise HTTPException(400, "Format non supporté : envoyez une photo JPEG, PNG, WebP ou GIF.")

    image = await file.read()
    if len(image) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"Image trop lourde (max {settings.max_upload_mb} Mo).")

    use_mistral = bool(settings.mistral_api_key)
    try:
        if use_mistral:
            ocr_text = await mistral_client.ocr_image(image, mime)
            subject, errors = await analyzer.analyze_page(ocr_text, file.filename or "photo")
        else:
            ocr_text = DEMO_OCR
            subject, errors = analyzer.demo_analyze(ocr_text, file.filename or "photo")
    except mistral_client.MistralError as exc:
        raise HTTPException(502, str(exc))

    page = NotebookPage(
        filename=file.filename or "photo",
        mime_type=mime,
        ocr_text=ocr_text,
        subject=subject,
        engine_mode="mistral" if use_mistral else "demo",
        error_count=len(errors),
    )
    db.add(page)
    db.flush()
    for e in errors:
        db.add(ErrorRecord(page_id=page.id, **e))
    db.commit()
    db.refresh(page)
    return AnalyzeResponse(page=page, demo_mode=not use_mistral)
