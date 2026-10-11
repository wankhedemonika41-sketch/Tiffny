import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();

  const userName = sessionStorage.getItem("tiffny_user_name") || "Student";

  return (
    <>
      <Navbar />

      <main className="student-dashboard">
        <div className="student-dashboard-container">
          {/* Welcome Banner */}
          <section className="student-hero">
            <div className="hero-content">
              <div className="dashboard-badge">
                <span className="badge-dot"></span>
                Student Dashboard
              </div>

              <h1>
                Welcome back, <span>{userName}</span>
              </h1>

              <p>
                Find your mess, manage your meals, and keep track of all your
                orders in one place.
              </p>

              <button
                className="hero-button"
                onClick={() => navigate("/messes")}
              >
                Browse Messes
                <span className="button-arrow">→</span>
              </button>
            </div>

            <div className="hero-visual">
              <div className="food-circle">
                <div className="food-plate">
                  <div className="food-rice"></div>

                  <div className="food-item food-item-one"></div>
                  <div className="food-item food-item-two"></div>
                  <div className="food-item food-item-three"></div>
                  <div className="food-item food-item-four"></div>
                </div>
              </div>

              <div className="hero-message">
                <strong>Healthy Meals</strong>
                <span>Better everyday choices</span>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="student-stats">
            <div
              className="student-stat-card plan-card"
              onClick={() => navigate("/messes")}
            >
              <div className="stat-icon plan-icon">P</div>

              <div className="stat-content">
                <span>Active Plan</span>
                <strong>No Active Plan</strong>
                <small>Choose a mess to get started</small>
              </div>

              <span className="stat-arrow">→</span>
            </div>

            <div
              className="student-stat-card order-card"
              onClick={() => navigate("/student/orders")}
            >
              <div className="stat-icon order-icon">O</div>

              <div className="stat-content">
                <span>Total Orders</span>
                <strong>0</strong>
                <small>Your complete order history</small>
              </div>

              <span className="stat-arrow">→</span>
            </div>

            <div
              className="student-stat-card review-card"
              onClick={() => navigate("/student/reviews")}
            >
              <div className="stat-icon review-icon">R</div>

              <div className="stat-content">
                <span>Reviews</span>
                <strong>0</strong>
                <small>Your submitted reviews</small>
              </div>

              <span className="stat-arrow">→</span>
            </div>
          </section>

          {/* Dashboard Grid */}
          <section className="student-dashboard-grid">
            {/* Recent Orders */}
            <div className="dashboard-card recent-orders-card">
              <div className="card-heading">
                <div className="heading-left">
                  <div className="heading-icon">O</div>

                  <div>
                    <h2>Recent Orders</h2>

                    <p>Your latest meal orders will appear here.</p>
                  </div>
                </div>

                <button
                  className="view-all-button"
                  onClick={() => navigate("/student/orders")}
                >
                  View All
                  <span>→</span>
                </button>
              </div>

              <div className="empty-orders">
                <div className="empty-order-illustration">
                  <div className="cloche-handle"></div>

                  <div className="cloche-dome"></div>

                  <div className="cloche-base"></div>
                </div>

                <h3>No orders yet</h3>

                <p>You haven't placed any meal orders yet.</p>

                <button
                  className="find-mess-button"
                  onClick={() => navigate("/messes")}
                >
                  Find a Mess
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card quick-actions-card">
              <div className="card-heading">
                <div className="heading-left">
                  <div className="heading-icon">Q</div>

                  <div>
                    <h2>Quick Actions</h2>

                    <p>Manage your Tiffny account.</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <button
                  className="action-item action-green"
                  onClick={() => navigate("/messes")}
                >
                  <div className="action-icon">M</div>

                  <div className="action-text">
                    <strong>Find a Mess</strong>
                    <span>Explore available messes</span>
                  </div>

                  <span className="action-arrow">→</span>
                </button>

                <button
                  className="action-item action-orange"
                  onClick={() => navigate("/student/orders")}
                >
                  <div className="action-icon">O</div>

                  <div className="action-text">
                    <strong>My Orders</strong>
                    <span>Check your meal orders</span>
                  </div>

                  <span className="action-arrow">→</span>
                </button>

                <button
                  className="action-item action-purple"
                  onClick={() => navigate("/student/profile")}
                >
                  <div className="action-icon">P</div>

                  <div className="action-text">
                    <button
                      type="button"
                      onClick={() => navigate("/student/profile")}
                    >
                      My Profile
                    </button>
                    <span>Manage your information</span>
                  </div>

                  <span className="action-arrow">→</span>
                </button>

                <button
                  className="action-item action-red"
                  onClick={() => navigate("/student/reviews")}
                >
                  <div className="action-icon">R</div>

                  <div className="action-text">
                    <strong>My Reviews</strong>
                    <span>View your submitted reviews</span>
                  </div>

                  <span className="action-arrow">→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Bottom Information */}
          <section className="dashboard-bottom">
            <div className="bottom-content">
              <div className="bottom-line"></div>

              <div>
                <h3>Good Food. Better Days.</h3>

                <p>Find reliable meals from messes around you.</p>
              </div>
            </div>

            <button onClick={() => navigate("/messes")}>
              Explore Messes
              <span>→</span>
            </button>
          </section>
        </div>
      </main>
    </>
  );
}

export default StudentDashboard;
