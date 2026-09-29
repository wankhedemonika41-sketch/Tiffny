import { NavLink, Outlet, useNavigate } from "react-router-dom";

import "./MessOwnerLayout.css";

function MessOwnerLayout() {
  const navigate = useNavigate();

  const ownerName =
    localStorage.getItem("tiffny_user_name") || "Mess Owner";

  const firstLetter = ownerName.charAt(0).toUpperCase();

  function handleLogout() {
    localStorage.removeItem("tiffny_token");
    localStorage.removeItem("tiffny_user_name");
    localStorage.removeItem("tiffny_user_role");

    navigate("/login");
  }

  function getNavClass({ isActive }) {
    return isActive
      ? "mess-owner-nav-link active"
      : "mess-owner-nav-link";
  }

  return (
    <div className="mess-owner-layout">

      {/* SIDEBAR */}

      <aside className="mess-owner-sidebar">

        <div className="mess-owner-brand">
          <div className="mess-owner-brand-mark">
            T
          </div>

          <span>tiffny</span>
        </div>

        <div className="mess-owner-user">

          <div className="mess-owner-avatar">
            {firstLetter}
          </div>

          <div>
            <strong>{ownerName}</strong>
            <span>Mess Owner</span>
          </div>

        </div>

        <nav className="mess-owner-navigation">

          <div className="mess-owner-nav-section">
            <p>DASHBOARD</p>

            <NavLink
              to="/mess/dashboard"
              className={getNavClass}
              end
            >
              <span className="nav-number">01</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/mess/profile"
              className={getNavClass}
            >
              <span className="nav-number">02</span>
              <span>Mess Profile</span>
            </NavLink>
          </div>


          <div className="mess-owner-nav-section">

            <p>MANAGEMENT</p>

            <NavLink
              to="/mess/menu"
              className={getNavClass}
            >
              <span className="nav-number">03</span>
              <span>Menu</span>
            </NavLink>

            <NavLink
              to="/mess/capacity"
              className={getNavClass}
            >
              <span className="nav-number">04</span>
              <span>Capacity</span>
            </NavLink>

            <NavLink
              to="/mess/monthly-price"
              className={getNavClass}
            >
              <span className="nav-number">05</span>
              <span>Monthly Price</span>
            </NavLink>

            <NavLink
              to="/mess/orders"
              className={getNavClass}
            >
              <span className="nav-number">06</span>
              <span>Orders</span>
            </NavLink>

            <NavLink
              to="/mess/reviews"
              className={getNavClass}
            >
              <span className="nav-number">07</span>
              <span>Reviews</span>
            </NavLink>

          </div>

        </nav>


        <button
          className="mess-owner-logout"
          onClick={handleLogout}
        >
          <span className="logout-arrow">↪</span>
          <span>Logout</span>
        </button>

      </aside>


      {/* RIGHT SIDE */}

      <main className="mess-owner-main">

        <Outlet />

      </main>

    </div>
  );
}

export default MessOwnerLayout;