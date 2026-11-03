import { useEffect, useState } from "react";

function StudentJobOpportunities({ user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);

  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/jobs/")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load jobs");
        }

        setJobs(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const closeOpportunity = () => {
    setSelectedJob(null);
    setMatchResult(null);
    setMatchError("");
    setApplyMessage("");
    setApplyError("");
  };

  const checkAiMatch = async () => {
    if (!selectedJob) return;

    try {
      setMatchLoading(true);
      setMatchError("");
      setMatchResult(null);

      const response = await fetch(
        `http://127.0.0.1:8000/student-match/${user.id}/${selectedJob.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to calculate AI match");
      }

      setMatchResult(data);
    } catch (err) {
      setMatchError(err.message);
    } finally {
      setMatchLoading(false);
    }
  };

  const applyForJob = async () => {
    if (!selectedJob) return;

    try {
      setApplyLoading(true);
      setApplyMessage("");
      setApplyError("");

      const response = await fetch(
        `http://127.0.0.1:8000/applications/${user.id}/${selectedJob.id}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to submit application");
      }

      setApplyMessage("Application submitted successfully.");
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="panel">
          <p>Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="section-intro">
        <div>
          <span className="eyebrow">JOB OPPORTUNITIES</span>
          <h2>Find your next opportunity</h2>
          <p>
            Explore available campus opportunities and check how well your
            profile matches each role.
          </p>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      {!error && jobs.length === 0 && (
        <div className="panel">
          <span className="eyebrow">JOB OPPORTUNITIES</span>
          <h3>No opportunities available</h3>
          <p>There are currently no active job opportunities.</p>
        </div>
      )}

      {!error && jobs.length > 0 && (
        <div className="job-grid">
          {jobs.map((job) => (
            <div className="job-card" key={job.id}>
              <div className="job-icon">💼</div>

              <span className="eyebrow">
                {job.company || "Campus Recruiter"}
              </span>

              <h3>{job.title}</h3>

              <p>
                {job.description ||
                  "Explore this opportunity and check whether your current skills match the role requirements."}
              </p>

              <div className="tags">
                {(job.required_skills || "")
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean)
                  .map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
              </div>

              <button
                className="outline-btn"
                onClick={() => {
                  setSelectedJob(job);
                  setMatchResult(null);
                  setMatchError("");
                  setApplyMessage("");
                  setApplyError("");
                }}
              >
                View Opportunity →
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="modal-overlay" onClick={closeOpportunity}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">JOB OPPORTUNITY</span>
                <h3>{selectedJob.title}</h3>
              </div>

              <button
                className="modal-close"
                onClick={closeOpportunity}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <span className="eyebrow">COMPANY</span>
                <h3>
                  {selectedJob.company || "Campus Recruiter"}
                </h3>
              </div>

              <div className="modal-section">
                <span className="eyebrow">ABOUT THE ROLE</span>
                <p>
                  {selectedJob.description ||
                    "No detailed job description has been provided for this opportunity."}
                </p>
              </div>

              <div className="modal-section">
                <span className="eyebrow">REQUIRED SKILLS</span>

                <div className="tags">
                  {(selectedJob.required_skills || "")
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                </div>
              </div>

              <div className="modal-section">
                <span className="eyebrow">YOUR PROFILE</span>

                <p>
                  Logged in as <strong>{user.name}</strong>
                </p>

                <p className="muted">
                  CampusAI compares your profile with this opportunity using
                  explainable AI-based matching.
                </p>
              </div>

              {matchLoading && (
                <div className="match-loading">
                  <span className="eyebrow">AI ANALYSIS</span>
                  <h3>Analyzing your profile...</h3>
                  <p>
                    CampusAI is comparing your skills and profile with the job
                    requirements.
                  </p>
                </div>
              )}

              {matchError && (
                <div className="login-error">
                  {matchError}
                </div>
              )}

              {matchResult && (
                <div className="ai-match-result">
                  <div className="match-result-header">
                    <div>
                      <span className="eyebrow">AI MATCH RESULT</span>
                      <h3>Your match analysis</h3>
                    </div>

                    <div className="match-score">
                      {matchResult.match_score}%
                    </div>
                  </div>

                  <div className="match-metrics">
                    <div className="match-metric">
                      <span>Skill Match</span>
                      <strong>
                        {matchResult.skill_match}%
                      </strong>
                    </div>

                    <div className="match-metric">
                      <span>Profile Similarity</span>
                      <strong>
                        {matchResult.tfidf_similarity}%
                      </strong>
                    </div>
                  </div>

                  <div className="modal-section">
                    <span className="eyebrow">MATCHED SKILLS</span>

                    {matchResult.matched_skills?.length > 0 ? (
                      <div className="tags">
                        {matchResult.matched_skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    ) : (
                      <p>No required skills matched yet.</p>
                    )}
                  </div>

                  <div className="modal-section">
                    <span className="eyebrow">SKILL GAP</span>

                    {matchResult.skill_gap?.length > 0 ? (
                      <div className="tags">
                        {matchResult.skill_gap.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    ) : (
                      <p>No major skill gaps identified.</p>
                    )}
                  </div>

                  <div className="explanation-box">
                    <span className="eyebrow">
                      WHY THIS SCORE?
                    </span>

                    <p>{matchResult.explanation}</p>
                  </div>
                </div>
              )}

              {applyMessage && (
                <div className="success-message application-success">
                  {applyMessage}
                </div>
              )}

              {applyError && (
                <div className="login-error application-error">
                  {applyError}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="outline-btn"
                onClick={closeOpportunity}
              >
                Close
              </button>

              <div className="modal-actions">
                {!matchResult && (
                  <button
                    className="primary-btn"
                    onClick={checkAiMatch}
                    disabled={matchLoading}
                  >
                    {matchLoading
                      ? "Analyzing..."
                      : "Check My AI Match →"}
                  </button>
                )}

                {!applyMessage && (
                  <button
                    className="primary-btn"
                    onClick={applyForJob}
                    disabled={applyLoading}
                  >
                    {applyLoading
                      ? "Submitting..."
                      : "Apply for this Job →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentJobOpportunities;