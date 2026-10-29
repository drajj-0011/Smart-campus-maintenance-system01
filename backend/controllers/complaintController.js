const Complaint = require("../models/Complaint");
const User = require("../models/User");

const CATEGORIES = ["Electrical", "Plumbing", "Network", "Cleaning", "Furniture", "Other"];
const STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"];
const BLOCKS = ["Block A", "Block B", "Block C", "Block D"];

const populateComplaint = (query) => {
  return query
    .populate("createdBy", "name email department")
    .populate("assignedTo", "name email employeeId jobRole employmentStatus")
    .populate("comments.user", "name role");
};

const getComplaints = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === "student") filter.createdBy = req.user._id;
    if (req.user.role === "staff") filter.assignedTo = req.user._id;

    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };

    const complaints = await populateComplaint(Complaint.find(filter).sort({ createdAt: -1 }));
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "student") filter.createdBy = req.user._id;
    if (req.user.role === "staff") filter.assignedTo = req.user._id;

    const complaints = await Complaint.find(filter).select("status");

    const stats = { total: complaints.length, Pending: 0, "In Progress": 0, Resolved: 0, Rejected: 0 };
    complaints.forEach((c) => {
      stats[c.status] = stats[c.status] + 1;
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await populateComplaint(Complaint.findById(req.params.id));

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role === "student" && complaint.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot view this complaint" });
    }

    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, block, roomNumber } = req.body;

    if (!title || !description || !category || !block || !roomNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (title.trim().length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters" });
    }
    if (description.trim().length < 10) {
      return res.status(400).json({ message: "Description must be at least 10 characters" });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }
    if (!BLOCKS.includes(block)) {
      return res.status(400).json({ message: "Please select Block A, B, C or D" });
    }
    if (!String(roomNumber).trim()) {
      return res.status(400).json({ message: "Room number is required" });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      block,
      roomNumber: String(roomNumber).trim(),
      createdBy: req.user._id,
    });

    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const role = req.user.role;
    const userId = req.user._id.toString();
    const { title, description, category, block, roomNumber, status, assignedTo } = req.body;

    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (role === "student") {
      if (complaint.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "This is not your complaint" });
      }
      if (complaint.status !== "Pending") {
        return res.status(400).json({ message: "Only pending complaints can be edited" });
      }
      if (title !== undefined && title.trim().length < 3) {
        return res.status(400).json({ message: "Title must be at least 3 characters" });
      }
      if (description !== undefined && description.trim().length < 10) {
        return res.status(400).json({ message: "Description must be at least 10 characters" });
      }
      if (category !== undefined && !CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      if (block !== undefined && !BLOCKS.includes(block)) {
        return res.status(400).json({ message: "Please select Block A, B, C or D" });
      }
      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (category) complaint.category = category;
      if (block) complaint.block = block;
      if (roomNumber) complaint.roomNumber = String(roomNumber).trim();
    }

    if (role === "admin") {
      if (status) complaint.status = status;
      if (assignedTo !== undefined) {
        if (assignedTo) {
          const staff = await User.findById(assignedTo);
          if (!staff || staff.role !== "staff") {
            return res.status(400).json({ message: "Please select a valid staff member" });
          }
          if (staff.employmentStatus === "past") {
            return res.status(400).json({ message: "Cannot assign a past employee" });
          }
          complaint.assignedTo = assignedTo;
          if (complaint.status === "Pending") {
            complaint.status = "In Progress";
          }
        } else {
          complaint.assignedTo = null;
        }
      }
    }

    if (role === "staff") {
      if (!complaint.assignedTo || complaint.assignedTo.toString() !== userId) {
        return res.status(403).json({ message: "This complaint is not assigned to you" });
      }
      if (status) complaint.status = status;
    }

    await complaint.save();
    const updated = await populateComplaint(Complaint.findById(complaint._id));
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.comments.push({ user: req.user._id, text: text.trim() });
    await complaint.save();

    const updated = await populateComplaint(Complaint.findById(complaint._id));
    res.status(201).json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const isOwner = complaint.createdBy.toString() === req.user._id.toString();

    if (req.user.role !== "admin") {
      if (!isOwner) {
        return res.status(403).json({ message: "You cannot delete this complaint" });
      }
      if (complaint.status !== "Pending") {
        return res.status(400).json({ message: "Only pending complaints can be deleted" });
      }
    }

    await complaint.deleteOne();
    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getStats,
  getComplaintById,
  createComplaint,
  updateComplaint,
  addComment,
  deleteComplaint,
};
