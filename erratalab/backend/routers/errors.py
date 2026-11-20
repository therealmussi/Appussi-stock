from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..config import SUBJECTS, TRAP_TYPES
from ..database import get_db
from ..models import ErrorRecord, NotebookPage, QuizQuestion
from ..schemas import DashboardResponse, ErrorOut

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/errors", response_model=list[ErrorOut])
def list_errors(subject: str | None = None, trap: str | None = None, limit: int = 100, db: Session = Depends(get_db)):
    q = db.query(ErrorRecord).order_by(ErrorRecord.created_at.desc())
    if subject:
        q = q.filter(ErrorRecord.subject == subject)
    if trap:
        q = q.filter(ErrorRecord.trap_type == trap)
    return q.limit(min(limit, 500)).all()


@router.get("/pages")
def list_pages(limit: int = 50, db: Session = Depends(get_db)):
    pages = (
        db.query(NotebookPage)
        .order_by(NotebookPage.created_at.desc())
        .limit(min(limit, 200))
        .all()
    )
    return [
        {
            "id": p.id,
            "created_at": p.created_at.isoformat(),
            "filename": p.filename,
            "subject": p.subject,
            "engine_mode": p.engine_mode,
            "error_count": p.error_count,
            "ocr_text": p.ocr_text,
        }
        for p in pages
    ]


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)):
    total_errors = db.query(func.count(ErrorRecord.id)).scalar() or 0
    total_pages = db.query(func.count(NotebookPage.id)).scalar() or 0
    total_questions = db.query(func.count(QuizQuestion.id)).scalar() or 0
    answered = db.query(QuizQuestion).filter(QuizQuestion.was_correct.isnot(None)).all()
    accuracy = None
    if answered:
        accuracy = sum(1 for q in answered if q.was_correct) / len(answered)

    by_subject = dict(
        db.query(ErrorRecord.subject, func.count(ErrorRecord.id))
        .group_by(ErrorRecord.subject)
        .all()
    )
    by_trap = dict(
        db.query(ErrorRecord.trap_type, func.count(ErrorRecord.id))
        .group_by(ErrorRecord.trap_type)
        .all()
    )

    weak_rows = (
        db.query(
            ErrorRecord.notion,
            ErrorRecord.subject,
            func.count(ErrorRecord.id).label("n"),
            func.avg(ErrorRecord.severity).label("sev"),
        )
        .group_by(ErrorRecord.notion, ErrorRecord.subject)
        .order_by(func.count(ErrorRecord.id).desc(), func.avg(ErrorRecord.severity).desc())
        .limit(8)
        .all()
    )
    weak_points = [
        {
            "notion": r.notion,
            "subject": r.subject,
            "count": r.n,
            "avg_severity": round(float(r.sev or 0.5), 2),
        }
        for r in weak_rows
    ]

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_rows = db.query(ErrorRecord).filter(ErrorRecord.created_at >= week_ago).all()
    weekly = []
    for i in range(6, -1, -1):
        day = (datetime.now(timezone.utc) - timedelta(days=i)).date()
        n = sum(1 for e in weekly_rows if e.created_at.date() == day)
        weekly.append({"date": day.isoformat(), "count": n})

    return DashboardResponse(
        total_errors=total_errors,
        total_pages=total_pages,
        total_questions=total_questions,
        quiz_accuracy=accuracy,
        by_subject={SUBJECTS.get(k, k): v for k, v in by_subject.items()},
        by_trap={TRAP_TYPES.get(k, k): v for k, v in by_trap.items()},
        weak_points=weak_points,
        weekly=weekly,
    )
