import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createComplaint, getComplaint, updateComplaint, getError } from "../services/api";
import { categoryIcons } from "../components/ComplaintCard";
import { CATEGORIES, BLOCKS } from "../constants";

// same form is used for adding and editing a complaint
function ComplaintForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    block: "",
    roomNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // if editing, load old complaint data
  useEffect(() => {
    if (isEdit) {
      getComplaint(id)
        .then((res) => {
          const c = res.data;
          setForm({
            title: c.title,
            description: c.description,
            category: c.category,
            block: c.block || "",
            roomNumber: c.roomNumber || "",
          });
        })
        .catch((err) => setError(getError(err)));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // frontend validation
    if (!form.category) {
      setError("Please select a category");
      return;
    }
    if (form.title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }
    if (!form.block) {
      setError("Please select a block");
      return;
    }
    if (!form.roomNumber.trim()) {
      setError("Please enter the room number");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateComplaint(id, form);
        setSuccess("Complaint updated successfully!");
      } else {
        await createComplaint(form);
        setSuccess("Complaint submitted successfully!");
      }
      setTimeout(() => navigate(isEdit ? "/complaints/" + id : "/"), 1000);
    } catch (err) {
      setError(getError(err));
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h2>{isEdit ? "Edit Complaint" : "Raise a New Complaint"}</h2>
      <p className="muted">Fill in the details of the problem you are facing.</p>

      <form onSubmit={handleSubmit} className="card">
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <label>Category *</label>
        <div className="category-options">
          {CATEGORIES.map((c) => (
            <div
              key={c}
              className={"category-option " + (form.category === c ? "active" : "")}
              onClick={() => setForm({ ...form, category: c })}
            >
              <span>{categoryIcons[c]}</span>
              {c}
            </div>
          ))}
        </div>

        <label>Title *</label>
        <input name="title" placeholder="e.g. Fan not working" value={form.title} onChange={handleChange} />

        <label>Description * <small className="muted">({form.description.length}/500)</small></label>
        <textarea
          name="description"
          rows="4"
          maxLength="500"
          placeholder="Explain the problem in detail"
          value={form.description}
          onChange={handleChange}
        />

        <div className="two-col">
          <div>
            <label>Block *</label>
            <select name="block" value={form.block} onChange={handleChange}>
              <option value="">Select block</option>
              {BLOCKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Room Number *</label>
            <input name="roomNumber" placeholder="e.g. 204" value={form.roomNumber} onChange={handleChange} />
          </div>
        </div>

        <div className="form-buttons">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Complaint" : "Submit Complaint"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComplaintForm;
