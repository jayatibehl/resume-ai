from flask import Blueprint, request, jsonify
import sqlite3
import os

job_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")

# DATABASE PATH
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "resumeai.db")


def get_connection():
    return sqlite3.connect(DB_PATH)


# POST JOB
@job_bp.route("/post", methods=["POST"])
def post_job():

    data = request.json

    title = data.get("title")
    description = data.get("description")
    recruiter_email = data.get("recruiter_email")

    if not title or not description:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            recruiter_email TEXT
        )
    """)

    cursor.execute(
        "INSERT INTO jobs (title, description, recruiter_email) VALUES (?, ?, ?)",
        (title, description, recruiter_email)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Job posted successfully"})


# GET ALL JOBS
@job_bp.route("/all", methods=["GET"])
def get_jobs():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, title, description FROM jobs")
    jobs = cursor.fetchall()

    conn.close()

    job_list = []

    for job in jobs:
        job_list.append({
            "id": job[0],
            "title": job[1],
            "description": job[2]
        })

    return jsonify(job_list)