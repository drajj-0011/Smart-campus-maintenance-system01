import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ComplaintForm from "./pages/ComplaintForm";
import ComplaintDetails from "./pages/ComplaintDetails";
import ManageStaff from "./pages/ManageStaff";

function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <div className={user ? "container" : ""}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetails /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute roles={["student"]}><ComplaintForm /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute roles={["student"]}><ComplaintForm /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute roles={["admin"]}><ManageStaff /></ProtectedRoute>} />
          <Route path="/users" element={<Navigate to="/staff" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
