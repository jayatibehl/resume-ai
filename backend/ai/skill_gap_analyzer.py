from ai.skill_extractor import extract_skills


def analyze_skill_gap(resume_text, job_description):

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    missing_skills = list(set(job_skills) - set(resume_skills))

    return {
        "resume_skills": resume_skills,
        "required_skills": job_skills,
        "missing_skills": missing_skills
    }