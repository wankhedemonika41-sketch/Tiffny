import { useEffect, useState } from "react";
import "./MenuManagement.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function findLoginToken() {
  const possibleKeys = [
    "access_token",
    "token",
    "accessToken",
    "jwt",
    "authToken",
    "tiffny_token",
    "tiffnyToken",
  ];

  // Check localStorage
  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  // Check sessionStorage
  for (const key of possibleKeys) {
    const value = sessionStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  // Search localStorage for JWT
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    if (
      value &&
      typeof value === "string" &&
      value.startsWith("eyJ") &&
      value.split(".").length === 3
    ) {
      return value;
    }

    if (value) {
      try {
        const parsed = JSON.parse(value);

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          const token =
            parsed.access_token ||
            parsed.accessToken ||
            parsed.token ||
            parsed.jwt ||
            parsed.authToken;

          if (
            token &&
            typeof token === "string"
          ) {
            return token;
          }
        }
      } catch {
        // Continue searching
      }
    }
  }

  // Search sessionStorage for JWT
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);

    if (
      value &&
      typeof value === "string" &&
      value.startsWith("eyJ") &&
      value.split(".").length === 3
    ) {
      return value;
    }

    if (value) {
      try {
        const parsed = JSON.parse(value);

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          const token =
            parsed.access_token ||
            parsed.accessToken ||
            parsed.token ||
            parsed.jwt ||
            parsed.authToken;

          if (
            token &&
            typeof token === "string"
          ) {
            return token;
          }
        }
      } catch {
        // Continue searching
      }
    }
  }

  return null;
}

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingMealId, setEditingMealId] = useState(null);

  const [formData, setFormData] = useState({
    meal_name: "",
    description: "",
    meal_type: "Lunch",
    price: "",
    available: true,
  });

  useEffect(() => {
    loadMenu();
  }, []);

  // =========================================================
  // LOAD MENU
  // =========================================================

  async function loadMenu() {
    try {
      setLoading(true);
      setError("");

      const token = findLoginToken();

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/mess/menu`,
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
          data.detail ||
            "Failed to load menu."
        );
      }

      setMenuItems(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Menu loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load menu."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

    setError("");
    setSuccessMessage("");
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  function resetForm() {
    setFormData({
      meal_name: "",
      description: "",
      meal_type: "Lunch",
      price: "",
      available: true,
    });

    setEditingMealId(null);
    setError("");
  }

  // =========================================================
  // ADD / UPDATE MENU ITEM
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const mealName =
      formData.meal_name.trim();

    const description =
      formData.description.trim();

    const priceValue =
      Number(formData.price);

    // Basic frontend validation
    if (!mealName) {
      setError(
        "Please enter the meal name."
      );
      return;
    }

    if (!description) {
      setError(
        "Please enter the meal description."
      );
      return;
    }

    if (
      !formData.price ||
      Number.isNaN(priceValue) ||
      priceValue <= 0
    ) {
      setError(
        "Please enter a valid price greater than 0."
      );
      return;
    }

    try {
      setSaving(true);

      const token = findLoginToken();

      if (!token) {
        setError("Please login first.");
        setSaving(false);
        return;
      }

      const menuData = {
        meal_name: mealName,
        description: description,
        meal_type: formData.meal_type,
        price: priceValue,
        available: formData.available,
      };

      let url = `${API_BASE_URL}/mess/menu`;
      let method = "POST";

      // If editing, use PUT
      if (editingMealId) {
        url = `${API_BASE_URL}/mess/menu/${editingMealId}`;
        method = "PUT";
      }

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(menuData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to save menu item."
        );
      }

      if (editingMealId) {
        setSuccessMessage(
          "Menu item updated successfully."
        );
      } else {
        setSuccessMessage(
          "Menu item added successfully."
        );
      }

      resetForm();

      await loadMenu();
    } catch (error) {
      console.error(
        "Menu save error:",
        error
      );

      setError(
        error.message ||
          "Unable to save menu item."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // EDIT MENU ITEM
  // =========================================================

  function handleEdit(item) {
    setEditingMealId(item.meal_id);

    setFormData({
      meal_name: item.meal_name || "",
      description: item.description || "",
      meal_type:
        item.meal_type || "Lunch",
      price:
        item.price !== undefined &&
        item.price !== null
          ? String(item.price)
          : "",
      available:
        item.available !== false,
    });

    setError("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================================
  // DELETE MENU ITEM
  // =========================================================

  async function handleDelete(mealId) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const token = findLoginToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/mess/menu/${mealId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to delete menu item."
        );
      }

      setSuccessMessage(
        "Menu item deleted successfully."
      );

      await loadMenu();
    } catch (error) {
      console.error(
        "Menu delete error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete menu item."
      );
    }
  }

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  function handleCancelEdit() {
    resetForm();
    setSuccessMessage("");
  }

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="menu-management-page">

        <div className="menu-loading-box">

          <div className="menu-loading-line"></div>

          <h2>
            Loading your menu
          </h2>

          <p>
            Please wait while we load your
            menu items.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="menu-management-page">

      <div className="menu-management-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="menu-page-header">

          <div>

            <span className="menu-page-label">
              MENU MANAGEMENT
            </span>

            <h1>
              Manage Your Menu
            </h1>

            <p>
              Add, update and manage the meals
              served by your mess.
            </p>

          </div>

          <div className="menu-count-card">

            <span>
              TOTAL MEALS
            </span>

            <strong>
              {menuItems.length}
            </strong>

          </div>

        </div>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div className="menu-message menu-error">

            <div className="menu-message-icon">
              !
            </div>

            <div>

              <strong>
                Something went wrong
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>

        )}

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {successMessage && (

          <div className="menu-message menu-success">

            <div className="menu-message-icon">
              ✓
            </div>

            <div>

              <strong>
                Success
              </strong>

              <p>
                {successMessage}
              </p>

            </div>

          </div>

        )}

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        <section className="menu-form-card">

          <div className="menu-section-heading">

            <div className="menu-section-number">
              {editingMealId ? "02" : "01"}
            </div>

            <div>

              <span>
                {editingMealId
                  ? "EDIT MENU ITEM"
                  : "ADD NEW MENU ITEM"}
              </span>

              <h2>
                {editingMealId
                  ? "Update meal details"
                  : "Create a new meal"}
              </h2>

              <p>
                {editingMealId
                  ? "Update the information of this menu item."
                  : "Enter the details of the meal you want to serve."}
              </p>

            </div>

          </div>

          <form
            className="menu-form"
            onSubmit={handleSubmit}
          >

            <div className="menu-form-row">

              {/* Meal Name */}

              <div className="menu-form-field">

                <label htmlFor="meal_name">
                  Meal Name
                </label>

                <input
                  id="meal_name"
                  name="meal_name"
                  type="text"
                  placeholder="Example: Veg Thali"
                  value={formData.meal_name}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Meal Type */}

              <div className="menu-form-field">

                <label htmlFor="meal_type">
                  Meal Type
                </label>

                <select
                  id="meal_type"
                  name="meal_type"
                  value={formData.meal_type}
                  onChange={handleChange}
                  required
                >

                  <option value="Breakfast">
                    Breakfast
                  </option>

                  <option value="Lunch">
                    Lunch
                  </option>

                  <option value="Dinner">
                    Dinner
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>

            {/* Description */}

            <div className="menu-form-field">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Example: Rice, dal, roti, sabji and salad"
                value={formData.description}
                onChange={handleChange}
                required
              />

            </div>

            <div className="menu-form-row">

              {/* Price */}

              <div className="menu-form-field">

                <label htmlFor="price">
                  Price
                </label>

                <div className="menu-price-input">

                  <span>
                    ₹
                  </span>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="80"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* Availability */}

              <div className="menu-form-field">

                <label>
                  Availability
                </label>

                <label className="menu-availability-toggle">

                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />

                  <span className="menu-toggle-slider"></span>

                  <span className="menu-toggle-text">

                    {formData.available
                      ? "Available"
                      : "Currently unavailable"}

                  </span>

                </label>

              </div>

            </div>

            {/* Form Buttons */}

            <div className="menu-form-actions">

              {editingMealId && (

                <button
                  type="button"
                  className="menu-cancel-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

              )}

              <button
                type="submit"
                className="menu-submit-button"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingMealId
                  ? "Update Menu Item"
                  : "Add Menu Item"}

                {!saving && (
                  <span>
                    →
                  </span>
                )}

              </button>

            </div>

          </form>

        </section>

        {/* =================================================
            CURRENT MENU
        ================================================= */}

        <section className="menu-list-section">

          <div className="menu-list-heading">

            <div>

              <span className="menu-page-label">
                YOUR MENU
              </span>

              <h2>
                Current Menu
              </h2>

              <p>
                View and manage all meals currently
                added to your mess.
              </p>

            </div>

            <div className="menu-total-items">

              {menuItems.length}

              <span>
                {menuItems.length === 1
                  ? " Meal"
                  : " Meals"}
              </span>

            </div>

          </div>

          {menuItems.length === 0 ? (

            <div className="menu-empty-state">

              <div className="menu-empty-icon">
                MENU
              </div>

              <h3>
                No Menu Items Yet
              </h3>

              <p>
                You haven't added any meals to your
                menu. Add your first meal using the
                form above.
              </p>

            </div>

          ) : (

            <div className="menu-items-grid">

              {menuItems.map((item) => (

                <article
                  className="menu-item-card"
                  key={item.meal_id}
                >

                  <div className="menu-item-top">

                    <div>

                      <span className="menu-item-type">
                        {item.meal_type}
                      </span>

                      <h3>
                        {item.meal_name}
                      </h3>

                    </div>

                    <div
                      className={`menu-item-status ${
                        item.available
                          ? "available"
                          : "unavailable"
                      }`}
                    >
                      {item.available
                        ? "Available"
                        : "Unavailable"}
                    </div>

                  </div>

                  <p className="menu-item-description">
                    {item.description}
                  </p>

                  <div className="menu-item-divider"></div>

                  <div className="menu-item-bottom">

                    <div className="menu-item-price">

                      <span>
                        PRICE
                      </span>

                      <strong>
                        ₹{Number(
                          item.price
                        ).toFixed(2)}
                      </strong>

                    </div>

                    <div className="menu-item-actions">

                      <button
                        type="button"
                        className="menu-edit-button"
                        onClick={() =>
                          handleEdit(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="menu-delete-button"
                        onClick={() =>
                          handleDelete(
                            item.meal_id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default MenuManagement;