import { useEffect, useState } from "react";
import "./SuspendedMesses.css";

function SuspendedMesses() {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reactivatingId, setReactivatingId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedProof, setSelectedProof] = useState(null);

  function findLoginToken() {
    const keys = [
      "access_token",
      "token",
      "accessToken",
      "jwt",
      "authToken",
      "tiffny_token",
      "tiffnyToken",
    ];

    for (const key of keys) {
      const localToken = localStorage.getItem(key);

      if (localToken) {
        return localToken;
      }

      const sessionToken = sessionStorage.getItem(key);

      if (sessionToken) {
        return sessionToken;
      }
    }

    return null;
  }

  function getPhotoUrl(photo) {
    if (!photo) {
      return null;
    }

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://")
    ) {
      return photo;
    }

    return `http://127.0.0.1:8000/${photo.replace(/^\/+/, "")}`;
  }

  function getProofUrl(proof) {
    if (!proof) {
      return null;
    }

    if (
      proof.startsWith("http://") ||
      proof.startsWith("https://")
    ) {
      return proof;
    }

    return `http://127.0.0.1:8000/${proof.replace(/^\/+/, "")}`;
  }

  async function fetchSuspendedMesses() {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = findLoginToken();

      if (!token) {
        setErrorMessage("Admin login token not found.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/admin/suspended-messes",
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
            data.message ||
            "Failed to load suspended messes."
        );
      }

      setMesses(data.suspended_messes || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReactivate(messId, messName) {
    const confirmReactivate = window.confirm(
      `Are you sure you want to reactivate "${messName}"?`
    );

    if (!confirmReactivate) {
      return;
    }

    try {
      setReactivatingId(messId);
      setErrorMessage("");
      setSuccessMessage("");

      const token = findLoginToken();

      if (!token) {
        setErrorMessage("Admin login token not found.");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/admin/reactivate-mess/${messId}`,
        {
          method: "PUT",
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
            "Failed to reactivate mess."
        );
      }

      setMesses((currentMesses) =>
        currentMesses.filter(
          (mess) => mess.mess_id !== messId
        )
      );

      setSuccessMessage(
        `${messName} has been reactivated successfully.`
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setReactivatingId(null);
    }
  }

  useEffect(() => {
    fetchSuspendedMesses();
  }, []);

  return (
    <div className="suspended-messes-page">

      {/* HEADER */}

      <div className="suspended-messes-header">

        <div>
          <span className="suspended-messes-label">
            MESS MANAGEMENT
          </span>

          <h2>Suspended Messes</h2>

          <p>
            View and manage messes that are currently suspended.
          </p>
        </div>

        <div className="suspended-messes-count">
          <span>{messes.length}</span>
          <small>Suspended</small>
        </div>

      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="suspended-message-box success">
          {successMessage}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {errorMessage && (
        <div className="suspended-message-box error">
          {errorMessage}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="suspended-message-box">
          Loading suspended messes...
        </div>
      )}

      {/* EMPTY STATE */}

      {!loading &&
        !errorMessage &&
        messes.length === 0 && (
          <div className="suspended-empty-state">

            <div className="suspended-empty-mark">
              SM
            </div>

            <h3>No Suspended Messes</h3>

            <p>
              There are currently no suspended messes.
            </p>

          </div>
        )}

      {/* SUSPENDED MESSES */}

      {!loading && messes.length > 0 && (
        <div className="suspended-messes-grid">

          {messes.map((mess) => {
            const photoUrl = getPhotoUrl(mess.photo);

            return (
              <div
                className="suspended-mess-card"
                key={mess.mess_id}
              >

                {/* IMAGE */}

                <div className="suspended-card-image">

                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={mess.mess_name}
                    />
                  ) : (
                    <div className="suspended-no-image">
                      NO PHOTO
                    </div>
                  )}

                  <span className="suspended-status-badge">
                    SUSPENDED
                  </span>

                </div>

                {/* CARD CONTENT */}

                <div className="suspended-card-content">

                  <div className="suspended-card-heading">
                    <h3>{mess.mess_name}</h3>

                    <span>
                      Mess ID: {mess.mess_id}
                    </span>
                  </div>

                  <p className="suspended-description">
                    {mess.description ||
                      "No description provided."}
                  </p>

                  {/* DETAILS */}

                  <div className="suspended-details">

                    <div className="suspended-detail-row">
                      <span className="suspended-detail-label">
                        Phone
                      </span>

                      <span>
                        {mess.phone || "Not provided"}
                      </span>
                    </div>

                    <div className="suspended-detail-row">
                      <span className="suspended-detail-label">
                        Address
                      </span>

                      <span>
                        {mess.address || "Not provided"}
                      </span>
                    </div>

                    <div className="suspended-detail-row">
                      <span className="suspended-detail-label">
                        Location
                      </span>

                      <span>
                        {mess.location || "Not provided"}
                      </span>
                    </div>

                    <div className="suspended-detail-row">
                      <span className="suspended-detail-label">
                        Owner ID
                      </span>

                      <span>
                        {mess.owner_id}
                      </span>
                    </div>

                  </div>

                  {/* SUSPENSION REASON */}

                  <div className="suspension-reason-section">

                    <div className="suspension-reason-heading">
                      Suspension Reason
                    </div>

                    <p className="suspension-reason-text">
                      {mess.suspension_reason ||
                        "No suspension reason was provided."}
                    </p>

                  </div>

                  {/* VERIFICATION PROOF */}

                  <div className="suspended-proof-section">

                    <div>
                      <span className="suspended-proof-title">
                        Verification Proof
                      </span>

                      <span className="suspended-proof-status">
                        {mess.verification_proof
                          ? "Document available"
                          : "No document uploaded"}
                      </span>
                    </div>

                    {mess.verification_proof && (
                      <button
                        type="button"
                        className="suspended-proof-button"
                        onClick={() =>
                          setSelectedProof(
                            getProofUrl(
                              mess.verification_proof
                            )
                          )
                        }
                      >
                        View Verification Proof
                      </button>
                    )}

                  </div>

                  {/* REACTIVATE */}

                  <button
                    type="button"
                    className="reactivate-mess-button"
                    disabled={
                      reactivatingId === mess.mess_id
                    }
                    onClick={() =>
                      handleReactivate(
                        mess.mess_id,
                        mess.mess_name
                      )
                    }
                  >
                    {reactivatingId === mess.mess_id
                      ? "Reactivating..."
                      : "Reactivate Mess"}
                  </button>

                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* VERIFICATION PROOF MODAL */}

      {selectedProof && (
        <div
          className="suspended-proof-modal-overlay"
          onClick={() => setSelectedProof(null)}
        >

          <div
            className="suspended-proof-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="suspended-proof-modal-header">

              <div>
                <span>DOCUMENT REVIEW</span>

                <h3>Verification Proof</h3>
              </div>

              <button
                type="button"
                className="suspended-close-button"
                onClick={() =>
                  setSelectedProof(null)
                }
              >
                Close
              </button>

            </div>

            <div className="suspended-proof-modal-body">

              {selectedProof.match(
                /\.(jpg|jpeg|png|gif|webp)$/i
              ) ? (
                <img
                  src={selectedProof}
                  alt="Verification proof"
                />
              ) : (
                <iframe
                  src={selectedProof}
                  title="Verification proof"
                />
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default SuspendedMesses;