import { useState } from "react";
import { matchJobs } from "../services/jobService";

export default function JobMatches() {

  const [file, setFile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMatch = async () => {

    if (!file) {
      alert("Upload resume first");
      return;
    }

    setLoading(true);
    setError("");

    const data = await matchJobs(file);

    if (data.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setMatches(data.job_matches || []);
    setLoading(false);
  };

  return (
    <div className="main-content">

      <div className="upload-card">

        <h2>Match Resume With Job Openings</h2>

        <div className="drag-area">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button className="primary-btn" onClick={handleMatch}>
          {loading ? "Matching..." : "Find Job Matches"}
        </button>

        {error && <p style={{color:"red"}}>{error}</p>}

      </div>

      {matches.length > 0 && (
        <div className="results-grid">

          {matches.map((job, i) => (
            <div key={i} className="stat-card">

              <h3>{job.title}</h3>
              <p>{job.company}</p>

              <div className="big-number">
                {job.score}%
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}