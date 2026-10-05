import { useEffect, useState } from "react";
import "./RejectedMesses.css";

function RejectedMesses() {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
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

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    return `http://127.0.0.1:8000/${photo.replace(/^\/+/, "")}`;
  }

  function getProofUrl(proof) {
    if (!proof) {
      return null;
    }

    if (proof.startsWith("http://") || proof.startsWith("https://")) {
      return proof;
    }

    return `http://127.0.0.1:8000/${proof.replace(/^\/+/, "")}`;
  }

  async function fetchRejectedMesses() {
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
        "http://127.0.0.1:8000/admin/rejected-messes",
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
          data.detail || "Failed to load rejected messes."
        );
      }

      setMesses(data.rejected_messes || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRejectedMesses();
  }, []);

  return (
    <div className="rejected-messes-page">

      <div className="rejected-messes-header">
        <div>
          <span className="rejected-messes-label">
            MESS MANAGEMENT
          </span>

          <h2>Rejected Messes</h2>

          <p>
            View mess registrations that were rejected by the administrator.
          </p>
        </div>

        <div className="rejected-messes-count">
          <span>{messes.length}</span>
          <small>Rejected</small>
        </div>
      </div>

      {loading && (
        <div className="rejected-message-box">
          Loading rejected messes...
        </div>
      )}

      {!loading && errorMessage && (
        <div className="rejected-message-box error">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && messes.length === 0 && (
        <div className="rejected-empty-state">
          <div className="rejected-empty-mark">RM</div>

          <h3>No Rejected Messes</h3>

          <p>
            There are currently no rejected mess registrations.
          </p>
        </div>
      )}

      {!loading && !errorMessage && messes.length > 0 && (
        <div className="rejected-messes-grid">
          {messes.map((mess) => {
            const photoUrl = getPhotoUrl(mess.photo);

            return (
              <div
                className="rejected-mess-card"
                key={mess.mess_id}
              >
                <div className="rejected-card-image">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={mess.mess_name}
                    />
                  ) : (
                    <div className="rejected-no-image">
                      NO PHOTO
                    </div>
                  )}

                  <span className="rejected-status-badge">
                    REJECTED
                  </span>
                </div>

                <div className="rejected-card-content">

                  <div className="rejected-card-heading">
                    <div>
                      <h3>{mess.mess_name}</h3>
                      <span>Mess ID: {mess.mess_id}</span>
                    </div>
                  </div>

                  <p className="rejected-description">
                    {mess.description || "No description provided."}
                  </p>

                  <div className="rejected-details">

                    <div className="rejected-detail-row">
                      <span className="rejected-detail-label">
                        Phone
                      </span>
                      <span>{mess.phone || "Not provided"}</span>
                    </div>

                    <div className="rejected-detail-row">
                      <span className="rejected-detail-label">
                        Address
                      </span>
                      <span>{mess.address || "Not provided"}</span>
                    </div>

                    <div className="rejected-detail-row">
                      <span className="rejected-detail-label">
                        Location
                      </span>
                      <span>{mess.location || "Not provided"}</span>
                    </div>

                    <div className="rejected-detail-row">
                      <span className="rejected-detail-label">
                        Owner ID
                      </span>
                      <span>{mess.owner_id}</span>
                    </div>

                  </div>

                  <div className="rejected-proof-section">

                    <div>
                      <span className="rejected-proof-title">
                        Verification Proof
                      </span>

                      <span className="rejected-proof-status">
                        {mess.verification_proof
                          ? "Document available"
                          : "No document uploaded"}
                      </span>
                    </div>

                    {mess.verification_proof && (
                      <button
                        type="button"
                        className="rejected-proof-button"
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

                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProof && (
        <div
          className="rejected-proof-modal-overlay"
          onClick={() => setSelectedProof(null)}
        >
          <div
            className="rejected-proof-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rejected-proof-modal-header">
              <div>
                <span>DOCUMENT REVIEW</span>
                <h3>Verification Proof</h3>
              </div>

              <button
                type="button"
                className="rejected-close-button"
                onClick={() => setSelectedProof(null)}
              >
                Close
              </button>
            </div>

            <div className="rejected-proof-modal-body">
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

export default RejectedMesses;