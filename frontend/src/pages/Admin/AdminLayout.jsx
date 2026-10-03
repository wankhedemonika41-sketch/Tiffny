import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

// sidebar links (same routes as before)
const navLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/pending-messes", label: "Pending Messes" },
  { to: "/admin/approved-messes", label: "Approved Messes" },
  { to: "/admin/rejected-messes", label: "Rejected Messes" },
  { to: "/admin/suspended-messes", label: "Suspended Messes" },
];

// every place the login token could have been saved
const tokenKeys = [
  "access_token",
  "token",
  "accessToken",
  "jwt",
  "authToken",
  "tiffny_token",
  "tiffnyToken",
];

function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    tokenKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    navigate("/login");
  }

  return (
    <div className="admin-layout">
      {/* sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">T</div>

          <div>
            <h2>tiffny</h2>
            <span>Admin</span>
          </div>
        </div>

        <nav className="admin-navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-admin-info">
            <div className="admin-profile-circle">A</div>

            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* main area */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <h1>Management Console</h1>

          <div className="admin-security-status">
            <span className="admin-status-dot"></span>
            <span>Admin Access</span>
          </div>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;