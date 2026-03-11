import { useState } from "react";

export default function CandidateDashboard() {

  const [file, setFile] = useState(null);
  const [step, setStep] = useState("upload");

  const [roles, setRoles] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState("");

  const [resumeText, setResumeText] = useState("");

  const [skillGap, setSkillGap] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [activeTab, setActiveTab] = useState("analysis");


  const handleUpload = async () => {

    if (!file) return;

    setStep("analyzing");

    const formData = new FormData();
    formData.append("file", file);

    try {

      const res = await fetch("http://127.0.0.1:5000/api/resume/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setStep("upload");
        return;
      }

      setRoles(data.recommended_roles || []);
      setJobs(data.matching_jobs || []);

      if (data.analysis) {
        setSkills(data.analysis.skills_found || []);
        setExperience(data.analysis.experience_level || "Not specified");
      }

      setResumeText(data.resume_text || "");

      setStep("results");

    } catch {
      alert("Backend not connected");
      setStep("upload");
    }
  };


  const handleJobClick = async (job) => {

    setSelectedJob(job);

    try {

      const res = await fetch("http://127.0.0.1:5000/api/skills/gap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: job.description
        })
      });

      const data = await res.json();

      setSkillGap(data);

      setActiveTab("skillgap");

    } catch {
      alert("Skill gap service unavailable");
    }
  };


  return (
    <main className="main-content">

      {/* UPLOAD SCREEN */}
      {step === "upload" && (
        <div className="upload-card">

          <h2>Analyze Your Career Path</h2>

          <label className="drag-area">
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <p>{file ? file.name : "Upload Resume PDF"}</p>
          </label>

          <button className="primary-btn" onClick={handleUpload}>
            Start AI Analysis
          </button>

        </div>
      )}


      {/* ANALYZING */}
      {step === "analyzing" && (
        <div className="upload-card">
          <h3>Analyzing Resume...</h3>
        </div>
      )}


      {/* RESULTS */}
      {step === "results" && (

        <div className="results-grid">

          {/* Resume Viewer */}
          <div
            className="stat-card"
            style={{
              gridColumn: "1 / -1",
              marginBottom: "25px"
            }}
          >

            <h3>Uploaded Resume</h3>

            <a
              href={`http://127.0.0.1:5000/uploads/${file?.name}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "10px 16px",
                background: "#5b6cff",
                borderRadius: "8px",
                textDecoration: "none",
                color: "white",
                fontWeight: "500"
              }}
            >
              Open Resume PDF
            </a>

          </div>


          {/* ANALYSIS TAB */}
          {activeTab === "analysis" && (

            <>

              {/* Detected Skills */}
              <div className="stat-card">

                <h3>Detected Skills</h3>

                {skills.length === 0 && <p>No skills detected</p>}

                <div className="tag-container">

                  {skills.map((s, i) => (
                    <span key={i} className="tag">
                      {s}
                    </span>
                  ))}

                </div>

              </div>


              {/* Experience */}
              <div className="stat-card">

                <h3>Experience Level</h3>

                <p>{experience}</p>

              </div>


              {/* AI Suggested Roles */}
              <div className="stat-card">

                <h3>AI Suggested Roles</h3>

                {roles.length === 0 && <p>No roles detected</p>}

                {roles.map((r, i) => (

                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >

                    <span>{r.role}</span>

                    <span className="big-number" style={{ fontSize: "22px" }}>
                      {r.score.toFixed(0)}%
                    </span>

                  </div>

                ))}

              </div>

            </>

          )}


          {/* JOB MATCHES TAB */}
          {activeTab === "jobs" && (

            <div className="stat-card">

              <h3>Matching Job Descriptions</h3>

              {jobs.length === 0 && <p>No job matches found</p>}

              {jobs.map((j, i) => (

                <div
                  key={i}
                  onClick={() => handleJobClick(j)}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer"
                  }}
                >

                  <h4>{j.title}</h4>

                  <p>Match Score: {(j.match_score * 100).toFixed(0)}%</p>

                </div>

              ))}

            </div>

          )}


          {/* SKILL GAP TAB */}
          {activeTab === "skillgap" && skillGap && (

            <div className="stat-card">

              <h3>Skill Gap Analysis</h3>

              <h4>Your Skills</h4>

              <div className="tag-container">

                {skillGap.resume_skills.map((s,i)=>(
                  <span key={i} className="tag">{s}</span>
                ))}

              </div>


              <h4 style={{marginTop:"20px"}}>Required Skills</h4>

              <div className="tag-container">

                {skillGap.required_skills.map((s,i)=>(
                  <span key={i} className="tag">{s}</span>
                ))}

              </div>


              <h4 style={{marginTop:"20px"}}>Missing Skills</h4>

              <div className="tag-container">

                {skillGap.missing_skills.map((s,i)=>(
                  <span key={i} className="tag">{s}</span>
                ))}

              </div>

            </div>

          )}

        </div>

      )}

    </main>
  );
}