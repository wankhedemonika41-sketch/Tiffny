import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./StudentOrderHistory.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function StudentOrderHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

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
          data.detail || "Failed to load orders."
        );
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);

      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATUS
  // =====================================================

  const formatStatus = (status, planType) => {
    if (status === "PENDING_OWNER_APPROVAL") {
      return "Waiting for Mess Owner Approval";
    }

    if (status === "PENDING_PAYMENT") {
      return "Payment Pending";
    }

    if (status === "ACTIVE") {
      if (planType === "MONTHLY") {
        return "Monthly Plan Active";
      }

      return "Payment Successful";
    }

    if (status === "COMPLETED") {
      return "Order Completed";
    }

    if (status === "CANCELLED") {
      return "Order Cancelled";
    }

    return status || "Unknown";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING_OWNER_APPROVAL":
        return "status-pending";

      case "PENDING_PAYMENT":
        return "status-confirmed";

      case "ACTIVE":
        return "status-active";

      case "COMPLETED":
        return "status-completed";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // =====================================================
  // PLAN TYPE
  // =====================================================

  const formatPlanType = (planType) => {
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
  };

  // =====================================================
  // MEAL MODE
  // =====================================================

  const formatMealMode = (mealMode) => {
    if (mealMode === "EAT_AT_MESS") {
      return "Eat at Mess";
    }

    if (mealMode === "TIFFIN") {
      return "Tiffin";
    }

    return mealMode || "N/A";
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "N/A";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // DATE + TIME
  // =====================================================

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "N/A";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // ORDER TYPE CHECK
  // =====================================================

  const isMonthlyOrder = (order) => {
    return order.plan_type === "MONTHLY";
  };

  const isOneDayOrder = (order) => {
    return (
      order.plan_type === "ONE_DAY" ||
      order.plan_type === "ONE_TIME"
    );
  };

  // =====================================================
  // PAY NOW
  // =====================================================

  const handlePayNow = (order) => {
    const orderId = order.order_id || order._id;

    if (!orderId) {
      alert("Order ID is missing.");
      return;
    }

    navigate(
      `/student/payment?orderId=${orderId}`
    );
  };

  return (
    <>
      <Navbar />

      <main className="student-order-history-page">

        <div className="student-order-history-container">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="order-history-header">

            <div>

              <button
                className="order-history-back-button"
                onClick={() =>
                  navigate("/student/dashboard")
                }
              >
                Back to Dashboard
              </button>

              <h1>My Orders</h1>

              <p>
                View your orders, payment status and
                active meal plans.
              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading && (
            <div className="order-history-message">

              <p>
                Loading your orders...
              </p>

            </div>
          )}


          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {!loading && error && (
            <div className="order-history-message error-message">

              <p>
                {error}
              </p>

              <button
                className="retry-button"
                onClick={fetchOrders}
              >
                Try Again
              </button>

            </div>
          )}


          {/* ================================================= */}
          {/* EMPTY */}
          {/* ================================================= */}

          {!loading &&
            !error &&
            orders.length === 0 && (

              <div className="order-history-empty">

                <h2>
                  No orders yet
                </h2>

                <p>
                  You have not placed any orders yet.
                </p>

                <button
                  className="find-mess-button"
                  onClick={() =>
                    navigate("/messes")
                  }
                >
                  Find a Mess
                </button>

              </div>
            )}


          {/* ================================================= */}
          {/* ORDERS */}
          {/* ================================================= */}

          {!loading &&
            !error &&
            orders.length > 0 && (

              <div className="orders-list">

                {orders.map((order, index) => {

                  const monthly =
                    isMonthlyOrder(order);

                  const oneDay =
                    isOneDayOrder(order);

                  return (

                    <div
                      className="order-history-card"
                      key={
                        order.order_id ||
                        order._id ||
                        index
                      }
                    >

                      {/* ===================================== */}
                      {/* ORDER HEADER */}
                      {/* ===================================== */}

                      <div className="order-card-top">

                        <div>

                          <h2>
                            {order.mess_name ||
                              "Mess"}
                          </h2>

                          <p className="order-date">
                            Ordered on{" "}
                            {formatDateTime(
                              order.created_at
                            )}
                          </p>

                        </div>


                        <span
                          className={`order-status ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {formatStatus(
                            order.status,
                            order.plan_type
                          )}
                        </span>

                      </div>


                      {/* ===================================== */}
                      {/* ORDER DETAILS */}
                      {/* ===================================== */}

                      <div className="order-card-details">

                        <div className="order-detail">

                          <span>
                            Plan
                          </span>

                          <strong>
                            {formatPlanType(
                              order.plan_type
                            )}
                          </strong>

                        </div>


                        <div className="order-detail">

                          <span>
                            Meal
                          </span>

                          <strong>
                            {order.meal_name ||
                              "N/A"}
                          </strong>

                        </div>


                        <div className="order-detail">

                          <span>
                            Meal Slot
                          </span>

                          <strong>
                            {order.meal_slot ||
                              "BOTH"}
                          </strong>

                        </div>


                        <div className="order-detail">

                          <span>
                            Mode
                          </span>

                          <strong>
                            {formatMealMode(
                              order.meal_mode
                            )}
                          </strong>

                        </div>


                        <div className="order-detail">

                          <span>
                            Price
                          </span>

                          <strong>
                            ₹
                            {Number(
                              order.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>


                        {order.location && (

                          <div className="order-detail order-location">

                            <span>
                              Location
                            </span>

                            <strong>
                              {order.location}
                            </strong>

                          </div>

                        )}

                      </div>


                      {/* ===================================== */}
                      {/* MONTHLY ACTIVE PLAN */}
                      {/* ===================================== */}

                      {monthly &&
                        order.status === "ACTIVE" && (

                        <div className="monthly-plan-section">

                          <div className="monthly-plan-header">

                            <h3>
                              Monthly Plan Active
                            </h3>

                            <span>
                              Payment Successful
                            </span>

                          </div>


                          <div className="monthly-plan-details">

                            <div className="monthly-plan-detail">

                              <span>
                                Joined From :- 
                              </span>

                              <strong>
                                {formatDate(
                                  order.start_date
                                )}
                              </strong>

                            </div>


                            <div className="monthly-plan-detail">

                              <span>
                                Ending Date :- 
                              </span>

                              <strong>
                                {formatDate(
                                  order.end_date
                                )}
                              </strong>

                            </div>

                          </div>


                          <p className="active-text">

                            You have successfully
                            joined this monthly mess
                            plan. Your membership is
                            active.

                          </p>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* ONE DAY ACTIVE */}
                      {/* ===================================== */}

                      {oneDay &&
                        order.status === "ACTIVE" && (

                        <div className="one-day-payment-section">

                          <strong>
                            Payment Successful
                          </strong>

                          <p>
                            Your one-day meal payment
                            has been successfully
                            completed.
                          </p>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* PENDING OWNER APPROVAL */}
                      {/* ===================================== */}

                      {order.status ===
                        "PENDING_OWNER_APPROVAL" && (

                        <div className="order-card-footer">

                          <p className="pending-text">

                            Your order is waiting for
                            the mess owner to accept it.

                          </p>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* PAYMENT PENDING */}
                      {/* ===================================== */}

                      {order.status ===
                        "PENDING_PAYMENT" && (

                        <div className="order-card-footer">

                          <div className="payment-section">

                            <p className="confirmed-text">

                              Your order has been
                              accepted by the mess
                              owner. Please complete
                              your payment.

                            </p>

                            <button
                              className="pay-now-button"
                              onClick={() =>
                                handlePayNow(order)
                              }
                            >
                              Pay Now
                            </button>

                          </div>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* CANCELLED */}
                      {/* ===================================== */}

                      {order.status ===
                        "CANCELLED" && (

                        <div className="order-card-footer">

                          <p className="cancelled-text">

                            This order was cancelled
                            by the mess owner.

                          </p>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* COMPLETED */}
                      {/* ===================================== */}

                      {order.status ===
                        "COMPLETED" && (

                        <div className="order-card-footer">

                          <p className="completed-text">

                            {oneDay
                              ? "Order Completed. Payment was successful."
                              : "Order Completed."}

                          </p>

                        </div>

                      )}

                    </div>

                  );

                })}

              </div>

            )}

        </div>

      </main>
    </>
  );
}

export default StudentOrderHistory;