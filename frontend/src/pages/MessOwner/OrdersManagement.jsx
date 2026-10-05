import { useEffect, useState } from "react";
import "./OrdersManagement.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const token = localStorage.getItem("tiffny_token");

    if (!token) {
      setError("Login token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/mess-orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load orders."
        );
      }

      setOrders(data);
    } catch (error) {
      console.error("Orders loading error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem("tiffny_token");

    if (!token) {
      setError("Login token not found. Please login again.");
      return;
    }

    setUpdatingOrderId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update order status."
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setSuccess(
        `Order status updated to ${formatStatus(newStatus)}.`
      );
    } catch (error) {
      console.error(
        "Order status update error:",
        error
      );

      setError(error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function formatStatus(status) {
    if (!status) {
      return "Unknown";
    }

    if (status === "PENDING_PAYMENT") {
      return "Pending";
    }

    if (status === "ACCEPTED") {
      return "Accepted";
    }

    if (status === "COMPLETED") {
      return "Completed";
    }

    if (status === "CANCELLED") {
      return "Cancelled";
    }

    return status.replaceAll("_", " ");
  }

  function getStatusClass(status) {
    if (status === "PENDING_PAYMENT") {
      return "status-pending";
    }

    if (status === "ACCEPTED") {
      return "status-accepted";
    }

    if (status === "COMPLETED") {
      return "status-completed";
    }

    if (status === "CANCELLED") {
      return "status-cancelled";
    }

    return "status-default";
  }

  function formatOrderType(planType) {
    if (planType === "ONE_DAY") {
      return "One-Time";
    }

    if (planType === "MONTHLY") {
      return "Monthly";
    }

    return planType || "Unknown";
  }

  function formatMealMode(mealMode) {
    if (mealMode === "EAT_AT_MESS") {
      return "Eat at Mess";
    }

    if (mealMode === "TIFFIN") {
      return "Tiffin";
    }

    return mealMode || "Unknown";
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">

        <div className="orders-header">
          <div>
            <p className="orders-label">
              MESS MANAGEMENT
            </p>

            <h1>Orders Management</h1>

            <p className="orders-description">
              View and manage orders placed by students.
            </p>
          </div>

          <div className="orders-count">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        {error && (
          <div className="orders-message orders-error">
            {error}
          </div>
        )}

        {success && (
          <div className="orders-message orders-success">
            {success}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-orders">
            <h2>No orders yet</h2>

            <p>
              Student orders will appear here when
              someone places an order.
            </p>
          </div>
        ) : (
          <div className="orders-list">

            {orders.map((order) => {

              const isUpdating =
                updatingOrderId === order.order_id;

              const status = order.status;

              return (
                <div
                  className="order-card"
                  key={order.order_id}
                >

                  <div className="order-card-header">

                    <div>
                      <p className="order-small-label">
                        ORDER
                      </p>

                      <h2>
                        {order.student_name}
                      </h2>

                      <p className="order-phone">
                        {order.student_phone ||
                          "Phone not available"}
                      </p>
                    </div>

                    <span
                      className={`order-status ${getStatusClass(
                        status
                      )}`}
                    >
                      {formatStatus(status)}
                    </span>

                  </div>

                  <div className="order-details">

                    <div className="order-detail">
                      <span>Meal</span>
                      <strong>
                        {order.meal_name}
                      </strong>
                    </div>

                    <div className="order-detail">
                      <span>Order Type</span>
                      <strong>
                        {formatOrderType(
                          order.plan_type
                        )}
                      </strong>
                    </div>

                    <div className="order-detail">
                      <span>Mode</span>
                      <strong>
                        {formatMealMode(
                          order.meal_mode
                        )}
                      </strong>
                    </div>

                    <div className="order-detail">
                      <span>Amount</span>
                      <strong>
                        ₹
                        {Number(
                          order.price || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="order-detail">
                      <span>Order Date</span>
                      <strong>
                        {formatDate(
                          order.created_at
                        )}
                      </strong>
                    </div>

                    <div className="order-detail order-location">
                      <span>Location</span>
                      <strong>
                        {order.location ||
                          "Mess location"}
                      </strong>
                    </div>

                  </div>

                  <div className="order-actions">

                    {status === "PENDING_PAYMENT" && (
                      <>
                        <button
                          type="button"
                          className="accept-button"
                          disabled={isUpdating}
                          onClick={() =>
                            updateOrderStatus(
                              order.order_id,
                              "ACCEPTED"
                            )
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          className="cancel-button"
                          disabled={isUpdating}
                          onClick={() =>
                            updateOrderStatus(
                              order.order_id,
                              "CANCELLED"
                            )
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {status === "ACCEPTED" && (
                      <>
                        <button
                          type="button"
                          className="complete-button"
                          disabled={isUpdating}
                          onClick={() =>
                            updateOrderStatus(
                              order.order_id,
                              "COMPLETED"
                            )
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : "Complete"}
                        </button>

                        <button
                          type="button"
                          className="cancel-button"
                          disabled={isUpdating}
                          onClick={() =>
                            updateOrderStatus(
                              order.order_id,
                              "CANCELLED"
                            )
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {status === "COMPLETED" && (
                      <span className="final-status">
                        Order Completed
                      </span>
                    )}

                    {status === "CANCELLED" && (
                      <span className="final-status cancelled-text">
                        Order Cancelled
                      </span>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default OrdersManagement;