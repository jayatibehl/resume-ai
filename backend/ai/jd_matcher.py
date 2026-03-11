import sqlite3
from ai.embedding_engine import get_embedding, cosine_similarity


def match_resume_to_jobs(resume_text):

    conn = sqlite3.connect("resumeai.db")
    cursor = conn.cursor()

    cursor.execute("SELECT id, title, description FROM jobs")

    jobs = cursor.fetchall()

    conn.close()

    # compute resume embedding ONCE
    resume_embedding = get_embedding(resume_text)

    results = []

    for job in jobs:

        job_id = job[0]
        title = job[1]
        description = job[2]

        job_embedding = get_embedding(description)

        score = cosine_similarity(resume_embedding, job_embedding)

        results.append({
            "job_id": job_id,
            "title": title,
            "description": description,
            "match_score": float(score)
        })

    results = sorted(results, key=lambda x: x["match_score"], reverse=True)

    return results[:5]