// runs when no route matches
const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found - " + req.originalUrl });
};

// common error handler for the whole app
const errorHandler = (err, req, res, next) => {
  console.log("Error:", err.message);

  // mongoose validation error (example: required field missing)
  if (err.name === "ValidationError") {
    const firstError = Object.values(err.errors)[0].message;
    return res.status(400).json({ message: firstError });
  }

  // wrong MongoDB id format
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  // duplicate email
  if (err.code === 11000) {
    return res.status(400).json({ message: "Email already exists" });
  }

  res.status(500).json({ message: "Server error, please try again" });
};

module.exports = { notFound, errorHandler };
