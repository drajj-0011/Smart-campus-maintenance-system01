import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getComplaint,
  updateComplaint,
  deleteComplaint,
  addComment,
  getUsers,
  getError,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { categoryIcons } from "../components/ComplaintCard";
import { formatPlace } from "../constants";

const statuses = ["Pending", "In Progress", "Resolved", "Rejected"];
const steps = ["Pending", "In Progress", "Resolved"];

function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getComplaint(id)
      .then((res) => setComplaint(res.data))
      .catch((err) => setError(getError(err)));

    // admin needs staff list for assigning
    if (user.role === "admin") {
      getUsers({ role: "staff", employmentStatus: "present" }).then((res) => setStaffList(res.data));
    }
  }, [id, user.role]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleUpdate = async (data, text) => {
    setError("");
    try {
      const res = await updateComplaint(id, data);
      setComplaint(res.data);
      showMessage(text);
    } catch (err) {
      setError(getError(err));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await deleteComplaint(id);
      navigate("/");
    } catch (err) {
      setError(getError(err));
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    try {
      const res = await addComment(id, comment);
      setComplaint(res.data);
      setComment("");
      setError("");
    } catch (err) {
      setError(getError(err));
    }
  };

  if (!complaint) {
    return error ? (
      <div className="error-msg">{error} <Link to="/">Go back</Link></div>
    ) : (
      <p className="center muted">Loading...</p>
    );
  }

  const isOwner = complaint.createdBy?._id === user._id;
  const isPending = complaint.status === "Pending";
  const currentStep = steps.indexOf(complaint.status);

  return (
    <div>
      <Link to="/" className="back-link">← Back to Dashboard</Link>

      {error && <div className="error-msg">{error}</div>}
      {message && <div className="success-msg">{message}</div>}

      <div className="details-layout">
        {/* left side - complaint info */}
        <div className="card">
          <div className="card-top">
            <span className="category">
              {categoryIcons[complaint.category]} {complaint.category}
            </span>
            <span className={"status " + complaint.status.replace(" ", "").toLowerCase()}>
              {complaint.status}
            </span>
          </div>

          <h2>{complaint.title}</h2>

          {/* progress tracker */}
          {complaint.status === "Rejected" ? (
            <p className="rejected-note">This complaint was rejected.</p>
          ) : (
            <div className="progress">
              {steps.map((s, i) => (
                <div key={s} className={"step " + (i <= currentStep ? "done" : "")}>
                  <div className="circle">{i < currentStep || (s === "Resolved" && i === currentStep) ? "✓" : i + 1}</div>
                  <p>{s}</p>
                </div>
              ))}
            </div>
          )}

          <p className="description">{complaint.description}</p>

          <table className="info-table">
            <tbody>
              <tr><td>Block</td><td>{complaint.block || "-"}</td></tr>
              <tr><td>Room Number</td><td>{complaint.roomNumber || "-"}</td></tr>
              <tr><td>Place</td><td>{formatPlace(complaint)}</td></tr>
              <tr><td>Raised By</td><td>{complaint.createdBy?.name}</td></tr>
              <tr>
                <td>Assigned To</td>
                <td>
                  {complaint.assignedTo
                    ? `${complaint.assignedTo.name}${complaint.assignedTo.employeeId ? " (" + complaint.assignedTo.employeeId + ")" : ""}${complaint.assignedTo.jobRole ? " — " + complaint.assignedTo.jobRole : ""}${complaint.assignedTo.employmentStatus === "past" ? "  [Past employee]" : ""}`
                    : "Not assigned yet"}
                </td>
              </tr>
              <tr><td>Date</td><td>{new Date(complaint.createdAt).toLocaleString()}</td></tr>
            </tbody>
          </table>

          {/* admin actions */}
          {user.role === "admin" && (
            <div className="action-box">
              <h4>Admin Actions</h4>
              <label>Assign Staff</label>
              <select
                value={complaint.assignedTo?._id || ""}
                onChange={(e) => handleUpdate({ assignedTo: e.target.value }, "Staff assignment updated")}
              >
                <option value="">-- Select Staff --</option>
                {staffList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — {s.jobRole || "Staff"} ({s.employeeId || "No ID"})
                  </option>
                ))}
              </select>

              <label>Change Status</label>
              <div className="status-buttons">
                {statuses.map((s) => (
                  <button
                    key={s}
                    className={"btn-status " + (complaint.status === s ? "active" : "")}
                    onClick={() => handleUpdate({ status: s }, "Status changed to " + s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* staff actions */}
          {user.role === "staff" && (
            <div className="action-box">
              <h4>Update Work Status</h4>
              <div className="form-buttons left">
                <button
                  className="btn btn-blue"
                  disabled={complaint.status === "In Progress"}
                  onClick={() => handleUpdate({ status: "In Progress" }, "Marked as In Progress")}
                >
                  Working On It
                </button>
                <button
                  className="btn btn-green"
                  disabled={complaint.status === "Resolved"}
                  onClick={() => handleUpdate({ status: "Resolved" }, "Marked as Resolved")}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          )}

          {/* student actions (only when pending) */}
          {isOwner && isPending && (
            <div className="form-buttons left">
              <Link to={"/edit/" + complaint._id} className="btn btn-outline">Edit</Link>
              <button className="btn btn-red" onClick={handleDelete}>Delete</button>
            </div>
          )}

          {user.role === "admin" && (
            <div className="form-buttons left">
              <button className="btn btn-red" onClick={handleDelete}>Delete Complaint</button>
            </div>
          )}
        </div>

        {/* right side - comments */}
        <div className="card comments">
          <h3>Comments ({complaint.comments.length})</h3>

          <div className="comment-list">
            {complaint.comments.length === 0 && <p className="muted">No comments yet.</p>}
            {complaint.comments.map((c) => (
              <div key={c._id} className={"comment " + (c.user?._id === user._id ? "mine" : "")}>
                <strong>{c.user?.name || "User"}</strong>
                <small> ({c.user?.role}) - {new Date(c.createdAt).toLocaleString()}</small>
                <p>{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleComment} className="comment-form">
            <input
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetails;
