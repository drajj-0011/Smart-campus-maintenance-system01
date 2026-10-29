const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Smart Campus API is running...");
});

// api routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// error handling
app.use(notFound);
app.use(errorHandler);

// create a default admin if there is no admin in database
const createDefaultAdmin = async () => {
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    await User.create({
      name: "Admin",
      email: "admin@campus.edu",
      password: "admin123",
      role: "admin",
      employeeId: "EMP000",
      employmentStatus: "present",
    });
    console.log("Default admin created -> admin@campus.edu / admin123");
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();
  app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
  });
};

startServer();
