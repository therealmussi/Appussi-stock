from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow():
    return datetime.now(timezone.utc)


class NotebookPage(Base):
    __tablename__ = "notebook_pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    filename: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(100), default="image/jpeg")
    ocr_text: Mapped[str] = mapped_column(Text, default="")
    subject: Mapped[str] = mapped_column(String(40), default="autre")
    engine_mode: Mapped[str] = mapped_column(String(20), default="mistral")
    error_count: Mapped[int] = mapped_column(Integer, default=0)

    errors: Mapped[list["ErrorRecord"]] = relationship(
        back_populates="page", cascade="all, delete-orphan"
    )


class ErrorRecord(Base):
    __tablename__ = "error_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    page_id: Mapped[int] = mapped_column(ForeignKey("notebook_pages.id", ondelete="CASCADE"))
    subject: Mapped[str] = mapped_column(String(40), index=True)
    notion: Mapped[str] = mapped_column(String(200), index=True)
    trap_type: Mapped[str] = mapped_column(String(40), index=True)
    original_text: Mapped[str] = mapped_column(Text, default="")
    corrected_text: Mapped[str] = mapped_column(Text, default="")
    explanation: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[float] = mapped_column(Float, default=0.5)

    page: Mapped[NotebookPage] = relationship(back_populates="errors")
    quiz_questions: Mapped[list["QuizQuestion"]] = relationship(back_populates="source_error")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    subject: Mapped[str] = mapped_column(String(40), index=True)
    notion: Mapped[str] = mapped_column(String(200))
    trap_type: Mapped[str] = mapped_column(String(40), index=True)
    question: Mapped[str] = mapped_column(Text)
    choices: Mapped[list] = mapped_column(JSON, default=list)
    correct_index: Mapped[int] = mapped_column(Integer)
    explanation: Mapped[str] = mapped_column(Text, default="")
    source_error_id: Mapped[int | None] = mapped_column(
        ForeignKey("error_records.id", ondelete="SET NULL"), nullable=True
    )
    answered_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    answered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    was_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    source_error: Mapped[ErrorRecord | None] = relationship(back_populates="quiz_questions")
