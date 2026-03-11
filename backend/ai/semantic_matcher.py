import pandas as pd
import os

from ai.embedding_engine import get_embedding, cosine_similarity
from ai.skill_extractor import extract_skills

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/job_roles.csv")
jobs_df = pd.read_csv(DATA_PATH)

# Precompute role embeddings
job_embeddings = []

for desc in jobs_df["description"]:
    emb = get_embedding(desc)
    job_embeddings.append(emb)


def clean_resume_text(text):

    text = text.lower()

    stopwords = [
        "education",
        "project",
        "projects",
        "experience",
        "skills",
        "profile",
        "summary",
        "objective",
        "activities",
        "achievements"
    ]

    for word in stopwords:
        text = text.replace(word, "")

    return text


def skill_overlap_bonus(resume_skills, role_description):

    role_desc = role_description.lower()

    overlap = 0

    for skill in resume_skills:
        if skill in role_desc:
            overlap += 1

    # small bonus
    return overlap * 0.02


def recommend_roles(resume_text):

    resume_text = clean_resume_text(resume_text)

    resume_skills = extract_skills(resume_text)

    # if skills exist → embed skills instead of full resume
    if resume_skills:
        resume_input = " ".join(resume_skills)
    else:
        resume_input = resume_text

    resume_embedding = get_embedding(resume_input)

    scores = []

    for i, job_vec in enumerate(job_embeddings):

        sim = cosine_similarity(resume_embedding, job_vec)

        role_description = jobs_df.iloc[i]["description"]

        bonus = skill_overlap_bonus(resume_skills, role_description)

        # FIX: convert to python float
        final_score = float(sim) + float(bonus)

        scores.append({
            "role": jobs_df.iloc[i]["role"],
            "score": final_score
        })

    # sort roles
    scores = sorted(scores, key=lambda x: x["score"], reverse=True)

    # convert cosine similarity to percentage
    for item in scores:
        item["score"] = round(float(item["score"]) * 100, 2)

    # remove duplicate roles
    seen = set()
    unique_scores = []

    for item in scores:

        role = item["role"]

        if role not in seen:
            seen.add(role)
            unique_scores.append(item)

        if len(unique_scores) == 5:
            break

    return unique_scores