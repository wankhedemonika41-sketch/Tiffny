import React, { useEffect, useState } from "react";
import "./PendingMesses.css";

function PendingMesses() {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProof, setSelectedProof] = useState(null);

  // ------------------------------------------------
  // FIND LOGIN TOKEN
  // ------------------------------------------------

  function findLoginToken() {
    const possibleKeys = [
      "token",
      "access_token",
      "accessToken",
      "jwt",
      "jwtToken",
      "authToken",
      "auth_token",
      "userToken",
      "user_token",
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

    // ------------------------------------------------
    // LAST OPTION:
    // Search storage for something that looks like JWT
    // ------------------------------------------------

    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      if (value && jwtPattern.test(value)) {
        return value;
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);

      if (value && jwtPattern.test(value)) {
        return value;
      }
    }

    return null;
  }

  // ------------------------------------------------
  // PHOTO URL
  // ------------------------------------------------

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

    if (photo.startsWith("/")) {
      return `http://127.0.0.1:8000${photo}`;
    }

    return `http://127.0.0.1:8000/uploads/${photo}`;
  }

  // ------------------------------------------------
  // VERIFICATION PROOF URL
  // ------------------------------------------------

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

    if (proof.startsWith("/")) {
      return `http://127.0.0.1:8000${proof}`;
    }

    return `http://127.0.0.1:8000/uploads/${proof}`;
  }

  // ------------------------------------------------
  // GET PENDING MESSES
  // ------------------------------------------------

  async function fetchPendingMesses() {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = findLoginToken();

      if (!token) {
        throw new Error(
          "Admin login token not found. Please login again."
        );
      }

      const response = await fetch(
        "http://127.0.0.1:8000/admin/pending-messes",
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
            "Failed to load pending messes."
        );
      }

      setMesses(data.pending_messes || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------

  useEffect(() => {
    fetchPendingMesses();
  }, []);

  // ------------------------------------------------
  // APPROVE MESS
  // ------------------------------------------------

  async function handleApprove(messId, messName) {
    const confirmApprove = window.confirm(
      `Are you sure you want to approve "${messName}"?`
    );

    if (!confirmApprove) {
      return;
    }

    try {
      setProcessingId(messId);
      setErrorMessage("");
      setSuccessMessage("");

      const token = findLoginToken();

      if (!token) {
        throw new Error(
          "Admin login token not found. Please login again."
        );
      }

      const response = await fetch(
        `http://127.0.0.1:8000/admin/approve-mess/${messId}`,
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
            "Failed to approve mess."
        );
      }

      // Remove approved mess from pending list
      setMesses((currentMesses) =>
        currentMesses.filter(
          (mess) => mess.mess_id !== messId
        )
      );

      setSuccessMessage(
        `${messName} has been approved successfully.`
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setProcessingId(null);
    }
  }

  // ------------------------------------------------
  // REJECT MESS
  // ------------------------------------------------

  async function handleReject(messId, messName) {
    const confirmReject = window.confirm(
      `Are you sure you want to reject "${messName}"?`
    );

    if (!confirmReject) {
      return;
    }

    try {
      setProcessingId(messId);
      setErrorMessage("");
      setSuccessMessage("");

      const token = findLoginToken();

      if (!token) {
        throw new Error(
          "Admin login token not found. Please login again."
        );
      }

      const response = await fetch(
        `http://127.0.0.1:8000/admin/reject-mess/${messId}`,
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
            "Failed to reject mess."
        );
      }

      // Remove rejected mess from pending list
      setMesses((currentMesses) =>
        currentMesses.filter(
          (mess) => mess.mess_id !== messId
        )
      );

      setSuccessMessage(
        `${messName} has been rejected successfully.`
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setProcessingId(null);
    }
  }

  // ------------------------------------------------
  // CLOSE PROOF MODAL
  // ------------------------------------------------

  function closeProofModal() {
    setSelectedProof(null);
  }

  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <div className="pending-messes-page">

      {/* HEADER */}
      <div className="pending-messes-header">
        <div>
          <h1>Pending Messes</h1>

          <p>
            Review mess registrations waiting for admin approval.
          </p>
        </div>

        <div className="pending-count">
          {messes.length}

          <span>Pending</span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="pending-message loading-message">
          Loading pending messes...
        </div>
      )}

      {/* ERROR */}
      {errorMessage && (
        <div className="pending-message error-message">
          {errorMessage}
        </div>
      )}

      {/* SUCCESS */}
      {successMessage && (
        <div className="pending-message success-message">
          {successMessage}
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !errorMessage &&
        messes.length === 0 && (
          <div className="empty-pending">
            <h2>No Pending Messes</h2>

            <p>
              There are currently no mess registrations
              waiting for approval.
            </p>
          </div>
        )}

      {/* MESSES */}
      {!loading && messes.length > 0 && (
        <div className="pending-messes-grid">

          {messes.map((mess) => {
            const photoUrl = getPhotoUrl(mess.photo);

            const proofUrl = getProofUrl(
              mess.verification_proof
            );

            return (
              <div
                className="pending-mess-card"
                key={mess.mess_id}
              >

                {/* IMAGE */}
                <div className="pending-mess-image-wrapper">

                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={mess.mess_name}
                      className="pending-mess-image"
                    />
                  ) : (
                    <div className="no-mess-image">
                      No Photo
                    </div>
                  )}

                  <span className="pending-status">
                    PENDING
                  </span>
                </div>

                {/* CONTENT */}
                <div className="pending-mess-content">

                  <h2>{mess.mess_name}</h2>

                  <p className="pending-description">
                    {mess.description}
                  </p>

                  {/* DETAILS */}
                  <div className="pending-details">

                    <div className="pending-detail-row">
                      <strong>Phone</strong>

                      <span>
                        {mess.phone}
                      </span>
                    </div>

                    <div className="pending-detail-row">
                      <strong>Address</strong>

                      <span>
                        {mess.address}
                      </span>
                    </div>

                    <div className="pending-detail-row">
                      <strong>Location</strong>

                      <span>
                        {mess.location}
                      </span>
                    </div>

                    <div className="pending-detail-row">
                      <strong>Owner ID</strong>

                      <span>
                        {mess.owner_id}
                      </span>
                    </div>

                  </div>

                  {/* VERIFICATION PROOF */}
                  <div className="verification-section">

                    <div className="verification-heading">
                      Verification Proof
                    </div>

                    {proofUrl ? (
                      <button
                        type="button"
                        className="proof-button"
                        onClick={() =>
                          setSelectedProof({
                            url: proofUrl,
                            name: mess.mess_name,
                          })
                        }
                      >
                        View Verification Proof
                      </button>
                    ) : (
                      <p className="no-proof">
                        No verification proof uploaded.
                      </p>
                    )}

                  </div>

                  {/* ACTIONS */}
                  <div className="pending-actions">

                    <button
                      type="button"
                      className="approve-button"
                      onClick={() =>
                        handleApprove(
                          mess.mess_id,
                          mess.mess_name
                        )
                      }
                      disabled={
                        processingId === mess.mess_id
                      }
                    >
                      {processingId === mess.mess_id
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="reject-button"
                      onClick={() =>
                        handleReject(
                          mess.mess_id,
                          mess.mess_name
                        )
                      }
                      disabled={
                        processingId === mess.mess_id
                      }
                    >
                      {processingId === mess.mess_id
                        ? "Processing..."
                        : "Reject"}
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* VERIFICATION PROOF MODAL */}
      {selectedProof && (
        <div
          className="proof-modal-overlay"
          onClick={closeProofModal}
        >

          <div
            className="proof-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="proof-modal-header">

              <div>
                <h2>Verification Proof</h2>

                <p>
                  {selectedProof.name}
                </p>
              </div>

              <button
                type="button"
                className="close-proof-button"
                onClick={closeProofModal}
              >
                ×
              </button>

            </div>

            <div className="proof-modal-body">

              <img
                src={selectedProof.url}
                alt="Verification proof"
                className="proof-image"
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default PendingMesses;