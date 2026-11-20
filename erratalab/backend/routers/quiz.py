from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import QuizQuestion
from ..schemas import AnswerIn, AnswerOut, QuizOut, QuizQuestionOut
from ..services import quiz as quiz_service

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/generate", response_model=QuizOut)
async def generate_quiz(db: Session = Depends(get_db)):
    try:
        questions, used_mistral = await quiz_service.generate_quiz(db)
    except Exception as exc:
        raise HTTPException(502, f"Génération du quiz impossible : {exc}")

    created = []
    for q in questions:
        obj = QuizQuestion(
            subject=q["subject"],
            notion=q["notion"],
            trap_type=q["trap_type"],
            question=q["question"],
            choices=q["choices"],
            correct_index=q["correct_index"],
            explanation=q["explanation"],
        )
        db.add(obj)
        created.append(obj)
    db.commit()
    for obj in created:
        db.refresh(obj)
    return QuizOut(questions=created, demo_mode=not used_mistral)


@router.post("/answer", response_model=AnswerOut)
def answer(payload: AnswerIn, db: Session = Depends(get_db)):
    q = db.get(QuizQuestion, payload.question_id)
    if not q:
        raise HTTPException(404, "Question introuvable.")
    if q.answered_index is not None:
        raise HTTPException(409, "Question déjà répondue.")
    q.answered_index = payload.choice_index
    q.answered_at = func.now()
    q.was_correct = payload.choice_index == q.correct_index
    db.commit()
    return AnswerOut(
        question_id=q.id,
        correct_index=q.correct_index,
        was_correct=q.was_correct,
        explanation=q.explanation,
    )


@router.get("/history", response_model=list[QuizQuestionOut])
def quiz_history(limit: int = 20, db: Session = Depends(get_db)):
    return (
        db.query(QuizQuestion)
        .order_by(QuizQuestion.created_at.desc())
        .limit(min(limit, 100))
        .all()
    )
