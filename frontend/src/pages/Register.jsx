import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, getError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { DEPARTMENTS } from "../constants";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // frontend validation
    if (!form.name || !form.email || !form.password) {
      setError("Please fill all required fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
      });
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Smart Campus</h1>
        <p className="subtitle">Create your student account</p>

        <form onSubmit={handleSubmit}>
          <h2>Register</h2>
          {error && <div className="error-msg">{error}</div>}

          <label>Full Name *</label>
          <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} />

          <label>Email *</label>
          <input name="email" type="email" placeholder="you@campus.edu" value={form.email} onChange={handleChange} />

          <label>Department</label>
          <select name="department" value={form.department} onChange={handleChange}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <label>Password *</label>
          <input name="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} />

          <label>Confirm Password *</label>
          <input name="confirmPassword" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} />

          <button type="submit" className="btn btn-primary full" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
