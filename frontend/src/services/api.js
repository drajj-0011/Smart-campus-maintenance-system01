import axios from "axios";

// all requests go to /api (vite proxy sends them to backend)
const API = axios.create({
  baseURL: "/api",
});

// add token to every request if user is logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// get a readable error message
export const getError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return "Cannot connect to server. Is the backend running?";
};

// ---------- Auth ----------
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

// ---------- Complaints ----------
export const getComplaints = (params) => API.get("/complaints", { params });
export const getStats = () => API.get("/complaints/stats");
export const getComplaint = (id) => API.get("/complaints/" + id);
export const createComplaint = (data) => API.post("/complaints", data);
export const updateComplaint = (id, data) => API.put("/complaints/" + id, data);
export const deleteComplaint = (id) => API.delete("/complaints/" + id);
export const addComment = (id, text) => API.post("/complaints/" + id + "/comments", { text });

// ---------- Users (admin) ----------
export const getUsers = (params) => API.get("/users", { params });
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put("/users/" + id, data);
export const deleteUser = (id) => API.delete("/users/" + id);
export const getStaffWork = (id) => API.get("/users/" + id + "/work");
export const getNextEmployeeId = () => API.get("/users/next-id");
