# ErrataLab — Débogueur cognitif

Analysez les **erreurs manuscrites** des élèves sur leurs cahiers d'exercices (maths, physique, langues), classez-les par **piège cognitif**, suivez vos **points faibles** et entraînez-vous avec des **mini-quizzes pièges générés sur mesure**.

## Fonctionnalités

1. **Importation & OCR** — photo d'une page de cahier (ratures, corrections) → extraction du texte et des formules via **Mistral OCR** (`mistral-ocr-latest`).
2. **Classification cognitive** — un agent IA (`mistral-large-latest`, sortie JSON) isole chaque erreur, identifie la notion et la classe : *erreur de signe*, *confusion de règle*, *inattention*, *formule mal appliquée*, *glissement de calcul*, *vocabulaire/notation*.
3. **Historique & tableau de bord (PostgreSQL)** — registre filtrable des erreurs, points faibles récurrents, répartition par piège et par matière, activité des 7 derniers jours.
4. **Générateur de mini-quiz pièges** — 5 questions inédites à choix multiples, construites sur vos erreurs les plus fréquentes, avec distracteurs qui reproduisent vos erreurs types et explication détaillée après chaque réponse.

> **Mode démo** : sans clé `MISTRAL_API_KEY`, l'application tourne avec un jeu de données d'exemple (OCR simulé + quiz pré-écrit) pour tester le parcours complet.

## Stack

- **Backend** : Python 3.12, FastAPI, SQLAlchemy 2 (PostgreSQL via psycopg2)
- **IA** : API Mistral — OCR (`POST /v1/ocr`) + chat structuré JSON (`POST /v1/chat/completions`)
- **Frontend** : HTML/CSS/JS vanilla servi par FastAPI (style carnet de laboratoire, zéro dépendance npm)

## Lancement

### Avec Docker (recommandé)

```bash
cp .env.example .env        # renseignez MISTRAL_API_KEY (optionnel : sinon mode démo)
docker compose up --build
```

Application : http://localhost:8000 — PostgreSQL démarré et peuplé automatiquement.

### Sans Docker

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql+psycopg2://erratalab:erratalab@localhost:5432/erratalab"
export MISTRAL_API_KEY="votre-clé"   # optionnel
uvicorn backend.main:app --reload
```

Les tables sont créées automatiquement au démarrage. Créez la base au préalable :
`CREATE DATABASE erratalab;`

## API

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/analyze` | Upload d'une photo (multipart `file`) → OCR + classification |
| GET | `/api/errors?subject=&trap=` | Historique filtré des erreurs |
| GET | `/api/pages` | Pages analysées (avec transcription OCR) |
| GET | `/api/dashboard` | Statistiques, points faibles, activité hebdo |
| POST | `/api/quiz/generate` | Génère un quiz de 5 questions ciblées |
| POST | `/api/quiz/answer` | Répond à une question → correction + explication |
| GET | `/api/quiz/history` | Historique des questions |
| GET | `/api/health` | Sonde de santé |

## Structure

```
erratalab/
├── backend/
│   ├── main.py               # app FastAPI + serving du frontend
│   ├── config.py             # settings (Mistral, DB), taxonomies pièges/matières
│   ├── database.py           # engine SQLAlchemy
│   ├── models.py             # NotebookPage, ErrorRecord, QuizQuestion
│   ├── schemas.py            # contrats Pydantic
│   ├── routers/              # uploads, errors (historique/dashboard), quiz
│   └── services/             # mistral_client (OCR + chat), analyzer, quiz, demo_data
├── frontend/                 # interface carnet de laboratoire
├── docker-compose.yml        # PostgreSQL 16 + app
└── Dockerfile
```
