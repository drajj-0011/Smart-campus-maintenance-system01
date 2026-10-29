const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const userData = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    employeeId: user.employeeId || "",
    jobRole: user.jobRole || "",
    employmentStatus: user.employmentStatus || "present",
  };
};

const emailRegex = /^\S+@\S+\.\S+$/;
const DEPARTMENTS = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "IT", "MBA", "Other"];

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (department && !DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: "Please select a valid department" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      department: department || "",
      role: "student",
      employmentStatus: "present",
    });

    res.status(201).json({ token: generateToken(user._id), user: userData(user) });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.employmentStatus === "past") {
      return res.status(403).json({ message: "This account is no longer active. Contact admin." });
    }

    res.json({ token: generateToken(user._id), user: userData(user) });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  res.json(userData(req.user));
};

module.exports = { registerUser, loginUser, getProfile };
