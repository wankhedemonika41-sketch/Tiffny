import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Navbar.css";

function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(sessionStorage.getItem("tiffny_token"))
  );

  const [userName, setUserName] = useState(
    sessionStorage.getItem("tiffny_user_name") || ""
  );

  const [userRole, setUserRole] = useState(
    sessionStorage.getItem("tiffny_user_role") || ""
  );

  const [showDropdown, setShowDropdown] = useState(false);


  // ==========================================
  // LOGOUT
  // ==========================================

  function handleLogout() {

    // Remove saved login information
    sessionStorage.removeItem("tiffny_token");
    sessionStorage.removeItem("tiffny_user_id");
    sessionStorage.removeItem("tiffny_user_name");
    sessionStorage.removeItem("tiffny_user_role");

    // Update Navbar immediately
    setIsLoggedIn(false);
    setUserName("");
    setUserRole("");

    setShowDropdown(false);

    // Go to home page
    navigate("/");
  }


  // ==========================================
  // DASHBOARD
  // ==========================================

  function handleDashboardClick() {

    setShowDropdown(false);

    if (userRole === "STUDENT") {

      navigate("/student/dashboard");

    } else if (userRole === "MESS_OWNER") {

      navigate("/mess/dashboard");

    } else if (userRole === "ADMIN") {

      navigate("/admin/dashboard");

    }
  }


  // ==========================================
  // PROFILE
  // ==========================================

  function handleProfileClick() {

    setShowDropdown(false);

    if (userRole === "STUDENT") {

      navigate("/student/profile");

    } else if (userRole === "MESS_OWNER") {

      navigate("/mess/profile");

    } else if (userRole === "ADMIN") {

      navigate("/admin/dashboard");

    }
  }


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <header className="navbar">

      {/* ======================================
          BRAND
      ======================================= */}

      <Link
        to="/"
        className="navbar-brand"
      >

        <div className="brand-mark">
          T
        </div>

        <span className="brand-name">
          tiffny
        </span>

      </Link>


      {/* ======================================
          NAVIGATION
      ======================================= */}

      <nav className="nav-links">

        <Link
          to="/messes"
          className={
            location.pathname.startsWith("/messes")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Messes
        </Link>


        <a
          href="/#how-it-works"
          className="nav-link"
        >
          How It Works
        </a>


        <a
          href="/#about"
          className="nav-link"
        >
          About
        </a>


        <a
          href="/#contact"
          className="nav-link"
        >
          Contact
        </a>

      </nav>


      {/* ======================================
          RIGHT SIDE
      ======================================= */}

      <div className="navbar-right">

        {!isLoggedIn ? (

          /* ==================================
             USER NOT LOGGED IN
          ================================== */

          <button
            className="nav-login-button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        ) : (

          /* ==================================
             USER LOGGED IN
          ================================== */

          <div className="navbar-user">

            <button
              className="navbar-user-button"
              onClick={() =>
                setShowDropdown(
                  (previous) => !previous
                )
              }
            >

              <span className="welcome-text">
                Welcome, {userName}
              </span>

              <span
                className={
                  showDropdown
                    ? "dropdown-arrow rotated"
                    : "dropdown-arrow"
                }
              >
                ▼
              </span>

            </button>


            {/* =================================
                DROPDOWN
            ================================== */}

            {showDropdown && (

              <div className="user-dropdown">

                {/* STUDENT OPTIONS */}

                {userRole === "STUDENT" && (
                  <>

                    <button
                      onClick={handleDashboardClick}
                    >
                      Dashboard
                    </button>


                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/student/orders");
                      }}
                    >
                      My Orders
                    </button>


                    <button
                      onClick={handleProfileClick}
                    >
                      My Profile
                    </button>


                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/student/reviews");
                      }}
                    >
                      My Reviews
                    </button>

                  </>
                )}


                {/* MESS OWNER OPTIONS */}

                {userRole === "MESS_OWNER" && (
                  <>

                    <button
                      onClick={handleDashboardClick}
                    >
                      Dashboard
                    </button>


                    <button
                      onClick={handleProfileClick}
                    >
                      My Profile
                    </button>


                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/mess/menu");
                      }}
                    >
                      Menu
                    </button>


                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/mess/orders");
                      }}
                    >
                      Orders
                    </button>


                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/mess/reviews");
                      }}
                    >
                      Reviews
                    </button>

                  </>
                )}


                {/* ADMIN OPTIONS */}

                {userRole === "ADMIN" && (

                  <button
                    onClick={handleDashboardClick}
                  >
                    Dashboard
                  </button>

                )}


                {/* DIVIDER */}

                <div className="dropdown-divider"></div>


                {/* LOGOUT */}

                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>

            )}

          </div>

        )}

      </div>

    </header>
  );
}

export default Navbar;