
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import "./StudentOrder.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function StudentOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [planType, setPlanType] = useState("");
  const [mealSlot, setMealSlot] = useState("LUNCH");
  const [orderMode, setOrderMode] = useState("EAT_AT_MESS");
  const [locationValue, setLocationValue] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, []);

  async function loadOrderDetails() {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("tiffny_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const params = new URLSearchParams(location.search);
      const messId = params.get("messId");
      const selectedPlan = params.get("planType");

      if (!messId || !selectedPlan) {
        setError("Order information is missing.");
        return;
      }

      let backendPlanType = selectedPlan;

      if (selectedPlan === "ONE_TIME") {
        backendPlanType = "ONE_DAY";
      }

      if (
        backendPlanType !== "ONE_DAY" &&
        backendPlanType !== "MONTHLY"
      ) {
        setError("Invalid meal plan selected.");
        return;
      }

      setPlanType(backendPlanType);

      if (backendPlanType === "MONTHLY") {
        setMealSlot("");
      } else {
        setMealSlot("LUNCH");
      }

      const response = await fetch(
        `${API_BASE_URL}/mess/public/${messId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load mess information."
        );
      }

      setMess(data);

      // Prefill the delivery address if one was saved.
      // The student can edit it before placing a Tiffin order.
      const savedLocation =
        sessionStorage.getItem("tiffny_user_location") || "";

      setLocationValue(savedLocation);
    } catch (error) {
      console.error("Order page error:", error);
      setError(error.message || "Unable to load order details.");
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
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  }

  function formatOrderStatus(status) {
    if (status === "PENDING_OWNER_APPROVAL") {
      return "Waiting for Mess Owner Approval";
    }

    if (status === "PENDING_PAYMENT") {
      return "Accepted — Payment Pending";
    }

    if (status === "CONFIRMED") {
      return "Order Accepted";
    }

    if (status === "CANCELLED") {
      return "Order Cancelled";
    }

    if (status === "COMPLETED") {
      return "Order Completed";
    }

    return status || "Unknown";
  }

  async function handleConfirmOrder() {
    try {
      setSubmitting(true);
      setError("");

      const token = sessionStorage.getItem("tiffny_token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!mess?.mess_id) {
        setError("Mess information is missing.");
        return;
      }

      // One-day orders must have Lunch or Dinner.
      if (
        planType === "ONE_DAY" &&
        mealSlot !== "LUNCH" &&
        mealSlot !== "DINNER"
      ) {
        setError("Please select Lunch or Dinner.");
        return;
      }

      // Tiffin orders require the student's delivery address.
      if (orderMode === "TIFFIN" && !locationValue.trim()) {
        setError(
          "Please enter your delivery address for the tiffin order."
        );
        return;
      }

      const orderData = {
        mess_id: mess.mess_id,
        plan_type: planType,
        meal_slot: planType === "ONE_DAY" ? mealSlot : null,
        meal_mode: orderMode,
        location:
          orderMode === "TIFFIN" ? locationValue.trim() : null,
      };

      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to create order.");
      }

      setOrderSuccess(data);
    } catch (error) {
      console.error("Order creation error:", error);
      setError(error.message || "Unable to create order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="student-order-page">
        <Navbar />
        <div className="student-order-loading">
          Loading your order...
        </div>
      </div>
    );
  }

  if (error && !orderSuccess && !mess) {
    return (
      <div className="student-order-page">
        <Navbar />

        <div className="student-order-error">
          <h2>Unable to continue</h2>
          <p>{error}</p>

          <button onClick={() => navigate("/messes")}>
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

  // ======================================================
  // ORDER SUCCESS
  // ======================================================

  if (orderSuccess) {
    const isMonthly = orderSuccess.plan_type === "MONTHLY";
    const isTiffin = orderSuccess.meal_mode === "TIFFIN";

    return (
      <div className="student-order-page">
        <Navbar />

        <main className="student-order-container">
          <section className="order-header">
            <span>ORDER PLACED</span>

            <h1>Your order has been placed.</h1>

            <p>
              Your order is waiting for mess owner approval.
            </p>
          </section>

          <div className="order-card">
            <div className="order-card-title">
              <span>ORDER DETAILS</span>
              <h2>{orderSuccess.meal_name}</h2>
            </div>

            <div className="selected-plan">
              <div>
                <strong>
                  {isMonthly ? "Monthly Meal Plan" : "One-Day Meal"}
                </strong>

                <p>
                  {isMonthly
                    ? `${orderSuccess.day} • Lunch + Dinner`
                    : `${orderSuccess.day} • ${orderSuccess.meal_slot}`}
                </p>
              </div>

              <strong className="plan-price">
                {formatPrice(orderSuccess.price)}
              </strong>
            </div>

            <div className="summary-row">
              <span>Meal</span>

              <strong>
                {isMonthly
                  ? "Lunch + Dinner"
                  : orderSuccess.meal_slot === "LUNCH"
                    ? "Lunch"
                    : "Dinner"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Meal Mode</span>

              <strong>{isTiffin ? "Tiffin" : "Eat at Mess"}</strong>
            </div>

            {orderSuccess.location && (
              <div className="summary-row">
                <span>
                  {isTiffin ? "Delivery Address" : "Mess Location"}
                </span>

                <strong>{orderSuccess.location}</strong>
              </div>
            )}

            <div className="summary-row">
              <span>Status</span>

              <strong>
                {formatOrderStatus(orderSuccess.status)}
              </strong>
            </div>

            <button
              type="button"
              className="confirm-order-button"
              onClick={() => navigate("/student/orders")}
            >
              View My Orders
              <span>→</span>
            </button>

            <button
              type="button"
              className="order-back-button"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ======================================================
  // ORDER PAGE
  // ======================================================

  const messAddress =
    mess.address || mess.location || "Location not available";

  return (
    <div className="student-order-page">
      <Navbar />

      <main className="student-order-container">
        <button
          type="button"
          className="order-back-button"
          onClick={() => navigate(`/messes/${mess.mess_id}`)}
        >
          ← Back to Mess Details
        </button>

        <section className="order-header">
          <span>YOUR ORDER</span>

          <h1>Complete your meal order.</h1>

          <p>
            Choose your meal plan and how you want to receive your meal.
          </p>
        </section>

        <section className="order-layout">
          <div className="order-main">
            {/* MESS */}

            <div className="order-card">
              <div className="order-card-title">
                <span>MESS</span>
                <h2>{mess.mess_name}</h2>
              </div>

              <div className="order-mess-info">
                {photoUrl && (
                  <img src={photoUrl} alt={mess.mess_name} />
                )}

                <div>
                  <strong>{mess.mess_name}</strong>

                  <p>{messAddress}</p>

                  <div className="order-rating">
                    ★ {Number(mess.rating || 0).toFixed(1)} (
                    {mess.total_reviews || 0} reviews)
                  </div>
                </div>
              </div>
            </div>

            {/* SELECTED PLAN */}

            <div className="order-card">
              <div className="order-card-title">
                <span>SELECTED PLAN</span>

                <h2>
                  {planType === "MONTHLY"
                    ? "Monthly Meal Plan"
                    : "One-Day Meal"}
                </h2>
              </div>

              <div className="selected-plan">
                <div>
                  <strong>
                    {planType === "MONTHLY" ? "Monthly" : "One-Day"}
                  </strong>

                  <p>
                    {planType === "MONTHLY"
                      ? "Lunch + Dinner included every day."
                      : "Meal for a single day."}
                  </p>
                </div>
              </div>
            </div>

            {/* MEAL SLOT */}

            {planType === "ONE_DAY" && (
              <div className="order-card">
                <div className="order-card-title">
                  <span>MEAL TIME</span>
                  <h2>Which meal do you want?</h2>
                </div>

                <div className="mode-options">
                  <button
                    type="button"
                    className={
                      mealSlot === "LUNCH"
                        ? "mode-option selected"
                        : "mode-option"
                    }
                    onClick={() => setMealSlot("LUNCH")}
                  >
                    <div className="mode-icon">L</div>

                    <div>
                      <strong>Lunch</strong>
                      <span>Get today's lunch.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={
                      mealSlot === "DINNER"
                        ? "mode-option selected"
                        : "mode-option"
                    }
                    onClick={() => setMealSlot("DINNER")}
                  >
                    <div className="mode-icon">D</div>

                    <div>
                      <strong>Dinner</strong>
                      <span>Get today's dinner.</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* MONTHLY MEAL INFORMATION */}

            {planType === "MONTHLY" && (
              <div className="order-card">
                <div className="order-card-title">
                  <span>MEALS INCLUDED</span>
                  <h2>Lunch + Dinner</h2>
                </div>

                <div className="selected-plan">
                  <div>
                    <strong>Both meals are included</strong>

                    <p>
                      Your monthly plan includes Lunch and Dinner
                      every day.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MEAL MODE */}

            <div className="order-card">
              <div className="order-card-title">
                <span>MEAL MODE</span>
                <h2>How do you want your meal?</h2>
              </div>

              <div className="mode-options">
                <button
                  type="button"
                  className={
                    orderMode === "EAT_AT_MESS"
                      ? "mode-option selected"
                      : "mode-option"
                  }
                  onClick={() => setOrderMode("EAT_AT_MESS")}
                >
                  <div className="mode-icon">M</div>

                  <div>
                    <strong>Eat at Mess</strong>
                    <span>Have your meal at the mess.</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={
                    orderMode === "TIFFIN"
                      ? "mode-option selected"
                      : "mode-option"
                  }
                  onClick={() => setOrderMode("TIFFIN")}
                >
                  <div className="mode-icon">T</div>

                  <div>
                    <strong>Tiffin</strong>
                    <span>Receive your meal as a tiffin.</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ORDER LOCATION */}

            <div className="order-card">
              <div className="order-card-title">
                <span>ORDER LOCATION</span>

                <h2>
                  {orderMode === "TIFFIN"
                    ? "Where should we deliver?"
                    : "Mess location"}
                </h2>
              </div>

              {orderMode === "TIFFIN" ? (
                <>
                  <textarea
                    value={locationValue}
                    onChange={(event) =>
                      setLocationValue(event.target.value)
                    }
                    placeholder="Enter your complete delivery address"
                    rows={3}
                  />

                  <small>
                    Enter the address where you want your tiffin
                    delivered. This address is saved with your order.
                  </small>
                </>
              ) : (
                <>
                  <p>{messAddress}</p>

                  <small>
                    Your order location will be the mess's physical
                    address because you selected Eat at Mess.
                  </small>
                </>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY */}

          <aside className="order-summary">
            <div className="summary-card">
              <span className="summary-label">ORDER SUMMARY</span>

              <h2>{mess.mess_name}</h2>

              <div className="summary-row">
                <span>Plan</span>

                <strong>
                  {planType === "MONTHLY" ? "Monthly" : "One-Day"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Meal</span>

                <strong>
                  {planType === "MONTHLY"
                    ? "Lunch + Dinner"
                    : mealSlot === "LUNCH"
                      ? "Lunch"
                      : "Dinner"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Meal Mode</span>

                <strong>
                  {orderMode === "EAT_AT_MESS"
                    ? "Eat at Mess"
                    : "Tiffin"}
                </strong>
              </div>

              <div className="summary-divider"></div>

              {planType === "MONTHLY" && (
                <p>Monthly plan includes both Lunch and Dinner.</p>
              )}

              {planType === "ONE_DAY" && (
                <p>
                  Your order will be sent to the mess owner for
                  approval.
                </p>
              )}

              <button
                type="button"
                className="confirm-order-button"
                onClick={handleConfirmOrder}
                disabled={submitting}
              >
                {submitting ? "Creating Order..." : "Confirm Order"}

                {!submitting && <span>→</span>}
              </button>

              <p className="payment-note">
                Payment will be available only after the mess owner
                accepts your order.
              </p>

              {error && <p className="order-error-message">{error}</p>}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default StudentOrder;
