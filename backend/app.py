from flask import Flask, send_from_directory
from flask_cors import CORS
import os

# Import blueprints
from routes.auth_routes import auth_bp
from routes.resume_routes import resume_bp
from routes.job_routes import job_bp
from routes.skill_routes import skill_bp

app = Flask(__name__)

# Enable CORS for frontend
CORS(app)

# Ensure uploads folder exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(resume_bp)
app.register_blueprint(job_bp)
app.register_blueprint(skill_bp)


# ---------------------------
# Serve Uploaded Resume Files
# ---------------------------
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# Test route
@app.route("/")
def home():
    return {"message": "ResumeAI Backend Running"}


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)