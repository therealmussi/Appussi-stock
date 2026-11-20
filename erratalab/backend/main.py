from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import errors, quiz, uploads

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

app = FastAPI(title="ErrataLab", version="1.0.0")

Base.metadata.create_all(bind=engine)

app.include_router(uploads.router)
app.include_router(errors.router)
app.include_router(quiz.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "ErrataLab"}


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


@app.exception_handler(404)
async def spa_fallback(request: Request, exc):
    if request.url.path.startswith("/api"):
        return JSONResponse({"detail": "Ressource introuvable."}, status_code=404)
    return FileResponse(FRONTEND_DIR / "index.html")
