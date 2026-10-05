import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  loginUser,
  getMessProfile,
} from "../../api/authApi";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      // ==========================================
      // LOGIN
      // ==========================================

      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", response);

      // ==========================================
      // STORE LOGIN INFORMATION
      // ==========================================

      sessionStorage.setItem(
        "tiffny_token",
        response.access_token
      );

      sessionStorage.setItem(
        "tiffny_user_id",
        response.user_id
      );

      sessionStorage.setItem(
        "tiffny_user_name",
        response.name
      );

      sessionStorage.setItem(
        "tiffny_user_role",
        response.role
      );

      alert("Login successful.");

      // ==========================================
      // STUDENT
      // ==========================================

      if (response.role === "STUDENT") {
        navigate("/");
        return;
      }

      // ==========================================
      // ADMIN
      // ==========================================

      if (response.role === "ADMIN") {
        navigate("/admin/dashboard");
        return;
      }

      // ==========================================
      // MESS OWNER
      // ==========================================

      if (response.role === "MESS_OWNER") {
        const token = response.access_token;

        try {
          /*
            Check whether this mess owner
            already has a mess profile.
          */

          const messProfile =
            await getMessProfile(token);

          console.log(
            "Mess profile:",
            messProfile
          );

          // ----------------------------------------
          // NO PROFILE
          // ----------------------------------------

          if (messProfile === null) {
            navigate("/mess/profile");
            return;
          }

          // ----------------------------------------
          // PROFILE EXISTS
          // ----------------------------------------

          navigate("/mess/dashboard");
          return;

        } catch (profileError) {
          /*
            Login was successful, but checking
            the mess profile failed.

            We keep the user logged in.
          */

          console.error(
            "Mess profile check failed:",
            profileError
          );

          /*
            For now, send the owner to the
            mess profile page instead of
            sending them back to login.
          */

          navigate("/mess/profile");
          return;
        }
      }

      // ==========================================
      // UNKNOWN ROLE
      // ==========================================

      alert("Unknown user role.");

    } catch (error) {
      // ==========================================
      // LOGIN ERROR
      // ==========================================

      console.error(
        "Login error:",
        error
      );

      alert(
        error.message ||
        "Login failed."
      );
    }
  }

  return (
    <div className="login-page">

      {/* =====================================================
          LEFT SECTION
      ====================================================== */}

      <section className="login-brand-section">

        <div className="login-brand-content">

          <button
            className="login-back-button"
            onClick={() => navigate("/")}
          >
            <span>←</span>
            Back to Home
          </button>

          <div className="login-brand-mark">
            T
          </div>

          <p className="login-brand-name">
            tiffny
          </p>

          <h1>
            Good meals
            <br />
            make the day
            <span>better.</span>
          </h1>

          <p className="login-brand-description">
            Manage your meals, orders and mess
            experience from one simple platform.
          </p>

          <div className="login-feature-list">

            <div className="login-feature">

              <span className="feature-number">
                01
              </span>

              <span>
                Find trusted messes
              </span>

            </div>

            <div className="login-feature">

              <span className="feature-number">
                02
              </span>

              <span>
                Manage your meal plans
              </span>

            </div>

            <div className="login-feature">

              <span className="feature-number">
                03
              </span>

              <span>
                Track your orders
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT SECTION
      ====================================================== */}

      <section className="login-form-section">

        <div className="login-form-container">

          <div className="login-heading">

            <span className="login-small-heading">
              WELCOME BACK
            </span>

            <h2>
              Sign in to Tiffny
            </h2>

            <p>
              Enter your details to continue.
            </p>

          </div>


          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => {
                    console.log(
                      "Forgot password clicked"
                    );
                  }}
                >
                  Forgot password?
                </button>

              </div>


              <div className="password-input-wrapper">

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-submit-button"
            >
              Sign In

              <span>
                →
              </span>

            </button>

          </form>


          {/* DIVIDER */}

          <div className="login-divider">

            <span></span>

            <p>
              OR
            </p>

            <span></span>

          </div>


          {/* REGISTER OPTIONS */}

          <div className="login-register">

            <p>
              Don't have a Tiffny account?
            </p>

            <div className="login-register-buttons">

              <button
                onClick={() =>
                  navigate(
                    "/register/student"
                  )
                }
              >
                Register as Student
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/register/mess"
                  )
                }
              >
                Register as Mess Owner
              </button>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;