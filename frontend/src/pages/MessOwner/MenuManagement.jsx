import { useEffect, useMemo, useState } from "react";
import "./MenuManagement.css";

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

const EMPTY_MEAL = {
  meal_name: "",
  description: "",
  price: "",
  available: true,
};

const EMPTY_FORM = {
  day: "MONDAY",
  holiday: false,
  lunch: { ...EMPTY_MEAL },
  dinner: { ...EMPTY_MEAL },
};

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    lunch: { ...EMPTY_MEAL },
    dinner: { ...EMPTY_MEAL },
  });

  const [editingMenuId, setEditingMenuId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const dayOrder = useMemo(() => {
    return DAYS.reduce((result, day, index) => {
      result[day] = index + 1;
      return result;
    }, {});
  }, []);

  useEffect(() => {
    loadMenu();
  }, []);

  // =========================================================
  // LOAD WEEKLY MENU
  // =========================================================

  async function loadMenu() {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("tiffny_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/mess/menu`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load weekly menu."
        );
      }

      const sortedMenu = Array.isArray(data)
        ? [...data].sort(
            (a, b) =>
              (dayOrder[a.day] || 99) -
              (dayOrder[b.day] || 99)
          )
        : [];

      setMenuItems(sortedMenu);
    } catch (error) {
      console.error("Load menu error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // FORM RESET
  // =========================================================

  function resetForm() {
    setFormData({
      day: "MONDAY",
      holiday: false,
      lunch: { ...EMPTY_MEAL },
      dinner: { ...EMPTY_MEAL },
    });

    setEditingMenuId(null);
  }

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  function handleDayChange(event) {
    const selectedDay = event.target.value;

    setFormData((previous) => ({
      ...previous,
      day: selectedDay,
    }));
  }

  function handleHolidayChange(event) {
    const isHoliday = event.target.checked;

    setFormData((previous) => ({
      ...previous,
      holiday: isHoliday,
    }));
  }

  function handleMealChange(mealType, field, value) {
    setFormData((previous) => ({
      ...previous,
      [mealType]: {
        ...previous[mealType],
        [field]: value,
      },
    }));
  }

  function handleAvailabilityChange(mealType) {
    setFormData((previous) => ({
      ...previous,
      [mealType]: {
        ...previous[mealType],
        available: !previous[mealType].available,
      },
    }));
  }

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  function validateForm() {
    if (!formData.day) {
      setError("Please select a day.");
      return false;
    }

    if (formData.holiday) {
      return true;
    }

    const lunchEmpty =
      !formData.lunch.meal_name.trim() &&
      !formData.lunch.description.trim() &&
      !formData.lunch.price;

    const dinnerEmpty =
      !formData.dinner.meal_name.trim() &&
      !formData.dinner.description.trim() &&
      !formData.dinner.price;

    if (lunchEmpty && dinnerEmpty) {
      setError(
        "Please add at least Lunch or Dinner, or mark the day as a holiday."
      );
      return false;
    }

    if (!lunchEmpty) {
      if (!formData.lunch.meal_name.trim()) {
        setError("Please enter the lunch meal name.");
        return false;
      }

      if (!formData.lunch.description.trim()) {
        setError("Please enter the lunch description.");
        return false;
      }

      if (
        !formData.lunch.price ||
        Number(formData.lunch.price) <= 0
      ) {
        setError("Please enter a valid lunch price.");
        return false;
      }
    }

    if (!dinnerEmpty) {
      if (!formData.dinner.meal_name.trim()) {
        setError("Please enter the dinner meal name.");
        return false;
      }

      if (!formData.dinner.description.trim()) {
        setError("Please enter the dinner description.");
        return false;
      }

      if (
        !formData.dinner.price ||
        Number(formData.dinner.price) <= 0
      ) {
        setError("Please enter a valid dinner price.");
        return false;
      }
    }

    return true;
  }

  // =========================================================
  // PREPARE MEAL DATA
  // =========================================================

  function prepareMeal(meal) {
    if (
      !meal ||
      !meal.meal_name?.trim()
    ) {
      return null;
    }

    return {
      meal_name: meal.meal_name.trim(),
      description: meal.description.trim(),
      price: Number(meal.price),
      available: Boolean(meal.available),
    };
  }

  // =========================================================
  // ADD / UPDATE MENU
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const requestBody = {
      day: formData.day,
      lunch: formData.holiday
        ? null
        : prepareMeal(formData.lunch),
      dinner: formData.holiday
        ? null
        : prepareMeal(formData.dinner),
      holiday: formData.holiday,
    };

    try {
      setSaving(true);

      const url = editingMenuId
        ? `${API_BASE_URL}/mess/menu/${editingMenuId}`
        : `${API_BASE_URL}/mess/menu`;

      const method = editingMenuId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Unable to ${
              editingMenuId ? "update" : "add"
            } menu.`
        );
      }

      setSuccessMessage(
        editingMenuId
          ? "Weekly menu updated successfully."
          : "Weekly menu added successfully."
      );

      resetForm();
      await loadMenu();
    } catch (error) {
      console.error("Save menu error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // EDIT MENU
  // =========================================================

  function handleEdit(item) {
    setError("");
    setSuccessMessage("");

    setEditingMenuId(item.menu_id);

    setFormData({
      day: item.day || "MONDAY",
      holiday: Boolean(item.holiday),

      lunch: {
        meal_name: item.lunch?.meal_name || "",
        description: item.lunch?.description || "",
        price:
          item.lunch?.price !== undefined
            ? item.lunch.price
            : "",
        available:
          item.lunch?.available !== undefined
            ? item.lunch.available
            : true,
      },

      dinner: {
        meal_name: item.dinner?.meal_name || "",
        description: item.dinner?.description || "",
        price:
          item.dinner?.price !== undefined
            ? item.dinner.price
            : "",
        available:
          item.dinner?.available !== undefined
            ? item.dinner.available
            : true,
      },
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  function handleCancelEdit() {
    resetForm();
    setError("");
    setSuccessMessage("");
  }

  // =========================================================
  // DELETE MENU
  // =========================================================

  async function handleDelete(menuId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this day's menu?"
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setDeletingId(menuId);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/mess/menu/${menuId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to delete menu."
        );
      }

      setSuccessMessage(
        "Daily menu deleted successfully."
      );

      if (editingMenuId === menuId) {
        resetForm();
      }

      await loadMenu();
    } catch (error) {
      console.error("Delete menu error:", error);
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================================
  // FORMAT DAY
  // =========================================================

  function formatDay(day) {
    if (!day) {
      return "";
    }

    return (
      day.charAt(0).toUpperCase() +
      day.slice(1).toLowerCase()
    );
  }

  // =========================================================
  // COUNT MEALS
  // =========================================================

  function getTotalMeals() {
    return menuItems.reduce((total, item) => {
      if (item.holiday) {
        return total;
      }

      let count = total;

      if (item.lunch) {
        count += 1;
      }

      if (item.dinner) {
        count += 1;
      }

      return count;
    }, 0);
  }

  // =========================================================
  // MEAL CARD
  // =========================================================

  function MealCard({ title, meal }) {
    if (!meal) {
      return (
        <div className="weekly-meal-card weekly-meal-empty">
          <div className="weekly-meal-heading">
            <span>{title}</span>
          </div>

          <p>
            No {title.toLowerCase()} menu added.
          </p>
        </div>
      );
    }

    return (
      <div className="weekly-meal-card">
        <div className="weekly-meal-heading">
          <span>{title}</span>

          <div
            className={`meal-status ${
              meal.available
                ? "available"
                : "unavailable"
            }`}
          >
            {meal.available
              ? "Available"
              : "Unavailable"}
          </div>
        </div>

        <h4>{meal.meal_name}</h4>

        <p className="weekly-meal-description">
          {meal.description}
        </p>

        <div className="weekly-meal-footer">
          <div>
            <span>PRICE</span>
            <strong>
              ₹
              {Number(meal.price).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="menu-management-page">
        <div className="menu-loading-box">
          <div className="menu-loading-line"></div>

          <h2>Loading Weekly Menu</h2>

          <p>
            Please wait while we load your menu.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

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

            <h1>Manage Your Weekly Menu</h1>

            <p>
              Add and manage Lunch and Dinner for
              each day of your weekly menu.
            </p>
          </div>

          <div className="menu-count-card">
            <span>WEEKLY MEALS</span>

            <strong>{getTotalMeals()}</strong>

            <small>
              {menuItems.length}{" "}
              {menuItems.length === 1
                ? "day"
                : "days"}{" "}
              configured
            </small>
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
              <strong>Something went wrong</strong>

              <p>{error}</p>
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
              <strong>Success</strong>

              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* =================================================
            ADD / EDIT WEEKLY MENU
        ================================================= */}

        <section className="menu-form-card">

          <div className="menu-section-heading">
            <div className="menu-section-number">
              {editingMenuId ? "02" : "01"}
            </div>

            <div>
              <span>
                {editingMenuId
                  ? "EDIT DAILY MENU"
                  : "ADD DAILY MENU"}
              </span>

              <h2>
                {editingMenuId
                  ? "Update your daily menu"
                  : "Create a daily menu"}
              </h2>

              <p>
                Set Lunch and Dinner for one day.
                You can also mark the day as a
                holiday.
              </p>
            </div>
          </div>

          <form
            className="menu-form"
            onSubmit={handleSubmit}
          >

            {/* DAY */}

            <div className="menu-day-selector">
              <div className="menu-form-field">
                <label htmlFor="day">
                  Select Day
                </label>

                <select
                  id="day"
                  value={formData.day}
                  onChange={handleDayChange}
                  disabled={saving}
                >
                  {DAYS.map((day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {formatDay(day)}
                    </option>
                  ))}
                </select>
              </div>

              <label className="holiday-toggle">
                <input
                  type="checkbox"
                  checked={formData.holiday}
                  onChange={handleHolidayChange}
                  disabled={saving}
                />

                <span className="holiday-checkbox">
                  {formData.holiday ? "✓" : ""}
                </span>

                <span>
                  Mark as Holiday
                </span>
              </label>
            </div>

            {/* HOLIDAY MESSAGE */}

            {formData.holiday ? (
              <div className="holiday-message">
                <div className="holiday-message-icon">
                  H
                </div>

                <div>
                  <strong>
                    {formatDay(formData.day)} is a
                    holiday
                  </strong>

                  <p>
                    No Lunch or Dinner will be
                    scheduled for this day.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* =================================================
                    LUNCH
                ================================================= */}

                <div className="meal-form-section">

                  <div className="meal-form-header">
                    <div>
                      <span className="meal-form-label">
                        MEAL 01
                      </span>

                      <h3>Lunch</h3>

                      <p>
                        Enter the lunch served on{" "}
                        {formatDay(formData.day)}.
                      </p>
                    </div>
                  </div>

                  <div className="meal-form-grid">

                    <div className="menu-form-field">
                      <label htmlFor="lunch_meal_name">
                        Meal Name
                      </label>

                      <input
                        id="lunch_meal_name"
                        type="text"
                        placeholder="Example: Dal Rice"
                        value={
                          formData.lunch.meal_name
                        }
                        onChange={(event) =>
                          handleMealChange(
                            "lunch",
                            "meal_name",
                            event.target.value
                          )
                        }
                        disabled={saving}
                      />
                    </div>

                    <div className="menu-form-field">
                      <label htmlFor="lunch_price">
                        Price
                      </label>

                      <div className="menu-price-input">
                        <span>₹</span>

                        <input
                          id="lunch_price"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="80"
                          value={
                            formData.lunch.price
                          }
                          onChange={(event) =>
                            handleMealChange(
                              "lunch",
                              "price",
                              event.target.value
                            )
                          }
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="menu-form-field">
                    <label htmlFor="lunch_description">
                      Description
                    </label>

                    <textarea
                      id="lunch_description"
                      rows="3"
                      placeholder="Example: Rice, dal, roti, sabji and salad"
                      value={
                        formData.lunch.description
                      }
                      onChange={(event) =>
                        handleMealChange(
                          "lunch",
                          "description",
                          event.target.value
                        )
                      }
                      disabled={saving}
                    />
                  </div>

                  <label className="meal-availability">
                    <input
                      type="checkbox"
                      checked={
                        formData.lunch.available
                      }
                      onChange={() =>
                        handleAvailabilityChange(
                          "lunch"
                        )
                      }
                      disabled={saving}
                    />

                    <span className="availability-box">
                      {formData.lunch.available
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      Lunch is available
                    </span>
                  </label>
                </div>

                {/* =================================================
                    DINNER
                ================================================= */}

                <div className="meal-form-section">

                  <div className="meal-form-header">
                    <div>
                      <span className="meal-form-label">
                        MEAL 02
                      </span>

                      <h3>Dinner</h3>

                      <p>
                        Enter the dinner served on{" "}
                        {formatDay(formData.day)}.
                      </p>
                    </div>
                  </div>

                  <div className="meal-form-grid">

                    <div className="menu-form-field">
                      <label htmlFor="dinner_meal_name">
                        Meal Name
                      </label>

                      <input
                        id="dinner_meal_name"
                        type="text"
                        placeholder="Example: Paneer Roti"
                        value={
                          formData.dinner.meal_name
                        }
                        onChange={(event) =>
                          handleMealChange(
                            "dinner",
                            "meal_name",
                            event.target.value
                          )
                        }
                        disabled={saving}
                      />
                    </div>

                    <div className="menu-form-field">
                      <label htmlFor="dinner_price">
                        Price
                      </label>

                      <div className="menu-price-input">
                        <span>₹</span>

                        <input
                          id="dinner_price"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="80"
                          value={
                            formData.dinner.price
                          }
                          onChange={(event) =>
                            handleMealChange(
                              "dinner",
                              "price",
                              event.target.value
                            )
                          }
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="menu-form-field">
                    <label htmlFor="dinner_description">
                      Description
                    </label>

                    <textarea
                      id="dinner_description"
                      rows="3"
                      placeholder="Example: Paneer sabji, roti and salad"
                      value={
                        formData.dinner.description
                      }
                      onChange={(event) =>
                        handleMealChange(
                          "dinner",
                          "description",
                          event.target.value
                        )
                      }
                      disabled={saving}
                    />
                  </div>

                  <label className="meal-availability">
                    <input
                      type="checkbox"
                      checked={
                        formData.dinner.available
                      }
                      onChange={() =>
                        handleAvailabilityChange(
                          "dinner"
                        )
                      }
                      disabled={saving}
                    />

                    <span className="availability-box">
                      {formData.dinner.available
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      Dinner is available
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* FORM BUTTONS */}

            <div className="menu-form-actions">

              {editingMenuId && (
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
                  : editingMenuId
                  ? "Update Day Menu"
                  : "Save Day Menu"}

                {!saving && (
                  <span>→</span>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* =================================================
            WEEKLY MENU
        ================================================= */}

        <section className="menu-list-section">

          <div className="menu-list-heading">
            <div>
              <span className="menu-page-label">
                YOUR MENU
              </span>

              <h2>Weekly Menu</h2>

              <p>
                View and manage your Lunch and Dinner
                for each day.
              </p>
            </div>

            <div className="menu-total-items">
              {menuItems.length}

              <span>
                {menuItems.length === 1
                  ? " Day"
                  : " Days"}
              </span>
            </div>
          </div>

          {menuItems.length === 0 ? (
            <div className="menu-empty-state">
              <div className="menu-empty-icon">
                MENU
              </div>

              <h3>
                No Weekly Menu Yet
              </h3>

              <p>
                You haven't added any daily menus.
                Start by creating your first day
                above.
              </p>
            </div>
          ) : (
            <div className="weekly-menu-list">
              {menuItems.map((item) => (
                <article
                  className={`weekly-day-card ${
                    item.holiday
                      ? "holiday-day-card"
                      : ""
                  }`}
                  key={item.menu_id}
                >

                  <div className="weekly-day-header">

                    <div>
                      <span className="weekly-day-label">
                        WEEKLY MENU
                      </span>

                      <h3>
                        {formatDay(item.day)}
                      </h3>
                    </div>

                    <div className="weekly-day-actions">

                      {item.holiday && (
                        <span className="holiday-badge">
                          Holiday
                        </span>
                      )}

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
                            item.menu_id
                          )
                        }
                        disabled={
                          deletingId ===
                          item.menu_id
                        }
                      >
                        {deletingId ===
                        item.menu_id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>

                  {item.holiday ? (
                    <div className="holiday-display">
                      <div className="holiday-display-icon">
                        H
                      </div>

                      <div>
                        <strong>
                          Holiday
                        </strong>

                        <p>
                          No Lunch or Dinner is
                          scheduled for this day.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="weekly-meals-grid">

                      <MealCard
                        title="Lunch"
                        meal={item.lunch}
                      />

                      <MealCard
                        title="Dinner"
                        meal={item.dinner}
                      />

                    </div>
                  )}
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