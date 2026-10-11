import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./StudentPayment.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function StudentPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!orderId) {
      setError("Order information is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/my-orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("tiffny_token");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load order."
        );
      }

      const foundOrder = data.find(
        (item) =>
          String(item.order_id || item._id) === String(orderId)
      );

      if (!foundOrder) {
        setError("Order not found.");
        return;
      }

      /*
       * Payment is available only after
       * the mess owner accepts the order.
       *
       * Backend status:
       * PENDING_OWNER_APPROVAL
       *          ↓
       * PENDING_PAYMENT
       */

      if (foundOrder.status !== "PENDING_PAYMENT") {
        setError(
          "This order is not available for payment yet."
        );
        return;
      }

      setOrder(foundOrder);

    } catch (err) {
      console.error("Payment page error:", err);
      setError(err.message);

    } finally {
      setLoading(false);
    }
  }

  function formatPlanType(planType) {
    if (
      planType === "ONE_DAY" ||
      planType === "ONE_TIME"
    ) {
      return "One-Day Meal";
    }

    if (planType === "MONTHLY") {
      return "Monthly Plan";
    }

    return planType || "N/A";
  }

  function formatMealMode(mealMode) {
    if (mealMode === "EAT_AT_MESS") {
      return "Eat at Mess";
    }

    if (mealMode === "TIFFIN") {
      return "Tiffin";
    }

    return mealMode || "N/A";
  }

  function handleProceedToPayment() {
    navigate(
      `/student/make-payment?orderId=${orderId}`
    );
  }

  if (loading) {
    return (
      <div className="student-payment-page">

        <Navbar />

        <div className="payment-loading">
          Loading payment details...
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="student-payment-page">

        <Navbar />

        <main className="student-payment-container">

          <div className="payment-error">

            <h2>Unable to continue</h2>

            <p>{error}</p>

            <button
              onClick={() =>
                navigate("/student/order-history")
              }
            >
              Back to My Orders
            </button>

          </div>

        </main>

      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="student-payment-page">

      <Navbar />

      <main className="student-payment-container">

        <button
          className="payment-back-button"
          onClick={() =>
            navigate("/student/order-history")
          }
        >
          Back to My Orders
        </button>

        <section className="payment-header">

          <span>PAYMENT</span>

          <h1>Complete Your Payment</h1>

          <p>
            Your order has been accepted by the mess owner.
          </p>

        </section>

        <section className="payment-card">

          <div className="payment-card-header">

            <div>

              <h2>
                {order.mess_name || "Mess"}
              </h2>

              <p>
                Your order is ready for payment.
              </p>

            </div>

            <span className="payment-confirmed">
              Order Accepted
            </span>

          </div>

          <div className="payment-details">

            <div className="payment-detail">

              <span>Plan</span>

              <strong>
                {formatPlanType(order.plan_type)}
              </strong>

            </div>

            <div className="payment-detail">

              <span>Meal</span>

              <strong>
                {order.meal_name || "N/A"}
              </strong>

            </div>

            <div className="payment-detail">

              <span>Meal Slot</span>

              <strong>
                {order.meal_slot || "BOTH"}
              </strong>

            </div>

            <div className="payment-detail">

              <span>Meal Mode</span>

              <strong>
                {formatMealMode(order.meal_mode)}
              </strong>

            </div>

            {order.location && (
              <div className="payment-detail">

                <span>Location</span>

                <strong>
                  {order.location}
                </strong>

              </div>
            )}

          </div>

          <div className="payment-total">

            <span>Total Amount</span>

            <strong>
              ₹
              {Number(
                order.price || 0
              ).toLocaleString("en-IN")}
            </strong>

          </div>

          <div className="payment-action">

            <p>
              Payment will be securely processed after you
              continue.
            </p>

            <button
              className="proceed-payment-button"
              onClick={handleProceedToPayment}
            >
              Proceed to Payment
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default StudentPayment;