import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers, createUser, updateUser, getStaffWork, getNextEmployeeId, getError } from "../services/api";
import { JOB_ROLES, formatPlace } from "../constants";

function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [tab, setTab] = useState("present");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", employeeId: "", jobRole: "" });
  const [selected, setSelected] = useState(null);
  const [work, setWork] = useState([]);
  const [summary, setSummary] = useState({ present: 0, past: 0, pastJobs: 0 });

  const loadSummary = async () => {
    try {
      const [p, past] = await Promise.all([
        getUsers({ role: "staff", employmentStatus: "present" }),
        getUsers({ role: "staff", employmentStatus: "past" }),
      ]);
      setSummary({
        present: p.data.length,
        past: past.data.length,
        pastJobs: past.data.reduce((n, u) => n + (u.jobsTotal || 0), 0),
      });
    } catch (err) {
      setError(getError(err));
    }
  };

  const loadStaff = async () => {
    try {
      const res = await getUsers({ role: "staff", employmentStatus: tab });
      setStaff(res.data);
    } catch (err) {
      setError(getError(err));
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    setSelected(null);
    setWork([]);
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const openForm = async () => {
    setError("");
    if (!showForm) {
      try {
        const res = await getNextEmployeeId();
        setForm({ name: "", email: "", password: "", employeeId: res.data.employeeId, jobRole: "" });
      } catch {
        setForm({ name: "", email: "", password: "", employeeId: "", jobRole: "" });
      }
    }
    setShowForm(!showForm);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) return setError("Name, email and password are required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (!form.employeeId.trim()) return setError("Employee ID is required");
    if (!form.jobRole) return setError("Please select a job role");

    try {
      await createUser({ ...form, role: "staff", employmentStatus: "present" });
      setMessage(form.name + " saved with ID " + form.employeeId.toUpperCase());
      setShowForm(false);
      loadStaff();
      loadSummary();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(getError(err));
    }
  };

  const handleStatus = async (u, status) => {
    try {
      await updateUser(u._id, { employmentStatus: status });
      setMessage(status === "past"
        ? u.name + " is now a past employee. Work done stays in the database under " + (u.employeeId || "their ID") + "."
        : u.name + " is present staff again.");
      setSelected(null);
      setWork([]);
      loadStaff();
      loadSummary();
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(getError(err));
    }
  };

  const openDetails = async (u) => {
    setError("");
    setSelected(u);
    try {
      const res = await getStaffWork(u._id);
      setWork(res.data.work || []);
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Manage Staff</h2>
          <p className="muted">Every staff member has an Employee ID. You can add more anytime. Past employees and their work stay in MongoDB.</p>
        </div>
        <button className="btn btn-primary" onClick={openForm}>{showForm ? "Close" : "+ Add Staff"}</button>
      </div>

      <div className="stats staff-stats">
        <div className="stat-box total"><h3>{summary.present}</h3><p>Present staff</p></div>
        <div className="stat-box rejected"><h3>{summary.past}</h3><p>Past employees</p></div>
        <div className="stat-box resolved"><h3>{summary.pastJobs}</h3><p>Jobs kept for past staff</p></div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {message && <div className="success-msg">{message}</div>}

      {showForm && (
        <form className="card add-user-form" onSubmit={handleAdd}>
          <input name="name" placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input name="email" type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input name="password" type="password" placeholder="Password *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input name="employeeId" placeholder="Employee ID *" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          <select name="jobRole" value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })}>
            <option value="">Select job role *</option>
            {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button type="submit" className="btn btn-green">Save Staff</button>
          <p className="muted" style={{ gridColumn: "1 / -1", margin: 0 }}>
            Employee ID is stored in the database (unique). Next ID is filled automatically; you can change it.
          </p>
        </form>
      )}

      <div className="tabs">
        <button className={tab === "present" ? "active" : ""} onClick={() => setTab("present")}>Present Staff</button>
        <button className={tab === "past" ? "active" : ""} onClick={() => setTab("past")}>Past Employees</button>
      </div>

      <div className="staff-layout">
        <div className="staff-grid">
          {staff.length === 0 && <div className="empty">No {tab === "past" ? "past employees" : "present staff"} yet</div>}
          {staff.map((u) => (
            <button
              type="button"
              key={u._id}
              className={"staff-card " + (selected?._id === u._id ? "selected" : "") + (u.employmentStatus === "past" ? " past" : "")}
              onClick={() => openDetails(u)}
            >
              <div className="staff-card-top">
                <span className="avatar">{u.name.charAt(0).toUpperCase()}</span>
                <span className={"emp-status " + (u.employmentStatus || "present")}>{u.employmentStatus}</span>
              </div>
              <h4>{u.name}</h4>
              <p className="emp-id">{u.employeeId || "No ID"}</p>
              <p className="muted">{u.jobRole || "Staff"}</p>
              <p className="muted small-mail">{u.email}</p>
              <div className="staff-jobs">
                <span>{u.jobsTotal || 0} jobs</span>
                <span>{u.jobsResolved || 0} resolved</span>
              </div>
            </button>
          ))}
        </div>

        <div className="card work-panel">
          {!selected ? (
            <div className="empty inner">
              <p>Select a staff card to see full details and work history.</p>
              <p className="muted">Present staff and past employees are both stored with Employee IDs.</p>
            </div>
          ) : (
            <>
              <div className="page-header">
                <div>
                  <h3>{selected.name}</h3>
                  <p className="muted">
                    {selected.employeeId} · {selected.jobRole}
                    {selected.employmentStatus === "past" ? " · Left the job — work is still saved" : " · Currently working"}
                  </p>
                </div>
                {selected.employmentStatus !== "past" ? (
                  <button className="btn btn-outline small" onClick={() => handleStatus(selected, "past")}>Mark as Past</button>
                ) : (
                  <button className="btn btn-green small" onClick={() => handleStatus(selected, "present")}>Mark as Present</button>
                )}
              </div>

              <table className="info-table">
                <tbody>
                  <tr><td>Employee ID</td><td><b>{selected.employeeId || "-"}</b></td></tr>
                  <tr><td>Job role</td><td>{selected.jobRole || "-"}</td></tr>
                  <tr><td>Email</td><td>{selected.email}</td></tr>
                  <tr><td>Status</td><td>{selected.employmentStatus === "past" ? "Past employee" : "Present staff"}</td></tr>
                  <tr><td>Jobs in database</td><td>{selected.jobsTotal || work.length}</td></tr>
                  <tr><td>Resolved jobs</td><td>{selected.jobsResolved || work.filter((c) => c.status === "Resolved").length}</td></tr>
                </tbody>
              </table>

              <h4 className="work-title">Work done</h4>
              {work.length === 0 ? (
                <p className="muted">No complaints assigned to this employee ID yet.</p>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Place</th>
                      <th>Status</th>
                      <th>Raised by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {work.map((c) => (
                      <tr key={c._id}>
                        <td><Link to={"/complaints/" + c._id}>{c.title}</Link></td>
                        <td>{formatPlace(c)}</td>
                        <td><span className={"status " + c.status.replace(" ", "").toLowerCase()}>{c.status}</span></td>
                        <td>{c.createdBy?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageStaff;
