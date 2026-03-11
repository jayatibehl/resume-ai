import { useState, useEffect } from "react";
import { Briefcase, Users, Search, PlusCircle } from "lucide-react";
import "../App.css";

export default function RecruiterDashboard() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);

  // LOAD JOBS FROM DATABASE
  useEffect(() => {

    const loadJobs = async () => {

      try {

        const res = await fetch("http://127.0.0.1:5000/api/jobs/all");

        const data = await res.json();

        setJobs(data);

      } catch {
        console.log("Could not load jobs");
      }

    };

    loadJobs();

  }, []);


  // POST JOB
  const postJob = async () => {

    if (!title || !description) {
      alert("Please fill all fields");
      return;
    }

    try {

      const res = await fetch("http://127.0.0.1:5000/api/jobs/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title,
          description: description,
          recruiter_email: "recruiter@test.com"
        })
      });

      const data = await res.json();

      if (data.message) {

        // Reload jobs from DB
        const jobsRes = await fetch("http://127.0.0.1:5000/api/jobs/all");
        const jobsData = await jobsRes.json();

        setJobs(jobsData);

        setTitle("");
        setDescription("");

      } else {
        alert("Error posting job");
      }

    } catch {
      alert("Backend not connected");
    }

  };


  // MATCH CANDIDATES (future)
  const getMatches = async (jobId) => {

    try {

      const res = await fetch(`http://127.0.0.1:5000/api/jobs/match/${jobId}`);

      const data = await res.json();

      setMatches(data);

    } catch {
      alert("Match service not available yet");
    }

  };


  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">Resume<span>AI</span></div>

        <nav>

          <div className="nav-item active">
            <Briefcase size={20}/> Job Posts
          </div>

          <div className="nav-item">
            <Users size={20}/> Candidates
          </div>

        </nav>

      </aside>


      <main className="main-content">

        {/* TOP STATS */}
        <div className="results-grid">

          <section className="stat-card">
            <h3>Total Jobs</h3>
            <div className="big-number">{jobs.length}</div>
          </section>

          <section className="stat-card">
            <h3>Matched Candidates</h3>
            <div className="big-number">{matches.length}</div>
          </section>

        </div>


        {/* POST JOB */}
        <div className="upload-card" style={{ marginTop: 30 }}>

          <h2><PlusCircle size={22}/> Post a Job</h2>

          <p>Enter job details and let AI find the best candidates</p>

          <input
            className="input-box"
            placeholder="Job Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <textarea
            className="input-box"
            placeholder="Job Description (skills, experience, responsibilities)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="4"
          />

          <button className="primary-btn" onClick={postJob}>
            Post Job
          </button>

        </div>


        {/* JOB LIST */}
        <h2 style={{ marginTop: 40 }}>Your Job Posts</h2>

        <div className="results-grid">

          {jobs.map(job => (

            <section key={job.id} className="stat-card">

              <h3>{job.title}</h3>

              <p>{job.description}</p>

              <button
                className="secondary-btn"
                onClick={() => getMatches(job.id)}
              >
                <Search size={16}/> View Matches
              </button>

            </section>

          ))}

        </div>


        {/* MATCHED CANDIDATES */}
        {matches.length > 0 && (

          <>
            <h2 style={{ marginTop: 40 }}>AI-Matched Candidates</h2>

            <div className="results-grid">

              {matches.map((m, i) => (

                <section key={i} className="stat-card">

                  <h3>Candidate #{i + 1}</h3>

                  <p><b>Match Score:</b> {(m.match_score * 100).toFixed(1)}%</p>

                  <button className="secondary-btn">
                    Shortlist
                  </button>

                </section>

              ))}

            </div>
          </>
        )}

      </main>

    </div>
  );
}