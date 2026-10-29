import { Link } from "react-router-dom";
import { formatPlace } from "../constants";

export const categoryIcons = {
  Electrical: "⚡",
  Plumbing: "🚰",
  Network: "📶",
  Cleaning: "🧹",
  Furniture: "🪑",
  Other: "📝",
};

function ComplaintCard({ complaint }) {
  const statusClass = complaint.status.replace(" ", "").toLowerCase();

  return (
    <Link to={"/complaints/" + complaint._id} className="complaint-card">
      <div className="card-top">
        <span className="category">
          {categoryIcons[complaint.category]} {complaint.category}
        </span>
        <span className={"status " + statusClass}>{complaint.status}</span>
      </div>

      <h3>{complaint.title}</h3>
      <p className="desc">{complaint.description}</p>

      <div className="card-bottom">
        <span>{formatPlace(complaint)}</span>
        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="card-bottom">
        <span>By: {complaint.createdBy?.name}</span>
        <span>
          {complaint.assignedTo
            ? "Assigned: " + complaint.assignedTo.name + (complaint.assignedTo.employeeId ? " (" + complaint.assignedTo.employeeId + ")" : "")
            : "Not assigned"}
        </span>
      </div>
    </Link>
  );
}

export default ComplaintCard;
