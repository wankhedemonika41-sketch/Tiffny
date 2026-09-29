import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./MessProfile.css";

const API_BASE_URL = "http://127.0.0.1:8000";


/* =========================================================
   FIND LOGIN TOKEN
========================================================= */

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

  /* Check localStorage */

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  /* Check sessionStorage */

  for (const key of possibleKeys) {
    const value = sessionStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  /* Check localStorage for JWT directly */

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

    /* Check if token is inside JSON */

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
        /* Value is not JSON. Continue checking. */
      }
    }
  }

  /* Check sessionStorage for JWT directly */

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

    /* Check JSON object in sessionStorage */

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
        /* Value is not JSON. Continue checking. */
      }
    }
  }

  return null;
}


/* =========================================================
   MESS PROFILE
========================================================= */

function MessProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  /* Check whether current page is Edit Profile */

  const isEditMode =
    location.pathname === "/mess/profile/edit";


  /* =======================================================
     STATE
  ======================================================= */

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");


  /* =======================================================
     EDIT FORM STATE
  ======================================================= */

  const [formData, setFormData] = useState({
    mess_name: "",
    description: "",
    phone: "",
    address: "",
    location: "",
  });


  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    loadMessProfile();
  }, []);


  async function loadMessProfile() {
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
          data.detail ||
            "Failed to load mess profile."
        );
      }

      setProfile(data);

      /* Fill edit form with existing profile */

      setFormData({
        mess_name: data.mess_name || "",
        description: data.description || "",
        phone: data.phone || "",
        address: data.address || "",
        location: data.location || "",
      });

    } catch (error) {
      console.error(
        "Mess profile loading error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  }


  /* =======================================================
     FILE URL
  ======================================================= */

  function getFileUrl(filePath) {
    if (!filePath) {
      return "";
    }

    if (
      filePath.startsWith("http://") ||
      filePath.startsWith("https://")
    ) {
      return filePath;
    }

    return `${API_BASE_URL}${filePath}`;
  }


  /* =======================================================
     CHECK PDF
  ======================================================= */

  function isPdf(filePath) {
    if (!filePath) {
      return false;
    }

    return filePath
      .toLowerCase()
      .endsWith(".pdf");
  }


  /* =======================================================
     VIEW VERIFICATION PROOF
  ======================================================= */

  function handleViewProof() {
    if (!profile?.verification_proof) {
      return;
    }

    const proofUrl = getFileUrl(
      profile.verification_proof
    );

    window.open(
      proofUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }


  /* =======================================================
     EDIT PROFILE
  ======================================================= */

  function handleEditProfile() {
    navigate("/mess/profile/edit");
  }


  /* =======================================================
     HANDLE FORM CHANGE
  ======================================================= */

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );
  }


  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  async function handleSaveChanges(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = findLoginToken();

      if (!token) {
        setError("Please login first.");
        setSaving(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/mess/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            mess_name: formData.mess_name,
            description: formData.description,
            phone: formData.phone,
            address: formData.address,
            location: formData.location,

            /*
              Keep existing photo and
              verification proof.
            */

            photo: profile?.photo || null,

            verification_proof:
              profile?.verification_proof ||
              null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update mess profile."
        );
      }

      /*
        Reload the profile so the
        latest information is displayed.
      */

      await loadMessProfile();

      alert(
        "Mess profile updated successfully."
      );

      navigate("/mess/profile");

    } catch (error) {
      console.error(
        "Mess profile update error:",
        error
      );

      setError(error.message);

    } finally {
      setSaving(false);
    }
  }


  /* =======================================================
     CANCEL EDIT
  ======================================================= */

  function handleCancelEdit() {
    navigate("/mess/profile");
  }


  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="mess-profile-loading">

        <div className="mess-loading-box">

          <div className="mess-loading-line"></div>

          <h2>
            Loading your profile
          </h2>

          <p>
            Please wait while we load your mess
            information.
          </p>

        </div>

      </div>
    );
  }


  /* =======================================================
     ERROR SCREEN
  ======================================================= */

  if (error && !profile) {
    return (
      <div className="mess-profile-loading">

        <div className="mess-loading-box">

          <h2>
            {error === "Please login first."
              ? "Please login first"
              : "Unable to load profile"}
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="mess-primary-button"
            onClick={() =>
              navigate("/login")
            }
          >
            Go to Login
          </button>

        </div>

      </div>
    );
  }


  /* =======================================================
     NO PROFILE
  ======================================================= */

  if (!profile) {
    return (
      <div className="mess-profile-loading">

        <div className="mess-loading-box">

          <h2>
            No Mess Profile Found
          </h2>

          <p>
            Your mess profile has not been created yet.
          </p>

          <button
            type="button"
            className="mess-primary-button"
            onClick={() =>
              navigate("/mess/profile")
            }
          >
            Create Mess Profile
          </button>

        </div>

      </div>
    );
  }


  /* =======================================================
     FILE URLS
  ======================================================= */

  const messImageUrl = getFileUrl(
    profile.photo
  );

  const proofUrl = getFileUrl(
    profile.verification_proof
  );


  /* =======================================================
     EDIT PROFILE PAGE
  ======================================================= */

  if (isEditMode) {
    return (
      <div className="mess-profile-page">

        {/* =================================================
            LEFT INFORMATION SECTION
        ================================================= */}

        <section className="mess-profile-info">

          <div className="mess-profile-info-content">

            <div className="mess-profile-brand">

              <div className="mess-profile-brand-mark">
                T
              </div>

              <span>
                tiffny
              </span>

            </div>


            <p className="mess-profile-label">
              MESS OWNER
            </p>


            <h1>
              Update your
              <br />
              mess
              <span> profile.</span>
            </h1>


            <p className="mess-profile-description">
              Update your mess information whenever
              your details change.
            </p>


            <div className="mess-profile-steps">

              <div className="mess-profile-step">

                <div className="mess-step-number">
                  01
                </div>

                <div>

                  <h3>
                    Update information
                  </h3>

                  <p>
                    Change your mess details.
                  </p>

                </div>

              </div>


              <div className="mess-profile-step">

                <div className="mess-step-number">
                  02
                </div>

                <div>

                  <h3>
                    Review changes
                  </h3>

                  <p>
                    Check your information before saving.
                  </p>

                </div>

              </div>


              <div className="mess-profile-step">

                <div className="mess-step-number">
                  03
                </div>

                <div>

                  <h3>
                    Save profile
                  </h3>

                  <p>
                    Your updated information will be saved.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            EDIT FORM SECTION
        ================================================= */}

        <section className="mess-profile-form-section">

          <div className="mess-profile-container">

            <div className="mess-profile-heading">

              <span>
                EDIT MESS PROFILE
              </span>

              <h2>
                Update your profile
              </h2>

              <p>
                Change the information you want to update.
              </p>

            </div>


            <form
              className="mess-profile-form"
              onSubmit={handleSaveChanges}
            >

              {/* =========================================
                  MESS INFORMATION
              ========================================= */}

              <div className="mess-profile-section-title">

                <span>
                  01
                </span>

                <div>

                  <h3>
                    Mess Information
                  </h3>

                  <p>
                    Update your basic mess information.
                  </p>

                </div>

              </div>


              <div className="mess-profile-row">

                <div className="mess-profile-field">

                  <label htmlFor="mess_name">
                    Mess Name
                  </label>

                  <input
                    id="mess_name"
                    name="mess_name"
                    type="text"
                    value={formData.mess_name}
                    onChange={handleChange}
                    required
                  />

                </div>


                <div className="mess-profile-field">

                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              <div className="mess-profile-field">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />

              </div>


              {/* =========================================
                  LOCATION
              ========================================= */}

              <div className="mess-profile-section-title">

                <span>
                  02
                </span>

                <div>

                  <h3>
                    Mess Location
                  </h3>

                  <p>
                    Update your mess address and location.
                  </p>

                </div>

              </div>


              <div className="mess-profile-field">

                <label htmlFor="address">
                  Mess Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  required
                />

              </div>


              <div className="mess-profile-field">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* =========================================
                  CURRENT FILES
              ========================================= */}

              <div className="mess-profile-section-title">

                <span>
                  03
                </span>

                <div>

                  <h3>
                    Current Documents
                  </h3>

                  <p>
                    Your existing uploaded files are kept.
                  </p>

                </div>

              </div>


              <div className="mess-upload-grid">

                {/* MESS IMAGE */}

                <div className="mess-upload-box">

                  <div className="mess-upload-icon">
                    IMG
                  </div>

                  <h3>
                    Current Mess Image
                  </h3>

                  {messImageUrl ? (

                    <div className="mess-file-preview">

                      <img
                        src={messImageUrl}
                        alt="Current mess"
                        className="mess-image-preview"
                      />

                    </div>

                  ) : (

                    <p>
                      No mess image available.
                    </p>

                  )}

                </div>


                {/* VERIFICATION PROOF */}

                <div className="mess-upload-box">

                  <div className="mess-upload-icon">
                    DOC
                  </div>

                  <h3>
                    Verification Proof
                  </h3>

                  {profile.verification_proof ? (

                    <div className="mess-file-preview">

                      {isPdf(
                        profile.verification_proof
                      ) ? (

                        <div className="mess-pdf-preview">

                          <div className="mess-pdf-icon">
                            PDF
                          </div>

                          <p>
                            Verification document
                          </p>

                        </div>

                      ) : (

                        <img
                          src={proofUrl}
                          alt="Verification proof"
                          className="mess-proof-image-preview"
                        />

                      )}

                      <button
                        type="button"
                        className="mess-view-proof-button"
                        onClick={handleViewProof}
                      >
                        View Proof
                      </button>

                    </div>

                  ) : (

                    <p>
                      No verification proof available.
                    </p>

                  )}

                </div>

              </div>


              {/* =========================================
                  ERROR
              ========================================= */}

              {error && (
                <div className="mess-profile-info-box">

                  <div className="mess-info-symbol">
                    !
                  </div>

                  <div>

                    <strong>
                      Unable to save changes
                    </strong>

                    <p>
                      {error}
                    </p>

                  </div>

                </div>
              )}


              {/* =========================================
                  BUTTONS
              ========================================= */}

              <div className="mess-form-actions">

                <button
                  type="button"
                  className="mess-cancel-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="mess-profile-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}

                  {!saving && (
                    <span>
                      →
                    </span>
                  )}

                </button>

              </div>

            </form>

          </div>

        </section>

      </div>
    );
  }


  /* =======================================================
     MAIN PROFILE VIEW PAGE
  ======================================================= */

  return (
    <div className="mess-profile-view-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="mess-profile-view-header">

        <div
          className="mess-profile-view-brand"
          onClick={() => navigate("/")}
        >

          <div className="mess-profile-view-brand-mark">
            T
          </div>

          <span>
            tiffny
          </span>

        </div>

        {/* Dashboard button removed */}

        {/* Top Edit button removed */}

      </header>


      {/* ===================================================
          MAIN CONTAINER
      =================================================== */}

      <main className="mess-profile-view-container">

        {/* =================================================
            PAGE HEADING
        ================================================= */}

        <div className="mess-profile-view-heading">

          <div>

            <span className="mess-profile-view-label">
              MESS OWNER
            </span>

            <h1>
              Your Mess Profile
            </h1>

            <p>
              View and manage the information of your
              registered mess.
            </p>

          </div>


          <div
            className={`mess-status-badge ${
              profile.status
                ? profile.status.toLowerCase()
                : "pending"
            }`}
          >
            {profile.status || "PENDING"}
          </div>

        </div>


        {/* =================================================
            PROFILE GRID
        ================================================= */}

        <div className="mess-profile-view-grid">

          {/* ===============================================
              MESS IMAGE
          =============================================== */}

          <div className="mess-profile-image-card">

            <span className="mess-card-label">
              MESS PROFILE
            </span>

            <h2>
              Mess Image
            </h2>

            {messImageUrl ? (

              <img
                src={messImageUrl}
                alt="Mess"
                className="mess-existing-image"
              />

            ) : (

              <div className="mess-no-image">
                No mess image available
              </div>

            )}

          </div>


          {/* ===============================================
              MESS INFORMATION
          =============================================== */}

          <div className="mess-profile-details-card">

            <span className="mess-card-label">
              MESS INFORMATION
            </span>

            <h2>
              {profile.mess_name}
            </h2>


            {/* Description */}

            <div className="mess-detail-item">

              <span>
                Description
              </span>

              <p>
                {profile.description ||
                  "Not provided"}
              </p>

            </div>


            {/* Phone */}

            <div className="mess-detail-item">

              <span>
                Phone Number
              </span>

              <p>
                {profile.phone ||
                  "Not provided"}
              </p>

            </div>


            {/* Address */}

            <div className="mess-detail-item">

              <span>
                Address
              </span>

              <p>
                {profile.address ||
                  "Not provided"}
              </p>

            </div>


            {/* Location */}

            <div className="mess-detail-item">

              <span>
                Location
              </span>

              <p>
                {profile.location ||
                  "Not provided"}
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            VERIFICATION STATUS
        ================================================= */}

        <div className="mess-verification-card">

          <div className="mess-verification-icon">
            i
          </div>

          <div className="mess-verification-content">

            <span>
              VERIFICATION STATUS
            </span>

            <h2>

              Your mess is{" "}

              <strong>
                {profile.status || "PENDING"}
              </strong>

            </h2>

            <p>

              {profile.status === "APPROVED"
                ? "Your mess profile has been approved by the admin."
                : profile.status === "REJECTED"
                ? "Your mess profile was rejected by the admin."
                : profile.status === "SUSPENDED"
                ? "Your mess profile has been suspended."
                : "Your mess profile has been submitted and will be reviewed by the admin."}

            </p>

          </div>

        </div>


        {/* =================================================
            VERIFICATION PROOF
        ================================================= */}

        {profile.verification_proof && (

          <div className="mess-proof-view-card">

            <span className="mess-card-label">
              VERIFICATION PROOF
            </span>

            <div className="mess-proof-view-content">

              {/* ===========================================
                  PDF PROOF
              =========================================== */}

              {isPdf(
                profile.verification_proof
              ) ? (

                <div className="mess-proof-document">

                  <div className="mess-proof-document-icon">
                    PDF
                  </div>

                  <div>

                    <h3>
                      Verification document
                    </h3>

                    <button
                      type="button"
                      className="mess-view-proof-button"
                      onClick={handleViewProof}
                    >
                      View PDF
                    </button>

                  </div>

                </div>

              ) : (

                /* =========================================
                   IMAGE PROOF
                ========================================= */

                <div>

                  <img
                    src={proofUrl}
                    alt="Verification proof"
                    className="mess-existing-proof-image"
                  />

                  <button
                    type="button"
                    className="mess-view-proof-button"
                    onClick={handleViewProof}
                  >
                    View Proof
                  </button>

                </div>

              )}

            </div>

          </div>

        )}


        {/* =================================================
            BOTTOM ACTIONS
        ================================================= */}

        <div className="mess-profile-bottom-actions">

          {/* Only ONE button */}

          <button
            type="button"
            className="mess-primary-button"
            onClick={handleEditProfile}
          >
            Edit Mess Profile
          </button>

        </div>

      </main>

    </div>
  );
}

export default MessProfile;