
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./StudentProfile.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function StudentProfile() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("tiffny_token");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    photo: null,
  });

  const [monthlyPlan, setMonthlyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadProfile();
    loadMonthlyPlan();
  }, []);

  async function apiRequest(url, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("tiffny_token");
      navigate("/login");
      throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(
        data.detail || data.message || "Something went wrong."
      );
    }

    return data;
  }

  async function loadProfile() {
    try {
      setError("");
      const data = await apiRequest("/students/profile");

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        photo: data.photo || null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthlyPlan() {
    try {
      const data = await apiRequest("/orders/active-plan");
      setMonthlyPlan(data);
    } catch (err) {
      if (err.message.toLowerCase().includes("no active monthly plan")) {
        setMonthlyPlan(null);
      } else {
        console.error("Monthly plan loading error:", err);
      }
    }
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/students/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          location: profile.location.trim(),
        }),
      });

      setProfile((previous) => ({ ...previous, ...data }));
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The profile photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setUploadingPhoto(true);
    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/students/profile/photo", {
        method: "POST",
        body: formData,
      });

      setProfile((previous) => ({ ...previous, photo: data.photo }));
      setMessage("Profile photo updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  }

  async function removePhoto() {
    if (!window.confirm("Remove your profile photo?")) return;

    setMessage("");
    setError("");

    try {
      await apiRequest("/students/profile/photo", { method: "DELETE" });
      setProfile((previous) => ({ ...previous, photo: null }));
      setMessage("Profile photo removed.");
    } catch (err) {
      setError(err.message);
    }
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
  }

  async function savePassword(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (passwords.new_password !== passwords.confirm_password) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (passwords.new_password.length < 8) {
      setError("The new password must be at least 8 characters.");
      return;
    }

    if (passwords.current_password === passwords.new_password) {
      setError("Choose a different new password.");
      return;
    }

    setChangingPassword(true);

    try {
      const data = await apiRequest("/students/change-password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      });

      setMessage(data.message || "Password changed successfully.");
      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function photoUrl(photo) {
    if (!photo) return "";

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    return `${API_BASE_URL}${photo.startsWith("/") ? "" : "/"}${photo}`;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="student-profile-page">
          <div className="profile-container">
            <p>Loading your profile...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="student-profile-page">
        <div className="profile-container">
          <header className="profile-page-header">
            <div>
              <p className="profile-eyebrow">YOUR ACCOUNT</p>
              <h1>Student Profile</h1>
              <p>Manage your personal information and account settings.</p>
            </div>

            <button
              type="button"
              className="profile-secondary-button"
              onClick={() => navigate("/student/orders")}
            >
              My Orders
            </button>
          </header>

          {message && (
            <div className="profile-alert profile-alert-success" role="status">
              {message}
            </div>
          )}

          {error && (
            <div className="profile-alert profile-alert-error" role="alert">
              {error}
            </div>
          )}

          <section className="profile-card">
            <div className="profile-card-heading">
              <h2>Personal Information</h2>

              {!editing && (
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={() => {
                    setMessage("");
                    setError("");
                    setEditing(true);
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="profile-photo-section">
              {profile.photo ? (
                <img
                  className="profile-avatar"
                  src={photoUrl(profile.photo)}
                  alt="Student profile"
                />
              ) : (
                <div className="profile-avatar profile-avatar-placeholder">
                  {profile.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
              )}

              <div className="profile-photo-actions">
                <strong>Profile Photo</strong>
                <p>JPG, PNG or WEBP. Maximum size 5 MB.</p>

                <label className="profile-upload-button">
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={uploadPhoto}
                    disabled={uploadingPhoto}
                    hidden
                  />
                </label>

                {profile.photo && (
                  <button
                    type="button"
                    className="profile-text-button"
                    onClick={removePhoto}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <div className="profile-form-grid">
                <label className="profile-field">
                  <span>Full Name</span>
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    disabled={!editing || saving}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>

                <label className="profile-field">
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    readOnly
                  />
                  <small>Email changes are disabled in this version.</small>
                </label>

                <label className="profile-field">
                  <span>Phone Number</span>
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    disabled={!editing || saving}
                    required
                    minLength={10}
                    maxLength={15}
                  />
                </label>

                <label className="profile-field">
                  <span>Location</span>
                  <input
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                    disabled={!editing || saving}
                    required
                    minLength={2}
                    maxLength={250}
                  />
                </label>
              </div>

              {editing && (
                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-secondary-button"
                    disabled={saving}
                    onClick={() => {
                      setEditing(false);
                      loadProfile();
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-primary-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </section>

          <section className="profile-card">
            <div className="profile-card-heading">
              <div>
                <h2>Current Monthly Plan</h2>
                <p>Your current subscription details.</p>
              </div>
            </div>

            {monthlyPlan && monthlyPlan.status === "ACTIVE" ? (
              <>
                <div className="monthly-plan-summary">
                  <span className="monthly-plan-status">
                    Monthly Plan Active
                  </span>

                  <h3>{monthlyPlan.mess_name || "Your Mess"}</h3>

                  <p className="monthly-plan-price">
                    ₹{Number(monthlyPlan.price || 0).toLocaleString("en-IN")}
                    <span> / month</span>
                  </p>
                </div>

                <div className="monthly-plan-dates">
                  <div>
                    <span>Starting Date</span>
                    <strong>{formatDate(monthlyPlan.start_date)}</strong>
                  </div>

                  <div>
                    <span>Ending Date</span>
                    <strong>{formatDate(monthlyPlan.end_date)}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="profile-empty-plan">
                <h3>No active monthly plan</h3>
                <p>
                  Once you successfully pay for a monthly plan, its details
                  will appear here.
                </p>
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={() => navigate("/messes")}
                >
                  Find a Mess
                </button>
              </div>
            )}

            <button
              type="button"
              className="profile-primary-button"
              onClick={() => navigate("/student/orders")}
            >
              View My Orders
            </button>
          </section>

          <section className="profile-card">
            <div className="profile-card-heading">
              <div>
                <h2>Change Password</h2>
                <p>Enter your current password to set a new one.</p>
              </div>
            </div>

            <form onSubmit={savePassword}>
              <div className="profile-password-fields">
                <label className="profile-field">
                  <span>Current Password</span>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="current_password"
                      value={passwords.current_password}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-button"
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                      onClick={() =>
                        setShowCurrentPassword((previous) => !previous)
                      }
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <label className="profile-field">
                  <span>New Password</span>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="new_password"
                      value={passwords.new_password}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-button"
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      onClick={() =>
                        setShowNewPassword((previous) => !previous)
                      }
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <label className="profile-field">
                  <span>Confirm New Password</span>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={passwords.confirm_password}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="profile-primary-button"
                disabled={changingPassword}
              >
                {changingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

export default StudentProfile;
