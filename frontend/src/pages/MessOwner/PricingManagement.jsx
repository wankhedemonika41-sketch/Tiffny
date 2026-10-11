import { useEffect, useState } from "react";
import "./PricingManagement.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function PricingManagement() {
  const [oneTimePrice, setOneTimePrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");

  const [currentOneTimePrice, setCurrentOneTimePrice] = useState(null);
  const [currentMonthlyPrice, setCurrentMonthlyPrice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updatingOneTime, setUpdatingOneTime] = useState(false);
  const [updatingMonthly, setUpdatingMonthly] = useState(false);

  const [oneTimeMessage, setOneTimeMessage] = useState("");
  const [monthlyMessage, setMonthlyMessage] = useState("");

  const [oneTimeError, setOneTimeError] = useState("");
  const [monthlyError, setMonthlyError] = useState("");

  useEffect(() => {
    fetchMessProfile();
  }, []);

  async function fetchMessProfile() {
    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      setOneTimeError("Login token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/mess/profile`,
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
          data.detail || "Failed to load pricing information."
        );
      }

      if (
        data.one_time_price !== null &&
        data.one_time_price !== undefined
      ) {
        setCurrentOneTimePrice(data.one_time_price);
        setOneTimePrice(data.one_time_price);
      }

      if (
        data.monthly_price !== null &&
        data.monthly_price !== undefined
      ) {
        setCurrentMonthlyPrice(data.monthly_price);
        setMonthlyPrice(data.monthly_price);
      }
    } catch (error) {
      console.error("Pricing loading error:", error);
      setOneTimeError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOneTimePriceChange(event) {
    setOneTimePrice(event.target.value);
    setOneTimeMessage("");
    setOneTimeError("");
  }

  function handleMonthlyPriceChange(event) {
    setMonthlyPrice(event.target.value);
    setMonthlyMessage("");
    setMonthlyError("");
  }

  async function handleOneTimePriceUpdate(event) {
    event.preventDefault();

    setOneTimeMessage("");
    setOneTimeError("");

    if (oneTimePrice === "") {
      setOneTimeError("Please enter the one-time meal price.");
      return;
    }

    const price = Number(oneTimePrice);

    if (!Number.isFinite(price) || price <= 0) {
      setOneTimeError("Price must be greater than 0.");
      return;
    }

    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      setOneTimeError(
        "Login token not found. Please login again."
      );
      return;
    }

    setUpdatingOneTime(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/mess/one-time-price`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            one_time_price: price,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to update one-time price."
        );
      }

      setCurrentOneTimePrice(data.one_time_price);
      setOneTimePrice(data.one_time_price);

      setOneTimeMessage(
        "One-time meal price updated successfully."
      );
    } catch (error) {
      console.error(
        "One-time price update error:",
        error
      );

      setOneTimeError(error.message);
    } finally {
      setUpdatingOneTime(false);
    }
  }

  async function handleMonthlyPriceUpdate(event) {
    event.preventDefault();

    setMonthlyMessage("");
    setMonthlyError("");

    if (monthlyPrice === "") {
      setMonthlyError("Please enter the monthly plan price.");
      return;
    }

    const price = Number(monthlyPrice);

    if (!Number.isFinite(price) || price <= 0) {
      setMonthlyError("Price must be greater than 0.");
      return;
    }

    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      setMonthlyError(
        "Login token not found. Please login again."
      );
      return;
    }

    setUpdatingMonthly(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/mess/monthly-price`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            monthly_price: price,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to update monthly price."
        );
      }

      setCurrentMonthlyPrice(data.monthly_price);
      setMonthlyPrice(data.monthly_price);

      setMonthlyMessage(
        "Monthly plan price updated successfully."
      );
    } catch (error) {
      console.error(
        "Monthly price update error:",
        error
      );

      setMonthlyError(error.message);
    } finally {
      setUpdatingMonthly(false);
    }
  }

  if (loading) {
    return (
      <div className="pricing-page">
        <div className="pricing-loading">
          Loading pricing information...
        </div>
      </div>
    );
  }

  return (
    <div className="pricing-page">
      <div className="pricing-container">

        <div className="pricing-header">
          <p className="pricing-label">
            MESS MANAGEMENT
          </p>

          <h1>Pricing Management</h1>

          <p className="pricing-description">
            Manage the prices students will pay for your
            one-time meals and monthly plans.
          </p>
        </div>

        <div className="pricing-grid">

          {/* ONE-TIME PRICE */}

          <div className="pricing-card">

            <div className="pricing-card-top">
              <div>
                <p className="pricing-card-label">
                  ONE-TIME MEAL
                </p>

                <h2>One-Time Price</h2>
              </div>

              <div className="pricing-icon one-time-icon">
                ₹
              </div>
            </div>

            <div className="current-price-section">
              <p>Current Price</p>

              <div className="current-price">
                {currentOneTimePrice !== null
                  ? `₹${Number(
                      currentOneTimePrice
                    ).toLocaleString("en-IN")}`
                  : "Not Set"}
              </div>
            </div>

            <form onSubmit={handleOneTimePriceUpdate}>

              <div className="price-input-group">

                <label htmlFor="oneTimePrice">
                  New One-Time Price
                </label>

                <div className="price-input-wrapper">
                  <span>₹</span>

                  <input
                    id="oneTimePrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={oneTimePrice}
                    onChange={handleOneTimePriceChange}
                    placeholder="80"
                  />
                </div>

              </div>

              {oneTimeError && (
                <div className="pricing-error">
                  {oneTimeError}
                </div>
              )}

              {oneTimeMessage && (
                <div className="pricing-success">
                  {oneTimeMessage}
                </div>
              )}

              <button
                type="submit"
                className="update-price-button"
                disabled={updatingOneTime}
              >
                {updatingOneTime
                  ? "Updating..."
                  : "Update One-Time Price"}
              </button>

            </form>
          </div>

          {/* MONTHLY PRICE */}

          <div className="pricing-card">

            <div className="pricing-card-top">
              <div>
                <p className="pricing-card-label">
                  MONTHLY PLAN
                </p>

                <h2>Monthly Price For Lunch And Dinner</h2>
              </div>

              <div className="pricing-icon monthly-icon">
                ₹
              </div>
            </div>

            <div className="current-price-section">
              <p>Current Price</p>

              <div className="current-price">
                {currentMonthlyPrice !== null
                  ? `₹${Number(
                      currentMonthlyPrice
                    ).toLocaleString("en-IN")}`
                  : "Not Set"}
              </div>
            </div>

            <form onSubmit={handleMonthlyPriceUpdate}>

              <div className="price-input-group">

                <label htmlFor="monthlyPrice">
                  New Monthly Price
                </label>

                <div className="price-input-wrapper">
                  <span>₹</span>

                  <input
                    id="monthlyPrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={monthlyPrice}
                    onChange={handleMonthlyPriceChange}
                    placeholder="3000"
                  />
                </div>

              </div>

              {monthlyError && (
                <div className="pricing-error">
                  {monthlyError}
                </div>
              )}

              {monthlyMessage && (
                <div className="pricing-success">
                  {monthlyMessage}
                </div>
              )}

              <button
                type="submit"
                className="update-price-button"
                disabled={updatingMonthly}
              >
                {updatingMonthly
                  ? "Updating..."
                  : "Update Monthly Price"}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

export default PricingManagement;