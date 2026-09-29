import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../../api/authApi";

import "./StudentRegister.css";

function StudentRegister() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: "",
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
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "STUDENT",
        location: formData.location,
      });

      console.log("Registration successful:", response);

      alert("Student account created successfully.");

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      alert(error.message);
    }
  }

  return (
    <div className="student-register-page">

      {/* Left Section */}

      <section className="student-register-brand">

        <button
          className="register-back-button"
          onClick={() => navigate("/")}
        >
          <span>←</span>
          Back to Home
        </button>

        <div className="student-register-brand-content">

          <div className="register-brand-mark">
            T
          </div>

          <p className="register-brand-name">
            tiffny
          </p>

          <h1>
            Your meals,
            <br />
            your routine,
            <span>your way.</span>
          </h1>

          <p className="register-brand-description">
            Create your student account and discover
            trusted messes, meal plans and easy ordering
            in one place.
          </p>

          <div className="register-points">

            <div className="register-point">
              <span>01</span>
              <p>Discover approved messes</p>
            </div>

            <div className="register-point">
              <span>02</span>
              <p>Choose one-day or monthly meals</p>
            </div>

            <div className="register-point">
              <span>03</span>
              <p>Order meals your way</p>
            </div>

          </div>

        </div>

      </section>


      {/* Right Section */}

      <section className="student-register-form-section">

        <div className="student-register-container">

          <div className="register-heading">

            <span>
              STUDENT ACCOUNT
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Enter your details to get started with Tiffny.
            </p>

          </div>


          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* Name */}

            <div className="register-form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* Email */}

            <div className="register-form-group">

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


            {/* Phone */}

            <div className="register-form-group">

              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

            </div>


            {/* Location */}

            <div className="register-form-group">

              <label htmlFor="location">
                Your Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Example: Nashik, Maharashtra"
                value={formData.location}
                onChange={handleChange}
                required
              />

            </div>


            {/* Password */}

            <div className="register-form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-password-wrapper">

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="register-submit-button"
            >
              Create Student Account

              <span>
                →
              </span>

            </button>

          </form>


          {/* Login */}

          <div className="already-account">

            <p>
              Already have an account?
            </p>

            <button
              onClick={() => navigate("/login")}
            >
              Sign in to Tiffny
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default StudentRegister;