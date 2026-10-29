import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo"><span className="logo-mark">SC</span> Smart Campus</div>

      <div className="nav-links">
        <NavLink to="/" end>Dashboard</NavLink>
        {user.role === "student" && <NavLink to="/add">+ New Complaint</NavLink>}
        {user.role === "admin" && <NavLink to="/staff">Manage Staff</NavLink>}
      </div>

      <div className="nav-user">
        <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
        <span>
          {user.name} <small className={"role-tag " + user.role}>{user.role}</small>
        </span>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
