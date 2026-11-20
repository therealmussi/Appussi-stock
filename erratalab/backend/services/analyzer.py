import hashlib
import json

from ..config import TRAP_TYPES
from . import demo_data, mistral_client

SYSTEM_ANALYZE = """Tu es un agent pédagogique expert en analyse d'erreurs manuscrites sur des cahiers d'exercices (mathématiques, physique, langues).
On te fournit la transcription OCR d'une page de cahier contenant des exercices corrigés, des raturures, des croix ou des corrections manuscrites.

Ta mission :
1. Isoler UNIQUEMENT les erreurs avérées : passages raturés, corrigés par l'enseignant, marqués faux, ou incohérents avec le reste du calcul.
2. Pour chaque erreur, identifier la notion mathématique/physique/linguistique précise concernée.
3. Classer l'erreur selon CE piège cognitif (choisis la valeur exacte) :
   - "signe" : erreur de signe (moins perdu, signe de b, double négatif...)
   - "confusion_regle" : deux règles ou deux notions confondues
   - "inattention" : copie, report, lecture rapide, le élève sait mais a glissé
   - "formule_mal_appliquee" : formule connue mais appliquée avec un mauvais terme ou mauvais dénominateur
   - "calcul" : glissement de calcul pur (addition, multiplication fausse)
   - "vocabulaire" : confusion de vocabulaire, de notation ou d'unité
   - "autre" : tout le reste

Réponds STRICTEMENT en JSON avec ce schéma :
{
  "matiere": "mathematiques" | "physique" | "langues" | "autre",
  "erreurs": [
    {
      "extrait_original": "texte manuscrit erroné (raturé ou marqué faux)",
      "extrait_corrige": "correction telle qu'écrite sur le cahier, sinon la bonne réponse",
      "notion": "notion précise (ex: 'discriminant d'une équation du second degré')",
      "type_piege": une des valeurs ci-dessus,
      "explication": "1-2 phrases pédagogiques expliquant le piège cognitif",
      "severite": 0.0 à 1.0 (0.1 = simple étourderie, 1.0 = incompréhension profonde)
    }
  ]
}
Si aucune erreur n'est détectable, renvoie {"matiere": "autre", "erreurs": []}."""


def demo_analyze(ocr_text: str, filename: str) -> tuple[str, list[dict]]:
    digest = int(hashlib.md5((filename + ocr_text[:200]).encode()).hexdigest(), 16)
    errors = demo_data.DEMO_ERRORS if ocr_text else demo_data.DEMO_ERRORS[:2]
    if digest % 3 == 2:
        errors = list(reversed(errors))
    return "mathematiques", [dict(e) for e in errors]


async def analyze_page(ocr_text: str, filename: str) -> tuple[str, list[dict]]:
    if not settings.mistral_api_key:
        return demo_analyze(ocr_text, filename)

    user = f"Transcription OCR de la page de cahier :\n\n{ocr_text[:12000]}"
    data = await mistral_client.chat_json(SYSTEM_ANALYZE, user)
    subject = data.get("matiere", "autre")
    if subject not in TRAP_TYPES and subject not in ("mathematiques", "physique", "langues"):
        subject = "autre"
    errors = []
    for e in data.get("erreurs", [])[:20]:
        trap = e.get("type_piege", "autre")
        if trap not in TRAP_TYPES:
            trap = "autre"
        errors.append(
            {
                "subject": subject,
                "notion": str(e.get("notion", "Non identifiée"))[:200],
                "trap_type": trap,
                "original_text": str(e.get("extrait_original", "")),
                "corrected_text": str(e.get("extrait_corrige", "")),
                "explanation": str(e.get("explication", "")),
                "severity": min(1.0, max(0.0, float(e.get("severite", 0.5)))),
            }
        )
    return subject, errors
