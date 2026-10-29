
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function createStaff() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const email = "staff@campus.edu";
    let staff = await User.findOne({ email });

    // Find an unused employee ID
    let employeeId = "";
    let number = 1;

    while (true) {
      const candidate = "STAFF" + String(number).padStart(3, "0");
      const existing = await User.findOne({ employeeId: candidate });

      if (!existing || (staff && existing._id.equals(staff._id))) {
        employeeId = candidate;
        break;
      }

      number++;
    }

    if (staff) {
      staff.name = "Campus Staff";
      staff.role = "staff";
      staff.department = "Other";
      staff.employeeId = employeeId;
      staff.jobRole = "General";
      staff.employmentStatus = "present";
      staff.password = "staff123";

      await staff.save();
      console.log("Existing account updated.");
    } else {
      staff = await User.create({
        name: "Campus Staff",
        email,
        password: "staff123",
        role: "staff",
        department: "Other",
        employeeId,
        jobRole: "General",
        employmentStatus: "present",
      });

      console.log("Staff account created.");
    }

    console.log("Email:", staff.email);
    console.log("Role:", staff.role);
    console.log("Employee ID:", staff.employeeId);
    console.log("Password: staff123");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createStaff();



