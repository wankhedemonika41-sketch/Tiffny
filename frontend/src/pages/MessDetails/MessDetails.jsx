import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./MessDetails.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function MessDetails() {
  const navigate = useNavigate();
  const { messId } = useParams();

  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMessDetails();
  }, [messId]);

  async function fetchMessDetails() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/mess/public/${messId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load mess details."
        );
      }

      setMess(data);

    } catch (error) {
      console.error(
        "Mess details loading error:",
        error
      );

      setError(error.message);

    } finally {
      setLoading(false);
    }
  }


  function getPhotoUrl(photo) {
    if (!photo) {
      return null;
    }

    if (photo.startsWith("http")) {
      return photo;
    }

    return `${API_BASE_URL}${photo}`;
  }


  function formatPrice(price) {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "Not set";
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  }


  function handleOrder(planType) {

    /*
      For now we send the student to Login.

      Later we will check the student token
      and directly open the booking page.
    */

    localStorage.setItem(
      "tiffny_pending_order",
      JSON.stringify({
        messId: messId,
        planType: planType
      })
    );

    navigate("/login");
  }


  if (loading) {
    return (
      <div className="mess-details-page">

        <div className="mess-details-loading">
          Loading mess details...
        </div>

      </div>
    );
  }


  if (error) {
    return (
      <div className="mess-details-page">

        <div className="mess-details-error">

          <h2>
            Unable to load mess
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={() => navigate("/messes")}
          >
            Back to Messes
          </button>

        </div>

      </div>
    );
  }


  if (!mess) {
    return null;
  }


  const photoUrl = getPhotoUrl(mess.photo);


  return (
    <div className="mess-details-page">


      {/* ========================================
          NAVBAR
      ======================================== */}

      <header className="details-navbar">

        <div
          className="details-brand"
          onClick={() => navigate("/")}
        >

          <div className="details-brand-mark">
            T
          </div>

          <span>
            tiffny
          </span>

        </div>


        <nav className="details-nav-links">

          <button
            className="details-nav-link"
            onClick={() => navigate("/messes")}
          >
            Messes
          </button>

          <button
            className="details-nav-link"
            onClick={() =>
              navigate("/#how-it-works")
            }
          >
            How It Works
          </button>

          <button
            className="details-nav-link"
            onClick={() =>
              navigate("/#about")
            }
          >
            About
          </button>

          <button
            className="details-nav-link"
            onClick={() =>
              navigate("/#contact")
            }
          >
            Contact
          </button>

        </nav>


        <button
          className="details-login-button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

      </header>


      {/* ========================================
          MAIN
      ======================================== */}

      <main className="mess-details-container">


        {/* BACK BUTTON */}

        <button
          className="back-to-messes"
          onClick={() => navigate("/messes")}
        >
          ← Back to Messes
        </button>


        {/* ========================================
            MESS HERO
        ======================================== */}

        <section className="mess-details-hero">


          {/* PHOTO */}

          <div className="details-image">

            {photoUrl ? (

              <img
                src={photoUrl}
                alt={mess.mess_name}
              />

            ) : (

              <div className="details-image-placeholder">

                <span>
                  {mess.mess_name
                    ?.charAt(0)
                    ?.toUpperCase() || "M"}
                </span>

              </div>

            )}

          </div>


          {/* INFORMATION */}

          <div className="details-main-info">

            <div className="approved-details-badge">
              APPROVED MESS
            </div>


            <h1>
              {mess.mess_name}
            </h1>


            <div className="details-rating">

              <span>
                ★
              </span>

              <strong>
                {Number(
                  mess.rating || 0
                ).toFixed(1)}
              </strong>

              <small>
                ({mess.total_reviews || 0} reviews)
              </small>

            </div>


            <p className="details-description">

              {mess.description ||
                "Fresh and home-style meals prepared for students."}

            </p>


            <div className="details-location">

              <span>
                LOCATION
              </span>

              <strong>
                {mess.location ||
                  mess.address ||
                  "Location not available"}
              </strong>

            </div>


            {mess.address && (
              <div className="details-address">

                <span>
                  ADDRESS
                </span>

                <strong>
                  {mess.address}
                </strong>

              </div>
            )}

          </div>

        </section>


        {/* ========================================
            MEAL PLANS
        ======================================== */}

        <section className="meal-plans-section">

          <div className="details-section-heading">

            <span>
              MEAL PLANS
            </span>

            <h2>
              Choose what works for you.
            </h2>

            <p>
              Select a one-time meal or choose
              a monthly plan.
            </p>

          </div>


          <div className="meal-plans-grid">


            {/* ONE TIME */}

            <div className="meal-plan-card">

              <div className="meal-plan-top">

                <span>
                  ONE-TIME MEAL
                </span>

                <strong>
                  {formatPrice(
                    mess.one_time_price
                  )}
                </strong>

              </div>


              <p>
                Perfect when you need a meal
                for a single day.
              </p>


              <button
                className="order-button"
                onClick={() =>
                  handleOrder("ONE_TIME")
                }
              >
                Order One-Time Meal
                <span>
                  →
                </span>
              </button>

            </div>


            {/* MONTHLY */}

            <div className="meal-plan-card featured">

              <div className="plan-featured-label">
                MONTHLY PLAN
              </div>


              <div className="meal-plan-top">

                <span>
                  MONTHLY MEAL PLAN
                </span>

                <strong>
                  {formatPrice(
                    mess.monthly_price
                  )}
                </strong>

              </div>


              <p>
                A convenient option for
                your everyday meal routine.
              </p>


              <button
                className="order-button"
                onClick={() =>
                  handleOrder("MONTHLY")
                }
              >
                Choose Monthly Plan
                <span>
                  →
                </span>
              </button>

            </div>

          </div>

        </section>


        {/* ========================================
            MENU
        ======================================== */}

        <section className="details-menu-section">

          <div className="details-section-heading">

            <span>
              MENU
            </span>

            <h2>
              What this mess serves.
            </h2>

            <p>
              Explore the meals currently
              available from this mess.
            </p>

          </div>


          {mess.menu &&
          mess.menu.length > 0 ? (

            <div className="details-menu-grid">

              {mess.menu.map((item) => (

                <div
                  className="details-menu-card"
                  key={item._id}
                >

                  <div className="menu-card-number">
                    +
                  </div>


                  <div>

                    <h3>
                      {item.meal_name ||
                        item.name ||
                        "Meal"}
                    </h3>

                    <p>
                      {item.description ||
                        "Freshly prepared meal"}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="no-menu">

              <h3>
                Menu not available yet
              </h3>

              <p>
                The mess owner has not added
                menu items yet.
              </p>

            </div>

          )}

        </section>


        {/* ========================================
            CAPACITY
        ======================================== */}

        {mess.max_capacity && (

          <section className="capacity-section">

            <div>

              <span>
                MESS CAPACITY
              </span>

              <h2>
                Serving students comfortably.
              </h2>

            </div>


            <div className="capacity-number">

              <strong>
                {mess.max_capacity}
              </strong>

              <span>
                students
              </span>

            </div>

          </section>

        )}

      </main>


      {/* ========================================
          FOOTER
      ======================================== */}

      <footer className="details-footer">

        <div>

          <div className="details-brand">

            <div className="details-brand-mark">
              T
            </div>

            <span>
              tiffny
            </span>

          </div>

          <p>
            Simple meals. Better routine.
          </p>

        </div>


        <div className="details-footer-bottom">

          <span>
            © 2026 Tiffny
          </span>

          <span>
            Student & Mess Platform
          </span>

        </div>

      </footer>

    </div>
  );
}

export default MessDetails;