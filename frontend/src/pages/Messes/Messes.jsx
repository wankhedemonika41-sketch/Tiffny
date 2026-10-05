import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";

import "./Messes.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Messes() {
  const navigate = useNavigate();

  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApprovedMesses();
  }, []);

  async function fetchApprovedMesses() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/mess/approved`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load messes."
        );
      }

      setMesses(data);
    } catch (error) {
      console.error("Messes loading error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getPhotoUrl(photo) {
    if (!photo) {
      return null;
    }

    if (photo.startsWith("http")) {
      return photo;
    }

    return `${API_BASE_URL}${photo}`;
  }

  function formatPrice(price) {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "Not set";
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  }

  function goToHomeSection(section) {
    navigate(`/#${section}`);
  }

  return (
    <div className="messes-page">

      {/* ========================================
          NAVBAR
      ======================================== */}

      <Navbar />

      


      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main>

        {/* ========================================
            HERO
        ======================================== */}

        <section className="messes-hero">

          <div className="messes-label">
            TIFFNY MESSES
          </div>


          <h1>
            Find a mess that
            <span> fits your routine.</span>
          </h1>


          <p>
            Explore trusted messes approved by Tiffny.
            Compare meals, prices, ratings and locations
            before choosing where you want to eat.
          </p>

        </section>


        {/* ========================================
            LOADING
        ======================================== */}

        {loading && (
          <div className="messes-loading">
            Loading available messes...
          </div>
        )}


        {/* ========================================
            ERROR
        ======================================== */}

        {!loading && error && (
          <div className="messes-error">
            {error}
          </div>
        )}


        {/* ========================================
            EMPTY
        ======================================== */}

        {!loading &&
          !error &&
          messes.length === 0 && (

            <div className="messes-empty">

              <h2>
                No messes available yet
              </h2>

              <p>
                Approved messes will appear here once
                they are verified by the admin.
              </p>

            </div>
          )}


        {/* ========================================
            MESSES
        ======================================== */}

        {!loading &&
          !error &&
          messes.length > 0 && (

            <section className="messes-grid">

              {messes.map((mess) => {

                const photoUrl =
                  getPhotoUrl(mess.photo);

                return (

                  <article
                    className="mess-card"
                    key={mess.mess_id}
                  >

                    {/* IMAGE */}

                    <div className="mess-card-image">

                      {photoUrl ? (

                        <img
                          src={photoUrl}
                          alt={mess.mess_name}
                        />

                      ) : (

                        <div className="mess-image-placeholder">

                          <div className="placeholder-icon">
                            +
                          </div>

                        </div>

                      )}


                      <div className="approved-badge">
                        APPROVED
                      </div>

                    </div>


                    {/* CARD CONTENT */}

                    <div className="mess-card-content">

                      {/* NAME + RATING */}

                      <div className="mess-card-heading">

                        <h2>
                          {mess.mess_name}
                        </h2>


                        <div className="mess-rating">

                          <span>
                            ★
                          </span>

                          <strong>
                            {Number(
                              mess.rating || 0
                            ).toFixed(1)}
                          </strong>

                          <small>
                            ({mess.total_reviews || 0})
                          </small>

                        </div>

                      </div>


                      {/* DESCRIPTION */}

                      <p className="mess-description">

                        {mess.description ||
                          "Fresh and home-style meals."}

                      </p>


                      {/* DETAILS */}

                      <div className="mess-info-row">

                        <div className="mess-info-item">

                          <span className="info-title">
                            Location
                          </span>

                          <strong>
                            {mess.location ||
                              mess.address ||
                              "Not available"}
                          </strong>

                        </div>


                        <div className="mess-info-item">

                          <span className="info-title">
                            One-Time Meal
                          </span>

                          <strong>
                            {formatPrice(
                              mess.one_time_price
                            )}
                          </strong>

                        </div>


                        <div className="mess-info-item">

                          <span className="info-title">
                            Monthly Plan
                          </span>

                          <strong>
                            {formatPrice(
                              mess.monthly_price
                            )}
                          </strong>

                        </div>

                      </div>


                      {/* VIEW DETAILS */}

                      <button
                        className="view-details-button"
                        onClick={() =>
                          navigate(
                            `/messes/${mess.mess_id}`
                          )
                        }
                      >
                        View Details

                        <span>
                          →
                        </span>

                      </button>

                    </div>

                  </article>

                );
              })}

            </section>
          )}

      </main>


      {/* ========================================
          FOOTER
      ======================================== */}

      <footer className="messes-footer">

        <div className="footer-brand">

          <div className="messes-brand">

            <div className="messes-brand-mark">
              T
            </div>

            <span>
              tiffny
            </span>

          </div>

          <p>
            Simple meals. Better routine.
          </p>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 Tiffny
          </span>

          <span>
            Student & Mess Platform
          </span>

        </div>

      </footer>

    </div>
  );
}

export default Messes;