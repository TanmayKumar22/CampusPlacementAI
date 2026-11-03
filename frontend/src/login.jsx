import { useState } from "react";

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const endpoint = isSignup
        ? "http://127.0.0.1:8000/auth/register"
        : "http://127.0.0.1:8000/auth/login";

      const requestBody = isSignup
        ? {
            name: name.trim(),
            email: email.trim(),
            password,
            role,
          }
        : {
            email: email.trim(),
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            (isSignup
              ? "Unable to create account."
              : "Invalid email or password.")
        );
      }

      // SIGNUP SUCCESS
      if (isSignup) {
        setSuccess(
          "Account created successfully! Please sign in."
        );

        setName("");
        setEmail("");
        setPassword("");
        setRole("student");

        setTimeout(() => {
          setIsSignup(false);
          setSuccess("");
        }, 1200);

        return;
      }

      // LOGIN SUCCESS
      localStorage.setItem(
        "campusai_token",
        data.access_token
      );

      localStorage.setItem(
        "campusai_user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup((current) => !current);
    setError("");
    setSuccess("");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* BRAND */}
        <div className="login-brand">
          <div className="brand-icon">AI</div>

          <div>
            <h1>CampusAI</h1>
            <span>Placement Intelligence</span>
          </div>
        </div>

        {/* HEADING */}
        <div className="login-heading">
          <span className="eyebrow">
            {isSignup ? "CREATE ACCOUNT" : "SECURE ACCESS"}
          </span>

          <h2>
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>

          <p>
            {isSignup
              ? "Join CampusAI and start your placement journey."
              : "Sign in to access your placement workspace."}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* NAME */}
          {isSignup && (
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />
            </div>
          )}

          {/* EMAIL */}
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={6}
            />
          </div>

          {/* ROLE */}
          {isSignup && (
            <div className="form-group">
              <label>Account Type</label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              >
                <option value="student">
                  Student
                </option>

                <option value="officer">
                  Placement Officer
                </option>
              </select>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="login-success">
              {success}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="primary-btn login-btn"
            disabled={loading}
          >
            {loading
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
              ? "Create Account →"
              : "Sign In →"}
          </button>

        </form>

        {/* SIGNUP / LOGIN SWITCH */}
        <div className="login-switch">
          <span>
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button
            type="button"
            onClick={switchMode}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {/* DEMO ACCOUNT */}
        {!isSignup && (
          <div className="login-demo">
            <span>Demo Officer Account</span>
            <p>officer@campusai.com</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;