from flask import Blueprint, request, jsonify
import os
import sqlite3

from ai.pdf_parser import extract_resume_text
from ai.resume_validator import is_resume
from ai.semantic_matcher import recommend_roles
from ai.jd_matcher import match_resume_to_jobs
from routes.job_routes import init_candidates_table

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

    # Ensure candidates table exists
    init_candidates_table()

    # STEP 1 — Extract text from resume
    text = extract_resume_text(filepath)

    # DEBUG
    print("\n===== RESUME TEXT DEBUG =====")
    print(text[:300] if text else "EMPTY TEXT")
    print("=============================\n")

    # Strong validation
    if not text or len(text.strip()) < 20:
        return jsonify({"error": "Resume text extraction failed"}), 400

    # STEP 2 — Validate resume
    if not is_resume(text):
        return jsonify({"error": "Uploaded document is not a valid resume"}), 400

    # STEP 3 — Extract skills
    skills = extract_skills(text)

    # STEP 4 — Experience
    experience = detect_experience(text)

    # STEP 5 — Roles
    recommended_roles = recommend_roles(text)

    # STEP 6 — Job matching
    job_matches = match_resume_to_jobs(text)

    # =========================================================
    # 🔥 SAVE / UPDATE CANDIDATE (FIXED — NO DUPLICATES)
    # =========================================================

    conn = sqlite3.connect("resumeai.db")
    cursor = conn.cursor()

    # Get user from frontend
    name = request.form.get("name")
    email = request.form.get("email")

    print("DEBUG USER:", name, email)  # 🔥 debug

    if not email:
        conn.close()
        return jsonify({"error": "User not logged in properly"}), 400

    # 🔥 CHECK IF USER EXISTS
    cursor.execute("SELECT id FROM candidates WHERE email = ?", (email,))
    existing = cursor.fetchone()

    if existing:
        # ✅ UPDATE (no duplicate cards)
        cursor.execute("""
            UPDATE candidates
            SET name = ?, resume_text = ?, resume_file = ?
            WHERE email = ?
        """, (name, text, file.filename, email))
    else:
        # ✅ INSERT (first time)
        cursor.execute("""
            INSERT INTO candidates (name, email, resume_text, resume_file)
            VALUES (?, ?, ?, ?)
        """, (name, email, text, file.filename))

    conn.commit()
    conn.close()

    # =========================================================

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