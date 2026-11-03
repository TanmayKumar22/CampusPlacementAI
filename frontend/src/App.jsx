import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import StudentProfile from "./StudentProfile";
import StudentJobOpportunities from "./StudentJobOpportunities";
import StudentApplications from "./StudentApplications";

const students = [
  {
    id: 1,
    name: "Aarav Sharma",
    degree: "B.Tech CSE",
    skills: ["Python", "React", "SQL", "Machine Learning"],
    score: 92,
  },
  {
    id: 2,
    name: "Priya Verma",
    degree: "B.Tech CSE",
    skills: ["Java", "React", "MongoDB", "Node.js"],
    score: 87,
  },
  {
    id: 3,
    name: "Rohan Singh",
    degree: "B.Tech IT",
    skills: ["Python", "Django", "SQL", "Data Analysis"],
    score: 81,
  },
];

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("campusai_user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("campusai_user");
      localStorage.removeItem("campusai_token");
      return null;
    }
  });

  const [activePage, setActivePage] = useState("Dashboard");

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setActivePage("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("campusai_token");
    localStorage.removeItem("campusai_user");

    setUser(null);
    setActivePage("Dashboard");
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const officerNavigation = [
    { name: "Dashboard", icon: "▦" },
    { name: "Students", icon: "♙" },
    { name: "Jobs", icon: "▣" },
    { name: "AI Shortlisting", icon: "✦" },
    { name: "Skill Gaps", icon: "◎" },
    { name: "Fairness Audit", icon: "◈" },
    { name: "Approvals", icon: "✓" },
  ];

  const studentNavigation = [
    { name: "Dashboard", icon: "▦" },
    { name: "My Profile", icon: "♙" },
    { name: "Job Opportunities", icon: "▣" },
    { name: "My Applications", icon: "✓" },
    { name: "Skill Gaps", icon: "◎" },
  ];

  const navigation =
    user.role === "officer"
      ? officerNavigation
      : studentNavigation;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">AI</div>

          <div>
            <h2>CampusAI</h2>
            <span>Placement Intelligence</span>
          </div>
        </div>

        <nav>
          {navigation.map((item) => (
            <button
              key={item.name}
              className={
                activePage === item.name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>
            AI System Online
          </div>

          <p>
            {user.role === "officer"
              ? "Human approval required"
              : "AI-assisted placement"}
          </p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {user.role === "officer"
                ? "PLACEMENT OFFICE"
                : "STUDENT WORKSPACE"}
            </p>

            <h1>{activePage}</h1>
          </div>

          <div className="profile">
            <div className="notification">●</div>

            <div className="avatar">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div>
              <strong>{user.name}</strong>

              <span>
                {user.role === "officer"
                  ? "Placement Officer"
                  : "Student"}
              </span>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* ================================
            OFFICER WORKSPACE
        ================================= */}

        {user.role === "officer" && (
          <>
            {activePage === "Dashboard" && (
              <Dashboard setActivePage={setActivePage} />
            )}

            {activePage === "Students" && <Students />}

            {activePage === "Jobs" && <Jobs />}

            {activePage === "AI Shortlisting" && (
              <Shortlisting />
            )}

            {activePage === "Skill Gaps" && <SkillGaps />}

            {activePage === "Fairness Audit" && <Fairness />}

            {activePage === "Approvals" && <Approvals />}
          </>
        )}

        {/* ================================
            STUDENT WORKSPACE
        ================================= */}

        {user.role === "student" && (
          <>
            {activePage === "Dashboard" && (
              <StudentDashboard
                user={user}
                setActivePage={setActivePage}
              />
            )}

            {activePage === "My Profile" && (
              <StudentProfile user={user} />
            )}

            {activePage === "Job Opportunities" && (
              <StudentJobOpportunities user={user} />
            )}

            {activePage === "My Applications" && (
              <StudentApplications user={user} />
            )}

            {activePage === "Skill Gaps" && (
  <StudentSkillGaps user={user} />
)}
          </>
        )}
      </main>
    </div>
  );
}

function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState({
    students: 0,
    jobs: 0,
    applications: 0,
    pending: 0,
    approved: 0,
  });

  const [recentApplications, setRecentApplications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get students
      const studentsResponse = await fetch(
        "https://campus-placement-ai-api.onrender.com/students/"
      );

      // Get jobs
      const jobsResponse = await fetch(
        "https://campus-placement-ai-api.onrender.com/jobs/"
      );

      if (!studentsResponse.ok) {
        throw new Error("Failed to load students.");
      }

      if (!jobsResponse.ok) {
        throw new Error("Failed to load jobs.");
      }

      const studentsData =
        await studentsResponse.json();

      const jobsData =
        await jobsResponse.json();

      // Get applications for every job
      let allApplications = [];

      for (const job of jobsData) {
        try {
          const response = await fetch(
            `https://campus-placement-ai-api.onrender.com/applications/job/${job.id}`
          );

          if (response.ok) {
            const applications =
              await response.json();

            const applicationsWithJob =
              applications.map((application) => ({
                ...application,
                job_title: job.title,
                company: job.company,
              }));

            allApplications = [
              ...allApplications,
              ...applicationsWithJob,
            ];
          }
        } catch (err) {
          console.log(
            `Could not load applications for job ${job.id}`
          );
        }
      }

      const pendingApplications =
        allApplications.filter(
          (application) =>
            application.status === "Pending"
        ).length;

      const approvedApplications =
        allApplications.filter(
          (application) =>
            application.status === "Approved"
        ).length;

      setStats({
        students: studentsData.length,
        jobs: jobsData.length,
        applications: allApplications.length,
        pending: pendingApplications,
        approved: approvedApplications,
      });

      // Show latest 5 applications
      setRecentApplications(
        allApplications.slice(-5).reverse()
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="content">

      {/* HERO */}
      <section className="hero">
        <div>
          <span className="hero-label">
            AI-POWERED DECISION SUPPORT
          </span>

          <h2>
            Find the right candidates,
            <br />
            with explainable AI.
          </h2>

          <p>
            Rank candidates against job requirements
            while keeping explanations, skill gaps and
            fairness visible to the placement team.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              setActivePage("AI Shortlisting")
            }
          >
            Run AI Shortlisting →
          </button>
        </div>

        <div className="hero-visual">
          <div className="score-circle">
            <strong>
              {stats.applications > 0
                ? stats.approved
                : "—"}
            </strong>

            <span>
              APPROVED
            </span>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="panel">
          <h3>
            Dashboard data unavailable
          </h3>

          <p>{error}</p>
        </div>
      )}

      {/* STATS */}
      <section className="stats-grid">

        <Stat
          title="Registered Students"
          value={
            loading
              ? "..."
              : stats.students
          }
          change="Live"
        />

        <Stat
          title="Active Jobs"
          value={
            loading
              ? "..."
              : stats.jobs
          }
          change="Live"
        />

        <Stat
          title="Applications"
          value={
            loading
              ? "..."
              : stats.applications
          }
          change="Live"
        />

        <Stat
          title="Pending Approval"
          value={
            loading
              ? "..."
              : stats.pending
          }
          change="Review"
        />

      </section>

      {/* DASHBOARD CONTENT */}
      <section className="dashboard-grid">

        {/* RECENT APPLICATIONS */}
        <div className="panel">

          <div className="panel-header">
            <div>
              <span className="eyebrow">
                RECENT ACTIVITY
              </span>

              <h3>
                Latest Applications
              </h3>
            </div>

            <button
              onClick={() =>
                setActivePage("Approvals")
              }
            >
              View all
            </button>
          </div>

          {loading ? (
            <p className="muted">
              Loading recent applications...
            </p>
          ) : recentApplications.length === 0 ? (
            <div className="empty-state">
              <h3>
                No applications yet
              </h3>

              <p>
                Student applications will appear here.
              </p>
            </div>
          ) : (
            <div className="candidate-list">

              {recentApplications.map(
                (application) => (
                  <div
                    className="candidate-row"
                    key={application.id}
                  >

                    <div className="candidate-avatar">
                      {application.student_name
                        ? application.student_name.charAt(
                            0
                          )
                        : "S"}
                    </div>

                    <div className="candidate-info">
                      <strong>
                        {
                          application.student_name
                        }
                      </strong>

                      <span>
                        {application.job_title}
                      </span>
                    </div>

                    <div className="match-score">
                      <strong>
                        {application.status}
                      </strong>

                      <span>
                        {application.company}
                      </span>
                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* SYSTEM INSIGHTS */}
        <div className="panel">

          <div className="panel-header">
            <div>
              <span className="eyebrow">
                SYSTEM INSIGHTS
              </span>

              <h3>
                AI Summary
              </h3>
            </div>
          </div>

          {/* INSIGHT 1 */}
          <div className="insight">
            <div className="insight-icon">
              ✦
            </div>

            <div>
              <strong>
                AI-assisted matching
              </strong>

              <p>
                Candidate ranking uses job-relevant
                skills and TF-IDF profile similarity.
              </p>
            </div>
          </div>

          {/* INSIGHT 2 */}
          <div className="insight">
            <div className="insight-icon">
              !
            </div>

            <div>
              <strong>
                Skill gaps available
              </strong>

              <p>
                Students can view missing skills and
                improve their match for selected jobs.
              </p>
            </div>
          </div>

          {/* INSIGHT 3 */}
          <div className="insight">
            <div className="insight-icon">
              ✓
            </div>

            <div>
              <strong>
                Human review active
              </strong>

              <p>
                {stats.approved} application
                {stats.approved !== 1
                  ? "s have"
                  : " has"}{" "}
                been approved. Final decisions remain
                with the placement officer.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* REFRESH */}
      <div
        style={{
          marginTop: "18px",
          textAlign: "right",
        }}
      >
        <button
          className="secondary-btn"
          onClick={fetchDashboardData}
        >
          Refresh Dashboard
        </button>
      </div>

    </div>
  );
}

function Stat({ title, value, change }) {
  return (
    <div className="stat-card">
      <span>{title}</span>

      <strong>{value}</strong>

      <small>{change}</small>
    </div>
  );
}

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://campus-placement-ai-api.onrender.com/students/"
      );

      if (!response.ok) {
        throw new Error("Failed to load students");
      }

      const data = await response.json();

      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="content">
      <div className="section-intro">
        <div>
          <span className="eyebrow">
            STUDENT PROFILES
          </span>

          <h2>Student Database</h2>

          <p>
            Manage student profiles and extracted technical skills.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={fetchStudents}
        >
          Refresh Students
        </button>
      </div>

      {loading && (
        <div className="panel">
          <h3>Loading student database...</h3>

          <p className="muted">
            Fetching student profiles from the backend.
          </p>
        </div>
      )}

      {error && (
        <div className="panel">
          <h3>Unable to load students</h3>

          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Degree</th>
                <th>Skills</th>
                <th>Profile Status</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.name}</strong>

                    <br />

                    <span className="muted">
                      {student.email}
                    </span>
                  </td>

                  <td>{student.degree}</td>

                  <td>
                    <div className="tags">
                      {(student.skills || "")
                        .split(",")
                        .filter(Boolean)
                        .map((skill) => (
                          <span key={skill}>
                            {skill.trim()}
                          </span>
                        ))}
                    </div>
                  </td>

                  <td>
                    <span className="score-badge">
                      Profile Ready
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && students.length === 0 && (
        <div className="panel">
          <h3>No students found</h3>

          <p className="muted">
            Add student profiles through the backend API.
          </p>
        </div>
      )}
    </div>
  );
}

function InfoModal({ title, children, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <h3>{title}</h3>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        <div className="modal-footer">
          <button
            className="primary-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    required_skills: "",
  });

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://campus-placement-ai-api.onrender.com/jobs/");

      if (!response.ok) {
        throw new Error("Failed to load jobs.");
      }

      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createJob = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.title.trim() ||
      !form.company.trim() ||
      !form.description.trim() ||
      !form.required_skills.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    try {
      const response = await fetch("https://campus-placement-ai-api.onrender.com/jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create job.");
      }

      setMessage("Job created successfully.");

      setForm({
        title: "",
        company: "",
        description: "",
        required_skills: "",
      });

      setShowForm(false);

      loadJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Jobs</h1>
          <p>Create and manage placement opportunities.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
            setError("");
          }}
        >
          {showForm ? "Close" : "+ Add New Job"}
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="panel job-form-panel">
          <h2>Create New Job</h2>

          <form onSubmit={createJob}>
            <div className="form-grid">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. AI/ML Engineer"
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. TechNova"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Job Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter the job description..."
                rows="5"
              />
            </div>

            <div className="form-group">
              <label>Required Skills</label>
              <input
                type="text"
                name="required_skills"
                value={form.required_skills}
                onChange={handleChange}
                placeholder="Python, Machine Learning, SQL, Git, Docker"
              />
              <small>
                Separate skills using commas.
              </small>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Create Job
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Available Jobs</h2>
            <p>{jobs.length} placement opportunities</p>
          </div>

          <button className="secondary-btn" onClick={loadJobs}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <h3>No jobs available</h3>
            <p>Create your first placement opportunity.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div className="job-card" key={job.id}>
                <div className="job-card-top">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>

                  <span className="job-id">
                    Job #{job.id}
                  </span>
                </div>

                <p className="job-description">
                  {job.description}
                </p>

                <div className="job-skills">
                  <strong>Required Skills</strong>

                  <div className="skill-list">
                    {job.required_skills
                      .split(",")
                      .map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Shortlisting() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [rankings, setRankings] = useState([]);
  const [job, setJob] = useState(null);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(false);

  const [error, setError] = useState("");
  const [approvalStatus, setApprovalStatus] = useState({});
  const [selectedCandidate, setSelectedCandidate] =
    useState(null);

  // Load all jobs
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");

      const response = await fetch(
        "https://campus-placement-ai-api.onrender.com/jobs/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs.");
      }

      const data = await response.json();

      setJobs(data);

      if (data.length > 0) {
        setSelectedJobId(String(data[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load AI ranking for selected job
  const fetchRankings = async () => {
    if (!selectedJobId) {
      setError("Please select a job first.");
      return;
    }

    try {
      setLoadingRanking(true);
      setError("");

      const response = await fetch(
        `https://campus-placement-ai-api.onrender.com/shortlisting/job/${selectedJobId}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch candidate rankings."
        );
      }

      const data = await response.json();

      setJob(data);
      setRankings(data.rankings);

      // Reset approval display when changing/rerunning ranking
      setApprovalStatus({});
    } catch (err) {
      setError(err.message);
      setRankings([]);
      setJob(null);
    } finally {
      setLoadingRanking(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Automatically run ranking when job is selected
  useEffect(() => {
    if (selectedJobId) {
      fetchRankings();
    }
  }, [selectedJobId]);

  const updateApproval = async (
    studentId,
    status
  ) => {
    try {
      const response = await fetch(
        "https://campus-placement-ai-api.onrender.com/approvals/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: studentId,
            job_id: Number(selectedJobId),
            status: status,
            reviewer: "Placement Officer",
            comments:
              status === "Approved"
                ? "Candidate approved after AI-assisted review."
                : "Candidate rejected after AI-assisted review.",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update approval."
        );
      }

      const data = await response.json();

      setApprovalStatus((previous) => ({
        ...previous,
        [studentId]: data.status,
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="content">

      {/* HEADER */}
      <div className="section-intro">
        <div>
          <span className="eyebrow">
            AI MATCHING ENGINE
          </span>

          <h2>AI Candidate Ranking</h2>

          <p>
            Select a placement opportunity to rank
            applicants using AI-assisted matching.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={fetchRankings}
          disabled={!selectedJobId || loadingRanking}
        >
          {loadingRanking
            ? "Running..."
            : "Run AI Ranking"}
        </button>
      </div>

      {/* JOB SELECTOR */}
      <div
        className="panel"
        style={{ marginBottom: "18px" }}
      >
        <span className="eyebrow">
          SELECT JOB
        </span>

        <h3 style={{ marginTop: "8px" }}>
          Placement Opportunity
        </h3>

        {loadingJobs ? (
          <p className="muted">
            Loading jobs...
          </p>
        ) : jobs.length === 0 ? (
          <p className="muted">
            No jobs have been created yet. Create a job
            from the Jobs page first.
          </p>
        ) : (
          <select
            value={selectedJobId}
            onChange={(e) =>
              setSelectedJobId(e.target.value)
            }
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #d7dce3",
              borderRadius: "9px",
              background: "#fff",
              fontSize: "13px",
              color: "#182235",
              outline: "none",
            }}
          >
            {jobs.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.title} — {item.company}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="panel">
          <h3>Unable to load rankings</h3>
          <p>{error}</p>
        </div>
      )}

      {/* LOADING */}
      {loadingRanking && (
        <div className="panel">
          <h3>Running AI matching...</h3>

          <p className="muted">
            Comparing student skills and resume content
            with job requirements.
          </p>
        </div>
      )}

      {/* JOB INFO */}
      {!loadingRanking &&
        !error &&
        job && (
          <div
            className="panel"
            style={{ marginBottom: "18px" }}
          >
            <span className="eyebrow">
              CURRENT JOB
            </span>

            <h3 style={{ marginTop: "8px" }}>
              {job.job_title}
            </h3>

            <p className="muted">
              {job.company} ·{" "}
              {job.total_candidates} candidates
            </p>
          </div>
        )}

      {/* RANKINGS */}
      {!loadingRanking &&
        !error &&
        job && (
          <>
            {rankings.length === 0 ? (
              <div className="panel">
                <h3>No applicants yet</h3>

                <p className="muted">
                  Students who apply for this job will
                  appear here for AI-assisted ranking.
                </p>
              </div>
            ) : (
              <div className="ranking-panel">
                {rankings.map((student) => (
                  <div
                    className="ranking-row"
                    key={student.student_id}
                  >
                    <div className="rank">
                      {student.rank}
                    </div>

                    <div className="candidate-avatar">
                      {student.student_name.charAt(0)}
                    </div>

                    <div className="ranking-info">
                      <strong>
                        {student.student_name}
                      </strong>

                      <span>
                        {student.degree}
                      </span>
                    </div>

                    <div className="progress">
                      <div
                        style={{
                          width: `${student.match_score}%`,
                        }}
                      ></div>
                    </div>

                    <strong className="large-score">
                      {student.match_score}%
                    </strong>

                    <button
                      className="explain-btn"
                      onClick={() =>
                        setSelectedCandidate(student)
                      }
                    >
                      Why?
                    </button>

                    <div className="approval-actions">
                      {approvalStatus[
                        student.student_id
                      ] ? (
                        <span className="approval-status">
                          {
                            approvalStatus[
                              student.student_id
                            ]
                          }
                        </span>
                      ) : (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() =>
                              updateApproval(
                                student.student_id,
                                "Approved"
                              )
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() =>
                              updateApproval(
                                student.student_id,
                                "Rejected"
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TOP CANDIDATE EXPLANATION */}
            {rankings.length > 0 && (
              <div className="explanation-box">
                <span className="eyebrow">
                  EXPLAINABLE AI MATCHING
                </span>

                <h3>
                  Why was{" "}
                  {rankings[0].student_name} ranked #1?
                </h3>

                <div className="reason-grid">
                  <div>
                    <strong>
                      {rankings[0].match_score}%
                    </strong>

                    <span>
                      Final AI Score
                    </span>
                  </div>

                  <div>
                    <strong>
                      {rankings[0].skill_match_score}%
                    </strong>

                    <span>
                      Skill Match
                    </span>
                  </div>

                  <div>
                    <strong>
                      {rankings[0].tfidf_similarity}%
                    </strong>

                    <span>
                      TF-IDF Similarity
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        rankings[0]
                          .matched_skills.length
                      }
                    </strong>

                    <span>
                      Skills Matched
                    </span>
                  </div>
                </div>

                <div className="tags">
                  {rankings[0].matched_skills.map(
                    (skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}

      {/* EXPLANATION MODAL */}
      {selectedCandidate && (
        <InfoModal
          title="AI Match Explanation"
          onClose={() =>
            setSelectedCandidate(null)
          }
        >
          <div className="modal-section">
            <span className="eyebrow">
              CANDIDATE
            </span>

            <h2>
              {selectedCandidate.student_name}
            </h2>

            <p className="muted">
              {selectedCandidate.degree}
            </p>
          </div>

          <div className="reason-grid">
            <div>
              <strong>
                {selectedCandidate.match_score}%
              </strong>

              <span>
                Final AI Score
              </span>
            </div>

            <div>
              <strong>
                {selectedCandidate.skill_match_score}%
              </strong>

              <span>
                Skill Match
              </span>
            </div>

            <div>
              <strong>
                {selectedCandidate.tfidf_similarity}%
              </strong>

              <span>
                TF-IDF Similarity
              </span>
            </div>
          </div>

          <div className="modal-section">
            <span className="eyebrow">
              MATCHED SKILLS
            </span>

            <div className="tags">
              {selectedCandidate.matched_skills.length >
              0 ? (
                selectedCandidate.matched_skills.map(
                  (skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  )
                )
              ) : (
                <span>None</span>
              )}
            </div>
          </div>

          <div className="modal-section">
            <span className="eyebrow">
              MISSING SKILLS
            </span>

            <div className="tags">
              {selectedCandidate.missing_skills.length >
              0 ? (
                selectedCandidate.missing_skills.map(
                  (skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  )
                )
              ) : (
                <span>None</span>
              )}
            </div>
          </div>

          <div className="panel">
            <strong>
              {selectedCandidate.explanation?.assessment ||
                "AI-assisted assessment"}
            </strong>

            <p className="muted">
              {selectedCandidate.explanation?.reason ||
                "The candidate was ranked using skill matching and TF-IDF similarity."}
            </p>
          </div>
        </InfoModal>
      )}
    </div>
  );
}

function SkillGaps() {
  return (
    <div className="content">
      <div className="section-intro">
        <div>
          <span className="eyebrow">
            ACTIONABLE FEEDBACK
          </span>

          <h2>Skill Gap Analysis</h2>

          <p>
            Identify missing skills and recommend areas
            for improvement.
          </p>
        </div>
      </div>

      <div className="skill-gap-grid">
        <div className="panel">
          <h3>Aarav Sharma</h3>

          <p className="muted">
            Target Role: AI/ML Engineer
          </p>

          <div className="skill-status">
            <div>
              <span>Python</span>
              <b className="matched">Matched</b>
            </div>

            <div>
              <span>Machine Learning</span>
              <b className="matched">Matched</b>
            </div>

            <div>
              <span>Scikit-learn</span>
              <b className="missing">
                Needs Improvement
              </b>
            </div>

            <div>
              <span>Cloud Deployment</span>
              <b className="missing">Missing</b>
            </div>
          </div>
        </div>

        <div className="panel recommendation">
          <span className="eyebrow">
            RECOMMENDATION
          </span>

          <h3>Suggested Learning Path</h3>

          <p>
            Focus on these skills to improve role readiness.
          </p>

          <ul>
            <li>Scikit-learn model evaluation</li>
            <li>Docker fundamentals</li>
            <li>Cloud deployment basics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Fairness() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAudit = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://campus-placement-ai-api.onrender.com/fairness/audit"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load fairness audit"
        );
      }

      const data = await response.json();

      setAudit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="content">

      {/* HEADER */}
      <div className="section-intro">
        <div>
          <span className="eyebrow">
            RESPONSIBLE AI
          </span>

          <h2>Fairness Audit</h2>

          <p>
            Monitor fairness controls and human oversight
            in the AI-assisted placement workflow.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={fetchAudit}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Audit"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="panel">
          <h3>
            Running fairness audit...
          </h3>

          <p className="muted">
            Checking candidate selection and AI
            decision controls.
          </p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="panel">
          <h3>
            Unable to load audit
          </h3>

          <p>{error}</p>
        </div>
      )}

      {/* AUDIT RESULTS */}
      {!loading && !error && audit && (
        <>

          {/* SUMMARY */}
          <div className="stats-grid">

            <div className="stat-card">
              <span>
                Total Candidates
              </span>

              <strong>
                {audit.total_candidates}
              </strong>
            </div>

            <div className="stat-card">
              <span>
                Approved Candidates
              </span>

              <strong>
                {audit.approved_candidates}
              </strong>
            </div>

            <div className="stat-card">
              <span>
                Selection Rate
              </span>

              <strong>
                {audit.selection_rate}%
              </strong>
            </div>

            <div className="stat-card">
              <span>
                Human Review
              </span>

              <strong>
                {audit.human_review_required
                  ? "Required"
                  : "Not Required"}
              </strong>
            </div>

          </div>

          {/* FAIRNESS STATUS */}
          <div
            className="panel"
            style={{ marginBottom: "18px" }}
          >
            <span className="eyebrow">
              FAIRNESS STATUS
            </span>

            <h3 style={{ marginTop: "8px" }}>
              {audit.sensitive_attributes_used
                ? "Review Required"
                : "Fairness Controls Active"}
            </h3>

            <p className="muted">
              {audit.fairness_note}
            </p>
          </div>

          {/* SENSITIVE ATTRIBUTES */}
          <div
            className="panel"
            style={{ marginBottom: "18px" }}
          >
            <span className="eyebrow">
              BIAS CONTROL
            </span>

            <h3 style={{ marginTop: "8px" }}>
              Sensitive attributes are excluded
            </h3>

            <p className="muted">
              The current AI matching process does not
              use attributes such as gender, caste,
              religion, photograph, or other sensitive
              personal characteristics as matching
              inputs.
            </p>

            <div className="tags">
              <span>Gender</span>
              <span>Caste</span>
              <span>Religion</span>
              <span>Photo</span>
            </div>
          </div>

          {/* AI DECISION CONTROLS */}
          <div
            className="panel"
            style={{ marginBottom: "18px" }}
          >
            <span className="eyebrow">
              AI DECISION CONTROLS
            </span>

            <h3 style={{ marginTop: "8px" }}>
              AI assists — humans decide
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "16px",
                marginTop: "18px",
              }}
            >

              <div>
                <strong>
                  01
                </strong>

                <p className="muted">
                  AI ranks candidates using
                  job-relevant skills and
                  profile similarity.
                </p>
              </div>

              <div>
                <strong>
                  02
                </strong>

                <p className="muted">
                  The system provides
                  explanations for the
                  calculated match score.
                </p>
              </div>

              <div>
                <strong>
                  03
                </strong>

                <p className="muted">
                  A placement officer makes
                  the final approval or
                  rejection decision.
                </p>
              </div>

            </div>
          </div>

          {/* LIMITATION / TRANSPARENCY */}
          <div className="panel">

            <span className="eyebrow">
              TRANSPARENCY NOTE
            </span>

            <h3 style={{ marginTop: "8px" }}>
              Current audit scope
            </h3>

            <p className="muted">
              This prototype performs basic fairness
              monitoring using selection outcomes and
              checks whether sensitive attributes are
              being used by the matching workflow.
              Advanced demographic fairness metrics
              require appropriate, consented evaluation
              data and are planned for future versions.
            </p>

          </div>

        </>
      )}
    </div>
  );
}

function Approvals() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  const [applications, setApplications] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] =
    useState(false);

  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Load all jobs
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");

      const response = await fetch(
        "https://campus-placement-ai-api.onrender.com/jobs/"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load jobs"
        );
      }

      setJobs(data);

      if (data.length > 0) {
        setSelectedJobId(String(data[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load applications for selected job
  const fetchApplications = async () => {
    if (!selectedJobId) {
      setApplications([]);
      return;
    }

    try {
      setLoadingApplications(true);
      setError("");

      const response = await fetch(
        `https://campus-placement-ai-api.onrender.com/applications/job/${selectedJobId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load applications"
        );
      }

      setApplications(data);
    } catch (err) {
      setError(err.message);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Initial job loading
  useEffect(() => {
    fetchJobs();
  }, []);

  // Reload applications whenever selected job changes
  useEffect(() => {
    if (selectedJobId) {
      fetchApplications();
    }
  }, [selectedJobId]);

  const updateApplication = async (
    applicationId,
    status
  ) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      const comments =
        status === "Approved"
          ? "Candidate approved after placement officer review."
          : "Candidate rejected after placement officer review.";

      const response = await fetch(
        `https://campus-placement-ai-api.onrender.com/applications/${applicationId}?status=${status}&reviewer=Placement%20Officer&comments=${encodeURIComponent(
          comments
        )}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update application"
        );
      }

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: status,
                reviewer: "Placement Officer",
                comments: comments,
              }
            : application
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "status-approved";
    }

    if (status === "Rejected") {
      return "status-rejected";
    }

    return "status-pending";
  };

  const selectedJob = jobs.find(
    (job) => String(job.id) === String(selectedJobId)
  );

  return (
    <div className="content">

      {/* HEADER */}
      <div className="section-intro">
        <div>
          <span className="eyebrow">
            HUMAN-IN-THE-LOOP
          </span>

          <h2>Application Approvals</h2>

          <p>
            Review student applications and make the
            final placement decision.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={fetchApplications}
          disabled={
            !selectedJobId || loadingApplications
          }
        >
          {loadingApplications
            ? "Refreshing..."
            : "Refresh Applications"}
        </button>
      </div>

      {/* JOB SELECTOR */}
      <div
        className="panel"
        style={{ marginBottom: "18px" }}
      >
        <span className="eyebrow">
          SELECT JOB
        </span>

        <h3 style={{ marginTop: "8px" }}>
          Placement Opportunity
        </h3>

        {loadingJobs ? (
          <p className="muted">
            Loading jobs...
          </p>
        ) : jobs.length === 0 ? (
          <p className="muted">
            No jobs have been created yet.
          </p>
        ) : (
          <select
            value={selectedJobId}
            onChange={(e) =>
              setSelectedJobId(e.target.value)
            }
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #d7dce3",
              borderRadius: "9px",
              background: "#fff",
              fontSize: "13px",
              color: "#182235",
              outline: "none",
            }}
          >
            {jobs.map((job) => (
              <option
                key={job.id}
                value={job.id}
              >
                {job.title} — {job.company}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* CURRENT JOB INFO */}
      {selectedJob && (
        <div
          className="panel"
          style={{ marginBottom: "18px" }}
        >
          <span className="eyebrow">
            CURRENT JOB
          </span>

          <h3 style={{ marginTop: "8px" }}>
            {selectedJob.title}
          </h3>

          <p className="muted">
            {selectedJob.company} ·{" "}
            {applications.length} application
            {applications.length !== 1
              ? "s"
              : ""}
          </p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="panel">
          <h3>
            Unable to load applications
          </h3>

          <p>{error}</p>
        </div>
      )}

      {/* LOADING */}
      {loadingApplications && (
        <div className="panel">
          <h3>
            Loading applications...
          </h3>

          <p className="muted">
            Fetching student applications from
            the backend.
          </p>
        </div>
      )}

      {/* NO APPLICATIONS */}
      {!loadingApplications &&
        !error &&
        selectedJobId &&
        applications.length === 0 && (
          <div className="panel">
            <span className="eyebrow">
              APPLICATIONS
            </span>

            <h3>
              No applications found
            </h3>

            <p className="muted">
              Student applications for this job
              will appear here after they apply.
            </p>
          </div>
        )}

      {/* APPLICATION LIST */}
      {!loadingApplications &&
        !error &&
        applications.length > 0 && (
          <div className="approval-list">
            {applications.map(
              (application) => (
                <div
                  className="panel approval-application-card"
                  key={application.id}
                >

                  {/* APPLICATION HEADER */}
                  <div className="approval-application-header">
                    <div>
                      <span className="eyebrow">
                        APPLICATION #
                        {application.id}
                      </span>

                      <h3>
                        {
                          application.student_name
                        }
                      </h3>

                      <p className="muted">
                        {
                          application.student_email
                        }
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

                  {/* APPLICATION DETAILS */}
                  <div className="approval-application-details">

                    <div>
                      <span className="eyebrow">
                        JOB
                      </span>

                      <strong>
                        {selectedJob
                          ? selectedJob.title
                          : "Selected Job"}
                      </strong>
                    </div>

                    <div>
                      <span className="eyebrow">
                        COMPANY
                      </span>

                      <strong>
                        {selectedJob
                          ? selectedJob.company
                          : "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="eyebrow">
                        REVIEWER
                      </span>

                      <strong>
                        {application.reviewer ||
                          "Awaiting review"}
                      </strong>
                    </div>

                    <div>
                      <span className="eyebrow">
                        COMMENTS
                      </span>

                      <strong>
                        {application.comments ||
                          "No review comments yet."}
                      </strong>
                    </div>

                  </div>

                  {/* ACTIONS */}
                  {application.status ===
                    "Pending" && (
                    <div className="approval-review-actions">

                      <button
                        className="reject-btn"
                        disabled={
                          updatingId ===
                          application.id
                        }
                        onClick={() =>
                          updateApplication(
                            application.id,
                            "Rejected"
                          )
                        }
                      >
                        {updatingId ===
                        application.id
                          ? "Updating..."
                          : "Reject"}
                      </button>

                      <button
                        className="approve-btn"
                        disabled={
                          updatingId ===
                          application.id
                        }
                        onClick={() =>
                          updateApplication(
                            application.id,
                            "Approved"
                          )
                        }
                      >
                        {updatingId ===
                        application.id
                          ? "Updating..."
                          : "Approve"}
                      </button>

                    </div>
                  )}

                  {/* FINAL DECISION */}
                  {application.status !==
                    "Pending" && (
                    <div className="approval-final-message">
                      <span className="eyebrow">
                        FINAL DECISION
                      </span>

                      <p>
                        This application has
                        already been{" "}
                        <strong>
                          {application.status.toLowerCase()}
                        </strong>{" "}
                        by the placement officer.
                      </p>
                    </div>
                  )}

                </div>
              )
            )}
          </div>
        )}
    </div>
  );
}

function StudentSkillGaps({ user }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        setError("");

        const response = await fetch(
          "https://campus-placement-ai-api.onrender.com/jobs/"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load jobs"
          );
        }

        setJobs(data);

        if (data.length > 0) {
          setSelectedJobId(String(data[0].id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const analyzeSkillGap = async () => {
    if (!selectedJobId) {
      setError("Please select a job first.");
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setAnalysis(null);

      const response = await fetch(
        `https://campus-placement-ai-api.onrender.com/student-match/${user.id}/${selectedJobId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to analyze skill gap"
        );
      }

      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="content">
      <div className="section-intro">
        <div>
          <span className="eyebrow">
            AI SKILL GAP ANALYSIS
          </span>

          <h2>Understand what to improve</h2>

          <p>
            Compare your current profile with a job and
            identify the skills you already have and the
            skills you can develop.
          </p>
        </div>
      </div>

      <div className="panel skill-gap-selector">
        <span className="eyebrow">
          TARGET OPPORTUNITY
        </span>

        <h3>Select a job to analyze</h3>

        {loadingJobs ? (
          <p className="muted">
            Loading available opportunities...
          </p>
        ) : jobs.length === 0 ? (
          <p className="muted">
            No active job opportunities are available.
          </p>
        ) : (
          <div className="skill-gap-controls">
            <select
              value={selectedJobId}
              onChange={(event) => {
                setSelectedJobId(event.target.value);
                setAnalysis(null);
                setError("");
              }}
            >
              {jobs.map((job) => (
                <option
                  key={job.id}
                  value={job.id}
                >
                  {job.title} — {job.company}
                </option>
              ))}
            </select>

            <button
              className="primary-btn"
              onClick={analyzeSkillGap}
              disabled={analyzing}
            >
              {analyzing
                ? "Analyzing..."
                : "Analyze Skill Gap →"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="panel">
          <h3>Unable to analyze skill gap</h3>
          <p>{error}</p>
        </div>
      )}

      {analysis && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Overall Match</span>
              <strong>
                {analysis.match_score}%
              </strong>
              <small>AI-assisted score</small>
            </div>

            <div className="stat-card">
              <span>Skill Match</span>
              <strong>
                {analysis.skill_match}%
              </strong>
              <small>Required skills matched</small>
            </div>

            <div className="stat-card">
              <span>Matched Skills</span>
              <strong>
                {analysis.matched_skills?.length || 0}
              </strong>
              <small>Current strengths</small>
            </div>

            <div className="stat-card">
              <span>Skill Gaps</span>
              <strong>
                {analysis.skill_gap?.length || 0}
              </strong>
              <small>Areas to improve</small>
            </div>
          </div>

          <div className="skill-gap-grid">
            <div className="panel">
              <span className="eyebrow">
                CURRENT STRENGTHS
              </span>

              <h3>Matched Skills</h3>

              {analysis.matched_skills?.length > 0 ? (
                <div className="tags">
                  {analysis.matched_skills.map(
                    (skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="muted">
                  No required skills matched yet.
                </p>
              )}
            </div>

            <div className="panel">
              <span className="eyebrow">
                AREAS TO IMPROVE
              </span>

              <h3>Skill Gaps</h3>

              {analysis.skill_gap?.length > 0 ? (
                <div className="tags">
                  {analysis.skill_gap.map(
                    (skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="muted">
                  No major skill gaps identified.
                </p>
              )}
            </div>
          </div>

          <div className="panel">
            <span className="eyebrow">
              AI RECOMMENDATION
            </span>

            <h3>
              How to improve your role readiness
            </h3>

            <p className="muted">
              {analysis.skill_gap?.length > 0
                ? `Focus on developing ${analysis.skill_gap.join(
                    ", "
                  )}. These skills are required by the selected
                  opportunity but are not currently present in
                  your profile.`
                : "Your profile currently covers all the listed technical requirements for this opportunity."}
            </p>

            <div className="explanation-box">
              <span className="eyebrow">
                WHY THIS MATTERS
              </span>

              <p>
                {analysis.explanation}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StudentDashboard({ user, setActivePage }) {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const profileResponse = await fetch(
        `https://campus-placement-ai-api.onrender.com/profile/${user.id}`
      );

      const jobsResponse = await fetch(
        "https://campus-placement-ai-api.onrender.com/jobs/"
      );

      const applicationsResponse = await fetch(
        `https://campus-placement-ai-api.onrender.com/applications/student/${user.id}`
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to load profile.");
      }

      if (!jobsResponse.ok) {
        throw new Error("Failed to load jobs.");
      }

      if (!applicationsResponse.ok) {
        throw new Error("Failed to load applications.");
      }

      const profileData = await profileResponse.json();
      const jobsData = await jobsResponse.json();
      const applicationsData = await applicationsResponse.json();

      setProfile(profileData);
      setJobs(jobsData);
      setApplications(applicationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const pendingApplications = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const approvedApplications = applications.filter(
    (application) => application.status === "Approved"
  ).length;

  const rejectedApplications = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  const profileFields = [
    profile?.degree,
    profile?.skills,
    profile?.resume_text,
  ];

  const completedFields = profileFields.filter(
    (field) => field && field.trim() !== ""
  ).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  return (
    <div className="content">

      {/* HERO */}
      <section className="hero">
        <div>
          <span className="hero-label">
            STUDENT PLACEMENT WORKSPACE
          </span>

          <h2>
            Welcome, {user.name}.
          </h2>

          <p>
            Manage your profile, discover job opportunities,
            track applications and understand your skill gaps.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              setActivePage("Job Opportunities")
            }
          >
            Explore Jobs →
          </button>
        </div>

        <div className="hero-visual">
          <div className="score-circle">
            <strong>
              {loading ? "..." : `${profileCompletion}%`}
            </strong>
            <span>PROFILE</span>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="panel">
          <h3>Dashboard data unavailable</h3>
          <p>{error}</p>
        </div>
      )}

      {/* STATS */}
      <section className="stats-grid">

        <Stat
          title="Profile Status"
          value={
            loading
              ? "..."
              : `${profileCompletion}%`
          }
          change={
            profileCompletion === 100
              ? "Profile complete"
              : "Complete your profile"
          }
        />

        <Stat
          title="Applications"
          value={
            loading
              ? "..."
              : applications.length
          }
          change={
            applications.length === 0
              ? "No applications yet"
              : `${pendingApplications} pending`
          }
        />

        <Stat
          title="Shortlisted"
          value={
            loading
              ? "..."
              : approvedApplications
          }
          change={
            approvedApplications > 0
              ? "Application approved"
              : "Keep applying"
          }
        />

        <Stat
          title="Available Jobs"
          value={
            loading
              ? "..."
              : jobs.length
          }
          change="Explore opportunities"
        />

      </section>

      {/* APPLICATION SUMMARY */}
      <section className="dashboard-grid">

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                APPLICATION STATUS
              </span>

              <h3>
                Your Applications
              </h3>
            </div>

            <button
              onClick={() =>
                setActivePage("My Applications")
              }
            >
              View all
            </button>
          </div>

          {loading ? (
            <p className="muted">
              Loading applications...
            </p>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <h3>
                No applications yet
              </h3>

              <p>
                Explore available jobs and apply
                to relevant opportunities.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  setActivePage("Job Opportunities")
                }
              >
                Explore Jobs
              </button>
            </div>
          ) : (
            <div className="candidate-list">

              {applications
                .slice(-5)
                .reverse()
                .map((application) => (
                  <div
                    className="candidate-row"
                    key={application.id}
                  >
                    <div className="candidate-avatar">
                      {application.job_title
                        ? application.job_title.charAt(0)
                        : "J"}
                    </div>

                    <div className="candidate-info">
                      <strong>
                        {application.job_title}
                      </strong>

                      <span>
                        {application.company}
                      </span>
                    </div>

                    <div className="match-score">
                      <strong>
                        {application.status}
                      </strong>

                      <span>
                        Application
                      </span>
                    </div>
                  </div>
                ))}

            </div>
          )}
        </div>

        {/* PROFILE / AI PANEL */}
        <div className="panel">

          <div className="panel-header">
            <div>
              <span className="eyebrow">
                AI PLACEMENT ASSISTANT
              </span>

              <h3>
                Profile Readiness
              </h3>
            </div>
          </div>

          <div className="insight">
            <div className="insight-icon">
              ✓
            </div>

            <div>
              <strong>
                Profile completion
              </strong>

              <p>
                {profileCompletion}% of your
                placement profile is complete.
              </p>
            </div>
          </div>

          <div className="insight">
            <div className="insight-icon">
              ✦
            </div>

            <div>
              <strong>
                AI matching
              </strong>

              <p>
                Your profile can be compared
                with job requirements using
                AI-assisted matching.
              </p>
            </div>
          </div>

          <div className="insight">
            <div className="insight-icon">
              !
            </div>

            <div>
              <strong>
                Skill gaps
              </strong>

              <p>
                Check missing skills for
                individual jobs to improve
                your placement readiness.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* APPLICATION COUNTS */}
      <div className="panel" style={{ marginTop: "18px" }}>

        <span className="eyebrow">
          PLACEMENT OVERVIEW
        </span>

        <h3>
          Your current application summary
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "16px",
            marginTop: "18px",
          }}
        >

          <div>
            <strong>
              {pendingApplications}
            </strong>

            <p className="muted">
              Pending
            </p>
          </div>

          <div>
            <strong>
              {approvedApplications}
            </strong>

            <p className="muted">
              Approved
            </p>
          </div>

          <div>
            <strong>
              {rejectedApplications}
            </strong>

            <p className="muted">
              Rejected
            </p>
          </div>

        </div>

      </div>

      {/* REFRESH */}
      <div
        style={{
          marginTop: "18px",
          textAlign: "right",
        }}
      >
        <button
          className="secondary-btn"
          onClick={fetchDashboardData}
        >
          Refresh Dashboard
        </button>
      </div>

    </div>
  );
}

export default App;