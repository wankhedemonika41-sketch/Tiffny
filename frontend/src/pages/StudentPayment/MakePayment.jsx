import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";

import "./MakePayment.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function MakePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");

  const [paymentMethod, setPaymentMethod] = useState("DEMO");

  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handlePayment() {
    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!orderId) {
      setError("Order information is missing.");
      return;
    }

    setPaying(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/${orderId}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            payment_method: paymentMethod,
          }),
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
          data.detail || "Payment failed."
        );
      }

      console.log("Payment successful:", data);

      setSuccess(
        "Payment successful. Your order is now active."
      );

      /*
       * Wait for a short time and then
       * return the student to My Orders.
       */

      setTimeout(() => {
        navigate("/student/orders");
      }, 1500);

    } catch (err) {
      console.error("Payment error:", err);

      setError(err.message);

    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="make-payment-page">

      <Navbar />

      <main className="make-payment-container">

        <button
          type="button"
          className="make-payment-back"
          onClick={() =>
            navigate(
              `/student/payment?orderId=${orderId}`
            )
          }
        >
          Back
        </button>

        <section className="make-payment-card">

          <div className="make-payment-header">

            <span>PAYMENT</span>

            <h1>Make Payment</h1>

            <p>
              Complete your payment to activate your order.
            </p>

          </div>

          {success ? (
            <div className="payment-success">

              <h2>Payment Successful</h2>

              <p>
                {success}
              </p>

              <p className="redirect-message">
                Redirecting to My Orders...
              </p>

            </div>
          ) : (
            <>
              <div className="payment-method-section">

                <h2>Payment Method</h2>

                <label className="payment-method-option">

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DEMO"
                    checked={
                      paymentMethod === "DEMO"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Demo Payment
                    </strong>

                    <p>
                      Use this option for testing
                      the payment flow.
                    </p>
                  </div>

                </label>

                <label className="payment-method-option">

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={
                      paymentMethod === "CASH"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Cash Payment
                    </strong>

                    <p>
                      Record this order as a
                      cash payment.
                    </p>
                  </div>

                </label>

              </div>

              {error && (
                <div className="make-payment-error">
                  {error}
                </div>
              )}

              <div className="payment-summary">

                <div>
                  <span>Order ID</span>

                  <strong>
                    {orderId || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Selected Method</span>

                  <strong>
                    {paymentMethod === "DEMO"
                      ? "Demo Payment"
                      : "Cash Payment"}
                  </strong>
                </div>

              </div>

              <div className="make-payment-action">

                <button
                  type="button"
                  className="pay-now-button"
                  disabled={paying}
                  onClick={handlePayment}
                >
                  {paying
                    ? "Processing Payment..."
                    : "Pay Now"}
                </button>

              </div>

              <p className="payment-note">
                This is currently a demo payment
                system. No real money will be charged.
              </p>
            </>
          )}

        </section>

      </main>

    </div>
  );
}

export default MakePayment;