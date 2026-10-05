import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";

import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* ========================================
          NAVBAR
      ======================================== */}

      <Navbar />

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main>


        {/* ========================================
            HERO SECTION
        ======================================== */}

        <section className="hero-section">

          <div className="hero-content">

            <div className="hero-badge">
              SIMPLE MEALS. BETTER ROUTINE.
            </div>


            <h1>
              Your daily meals,
              <span> made simple.</span>
            </h1>


            <p>
              Find trusted messes, choose your meal plan,
              select how you want your food, and manage
              everything from one place.
            </p>


            <div className="hero-actions">

              <button
                className="primary-button"
                onClick={() => navigate("/messes")}
              >
                Find Your Mess

                <span className="button-arrow">
                  →
                </span>

              </button>


              <button
                className="secondary-button"
                onClick={() => navigate("/register/mess")}
              >
                Join as a Mess Owner
              </button>

            </div>


            {/* TRUST / PROCESS */}

            <div className="hero-trust">

              <div className="trust-item">

                <strong>
                  01
                </strong>

                <span>
                  Find trusted messes
                </span>

              </div>


              <div className="trust-line"></div>


              <div className="trust-item">

                <strong>
                  02
                </strong>

                <span>
                  Choose your meal
                </span>

              </div>


              <div className="trust-line"></div>


              <div className="trust-item">

                <strong>
                  03
                </strong>

                <span>
                  Order with ease
                </span>

              </div>

            </div>

          </div>


          {/* ========================================
              HERO VISUAL
          ======================================== */}

          <div className="hero-visual">

            <div className="visual-glow"></div>


            {/* MEAL CARD */}

            <div className="meal-card">

              <div className="meal-card-top">

                <span className="meal-label">
                  TODAY'S MEAL
                </span>

                <span className="available-label">
                  AVAILABLE
                </span>

              </div>


              {/* MEAL VISUAL */}

              <div className="meal-visual">

                <div className="plate">

                  <div className="food-center"></div>

                  <div className="food-item food-one"></div>

                  <div className="food-item food-two"></div>

                  <div className="food-item food-three"></div>

                </div>

              </div>


              {/* MEAL INFORMATION */}

              <div className="meal-information">

                <div>

                  <h3>
                    Home Style Thali
                  </h3>

                  <p>
                    Freshly prepared meal
                  </p>

                </div>


                <div className="meal-price">

                  <small>
                    FROM
                  </small>

                  <strong>
                    ₹80
                  </strong>

                </div>

              </div>


              {/* MEAL DETAILS */}

              <div className="meal-details">

                <span>
                  Lunch
                </span>

                <span>
                  •
                </span>

                <span>
                  Eat at Mess
                </span>

              </div>

            </div>


            {/* ========================================
                FLOATING RATING CARD
            ======================================== */}

            <div className="floating-card floating-card-one">

              <div className="floating-number">
                4.8
              </div>


              <div>

                <strong>
                  Mess Rating
                </strong>

                <span>
                  Student reviews
                </span>

              </div>

            </div>


            {/* ========================================
                FLOATING ORDERING CARD
            ======================================== */}

            <div className="floating-card floating-card-two">

              <div className="mini-icon">
                +
              </div>


              <div>

                <strong>
                  Easy Ordering
                </strong>

                <span>
                  One place for everything
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ========================================
            HOW IT WORKS
        ======================================== */}

        <section
          className="how-section"
          id="how-it-works"
        >

          <div className="section-heading">

            <span>
              HOW IT WORKS
            </span>

            <h2>
              Everything you need,
              <br />
              in four simple steps.
            </h2>

            <p>
              Tiffny keeps the entire meal ordering process
              simple for students and mess owners.
            </p>

          </div>


          <div className="steps-container">


            {/* STEP 01 */}

            <div className="step-card">

              <div className="step-number">
                01
              </div>

              <div className="step-line"></div>

              <h3>
                Find a Mess
              </h3>

              <p>
                Browse approved messes available
                around your location.
              </p>

            </div>


            {/* STEP 02 */}

            <div className="step-card">

              <div className="step-number">
                02
              </div>

              <div className="step-line"></div>

              <h3>
                Choose Your Meal
              </h3>

              <p>
                Explore menus and select a
                one-day or monthly plan.
              </p>

            </div>


            {/* STEP 03 */}

            <div className="step-card">

              <div className="step-number">
                03
              </div>

              <div className="step-line"></div>

              <h3>
                Select Your Mode
              </h3>

              <p>
                Decide whether you want to eat
                at the mess or receive a tiffin.
              </p>

            </div>


            {/* STEP 04 */}

            <div className="step-card">

              <div className="step-number">
                04
              </div>

              <div className="step-line"></div>

              <h3>
                Order & Pay
              </h3>

              <p>
                Confirm your order and keep
                track of it from your dashboard.
              </p>

            </div>

          </div>

        </section>


        {/* ========================================
            ABOUT SECTION
        ======================================== */}

        <section
          className="about-section"
          id="about"
        >

          <div className="about-box">

            <div className="about-number">
              T
            </div>


            <div className="about-content">

              <span>
                ABOUT TIFFNY
              </span>

              <h2>
                A simpler way to manage
                your everyday meals.
              </h2>

              <p>
                Tiffny brings students and mess owners
                together on one platform. Students can
                discover approved messes, choose meals,
                place orders and track them easily.
              </p>

            </div>

          </div>

        </section>


        {/* ========================================
            CTA SECTION
        ======================================== */}

        <section className="cta-section">

          <div className="cta-content">

            <span>
              READY WHEN YOU ARE
            </span>

            <h2>
              Find your next meal
              with Tiffny.
            </h2>

            <p>
              Start exploring messes and make
              your daily meal routine easier.
            </p>


            <button
              className="cta-button"
              onClick={() => navigate("/messes")}
            >
              Explore Messes

              <span>
                →
              </span>

            </button>

          </div>

        </section>

      </main>


      {/* ========================================
          FOOTER
      ======================================== */}

      <footer
        className="footer"
        id="contact"
      >

        <div className="footer-brand">

          <div className="brand">

            <div className="brand-mark">
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

export default Home;