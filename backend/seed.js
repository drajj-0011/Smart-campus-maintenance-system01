// run "npm run seed" to add sample data
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");
const Complaint = require("./models/Complaint");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await Complaint.deleteMany();

    const admin = await User.create({
      name: "Admin",
      email: "admin@campus.edu",
      password: "admin123",
      role: "admin",
      department: "CSE",
      employeeId: "EMP000",
      employmentStatus: "present",
    });

    // present staff
    const staff1 = await User.create({
      name: "Ravi Kumar",
      email: "staff@campus.edu",
      password: "staff123",
      role: "staff",
      department: "EEE",
      employeeId: "EMP001",
      jobRole: "Electrician",
      employmentStatus: "present",
    });
    const staff2 = await User.create({
      name: "Suresh",
      email: "suresh@campus.edu",
      password: "staff123",
      role: "staff",
      department: "Mechanical",
      employeeId: "EMP002",
      jobRole: "Plumber",
      employmentStatus: "present",
    });
    await User.create({
      name: "Anita",
      email: "anita@campus.edu",
      password: "staff123",
      role: "staff",
      department: "IT",
      employeeId: "EMP003",
      jobRole: "Network Technician",
      employmentStatus: "present",
    });
    await User.create({
      name: "Karthik",
      email: "karthik@campus.edu",
      password: "staff123",
      role: "staff",
      department: "Civil",
      employeeId: "EMP004",
      jobRole: "Carpenter",
      employmentStatus: "present",
    });
    await User.create({
      name: "Meena",
      email: "meena@campus.edu",
      password: "staff123",
      role: "staff",
      department: "Other",
      employeeId: "EMP005",
      jobRole: "Housekeeping",
      employmentStatus: "present",
    });

    // past employees (kept in database with their completed work)
    const past1 = await User.create({
      name: "Mohan Das",
      email: "mohan@campus.edu",
      password: "staff123",
      role: "staff",
      employeeId: "EMP010",
      jobRole: "Electrician",
      employmentStatus: "past",
    });
    const past2 = await User.create({
      name: "Lakshmi",
      email: "lakshmi@campus.edu",
      password: "staff123",
      role: "staff",
      employeeId: "EMP011",
      jobRole: "Housekeeping",
      employmentStatus: "past",
    });
    const past3 = await User.create({
      name: "Joseph",
      email: "joseph@campus.edu",
      password: "staff123",
      role: "staff",
      employeeId: "EMP012",
      jobRole: "Plumber",
      employmentStatus: "past",
    });

    const student = await User.create({
      name: "Priya Sharma",
      email: "student@campus.edu",
      password: "student123",
      role: "student",
      department: "CSE",
      employmentStatus: "present",
    });

    await Complaint.create([
      {
        title: "Fan not working",
        description: "The ceiling fan in classroom 204 is not working since Monday.",
        category: "Electrical",
        block: "Block A",
        roomNumber: "204",
        status: "In Progress",
        createdBy: student._id,
        assignedTo: staff1._id,
        comments: [{ user: admin._id, text: "Assigned to Ravi (EMP001 - Electrician)." }],
      },
      {
        title: "WiFi not working",
        description: "No internet connection in the computer lab.",
        category: "Network",
        block: "Block B",
        roomNumber: "112",
        createdBy: student._id,
      },
      {
        title: "Water leakage in washroom",
        description: "Tap is leaking continuously in the washroom.",
        category: "Plumbing",
        block: "Block C",
        roomNumber: "G02",
        status: "Resolved",
        createdBy: student._id,
        assignedTo: staff2._id,
      },
      {
        title: "Corridor lights replaced",
        description: "All fused tube lights in Block D corridor were replaced.",
        category: "Electrical",
        block: "Block D",
        roomNumber: "101",
        status: "Resolved",
        createdBy: student._id,
        assignedTo: past1._id,
        comments: [{ user: admin._id, text: "Completed by Mohan Das (EMP010) before he left." }],
      },
      {
        title: "Hostel cleaning drive",
        description: "Full cleaning of Block B hostel rooms completed last semester.",
        category: "Cleaning",
        block: "Block B",
        roomNumber: "210",
        status: "Resolved",
        createdBy: student._id,
        assignedTo: past2._id,
      },
      {
        title: "Main tank pipe repaired",
        description: "Broken pipe near the overhead tank was repaired.",
        category: "Plumbing",
        block: "Block A",
        roomNumber: "001",
        status: "Resolved",
        createdBy: student._id,
        assignedTo: past3._id,
      },
    ]);

    console.log("Sample data added successfully!");
    console.log("Admin   : admin@campus.edu / admin123");
    console.log("Staff   : staff@campus.edu / staff123  (EMP001 Electrician)");
    console.log("Student : student@campus.edu / student123");
    console.log("Past employees are in DB: EMP010, EMP011, EMP012 (cannot login)");
    process.exit();
  } catch (error) {
    console.log("Seeding failed: " + error.message);
    process.exit(1);
  }
};

seedData();
