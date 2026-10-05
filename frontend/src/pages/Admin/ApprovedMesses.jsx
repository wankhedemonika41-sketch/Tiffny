import { useEffect, useState } from "react";
import "./ApprovedMesses.css";

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

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  for (const key of possibleKeys) {
    const value = sessionStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}


function ApprovedMesses() {

  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProof, setSelectedProof] = useState(null);


  useEffect(() => {
    loadApprovedMesses();
  }, []);


  async function loadApprovedMesses() {

    try {

      setLoading(true);
      setError("");

      const token = findLoginToken();

      if (!token) {
        setError("Please login as an admin first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/approved-messes`,
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
          "Failed to load approved messes."
        );
      }

      setMesses(
        Array.isArray(data.approved_messes)
          ? data.approved_messes
          : []
      );

    } catch (error) {

      console.error(
        "Approved mess loading error:",
        error
      );

      setError(
        error.message ||
        "Unable to load approved messes."
      );

    } finally {

      setLoading(false);

    }
  }


  function getImageUrl(photo) {

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
      return `${API_BASE_URL}${photo}`;
    }

    return `${API_BASE_URL}/${photo}`;
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

    if (proof.startsWith("/")) {
      return `${API_BASE_URL}${proof}`;
    }

    return `${API_BASE_URL}/${proof}`;
  }


  async function handleSuspend(messId) {

    const shouldSuspend = window.confirm(
      "Are you sure you want to suspend this mess?"
    );

    if (!shouldSuspend) {
      return;
    }

    try {

      setProcessingId(messId);
      setError("");
      setSuccessMessage("");

      const token = findLoginToken();

      if (!token) {
        setError("Please login as an admin first.");
        setProcessingId(null);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/suspend-mess/${messId}`,
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
          "Failed to suspend mess."
        );
      }

      setSuccessMessage(
        "Mess suspended successfully."
      );

      setMesses((previousMesses) =>
        previousMesses.filter(
          (mess) => mess.mess_id !== messId
        )
      );

    } catch (error) {

      console.error(
        "Suspend mess error:",
        error
      );

      setError(
        error.message ||
        "Unable to suspend mess."
      );

    } finally {

      setProcessingId(null);

    }
  }


  if (loading) {

    return (
      <div className="approved-messes-page">

        <div className="approved-loading-box">

          <div className="approved-loading-line"></div>

          <h2>
            Loading Approved Messes
          </h2>

          <p>
            Please wait while we load approved mess registrations.
          </p>

        </div>

      </div>
    );
  }


  return (

    <div className="approved-messes-page">

      <div className="approved-messes-container">


        {/* PAGE HEADER */}

        <div className="approved-page-header">

          <div>

            <span className="approved-page-label">
              ADMINISTRATION
            </span>

            <h1>
              Approved Messes
            </h1>

            <p>
              View all messes that have been approved by the administrator.
            </p>

          </div>


          <div className="approved-count-card">

            <span>
              APPROVED MESSES
            </span>

            <strong>
              {messes.length}
            </strong>

            <small>
              Currently active
            </small>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="approved-message approved-error">

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* SUCCESS */}

        {successMessage && (

          <div className="approved-message approved-success">

            <strong>
              Action completed
            </strong>

            <p>
              {successMessage}
            </p>

          </div>

        )}


        {/* SECTION */}

        <section className="approved-section">

          <div className="approved-section-heading">

            <div>

              <span className="approved-page-label">
                ACTIVE MESSES
              </span>

              <h2>
                Approved Mess Registrations
              </h2>

              <p>
                These messes are currently approved and available in the Tiffny system.
              </p>

            </div>


            <div className="approved-section-count">

              {messes.length}

              <span>
                {messes.length === 1
                  ? " Mess"
                  : " Messes"}
              </span>

            </div>

          </div>


          {/* EMPTY STATE */}

          {messes.length === 0 ? (

            <div className="approved-empty-state">

              <div className="approved-empty-icon">
                NONE
              </div>

              <h3>
                No Approved Messes
              </h3>

              <p>
                There are currently no approved mess registrations.
              </p>

              <button
                type="button"
                className="approved-refresh-button"
                onClick={loadApprovedMesses}
              >
                Refresh
              </button>

            </div>

          ) : (

            <div className="approved-messes-grid">

              {messes.map((mess) => {

                const imageUrl =
                  getImageUrl(mess.photo);

                const proofUrl =
                  getProofUrl(
                    mess.verification_proof
                  );

                const isProcessing =
                  processingId === mess.mess_id;


                return (

                  <article
                    className="approved-mess-card"
                    key={mess.mess_id}
                  >


                    {/* PHOTO */}

                    <div className="approved-image-wrapper">

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={mess.mess_name}
                          className="approved-mess-image"
                        />

                      ) : (

                        <div className="approved-no-image">
                          NO PHOTO
                        </div>

                      )}

                      <div className="approved-status-badge">
                        APPROVED
                      </div>

                    </div>


                    {/* CONTENT */}

                    <div className="approved-mess-content">

                      <span className="approved-mess-label">
                        APPROVED MESS
                      </span>

                      <h3>
                        {mess.mess_name}
                      </h3>


                      <p className="approved-description">
                        {mess.description ||
                          "No description provided."}
                      </p>


                      {/* DETAILS */}

                      <div className="approved-details">


                        <div className="approved-detail-item">

                          <span>
                            PHONE
                          </span>

                          <strong>
                            {mess.phone ||
                              "Not provided"}
                          </strong>

                        </div>


                        <div className="approved-detail-item">

                          <span>
                            LOCATION
                          </span>

                          <strong>
                            {mess.location ||
                              "Not provided"}
                          </strong>

                        </div>


                        <div className="approved-detail-item approved-detail-full">

                          <span>
                            ADDRESS
                          </span>

                          <strong>
                            {mess.address ||
                              "Not provided"}
                          </strong>

                        </div>


                        <div className="approved-detail-item approved-detail-full">

                          <span>
                            OWNER ID
                          </span>

                          <strong>
                            {mess.owner_id}
                          </strong>

                        </div>


                      </div>


                      {/* VERIFICATION PROOF */}

                      <div className="approved-proof-section">

                        <span>
                          VERIFICATION PROOF
                        </span>


                        {proofUrl ? (

                          <button
                            type="button"
                            className="approved-proof-button"
                            onClick={() =>
                              setSelectedProof(
                                proofUrl
                              )
                            }
                          >
                            View Verification Proof
                          </button>

                        ) : (

                          <strong className="approved-proof-missing">
                            Not provided
                          </strong>

                        )}

                      </div>


                      {/* ACTION */}

                      <div className="approved-actions">

                        <button
                          type="button"
                          className="approved-suspend-button"
                          onClick={() =>
                            handleSuspend(
                              mess.mess_id
                            )
                          }
                          disabled={isProcessing}
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Suspend Mess"}
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


      {/* VERIFICATION PROOF MODAL */}

      {selectedProof && (

        <div
          className="approved-proof-modal-overlay"
          onClick={() =>
            setSelectedProof(null)
          }
        >

          <div
            className="approved-proof-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="approved-proof-modal-header">

              <div>

                <span>
                  DOCUMENT REVIEW
                </span>

                <h2>
                  Verification Proof
                </h2>

              </div>


              <button
                type="button"
                className="approved-proof-close"
                onClick={() =>
                  setSelectedProof(null)
                }
              >
                Close
              </button>

            </div>


            <div className="approved-proof-modal-body">

              <img
                src={selectedProof}
                alt="Mess verification proof"
                className="approved-proof-image"
              />

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


export default ApprovedMesses;