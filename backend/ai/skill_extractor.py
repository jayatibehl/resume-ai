import os
import re
import spacy
from sentence_transformers import SentenceTransformer, util

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")


# -----------------------------
# Load Skill Dataset
# -----------------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/skills_dataset.txt")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    SKILLS = [line.strip().lower() for line in f.readlines() if line.strip()]

# Precompute embeddings for skills
skill_embeddings = model.encode(SKILLS, convert_to_tensor=True)


# -----------------------------
# Extract Candidate Phrases
# -----------------------------
def extract_candidate_phrases(text):

    doc = nlp(text)

    phrases = set()

    for chunk in doc.noun_chunks:

        phrase = chunk.text.lower().strip()

        # filter noisy phrases
        if len(phrase) < 3:
            continue

        if len(phrase) > 40:
            continue

        phrases.add(phrase)

    return list(phrases)


# -----------------------------
# Semantic Skill Matching
# -----------------------------
def match_skills_semantically(phrases):

    phrase_embeddings = model.encode(phrases, convert_to_tensor=True)

    detected_skills = set()

    for i, phrase_emb in enumerate(phrase_embeddings):

        scores = util.cos_sim(phrase_emb, skill_embeddings)[0]

        best_idx = scores.argmax()

        if scores[best_idx] > 0.60:
            detected_skills.add(SKILLS[best_idx])

    return list(detected_skills)


# -----------------------------
# Main Skill Extraction
# -----------------------------
def extract_skills(resume_text):

    phrases = extract_candidate_phrases(resume_text)

    skills = match_skills_semantically(phrases)

    return skills


# -----------------------------
# Experience Detection
# -----------------------------
def detect_experience(text):

    text = text.lower()

    # detect patterns like "2 years", "3 yrs", "4+ years"
    matches = re.findall(r'(\d+)\+?\s*(year|years|yr|yrs)', text)

    if matches:

        years = max([int(m[0]) for m in matches])

        return f"{years}+ years"

    # detect internship
    if "intern" in text or "internship" in text:
        return "Internship Experience"

    return "Fresher"