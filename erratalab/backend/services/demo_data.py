DEMO_OCR = """# Exercice 3 — Équations du second degré

1. Résoudre $x^2 - 5x + 6 = 0$

   Δ = (-5)^2 - 4·1·6 = 25 - 24 = 1  ~~Δ = 25 + 24 = 49~~

   x₁ = (5 - 1)/2 = 2  x₂ = (5 + 1)/2 = 3

2. Résoudre $2x^2 + 4x - 6 = 0$

   Δ = 16 + 48 = 64 → √Δ = 8

   x₁ = (-4 - 8)/4 = -3  ~~x₁ = (-4 - 8)/2 = -6~~  x₂ = (-4 + 8)/4 = 1

# Exercice 4 — Dérivées

Soit f(x) = x³ - 3x² + 2

f'(x) = 3x² - 6x  ~~f'(x) = 3x² - 3x~~

Tangente en x = 1 : y = f'(1)(x - 1) + f(1) = -3(x - 1) + 0 = -3x + 3
"""

DEMO_ERRORS = [
    {
        "subject": "mathematiques",
        "notion": "Discriminant d'une équation du second degré",
        "trap_type": "signe",
        "original_text": "Δ = 25 + 24 = 49",
        "corrected_text": "Δ = 25 - 24 = 1",
        "explanation": "Le discriminant utilise une soustraction : Δ = b² - 4ac. Écrire « + 4ac » annule la structure même de la formule et fausse les deux racines.",
        "severity": 0.7,
    },
    {
        "subject": "mathematiques",
        "notion": "Formule des racines (division par 2a)",
        "trap_type": "formule_mal_appliquee",
        "original_text": "x₁ = (-4 - 8)/2 = -6",
        "corrected_text": "x₁ = (-4 - 8)/4 = -3",
        "explanation": "La racine est x = (-b ± √Δ) / (2a). Avec a = 2, on divise par 4, pas par 2 : le coefficient a a été oublié dans le dénominateur.",
        "severity": 0.8,
    },
    {
        "subject": "mathematiques",
        "notion": "Dérivée d'un polynôme (coefficient de x²)",
        "trap_type": "inattention",
        "original_text": "f'(x) = 3x² - 3x",
        "corrected_text": "f'(x) = 3x² - 6x",
        "explanation": "La dérivée de -3x² est -6x. Le facteur 2 de la puissance a été perdu en route : relecture rapide, le reste du calcul était juste.",
        "severity": 0.4,
    },
]

DEMO_QUIZ = [
    {
        "subject": "mathematiques",
        "notion": "Discriminant d'une équation du second degré",
        "trap_type": "signe",
        "question": "Pour 3x² - 2x + 1 = 0, quel est le discriminant Δ ?",
        "choices": ["Δ = (-2)² - 4·3·1 = -8", "Δ = (-2)² + 4·3·1 = 16", "Δ = 4 - 12 = -8 donc Δ = 8", "Δ = 2² - 3·1 = 1"],
        "correct_index": 0,
        "explanation": "Δ = b² - 4ac = (-2)² - 4·3·1 = 4 - 12 = -8. Piège principal : oublier le signe de b (ici négatif) ou remplacer la soustraction par une addition. Δ < 0 signifie aucune racine réelle.",
    },
    {
        "subject": "mathematiques",
        "notion": "Formule des racines (division par 2a)",
        "trap_type": "formule_mal_appliquee",
        "question": "Les racines de 2x² - 8x + 6 = 0 sont :",
        "choices": ["x = (8 ± √16)/2 → 5 et 3", "x = (8 ± √16)/4 → 3 et 1", "x = (-8 ± √16)/4 → -3 et -1", "x = (8 ± 16)/4 → 6 et -2"],
        "correct_index": 1,
        "explanation": "Δ = 64 - 48 = 16, donc x = (8 ± 4)/4 = 3 et 1. Le piège classique : diviser par a au lieu de 2a, ou oublier que -b = 8 quand b = -8.",
    },
    {
        "subject": "mathematiques",
        "notion": "Dérivée d'un polynôme (coefficient de x²)",
        "trap_type": "inattention",
        "question": "Si f(x) = 5x³ - 4x² + 7, alors f'(x) = ?",
        "choices": ["15x² - 4x + 7", "15x² - 8x", "5x² - 8x", "15x² - 8x + 7"],
        "correct_index": 1,
        "explanation": "On dérive terme à terme : 5·3x² = 15x², -4·2x = -8x, et la constante 7 disparaît. Les distracteurs reprennent vos erreurs habituelles : garder la constante ou perdre le facteur 2.",
    },
    {
        "subject": "mathematiques",
        "notion": "Discriminant d'une équation du second degré",
        "trap_type": "signe",
        "question": "Pour x² + 6x + 9 = 0, quel calcul de Δ est correct ?",
        "choices": ["Δ = 36 - 36 = 0", "Δ = 36 + 36 = 72", "Δ = 6² + 4·9 = 72", "Δ = 36 - 9 = 27"],
        "correct_index": 0,
        "explanation": "Δ = b² - 4ac = 36 - 36 = 0 : racine double x = -3. Le piège : ici a = 1, mais la soustraction des 4ac doit rester, même quand le résultat tombe à 0.",
    },
    {
        "subject": "mathematiques",
        "notion": "Formule des racines (division par 2a)",
        "trap_type": "formule_mal_appliquee",
        "question": "Après avoir trouvé Δ = 25 pour 2x² - 3x - 2 = 0, la bonne racine positive est :",
        "choices": ["x = (3 + 5)/2 = 4", "x = (3 + 5)/4 = 2", "x = (-3 + 5)/4 = 0,5", "x = (3 - 5)/4 = -0,5"],
        "correct_index": 1,
        "explanation": "x = (-b ± √Δ)/(2a) = (3 ± 5)/4, donc 2 et -0,5. Double piège : le signe de -b (b = -3 donc -b = 3) et le dénominateur 2a = 4.",
    },
]
