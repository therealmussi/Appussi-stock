from sqlalchemy import func
from sqlalchemy.orm import Session

from ..config import TRAP_TYPES, settings
from ..models import ErrorRecord, QuizQuestion
from . import demo_data, mistral_client

SYSTEM_QUIZ = """Tu es un concepteur d'exercices piégés, spécialiste des erreurs récurrentes d'élèves.
On te fournit les points faibles d'un élève : notions et types de pièges cognitifs où il échoue le plus souvent (erreurs de signe, confusion de règle, inattention, formule mal appliquée, etc.).

Génère exactement 5 questions inédites à choix multiples (4 options, une seule correcte), conçues sur mesure pour PIÉGER cet élève sur ses faiblesses : chaque question doit contenir un distracteur qui reproduit exactement son type d'erreur habituel.

Réponds STRICTEMENT en JSON :
{
  "questions": [
    {
      "matiere": "mathematiques" | "physique" | "langues",
      "notion": "notion ciblée",
      "type_piege": "signe" | "confusion_regle" | "inattention" | "formule_mal_appliquee" | "calcul" | "vocabulaire" | "autre",
      "question": "énoncé court et autonome",
      "choix": ["option A", "option B", "option C", "option D"],
      "index_correct": 0 à 3,
      "explication": "explication détaillée : pourquoi la bonne réponse est juste ET pourquoi le distracteur piégeur correspond à l'erreur type de l'élève"
    }
  ]
}"""


def _weekly_weak_points(db: Session, limit: int = 6) -> list[dict]:
    rows = (
        db.query(
            ErrorRecord.notion,
            ErrorRecord.trap_type,
            func.count(ErrorRecord.id).label("n"),
        )
        .group_by(ErrorRecord.notion, ErrorRecord.trap_type)
        .order_by(func.count(ErrorRecord.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {"notion": r.notion, "trap_type": r.trap_type, "count": r.n} for r in rows
    ]


async def generate_quiz(db: Session) -> tuple[list[dict], bool]:
    weak = _weekly_weak_points(db)
    if not weak:
        weak = [
            {"notion": "équations du second degré", "trap_type": "signe", "count": 1},
            {"notion": "dérivées de polynômes", "trap_type": "inattention", "count": 1},
        ]
    weak_summary = "\n".join(
        f"- {p['notion']} (piège : {TRAP_TYPES.get(p['trap_type'], p['trap_type'])}, "
        f"commis {p['count']} fois)"
        for p in weak
    )

    if not settings.mistral_api_key:
        return [dict(q) for q in demo_data.DEMO_QUIZ], False

    user = f"Points faibles de l'élève (erreurs récentes) :\n{weak_summary}\n\nGénère le quiz de 5 questions."
    data = await mistral_client.chat_json(SYSTEM_QUIZ, user, temperature=0.7)
    questions = []
    for q in data.get("questions", [])[:5]:
        choices = [str(c) for c in q.get("choix", [])][:6]
        if len(choices) < 2:
            continue
        idx = int(q.get("index_correct", 0))
        idx = max(0, min(idx, len(choices) - 1))
        trap = q.get("type_piege", "autre")
        if trap not in TRAP_TYPES:
            trap = "autre"
        questions.append(
            {
                "subject": q.get("matiere", "mathematiques"),
                "notion": str(q.get("notion", "Général"))[:200],
                "trap_type": trap,
                "question": str(q.get("question", "")),
                "choices": choices,
                "correct_index": idx,
                "explanation": str(q.get("explication", "")),
            }
        )
    if not questions:
        raise ValueError("Réponse quiz invalide")
    return questions, True
