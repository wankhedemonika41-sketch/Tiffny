import { useEffect, useState } from "react";
import "./ReviewsManagement.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const token = sessionStorage.getItem("tiffny_token");

    if (!token) {
      setError("Login token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/owner-reviews`,
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
          data.detail || "Failed to load reviews."
        );
      }

      setReviews(data);
    } catch (error) {
      console.error("Reviews loading error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Date not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function renderStars(rating) {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={
            i <= rating
              ? "review-star active"
              : "review-star"
          }
        >
          ★
        </span>
      );
    }

    return stars;
  }

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (total, item) => total + Number(item.rating || 0),
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="reviews-page">
        <div className="reviews-loading">
          Loading reviews...
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-container">

        <div className="reviews-header">
          <div>
            <p className="reviews-label">
              MESS MANAGEMENT
            </p>

            <h1>Reviews Management</h1>

            <p className="reviews-description">
              View feedback and ratings given by students.
            </p>
          </div>
        </div>

        {error && (
          <div className="reviews-error">
            {error}
          </div>
        )}

        <div className="reviews-summary">

          <div className="summary-card">
            <span>Average Rating</span>

            <strong>
              {averageRating}
            </strong>

            <div className="summary-stars">
              {renderStars(
                Math.round(Number(averageRating))
              )}
            </div>
          </div>

          <div className="summary-card">
            <span>Total Reviews</span>

            <strong>
              {totalReviews}
            </strong>
          </div>

        </div>

        {reviews.length === 0 ? (
          <div className="empty-reviews">
            <h2>No reviews yet</h2>

            <p>
              Student reviews will appear here after
              completed orders are reviewed.
            </p>
          </div>
        ) : (
          <div className="reviews-list">

            {reviews.map((item) => (
              <div
                className="review-card"
                key={item.review_id}
              >

                <div className="review-top">

                  <div>
                    <p className="review-small-label">
                      STUDENT REVIEW
                    </p>

                    <h2>
                      {item.student_name}
                    </h2>
                  </div>

                  <div className="review-rating">
                    {renderStars(
                      Number(item.rating)
                    )}
                  </div>

                </div>

                <div className="review-content">
                  <p>
                    {item.review || "No written review."}
                  </p>
                </div>

                <div className="review-footer">
                  <span>
                    Rating: {item.rating}/5
                  </span>

                  <span>
                    {formatDate(item.created_at)}
                  </span>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default ReviewsManagement;