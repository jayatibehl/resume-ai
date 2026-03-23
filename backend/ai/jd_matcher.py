import sqlite3

from ai.embedding_engine import get_embedding, cosine_similarity
from ai.skill_extractor import extract_skills

# ------------------ GLOBAL CACHE ------------------

job_cache = None


def load_jobs():
    global job_cache

    if job_cache is None:
        conn = sqlite3.connect("resumeai.db")
        cursor = conn.cursor()

        cursor.execute("SELECT id, title, description FROM jobs")
        jobs = cursor.fetchall()

        conn.close()

        job_cache = []

        for job in jobs:
            job_id, title, description = job

            # 🔥 Combine title + description
            combined_text = f"{title} {description}"

            embedding = get_embedding(combined_text)

            job_cache.append({
                "job_id": job_id,
                "title": title,
                "description": description,
                "embedding": embedding
            })

    return job_cache


# ------------------ SKILL BONUS ------------------

def skill_overlap_bonus(resume_skills, job_description):
    job_desc = job_description.lower()

    overlap = sum(1 for skill in resume_skills if skill in job_desc)

    if len(resume_skills) == 0:
        return 0

    return (overlap / len(resume_skills)) * 0.2


# ------------------ MAIN FUNCTION ------------------

def match_resume_to_jobs(resume_text):

    # Step 1: Extract skills
    resume_skills = extract_skills(resume_text)

    # Step 2: Hybrid input (text + skills)
    resume_input = resume_text + " " + " ".join(resume_skills)

    # Step 3: Compute embedding once
    resume_embedding = get_embedding(resume_input)

    # Step 4: Load jobs (cached)
    jobs = load_jobs()

    results = []

    for job in jobs:

        sim = cosine_similarity(resume_embedding, job["embedding"])

        bonus = skill_overlap_bonus(resume_skills, job["description"])

        final_score = float(sim) + float(bonus)

        # 🔥 Normalize score [-1,1] → [0,1]
        final_score = (final_score + 1) / 2

        results.append({
            "job_id": job["job_id"],
            "title": job["title"],
            "description": job["description"],
            "match_score": round(final_score * 100, 2)
        })

    # Step 5: Sort
    results = sorted(results, key=lambda x: x["match_score"], reverse=True)

    return results[:5]