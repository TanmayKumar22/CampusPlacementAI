import { useEffect, useState } from "react";

function StudentApplications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = () => {
    setLoading(true);

    fetch(`https://campus-placement-ai-api.onrender.com/applications/student/${user.id}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load applications");
        }

        setApplications(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, [user.id]);

  const getStatusClass = (status) => {
    if (status === "Approved") return "status-approved";
    if (status === "Rejected") return "status-rejected";
    return "status-pending";
  };

  if (loading) {
    return (
      <div className="content">
        <div className="panel">
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="section-intro">
        <div>
          <span className="eyebrow">MY APPLICATIONS</span>
          <h2>Track your applications</h2>
          <p>
            View the status of the opportunities you have applied for.
          </p>
        </div>

        <button className="outline-btn" onClick={loadApplications}>
          Refresh
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}

      {!error && applications.length === 0 && (
        <div className="panel empty-state">
          <span className="eyebrow">APPLICATIONS</span>
          <h3>No applications yet</h3>
          <p>
            Explore Job Opportunities and apply for roles that match your
            profile.
          </p>
        </div>
      )}

      {!error && applications.length > 0 && (
        <div className="application-list">
          {applications.map((application) => (
            <div className="panel application-card" key={application.id}>
              <div className="application-main">
                <div>
                  <span className="eyebrow">
                    {application.company || "Campus Recruiter"}
                  </span>

                  <h3>{application.job_title}</h3>

                  <p>
                    Application ID: #{application.id}
                  </p>
                </div>

                <span
                  className={`application-status ${getStatusClass(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </div>

              <div className="application-details">
                <div>
                  <span className="eyebrow">STATUS</span>
                  <strong>{application.status}</strong>
                </div>

                <div>
                  <span className="eyebrow">REVIEWER</span>
                  <strong>
                    {application.reviewer || "Not reviewed yet"}
                  </strong>
                </div>

                <div>
                  <span className="eyebrow">COMMENTS</span>
                  <strong>
                    {application.comments || "No comments yet"}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentApplications;