import { useEffect, useState } from "react";
import "./CapacityManagement.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function CapacityManagement() {
  const [capacity, setCapacity] = useState("");
  const [currentCapacity, setCurrentCapacity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMessProfile();
  }, []);

  async function fetchMessProfile() {
    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      setError("Login token not found. Please login again.");
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
          data.detail || "Failed to load mess profile."
        );
      }

      const savedCapacity = data.max_capacity;

      if (savedCapacity !== null && savedCapacity !== undefined) {
        setCurrentCapacity(savedCapacity);
        setCapacity(savedCapacity);
      } else {
        setCurrentCapacity(null);
        setCapacity("");
      }
    } catch (err) {
      console.error("Capacity loading error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCapacityChange(event) {
    setCapacity(event.target.value);

    setMessage("");
    setError("");
  }

  async function handleUpdateCapacity(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (capacity === "") {
      setError("Please enter the maximum capacity.");
      return;
    }

    const newCapacity = Number(capacity);

    if (!Number.isInteger(newCapacity) || newCapacity <= 0) {
      setError("Capacity must be a positive whole number.");
      return;
    }

    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      setError("Login token not found. Please login again.");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/mess/capacity`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            max_capacity: newCapacity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Failed to update capacity."
        );
      }

      setCurrentCapacity(data.max_capacity);
      setCapacity(data.max_capacity);

      setMessage("Capacity updated successfully.");
    } catch (err) {
      console.error("Capacity update error:", err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="capacity-page">
        <div className="capacity-loading">
          Loading capacity...
        </div>
      </div>
    );
  }

  return (
    <div className="capacity-page">
      <div className="capacity-container">

        <div className="capacity-header">
          <div>
            <p className="capacity-label">MESS MANAGEMENT</p>
            <h1>Capacity Management</h1>
            <p className="capacity-description">
              Set the maximum number of students your mess can serve.
            </p>
          </div>
        </div>

        <div className="capacity-content">

          <div className="capacity-current-card">
            <p className="card-label">CURRENT CAPACITY</p>

            <div className="capacity-number">
              {currentCapacity !== null
                ? currentCapacity
                : "Not Set"}
            </div>

            <p className="capacity-subtext">
              Maximum students your mess can currently serve.
            </p>
          </div>

          <div className="capacity-form-card">
            <div className="form-card-header">
              <h2>Update Capacity</h2>
              <p>
                Enter the maximum number of students you can
                accommodate.
              </p>
            </div>

            <form onSubmit={handleUpdateCapacity}>

              <div className="input-group">
                <label htmlFor="maxCapacity">
                  Maximum Capacity
                </label>

                <input
                  id="maxCapacity"
                  type="number"
                  min="1"
                  step="1"
                  value={capacity}
                  onChange={handleCapacityChange}
                  placeholder="Example: 50"
                />

                <span className="input-help">
                  Enter a positive whole number.
                </span>
              </div>

              {error && (
                <div className="capacity-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="capacity-success">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="update-capacity-button"
                disabled={updating}
              >
                {updating
                  ? "Updating..."
                  : "Update Capacity"}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CapacityManagement;