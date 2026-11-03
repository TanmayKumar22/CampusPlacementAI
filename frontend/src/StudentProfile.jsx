import { useEffect, useState } from "react";

function StudentProfile({ user }) {
  const [profile, setProfile] = useState({
    name: user.name || "",
    email: user.email || "",
    degree: "",
    skills: "",
    resume_text: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [message, setMessage] = useState("");
  const [resumeMessage, setResumeMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/profile/${user.id}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load profile"
          );
        }

        setProfile({
          name: data.name || "",
          email: data.email || "",
          degree: data.degree || "",
          skills: data.skills || "",
          resume_text: data.resume_text || "",
        });
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setResumeMessage("Please upload a PDF resume.");
      return;
    }

    try {
      setUploadingResume(true);
      setResumeMessage("");
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/resume/extract",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to process resume"
        );
      }

      setProfile((previous) => ({
        ...previous,
        degree: data.degree || previous.degree,
        skills:
          data.skills && data.skills.length > 0
            ? data.skills.join(", ")
            : previous.skills,
        resume_text:
          data.text || previous.resume_text,
      }));

      setResumeMessage(
        `Resume processed successfully: ${file.name}`
      );
    } catch (err) {
      setResumeMessage(err.message);
    } finally {
      setUploadingResume(false);

      // Allows the same PDF to be selected again later.
      event.target.value = "";
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            degree: profile.degree,
            skills: profile.skills,
            resume_text: profile.resume_text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save profile"
        );
      }

      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="panel">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const completedFields = [
    profile.name,
    profile.email,
    profile.degree,
    profile.skills,
    profile.resume_text,
  ].filter(
    (value) => value && value.trim()
  ).length;

  const completion = Math.round(
    (completedFields / 5) * 100
  );

  return (
    <div className="content">

      <div className="page-heading">
        <div>
          <span className="eyebrow">
            STUDENT PROFILE
          </span>

          <h2>
            Build your placement profile
          </h2>

          <p>
            Keep your academic information and skills
            updated so CampusAI can find better
            opportunities for you.
          </p>
        </div>
      </div>

      <div className="profile-layout">

        <section className="panel profile-main">

          <div className="section-heading">
            <div>
              <span className="eyebrow">
                PERSONAL INFORMATION
              </span>

              <h3>
                Your information
              </h3>
            </div>
          </div>

          <form onSubmit={handleSave}>

            <div className="profile-form-grid">

              <div className="form-group">
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={profile.name}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={profile.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>
                  Degree
                </label>

                <input
                  type="text"
                  name="degree"
                  placeholder="e.g. B.Tech CSE"
                  value={profile.degree}
                  onChange={handleChange}
                />
              </div>

              {/* Resume Upload */}

              <div className="form-group full-width">
                <div className="resume-upload-box">

                  <div>
                    <span className="eyebrow">
                      RESUME IMPORT
                    </span>

                    <h3>
                      Upload your resume
                    </h3>

                    <p>
                      Upload a PDF resume and CampusAI
                      will automatically extract your
                      degree, skills and resume information.
                    </p>
                  </div>

                  <label className="secondary-btn">
                    {uploadingResume
                      ? "Processing..."
                      : "Choose PDF"}

                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      hidden
                    />
                  </label>

                  {resumeMessage && (
                    <div
                      className={
                        resumeMessage.includes(
                          "successfully"
                        )
                          ? "success-message"
                          : "login-error"
                      }
                    >
                      {resumeMessage}
                    </div>
                  )}

                </div>
              </div>

              <div className="form-group full-width">
                <label>
                  Skills
                </label>

                <textarea
                  name="skills"
                  rows="4"
                  placeholder="e.g. Python, Java, React, SQL, Git"
                  value={profile.skills}
                  onChange={handleChange}
                />

                <small>
                  Separate multiple skills with commas.
                </small>
              </div>

              <div className="form-group full-width">
                <label>
                  Resume / Professional Summary
                </label>

                <textarea
                  name="resume_text"
                  rows="8"
                  placeholder="Paste your resume text or a professional summary here..."
                  value={profile.resume_text}
                  onChange={handleChange}
                />

                <small>
                  This information will be used by the
                  AI matching engine when comparing you
                  with job opportunities.
                </small>
              </div>

            </div>

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Profile →"}
            </button>

          </form>

        </section>

        <aside className="profile-side">

          <div className="panel completion-card">

            <span className="eyebrow">
              PROFILE COMPLETION
            </span>

            <div className="completion-number">
              {completion}%
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${completion}%`,
                }}
              ></div>
            </div>

            <p>
              {completion === 100
                ? "Your profile is complete."
                : "Complete your profile to improve AI job matching."}
            </p>

          </div>

          <div className="panel ai-tip">

            <span className="eyebrow">
              AI MATCHING
            </span>

            <h3>
              Why your profile matters
            </h3>

            <p>
              CampusAI compares your skills and
              professional information with job
              requirements to calculate a transparent
              match score.
            </p>

            <div className="tip-item">
              <span>01</span>
              <p>
                Keep your skills updated.
              </p>
            </div>

            <div className="tip-item">
              <span>02</span>
              <p>
                Add relevant projects and technologies.
              </p>
            </div>

            <div className="tip-item">
              <span>03</span>
              <p>
                Keep your resume information complete.
              </p>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default StudentProfile;