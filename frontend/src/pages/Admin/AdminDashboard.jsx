import { useEffect, useState } from "react";
import "./AdminDashboard.css";

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

  const storages = [localStorage, sessionStorage];

  // try the common key names first
  for (const storage of storages) {
    for (const key of possibleKeys) {
      const value = storage.getItem(key);

      if (value) {
        return value;
      }
    }
  }

  // then look through everything that is stored
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
          // not json, keep searching
        }
      }
    }
  }

  return null;
}

/* =========================================================
   FILE HELPERS
========================================================= */

// turns "/uploads/..." into a full backend url
function getFileUrl(filePath) {
  if (!filePath) {
    return null;
  }

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  if (filePath.startsWith("/")) {
    return `${API_BASE_URL}${filePath}`;
  }

  return `${API_BASE_URL}/${filePath}`;
}

function isPdf(filePath) {
  if (!filePath) {
    return false;
  }

  return filePath.split("?")[0].toLowerCase().endsWith(".pdf");
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
  const [pendingMesses, setPendingMesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // which mess is being approved/rejected, and which button was clicked
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // url of the verification proof shown in the modal
  const [selectedProof, setSelectedProof] = useState(null);

  /* =========================================================
     LOAD PENDING MESSES
  ========================================================= */

  useEffect(() => {
    loadPendingMesses();
  }, []);

  // close the proof modal with the Esc key, and stop the page
  // behind it from scrolling while it is open
  useEffect(() => {
    if (!selectedProof) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedProof(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProof]);

  async function loadPendingMesses() {
    try {
      setLoading(true);
      setError("");

      const token = findLoginToken();

      if (!token) {
        setError("Please login as an admin first.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/pending-messes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load pending messes.");
      }

      setPendingMesses(
        Array.isArray(data.pending_messes) ? data.pending_messes : []
      );
    } catch (error) {
      console.error("Pending mess loading error:", error);

      setError(error.message || "Unable to load pending messes.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     APPROVE / REJECT MESS
  ========================================================= */

  async function handleMessAction(messId, action) {
    try {
      setProcessingId(messId);
      setProcessingAction(action);
      setError("");
      setSuccessMessage("");

      const token = findLoginToken();

      if (!token) {
        setError("Please login as an admin first.");
        return;
      }

      const endpoint =
        action === "approve"
          ? `/admin/approve-mess/${messId}`
          : `/admin/reject-mess/${messId}`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || `Failed to ${action} mess.`
        );
      }

      setSuccessMessage(
        action === "approve"
          ? "Mess approved successfully."
          : "Mess rejected successfully."
      );

      // remove the processed mess from the pending list
      setPendingMesses((previousMesses) =>
        previousMesses.filter((mess) => mess.mess_id !== messId)
      );
    } catch (error) {
      console.error("Mess action error:", error);

      setError(error.message || `Unable to ${action} mess.`);
    } finally {
      setProcessingId(null);
      setProcessingAction("");
    }
  }

  function handleApprove(messId) {
    const shouldApprove = window.confirm(
      "Are you sure you want to approve this mess?"
    );

    if (!shouldApprove) {
      return;
    }

    handleMessAction(messId, "approve");
  }

  function handleReject(messId) {
    const shouldReject = window.confirm(
      "Are you sure you want to reject this mess?"
    );

    if (!shouldReject) {
      return;
    }

    handleMessAction(messId, "reject");
  }

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-loading-box">
          <div className="admin-loading-line"></div>

          <h2>Loading Admin Dashboard</h2>

          <p>Please wait while we load pending messes.</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        {/* ---------- header ---------- */}
        <div className="admin-dashboard-header">
          <div>
            <span className="admin-page-label">ADMINISTRATION</span>

            <h1>Admin Dashboard</h1>

            <p>
              Review and manage mess registrations waiting for verification.
            </p>
          </div>

          <div className="admin-pending-count-card">
            <span>PENDING MESSES</span>

            <strong>{pendingMesses.length}</strong>

            <small>Waiting for review</small>
          </div>
        </div>

        {/* ---------- error message ---------- */}
        {error && (
          <div className="admin-message admin-error">
            <div className="admin-message-icon">!</div>

            <div>
              <strong>Something went wrong</strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {/* ---------- success message ---------- */}
        {successMessage && (
          <div className="admin-message admin-success">
            <div className="admin-message-icon">✓</div>

            <div>
              <strong>Action completed</strong>

              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* ---------- statistics ---------- */}
        <section className="admin-statistics">
          <div className="admin-stat-card">
            <div className="admin-stat-title">PENDING</div>

            <strong>{pendingMesses.length}</strong>

            <p>Mess registrations waiting for verification</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-title">REVIEW</div>

            <strong>{pendingMesses.length > 0 ? "OPEN" : "CLEAR"}</strong>

            <p>Current verification status</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-title">ACTION</div>

            <strong>{pendingMesses.length > 0 ? "REQUIRED" : "NONE"}</strong>

            <p>Admin attention required</p>
          </div>
        </section>

        {/* ---------- pending messes ---------- */}
        <section className="admin-pending-section">
          <div className="admin-section-heading">
            <div>
              <span className="admin-page-label">VERIFICATION QUEUE</span>

              <h2>Pending Mess Registrations</h2>

              <p>
                Review the details submitted by mess owners before approving
                their registration.
              </p>
            </div>

            <div className="admin-section-count">
              {pendingMesses.length}

              <span>{pendingMesses.length === 1 ? " Mess" : " Messes"}</span>
            </div>
          </div>

          {pendingMesses.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">CLEAR</div>

              <h3>No Pending Messes</h3>

              <p>
                There are currently no mess registrations waiting for review.
              </p>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={loadPendingMesses}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="admin-messes-grid">
              {pendingMesses.map((mess) => {
                const imageUrl = getFileUrl(mess.photo);
                const proofUrl = getFileUrl(mess.verification_proof);
                const isProcessing = processingId === mess.mess_id;

                return (
                  <article className="admin-mess-card" key={mess.mess_id}>
                    {/* mess photo */}
                    <div className="admin-mess-image-wrapper">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={mess.mess_name}
                          className="admin-mess-image"
                        />
                      ) : (
                        <div className="admin-no-image">NO PHOTO</div>
                      )}

                      <div className="admin-status-badge">{mess.status}</div>
                    </div>

                    <div className="admin-mess-content">
                      <div className="admin-mess-title-row">
                        <div>
                          <span className="admin-mess-label">
                            MESS REGISTRATION
                          </span>

                          <h3>{mess.mess_name}</h3>
                        </div>
                      </div>

                      <p className="admin-mess-description">
                        {mess.description || "No description provided."}
                      </p>

                      {/* mess details */}
                      <div className="admin-mess-details">
                        <div className="admin-detail-item">
                          <span>PHONE</span>

                          <strong>{mess.phone || "Not provided"}</strong>
                        </div>

                        <div className="admin-detail-item">
                          <span>LOCATION</span>

                          <strong>{mess.location || "Not provided"}</strong>
                        </div>

                        <div className="admin-detail-item admin-detail-full">
                          <span>ADDRESS</span>

                          <strong>{mess.address || "Not provided"}</strong>
                        </div>

                        <div className="admin-detail-item">
                          <span>OWNER ID</span>

                          <strong>{mess.owner_id}</strong>
                        </div>
                      </div>

                      {/* verification proof */}
                      <div className="admin-verification-section">
                        <span>VERIFICATION PROOF</span>

                        {proofUrl ? (
                          <button
                            type="button"
                            className="admin-proof-button"
                            onClick={() => setSelectedProof(proofUrl)}
                          >
                            View Verification Proof
                          </button>
                        ) : (
                          <strong className="admin-proof-missing">
                            Not provided
                          </strong>
                        )}
                      </div>

                      {/* approve / reject */}
                      <div className="admin-mess-actions">
                        <button
                          type="button"
                          className="admin-reject-button"
                          onClick={() => handleReject(mess.mess_id)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "reject"
                            ? "Processing..."
                            : "Reject"}
                        </button>

                        <button
                          type="button"
                          className="admin-approve-button"
                          onClick={() => handleApprove(mess.mess_id)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "approve"
                            ? "Processing..."
                            : "Approve"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =========================================================
          VERIFICATION PROOF MODAL
      ========================================================= */}

      {selectedProof && (
        <div
          className="admin-proof-modal-overlay"
          onClick={() => setSelectedProof(null)}
        >
          <div
            className="admin-proof-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-proof-modal-header">
              <div>
                <span>DOCUMENT REVIEW</span>

                <h2>Verification Proof</h2>
              </div>

              <div className="admin-proof-modal-buttons">
                <a
                  href={selectedProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-proof-open-link"
                >
                  Open in new tab
                </a>

                <button
                  type="button"
                  className="admin-proof-close"
                  onClick={() => setSelectedProof(null)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="admin-proof-modal-body">
              {isPdf(selectedProof) ? (
                <iframe
                  src={selectedProof}
                  title="Mess verification proof"
                  className="admin-proof-frame"
                />
              ) : (
                <img
                  src={selectedProof}
                  alt="Mess verification proof"
                  className="admin-proof-image"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;