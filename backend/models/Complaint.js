const mongoose = require("mongoose");

const BLOCKS = ["Block A", "Block B", "Block C", "Block D"];

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: ["Electrical", "Plumbing", "Network", "Cleaning", "Furniture", "Other"],
      required: [true, "Category is required"],
    },
    block: {
      type: String,
      enum: BLOCKS,
      required: [true, "Block is required"],
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    // saved as "Block A - Room 204" for easy display
    location: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

complaintSchema.pre("save", function (next) {
  if (this.block && this.roomNumber) {
    this.location = this.block + " - Room " + this.roomNumber;
  }
  next();
});

module.exports = mongoose.model("Complaint", complaintSchema);
module.exports.BLOCKS = BLOCKS;
