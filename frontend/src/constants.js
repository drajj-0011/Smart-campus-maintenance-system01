export const CATEGORIES = ["Electrical", "Plumbing", "Network", "Cleaning", "Furniture", "Other"];
export const BLOCKS = ["Block A", "Block B", "Block C", "Block D"];
export const DEPARTMENTS = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "IT", "MBA", "Other"];
export const JOB_ROLES = [
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

export const formatPlace = (c) => {
  if (c.block && c.roomNumber) return c.block + " - Room " + c.roomNumber;
  return c.location || "-";
};
