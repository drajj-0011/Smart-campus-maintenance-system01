const express = require("express");
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getStaffWork, getNextEmployeeId } = require("../controllers/userController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

// only admin can manage users
router.use(protect, allowRoles("admin"));

router.get("/", getUsers);
router.get("/next-id", getNextEmployeeId);
router.post("/", createUser);
router.get("/:id/work", getStaffWork);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
