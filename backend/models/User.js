const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["student", "staff", "admin"],
      default: "student",
    },
    department: {
      type: String,
      enum: ["", ...DEPARTMENTS],
      default: "",
    },
    // staff / admin only
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    // plumber, electrician, etc. (staff only)
    jobRole: {
      type: String,
      enum: ["", ...JOB_ROLES],
      default: "",
    },
    // present staff vs past employees (kept in database)
    employmentStatus: {
      type: String,
      enum: ["present", "past"],
      default: "present",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
module.exports.DEPARTMENTS = DEPARTMENTS;
module.exports.JOB_ROLES = JOB_ROLES;
