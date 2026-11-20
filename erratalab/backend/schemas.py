from datetime import datetime

from pydantic import BaseModel, Field


class ErrorOut(BaseModel):
    id: int
    created_at: datetime
    subject: str
    notion: str
    trap_type: str
    original_text: str
    corrected_text: str
    explanation: str
    severity: float
    page_id: int

    class Config:
        from_attributes = True


class PageOut(BaseModel):
    id: int
    created_at: datetime
    filename: str
    subject: str
    ocr_text: str
    engine_mode: str
    error_count: int
    errors: list[ErrorOut] = []

    class Config:
        from_attributes = True


class AnalyzeResponse(BaseModel):
    page: PageOut
    demo_mode: bool


class DashboardResponse(BaseModel):
    total_errors: int
    total_pages: int
    total_questions: int
    quiz_accuracy: float | None
    by_subject: dict[str, int]
    by_trap: dict[str, int]
    weak_points: list[dict]
    weekly: list[dict]


class QuizQuestionOut(BaseModel):
    id: int
    subject: str
    notion: str
    trap_type: str
    question: str
    choices: list[str]
    answered_index: int | None = None
    was_correct: bool | None = None

    class Config:
        from_attributes = True


class QuizOut(BaseModel):
    questions: list[QuizQuestionOut]
    demo_mode: bool


class AnswerIn(BaseModel):
    question_id: int
    choice_index: int = Field(ge=0, le=9)


class AnswerOut(BaseModel):
    question_id: int
    correct_index: int
    was_correct: bool
    explanation: str
