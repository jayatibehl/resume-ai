export default function SkillGap({ roles }) {

  if (!roles || roles.length === 0) {
    return (
      <div className="upload-card">
        <h2>Skill Gap Analysis</h2>
        <p>Upload and analyze your resume first.</p>
      </div>
    );
  }

  const topRole = roles[0];

  return (
    <div className="results-grid">

      <div className="stat-card">
        <h3>Target Role</h3>
        <p>{topRole.role}</p>
      </div>

      <div className="stat-card">
        <h3>Recommended Skills to Learn</h3>

        {topRole.missing_skills && topRole.missing_skills.length > 0 ? (
          topRole.missing_skills.map((skill, i) => (
            <div key={i} className="tag">{skill}</div>
          ))
        ) : (
          <p>No skill gaps detected.</p>
        )}

      </div>

    </div>
  );
}