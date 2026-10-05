import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./MessDashboard.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function MessDashboard() {
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [mess, setMess] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD OWNER AND MESS INFORMATION
  // =========================================================

  useEffect(() => {
    async function loadDashboard() {
      const token = sessionStorage.getItem("tiffny_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        // =====================================================
        // GET OWNER PROFILE
        // =====================================================

        const ownerResponse = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const ownerResult = await ownerResponse.json();

        if (!ownerResponse.ok) {
          throw new Error(
            ownerResult.detail ||
              "Failed to load owner information."
          );
        }

        setOwner(ownerResult);

        // =====================================================
        // GET MESS PROFILE
        // =====================================================

        const messResponse = await fetch(
          `${API_BASE_URL}/mess/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const messResult = await messResponse.json();

        if (!messResponse.ok) {
          throw new Error(
            messResult.detail ||
              "Failed to load mess profile."
          );
        }

        setMess(messResult);
      } catch (error) {
        console.error(
          "Mess dashboard error:",
          error
        );

        setError(
          error.message ||
            "Something went wrong while loading the dashboard."
        );

        const message =
          error.message?.toLowerCase() || "";

        if (
          message.includes("token") ||
          message.includes("authentication") ||
          message.includes("unauthorized")
        ) {
          sessionStorage.removeItem("tiffny_token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  // =========================================================
  // NAVIGATION
  // =========================================================

  function handleProfile() {
    navigate("/mess/profile");
  }

  function handleMenu() {
    navigate("/mess/menu");
  }

  function handleCapacity() {
    navigate("/mess/capacity");
  }

  function handleMonthlyPrice() {
    navigate("/mess/monthly-price");
  }

  function handleOrders() {
    navigate("/mess/orders");
  }

  function handleReviews() {
    navigate("/mess/reviews");
  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  function getStatusClass(status) {
    if (!status) {
      return "status-pending";
    }

    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === "APPROVED") {
      return "status-approved";
    }

    if (normalizedStatus === "REJECTED") {
      return "status-rejected";
    }

    return "status-pending";
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="mess-dashboard-loading">
        <div className="mess-dashboard-loader"></div>

        <h2>Loading your dashboard</h2>

        <p>
          Please wait while we load your mess information.
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="mess-dashboard-error-page">
        <div className="mess-dashboard-error-card">
          <div className="mess-dashboard-error-symbol">
            !
          </div>

          <h2>
            Unable to load dashboard
          </h2>

          <p>{error}</p>

          <div className="mess-dashboard-error-actions">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="dashboard-primary-button"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(
                  "tiffny_token"
                );
                navigate("/login");
              }}
              className="dashboard-secondary-button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="mess-dashboard-page">

      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <header className="mess-dashboard-topbar">

        <div className="dashboard-header-content">
          <span className="dashboard-small-label">
            MESS OWNER DASHBOARD
          </span>

          <h1>
            Welcome,{" "}
            <span>
              {owner?.name || "Owner"}
            </span>
          </h1>

          <p>
            Manage your mess and keep track of your
            verification status.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-top-profile"
          onClick={handleProfile}
        >
          <div className="dashboard-top-avatar">
            {owner?.name
              ? owner.name
                  .charAt(0)
                  .toUpperCase()
              : "M"}
          </div>

          <div className="dashboard-top-profile-info">
            <strong>
              {owner?.name || "Mess Owner"}
            </strong>

            <span>
              View Profile
            </span>
          </div>
        </button>

      </header>


      {/* =====================================================
          VERIFICATION STATUS
      ====================================================== */}

      <section className="mess-verification-banner">

        <div className="mess-verification-left">

          <div className="mess-verification-icon">
            {mess?.status === "APPROVED"
              ? "✓"
              : mess?.status === "REJECTED"
                ? "!"
                : "i"}
          </div>

          <div className="mess-verification-content">

            <span className="verification-label">
              VERIFICATION STATUS
            </span>

            <h2>
              Your mess is{" "}
              <span>
                {mess?.status || "PENDING"}
              </span>
            </h2>

            <p>
              {mess?.status === "APPROVED"
                ? "Your mess has been approved and can now be available to students."
                : mess?.status === "REJECTED"
                  ? "Your mess profile was rejected by the admin. Please review your information."
                  : "Your mess profile has been submitted and is waiting for admin verification."}
            </p>

          </div>

        </div>

        <div
          className={`mess-status-badge ${getStatusClass(
            mess?.status
          )}`}
        >
          {mess?.status || "PENDING"}
        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="mess-dashboard-stats">

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">
            RATING
          </span>

          <strong>
            {mess?.rating ?? 0}
          </strong>

          <p>
            From {mess?.total_reviews ?? 0} reviews
          </p>
        </div>


        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">
            MONTHLY PRICE
          </span>

          <strong>
            {mess?.monthly_price
              ? `₹${mess.monthly_price}`
              : "Not set"}
          </strong>

          <p>
            Monthly meal plan
          </p>
        </div>


        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">
            CAPACITY
          </span>

          <strong>
            {mess?.max_capacity ?? "Not set"}
          </strong>

          <p>
            Maximum students
          </p>
        </div>


        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">
            ACCOUNT
          </span>

          <strong>
            {owner?.role === "MESS_OWNER"
              ? "OWNER"
              : "USER"}
          </strong>

          <p>
            Tiffny account
          </p>
        </div>

      </section>


      {/* =====================================================
          PROFILE + QUICK ACTIONS
      ====================================================== */}

      <section className="mess-dashboard-content-grid">

        {/* ===================================================
            MESS PROFILE
        ==================================================== */}

        <div className="mess-dashboard-profile-card">

          <div className="dashboard-card-heading">

            <div>
              <span>
                MESS PROFILE
              </span>

              <h2>
                {mess?.mess_name || "Your Mess"}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleProfile}
              className="dashboard-edit-button"
            >
              Edit Profile
            </button>

          </div>


          {/* MESS IMAGE */}

          <div className="dashboard-mess-image-wrapper">

            {mess?.photo ? (
              <img
                src={`${API_BASE_URL}${mess.photo}`}
                alt={mess.mess_name}
                className="dashboard-mess-image"
              />
            ) : (
              <div className="dashboard-no-image">
                <span>T</span>

                <p>
                  No mess image available
                </p>
              </div>
            )}

          </div>


          {/* DETAILS */}

          <div className="dashboard-profile-details">

            <div className="dashboard-detail">
              <span>
                PHONE
              </span>

              <strong>
                {mess?.phone || "Not available"}
              </strong>
            </div>


            <div className="dashboard-detail">
              <span>
                LOCATION
              </span>

              <strong>
                {mess?.location || "Not available"}
              </strong>
            </div>


            <div className="dashboard-detail dashboard-detail-full">
              <span>
                ADDRESS
              </span>

              <strong>
                {mess?.address || "Not available"}
              </strong>
            </div>


            <div className="dashboard-detail dashboard-detail-full">
              <span>
                DESCRIPTION
              </span>

              <p>
                {mess?.description ||
                  "No description added yet."}
              </p>
            </div>

          </div>

        </div>


        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <div className="mess-dashboard-actions-card">

          <div className="dashboard-card-heading">

            <div>
              <span>
                QUICK ACTIONS
              </span>

              <h2>
                Manage your mess
              </h2>
            </div>

          </div>


          <div className="dashboard-action-list">

            <button
              type="button"
              className="dashboard-action"
              onClick={handleProfile}
            >
              <div className="dashboard-action-number">
                01
              </div>

              <div className="dashboard-action-text">
                <strong>
                  Edit Mess Profile
                </strong>

                <span>
                  Update your mess information
                </span>
              </div>

              <span className="dashboard-action-arrow">
                →
              </span>
            </button>


            <button
              type="button"
              className="dashboard-action"
              onClick={handleMenu}
            >
              <div className="dashboard-action-number">
                02
              </div>

              <div className="dashboard-action-text">
                <strong>
                  Manage Menu
                </strong>

                <span>
                  Add and update your meals
                </span>
              </div>

              <span className="dashboard-action-arrow">
                →
              </span>
            </button>


            <button
              type="button"
              className="dashboard-action"
              onClick={handleOrders}
            >
              <div className="dashboard-action-number">
                03
              </div>

              <div className="dashboard-action-text">
                <strong>
                  View Orders
                </strong>

                <span>
                  Manage student orders
                </span>
              </div>

              <span className="dashboard-action-arrow">
                →
              </span>
            </button>


            <button
              type="button"
              className="dashboard-action"
              onClick={handleReviews}
            >
              <div className="dashboard-action-number">
                04
              </div>

              <div className="dashboard-action-text">
                <strong>
                  View Reviews
                </strong>

                <span>
                  See student feedback
                </span>
              </div>

              <span className="dashboard-action-arrow">
                →
              </span>
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          PENDING INFORMATION
      ====================================================== */}

      {mess?.status === "PENDING" && (
        <section className="dashboard-pending-section">

          <div className="dashboard-pending-number">
            01
          </div>

          <div>
            <span>
              ADMIN REVIEW
            </span>

            <h2>
              Your mess is waiting for verification
            </h2>

            <p>
              Our admin team will review your mess
              information and verification proof.
              Once approved, your mess can become
              available to students on Tiffny.
            </p>
          </div>

        </section>
      )}

    </div>
  );
}

export default MessDashboard;