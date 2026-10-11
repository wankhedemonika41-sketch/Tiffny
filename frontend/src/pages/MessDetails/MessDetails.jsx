import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./MessDetails.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

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
    const token = sessionStorage.getItem("tiffny_token");

    /*
      Save the selected order so the selection
      is not lost if the student needs to login.
    */

    const pendingOrder = {
      messId: messId,
      planType: planType,
    };

    sessionStorage.setItem(
      "tiffny_pending_order",
      JSON.stringify(pendingOrder)
    );

    /*
      If student is already logged in,
      directly open the order page.
    */

    if (token) {
      navigate(
        `/student/order?messId=${messId}&planType=${planType}`
      );

      return;
    }

    /*
      If student is not logged in,
      send them to Login.
    */

    navigate("/login");
  }

  function getSortedMenu() {
    if (!mess?.menu || !Array.isArray(mess.menu)) {
      return [];
    }

    const menuMap = {};

    mess.menu.forEach((item) => {
      if (item?.day) {
        menuMap[item.day.toUpperCase()] = item;
      }
    });

    return DAYS.map((day) => {
      return (
        menuMap[day] || {
          day: day,
          lunch: null,
          dinner: null,
          holiday: false,
        }
      );
    });
  }

  function renderMeal(meal, mealType) {
    if (!meal) {
      return (
        <div className="weekly-meal-empty">
          <span className="weekly-meal-label">
            {mealType}
          </span>

          <p>
            {mealType === "LUNCH"
              ? "Lunch not added."
              : "Dinner not added."}
          </p>
        </div>
      );
    }

    return (
      <div className="weekly-meal-card">
        <div className="weekly-meal-header">
          <span className="weekly-meal-label">
            {mealType}
          </span>

          <strong className="weekly-meal-price">
            {formatPrice(meal.price)}
          </strong>
        </div>

        <h4>
          {meal.meal_name || "Meal"}
        </h4>

        <p className="weekly-meal-description">
          {meal.description ||
            "Freshly prepared meal."}
        </p>

        <div
          className={
            meal.available
              ? "weekly-meal-status available"
              : "weekly-meal-status unavailable"
          }
        >
          <span className="status-dot"></span>

          {meal.available
            ? "Available"
            : "Not available"}
        </div>
      </div>
    );
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
  const weeklyMenu = getSortedMenu();

  return (
    <div className="mess-details-page">

      {/* ========================================
          NAVBAR
      ======================================== */}

      <Navbar />


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
            WEEKLY MENU
        ======================================== */}

        <section className="details-menu-section">

          <div className="details-section-heading">

            <span>
              WEEKLY MENU
            </span>

            <h2>
              What this mess serves.
            </h2>

            <p>
              Explore the weekly lunch and dinner
              menu prepared by this mess.
            </p>

          </div>


          {weeklyMenu.length > 0 ? (

            <div className="weekly-menu-list">

              {weeklyMenu.map((dayMenu) => (

                <div
                  className="weekly-day-card"
                  key={dayMenu.day}
                >

                  {/* DAY HEADER */}

                  <div className="weekly-day-header">

                    <div>
                      <span>
                        DAY
                      </span>

                      <h3>
                        {dayMenu.day}
                      </h3>
                    </div>

                    {dayMenu.holiday && (
                      <div className="holiday-badge">
                        HOLIDAY
                      </div>
                    )}

                  </div>


                  {/* HOLIDAY */}

                  {dayMenu.holiday ? (

                    <div className="holiday-content">

                      <div className="holiday-icon">
                        —
                      </div>

                      <div>
                        <h4>
                          Mess Closed
                        </h4>

                        <p>
                          This mess is closed on
                          {` ${dayMenu.day.toLowerCase()}`}.
                        </p>
                      </div>

                    </div>

                  ) : (

                    <div className="weekly-meals-grid">

                      {renderMeal(
                        dayMenu.lunch,
                        "LUNCH"
                      )}

                      {renderMeal(
                        dayMenu.dinner,
                        "DINNER"
                      )}

                    </div>

                  )}

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
                the weekly menu yet.
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