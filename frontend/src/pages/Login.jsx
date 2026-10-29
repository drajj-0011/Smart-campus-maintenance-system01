import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getError } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // frontend validation
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  // fill demo account details
  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Smart Campus</h1>
        <p className="subtitle">Complaint & Maintenance Management System</p>

        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <div className="error-msg">{error}</div>}

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn btn-primary full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="demo-box">
          <p>Demo accounts (click to fill):</p>
          <button onClick={() => fillDemo("student@campus.edu", "student123")}>Student</button>
          <button onClick={() => fillDemo("staff@campus.edu", "staff123")}>Staff</button>
          <button onClick={() => fillDemo("admin@campus.edu", "admin123")}>Admin</button>
        </div>

        <p className="switch-text">
          New student? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
