import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./MessProfile.css";

const API_BASE_URL = "http://127.0.0.1:8000";

// route used to upload a new mess image
const UPLOAD_PHOTO_URL = `${API_BASE_URL}/mess/upload-photo`;
const UPLOAD_PHOTO_FIELD = "file";

const MAX_IMAGE_SIZE_MB = 5;

// we don't know where the token was saved, so check the usual places
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

  const storages = [localStorage, sessionStorage];

  // first try the common key names
  for (const storage of storages) {
    for (const key of possibleKeys) {
      const value = storage.getItem(key);
      if (value) return value;
    }
  }

  // if that fails, look through everything that is stored
  for (const storage of storages) {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      const value = storage.getItem(key);

      // looks like a jwt
      if (
        value &&
        typeof value === "string" &&
        value.startsWith("eyJ") &&
        value.split(".").length === 3
      ) {
        return value;
      }

      // maybe the token is inside a json object
      if (value) {
        try {
          const parsed = JSON.parse(value);

          if (parsed && typeof parsed === "object") {
            const token =
              parsed.access_token ||
              parsed.accessToken ||
              parsed.token ||
              parsed.jwt ||
              parsed.authToken;

            if (token && typeof token === "string") {
              return token;
            }
          }
        } catch {
          // not json, ignore
        }
      }
    }
  }

  return null;
}

function MessProfile() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // new image picked by the user (not saved yet)
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState("");

  const [formData, setFormData] = useState({
    mess_name: "",
    description: "",
    phone: "",
    address: "",
    location: "",
  });

  // load the profile when the page opens
  useEffect(() => {
    loadMessProfile();
  }, []);

  // free the preview url when it changes or the page closes
  useEffect(() => {
    return () => {
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
      }
    };
  }, [newImagePreview]);

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

      const response = await fetch(`${API_BASE_URL}/mess/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load mess profile.");
      }

      setProfile(data);

      // fill the form with the saved values
      setFormData({
        mess_name: data.mess_name || "",
        description: data.description || "",
        phone: data.phone || "",
        address: data.address || "",
        location: data.location || "",
      });
    } catch (error) {
      console.error("Mess profile loading error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // add the backend url if the path is not a full link
  function getFileUrl(filePath) {
    if (!filePath) return "";

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    return `${API_BASE_URL}${filePath}`;
  }

  function isPdf(filePath) {
    if (!filePath) return false;

    return filePath.toLowerCase().endsWith(".pdf");
  }

  function handleViewProof() {
    if (!profile?.verification_proof) return;

    window.open(
      getFileUrl(profile.verification_proof),
      "_blank",
      "noopener,noreferrer"
    );
  }

  // opens the image that is on screen (new one if picked, else the saved one)
  function handleViewImage() {
    const url = newImagePreview || getFileUrl(profile?.photo);

    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleChooseImage() {
    imageInputRef.current?.click();
  }

  function handleImageSelected(event) {
    const file = event.target.files?.[0];

    // reset the input so the same file can be picked again
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }

    setError("");
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveNewImage() {
    setNewImageFile(null);
    setNewImagePreview("");
  }

  function handleEditProfile() {
    setError("");
    setIsEditMode(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  // uploads the new image and gives back the saved path
  async function uploadNewImage(token) {
    const body = new FormData();
    body.append(UPLOAD_PHOTO_FIELD, newImageFile);

    // don't set Content-Type here, the browser adds it for FormData
    const response = await fetch(UPLOAD_PHOTO_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to upload the new image.");
    }

    const uploadedPath =
      data.photo ||
      data.url ||
      data.path ||
      data.file_path ||
      data.file_url ||
      data.filename;

    if (!uploadedPath) {
      throw new Error("Upload succeeded but no image path was returned.");
    }

    return uploadedPath;
  }

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

      // keep the old photo unless a new one was picked
      let photoPath = profile?.photo || null;

      if (newImageFile) {
        photoPath = await uploadNewImage(token);
      }

      const response = await fetch(`${API_BASE_URL}/mess/profile`, {
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
          photo: photoPath,
          verification_proof: profile?.verification_proof || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update mess profile.");
      }

      await loadMessProfile();

      handleRemoveNewImage();

      alert("Mess profile updated successfully.");

      setIsEditMode(false);
    } catch (error) {
      console.error("Mess profile update error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    handleRemoveNewImage();
    setIsEditMode(false);
    setError("");

    // put the form back to the saved values
    if (profile) {
      setFormData({
        mess_name: profile.mess_name || "",
        description: profile.description || "",
        phone: profile.phone || "",
        address: profile.address || "",
        location: profile.location || "",
      });
    }
  }

  // ---------- loading screen ----------
  if (loading) {
    return (
      <div className="mess-profile-loading">
        <div className="mess-loading-box">
          <div className="mess-loading-line"></div>

          <h2>Loading your profile</h2>

          <p>Please wait while we load your mess information.</p>
        </div>
      </div>
    );
  }

  // ---------- error screen ----------
  if (error && !profile) {
    return (
      <div className="mess-profile-loading">
        <div className="mess-loading-box">
          <h2>
            {error === "Please login first."
              ? "Please login first"
              : "Unable to load profile"}
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="mess-primary-button"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ---------- no profile yet ----------
  if (!profile) {
    return (
      <div className="mess-profile-loading">
        <div className="mess-loading-box">
          <h2>No Mess Profile Found</h2>

          <p>Your mess profile has not been created yet.</p>

          <button
            type="button"
            className="mess-primary-button"
            onClick={() => navigate("/mess/profile")}
          >
            Create Mess Profile
          </button>
        </div>
      </div>
    );
  }

  const messImageUrl = getFileUrl(profile.photo);
  const proofUrl = getFileUrl(profile.verification_proof);

  // image shown in the edit form
  const displayedImageUrl = newImagePreview || messImageUrl;

  // ---------- edit mode ----------
  if (isEditMode) {
    return (
      <div
        className="mess-profile-page"
        style={{
          width: "100%",
          minWidth: "0",
        }}
      >
        <section
          className="mess-profile-form-section"
          style={{
            width: "100%",
            flex: "1",
          }}
        >
          <div
            className="mess-profile-container"
            style={{
              width: "100%",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            <div className="mess-profile-heading">
              <span>EDIT MESS PROFILE</span>

              <h2>Update your profile</h2>

              <p>Change the information you want to update.</p>
            </div>

            <form
              className="mess-profile-form"
              onSubmit={handleSaveChanges}
              style={{
                width: "100%",
                maxWidth: "1200px",
              }}
            >
              {/* basic info */}
              <div className="mess-profile-section-title">
                <span>01</span>

                <div>
                  <h3>Mess Information</h3>

                  <p>Update your basic mess information.</p>
                </div>
              </div>

              <div className="mess-profile-row">
                <div className="mess-profile-field">
                  <label htmlFor="mess_name">Mess Name</label>

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
                  <label htmlFor="phone">Phone Number</label>

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
                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              {/* address and location */}
              <div className="mess-profile-section-title">
                <span>02</span>

                <div>
                  <h3>Mess Location</h3>

                  <p>Update your mess address and location.</p>
                </div>
              </div>

              <div className="mess-profile-field">
                <label htmlFor="address">Mess Address</label>

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
                <label htmlFor="location">Location</label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* documents */}
              <div className="mess-profile-section-title">
                <span>03</span>

                <div>
                  <h3>Current Documents</h3>

                  <p>You can change the mess image. Your proof is kept.</p>
                </div>
              </div>

              <div className="mess-upload-grid">
                {/* mess image */}
                <div className="mess-upload-box">
                  <div className="mess-upload-icon">IMG</div>

                  <h3>
                    {newImageFile ? "New Mess Image" : "Current Mess Image"}
                  </h3>

                  {displayedImageUrl ? (
                    <div className="mess-file-preview">
                      <img
                        src={displayedImageUrl}
                        alt="Mess"
                        className="mess-image-preview"
                      />

                      {newImageFile && (
                        <p className="mess-file-note">
                          New image selected. It will be saved when you click
                          Save Changes.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p>No mess image available.</p>
                  )}

                  {/* hidden, opened by the Change Image button */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="mess-hidden-input"
                    onChange={handleImageSelected}
                  />

                  <div className="mess-image-actions">
                    {displayedImageUrl && (
                      <button
                        type="button"
                        className="mess-view-proof-button"
                        onClick={handleViewImage}
                      >
                        View Image
                      </button>
                    )}

                    <button
                      type="button"
                      className="mess-change-button"
                      onClick={handleChooseImage}
                      disabled={saving}
                    >
                      Change Image
                    </button>

                    {newImageFile && (
                      <button
                        type="button"
                        className="mess-view-proof-button"
                        onClick={handleRemoveNewImage}
                        disabled={saving}
                      >
                        Undo
                      </button>
                    )}
                  </div>
                </div>

                {/* verification proof */}
                <div className="mess-upload-box">
                  <div className="mess-upload-icon">DOC</div>

                  <h3>Verification Proof</h3>

                  {profile.verification_proof ? (
                    <div className="mess-file-preview">
                      {isPdf(profile.verification_proof) ? (
                        <div className="mess-pdf-preview">
                          <div className="mess-pdf-icon">PDF</div>

                          <p>Verification document</p>
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
                    <p>No verification proof available.</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="mess-profile-info-box">
                  <div className="mess-info-symbol">!</div>

                  <div>
                    <strong>Unable to save changes</strong>

                    <p>{error}</p>
                  </div>
                </div>
              )}

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
                  {saving ? "Saving..." : "Save Changes"}

                  {!saving && <span>→</span>}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    );
  }

  // ---------- normal view ----------
  return (
    <div className="mess-profile-view-page">
      <header className="mess-profile-view-header">
        <div
          className="mess-profile-view-brand"
          onClick={() => navigate("/")}
        >
          <div className="mess-profile-view-brand-mark">T</div>

          <span>tiffny</span>
        </div>
      </header>

      <main className="mess-profile-view-container">
        <div className="mess-profile-view-heading">
          <div>
            <span className="mess-profile-view-label">MESS OWNER</span>

            <h1>Your Mess Profile</h1>

            <p>View and manage the information of your registered mess.</p>
          </div>

          <div
            className={`mess-status-badge ${
              profile.status ? profile.status.toLowerCase() : "pending"
            }`}
          >
            {profile.status || "PENDING"}
          </div>
        </div>

        <div className="mess-profile-view-grid">
          {/* image card */}
          <div className="mess-profile-image-card">
            <span className="mess-card-label">MESS PROFILE</span>

            <h2>Mess Image</h2>

            {messImageUrl ? (
              <>
                <img
                  src={messImageUrl}
                  alt="Mess"
                  className="mess-existing-image"
                />

                <button
                  type="button"
                  className="mess-view-proof-button"
                  onClick={handleViewImage}
                >
                  View Image
                </button>
              </>
            ) : (
              <div className="mess-no-image">No mess image available</div>
            )}
          </div>

          {/* details card */}
          <div className="mess-profile-details-card">
            <span className="mess-card-label">MESS INFORMATION</span>

            <h2>{profile.mess_name}</h2>

            <div className="mess-detail-item">
              <span>Description</span>
              <p>{profile.description || "Not provided"}</p>
            </div>

            <div className="mess-detail-item">
              <span>Phone Number</span>
              <p>{profile.phone || "Not provided"}</p>
            </div>

            <div className="mess-detail-item">
              <span>Address</span>
              <p>{profile.address || "Not provided"}</p>
            </div>

            <div className="mess-detail-item">
              <span>Location</span>
              <p>{profile.location || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* verification status */}
        <div className="mess-verification-card">
          <div className="mess-verification-icon">i</div>

          <div className="mess-verification-content">
            <span>VERIFICATION STATUS</span>

            <h2>
              Your mess is <strong>{profile.status || "PENDING"}</strong>
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

        {/* proof card, only if a proof was uploaded */}
        {profile.verification_proof && (
          <div className="mess-proof-view-card">
            <span className="mess-card-label">VERIFICATION PROOF</span>

            <div className="mess-proof-view-content">
              {isPdf(profile.verification_proof) ? (
                <div className="mess-proof-document">
                  <div className="mess-proof-document-icon">PDF</div>

                  <div>
                    <h3>Verification document</h3>

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

        <div className="mess-profile-bottom-actions">
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