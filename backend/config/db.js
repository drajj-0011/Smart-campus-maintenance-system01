const mongoose = require("mongoose");

// connect to MongoDB using the URL from .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected: " + conn.connection.host);
  } catch (error) {
    console.log("MongoDB connection failed: " + error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
