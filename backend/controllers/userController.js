const User = require("../models/User");
const Complaint = require("../models/Complaint");

const DEPARTMENTS = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "IT", "MBA", "Other"];
const JOB_ROLES = [
  "Electrician",
  "Plumber",
  "Network Technician",
  "Housekeeping",
  "Carpenter",
  "Painter",
  "AC Technician",
  "Gardener",
  "Mason",
  "General",
];

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  employeeId: user.employeeId || "",
  jobRole: user.jobRole || "",
  employmentStatus: user.employmentStatus || "present",
  createdAt: user.createdAt,
});

const getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.employmentStatus) filter.employmentStatus = req.query.employmentStatus;

    const users = await User.find(filter).select("-password").sort({ employeeId: 1, createdAt: -1 }).lean();

    const ids = users.map((u) => u._id);
    const counts = ids.length
      ? await Complaint.aggregate([
          { $match: { assignedTo: { $in: ids } } },
          {
            $group: {
              _id: "$assignedTo",
              total: { $sum: 1 },
              resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
            },
          },
        ])
      : [];

    const map = {};
    counts.forEach((c) => {
      map[String(c._id)] = c;
    });

    res.json(
      users.map((u) => ({
        ...u,
        jobsTotal: map[String(u._id)]?.total || 0,
        jobsResolved: map[String(u._id)]?.resolved || 0,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const getNextEmployeeId = async (req, res, next) => {
  try {
    const users = await User.find({ employeeId: { $exists: true, $ne: "" } }).select("employeeId");
    let max = 0;
    users.forEach((u) => {
      const n = parseInt(String(u.employeeId).replace(/\D/g, ""), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    });
    const employeeId = "EMP" + String(max + 1).padStart(3, "0");
    res.json({ employeeId });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, employeeId, jobRole, employmentStatus } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!["student", "staff", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (department && !DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: "Please select a valid department" });
    }

    if (role === "staff" || role === "admin") {
      if (!employeeId || !String(employeeId).trim()) {
        return res.status(400).json({ message: "Employee ID is required for staff and admin" });
      }
    }
    if (role === "staff") {
      if (!jobRole || !JOB_ROLES.includes(jobRole)) {
        return res.status(400).json({ message: "Please select a job role (Electrician, Plumber, etc.)" });
      }
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (employeeId) {
      const idTaken = await User.findOne({ employeeId: String(employeeId).trim().toUpperCase() });
      if (idTaken) {
        return res.status(400).json({ message: "Employee ID already exists" });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: department || "",
      employeeId: role === "student" ? undefined : String(employeeId).trim().toUpperCase(),
      jobRole: role === "staff" ? jobRole : "",
      employmentStatus: employmentStatus === "past" ? "past" : "present",
    });

    res.status(201).json(publicUser(user));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.employmentStatus) {
      if (!["present", "past"].includes(req.body.employmentStatus)) {
        return res.status(400).json({ message: "Invalid employment status" });
      }
      if (user._id.toString() === req.user._id.toString() && req.body.employmentStatus === "past") {
        return res.status(400).json({ message: "You cannot mark your own account as past" });
      }
      user.employmentStatus = req.body.employmentStatus;

      // open jobs go back to pending; finished work stays under this employee id
      if (user.employmentStatus === "past" && user.role === "staff") {
        await Complaint.updateMany(
          { assignedTo: user._id, status: { $in: ["Pending", "In Progress"] } },
          { assignedTo: null, status: "Pending" }
        );
      }
    }

    if (req.body.department !== undefined) {
      if (req.body.department && !DEPARTMENTS.includes(req.body.department)) {
        return res.status(400).json({ message: "Please select a valid department" });
      }
      user.department = req.body.department || "";
    }
    if (req.body.jobRole !== undefined && user.role === "staff") {
      if (req.body.jobRole && !JOB_ROLES.includes(req.body.jobRole)) {
        return res.status(400).json({ message: "Invalid job role" });
      }
      user.jobRole = req.body.jobRole || "";
    }

    await user.save();
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const workCount = await Complaint.countDocuments({ assignedTo: user._id });
    if (workCount > 0) {
      return res.status(400).json({
        message: "This staff member has work in the database. Mark them as Past Employee instead of deleting, so their work history stays.",
      });
    }

    await user.deleteOne();
    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getStaffWork = async (req, res, next) => {
  try {
    const staff = await User.findById(req.params.id).select("-password");
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const work = await Complaint.find({ assignedTo: staff._id })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name employeeId jobRole employmentStatus")
      .sort({ updatedAt: -1 });

    const jobsResolved = work.filter((c) => c.status === "Resolved").length;
    res.json({
      staff: publicUser(staff),
      work,
      jobsTotal: work.length,
      jobsResolved,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getStaffWork, getNextEmployeeId };
