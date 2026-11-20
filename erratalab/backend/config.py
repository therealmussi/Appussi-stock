from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mistral_api_key: str = ""
    mistral_ocr_model: str = "mistral-ocr-latest"
    mistral_chat_model: str = "mistral-large-latest"
    database_url: str = "postgresql+psycopg2://erratalab:erratalab@localhost:5432/erratalab"
    max_upload_mb: int = 12

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

MISTRAL_API_BASE = "https://api.mistral.ai/v1"

TRAP_TYPES = {
    "signe": "Erreur de signe",
    "confusion_regle": "Confusion de règle",
    "inattention": "Inattention",
    "formule_mal_appliquee": "Formule mal appliquée",
    "calcul": "Glissement de calcul",
    "vocabulaire": "Vocabulaire / notation",
    "autre": "Autre",
}

SUBJECTS = {
    "mathematiques": "Mathématiques",
    "physique": "Physique",
    "langues": "Langues",
    "autre": "Autre",
}
