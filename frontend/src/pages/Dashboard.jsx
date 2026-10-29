import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaints, getStats, getError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ComplaintCard from "../components/ComplaintCard";

const categories = ["Electrical", "Plumbing", "Network", "Cleaning", "Furniture", "Other"];
const statuses = ["Pending", "In Progress", "Resolved", "Rejected"];

function Dashboard() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  // load stats once
  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  // load complaints whenever filters change
  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true);
      try {
        const res = await getComplaints({ search, status, category });
        setComplaints(res.data);
        setError("");
      } catch (err) {
        setError(getError(err));
      }
      setLoading(false);
    };
    loadComplaints();
  }, [search, status, category]);

  const headings = {
    student: "My Complaints",
    staff: "Complaints Assigned To Me",
    admin: "All Campus Complaints",
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome, {user.name}</h2>
          <p className="muted">{headings[user.role]}</p>
        </div>
        {user.role === "student" && (
          <Link to="/add" className="btn btn-primary">+ Raise Complaint</Link>
        )}
      </div>

      {/* stats boxes - click to filter */}
      <div className="stats">
        <div className={"stat-box total " + (status === "" ? "selected" : "")} onClick={() => setStatus("")}>
          <h3>{stats.total || 0}</h3>
          <p>Total</p>
        </div>
        {statuses.map((s) => (
          <div
            key={s}
            className={"stat-box " + s.replace(" ", "").toLowerCase() + (status === s ? " selected" : "")}
            onClick={() => setStatus(status === s ? "" : s)}
          >
            <h3>{stats[s] || 0}</h3>
            <p>{s}</p>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <p className="center muted">Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <div className="empty">
          <p>No complaints found</p>
        </div>
      ) : (
        <div className="complaint-grid">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
