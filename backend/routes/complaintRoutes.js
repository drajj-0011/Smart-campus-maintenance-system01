const express = require("express");
const router = express.Router();
const {
  getComplaints,
  getStats,
  getComplaintById,
  createComplaint,
  updateComplaint,
  addComment,
  deleteComplaint,
} = require("../controllers/complaintController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

// all complaint routes need login
router.use(protect);

router.get("/stats", getStats);
router.get("/", getComplaints);
router.post("/", allowRoles("student"), createComplaint);
router.get("/:id", getComplaintById);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);
router.post("/:id/comments", addComment);

module.exports = router;
