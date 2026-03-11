from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

RESUME_REFERENCE = """
A resume contains sections like education, skills, experience,
projects, internships, certifications, technical skills,
contact details and achievements.
"""

reference_embedding = model.encode(RESUME_REFERENCE, convert_to_tensor=True)

COMMON_RESUME_KEYWORDS = [
    "education",
    "skills",
    "experience",
    "projects",
    "internship",
    "work",
    "technical",
    "summary",
    "profile",
    "certification",
    "achievement"
]

def has_resume_structure(text):

    text_lower = text.lower()

    hits = sum([1 for word in COMMON_RESUME_KEYWORDS if word in text_lower])

    return hits >= 2   # Resume usually has multiple sections

def is_resume(text):

    if len(text) < 200:
        return False

    # STEP 1 → Structure check
    if has_resume_structure(text):
        return True

    # STEP 2 → Semantic fallback
    text_embedding = model.encode(text[:1500], convert_to_tensor=True)
    similarity = util.cos_sim(text_embedding, reference_embedding)
    score = float(similarity[0][0])

    print("Resume similarity score:", score)

    return score > 0.25