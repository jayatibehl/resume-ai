from flask import Blueprint, request, jsonify
import os

from ai.pdf_parser import extract_resume_text
from ai.resume_validator import is_resume
from ai.semantic_matcher import recommend_roles
from ai.jd_matcher import match_resume_to_jobs

# AI skill + experience extraction
from ai.skill_extractor import extract_skills, detect_experience

resume_bp = Blueprint("resume", __name__, url_prefix="/api/resume")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@resume_bp.route("/upload", methods=["POST"])
def upload_resume():

    # Check if file is present
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    # Check filename
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Only allow PDF
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF resumes allowed"}), 400

    # Save file
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # STEP 1 — Extract text from resume
    text = extract_resume_text(filepath)

    if not text:
        return jsonify({"error": "Could not read PDF"}), 400

    # STEP 2 — Validate resume
    if not is_resume(text):
        return jsonify({"error": "Uploaded document is not a valid resume"}), 400

    # STEP 3 — Extract skills using AI
    skills = extract_skills(text)

    # STEP 4 — Detect experience level
    experience = detect_experience(text)

    # STEP 5 — Recommend roles using semantic matching
    recommended_roles = recommend_roles(text)

    # STEP 6 — Match with recruiter job descriptions
    job_matches = match_resume_to_jobs(text)

    # Response
    return jsonify({
        "message": "Resume analyzed successfully",

        "resume_text": text,

        "analysis": {
            "skills_found": skills,
            "experience_level": experience
        },

        "recommended_roles": recommended_roles,
        "matching_jobs": job_matches
    })