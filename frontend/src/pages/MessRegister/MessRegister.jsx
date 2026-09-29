import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../../api/authApi";

import "./MessRegister.css";

function MessRegister() {
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
        role: "MESS_OWNER",
        location: formData.location,
      });

      console.log("Mess owner registration successful:", response);

      alert("Mess owner account created successfully.");

      navigate("/login");
    } catch (error) {
      console.error("Mess owner registration error:", error);

      alert(error.message);
    }
  }

  return (
    <div className="mess-register-page">

      {/* Left Section */}

      <section className="mess-register-brand">

        <button
          className="mess-back-button"
          onClick={() => navigate("/")}
        >
          <span>←</span>
          Back to Home
        </button>

        <div className="mess-register-brand-content">

          <div className="mess-brand-mark">
            T
          </div>

          <p className="mess-brand-name">
            tiffny
          </p>

          <h1>
            Bring your
            <br />
            meals to
            <span>more people.</span>
          </h1>

          <p className="mess-brand-description">
            Create your mess owner account and bring your
            food business to students looking for reliable
            everyday meals.
          </p>

          <div className="mess-register-points">

            <div className="mess-register-point">
              <span>01</span>
              <p>Create your mess profile</p>
            </div>

            <div className="mess-register-point">
              <span>02</span>
              <p>Add your menu and pricing</p>
            </div>

            <div className="mess-register-point">
              <span>03</span>
              <p>Manage student orders</p>
            </div>

          </div>

        </div>

      </section>


      {/* Right Section */}

      <section className="mess-register-form-section">

        <div className="mess-register-container">

          <div className="mess-register-heading">

            <span>
              MESS OWNER ACCOUNT
            </span>

            <h2>
              Join Tiffny
            </h2>

            <p>
              Create your owner account to get started.
            </p>

          </div>


          <form
            className="mess-register-form"
            onSubmit={handleSubmit}
          >

            {/* Owner Name */}

            <div className="mess-form-group">

              <label htmlFor="mess-owner-name">
                Owner Name
              </label>

              <input
                id="mess-owner-name"
                name="name"
                type="text"
                placeholder="Enter owner name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* Email */}

            <div className="mess-form-group">

              <label htmlFor="mess-owner-email">
                Email Address
              </label>

              <input
                id="mess-owner-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* Phone */}

            <div className="mess-form-group">

              <label htmlFor="mess-owner-phone">
                Phone Number
              </label>

              <input
                id="mess-owner-phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

            </div>


            {/* Location */}

            <div className="mess-form-group">

              <label htmlFor="mess-owner-location">
                Owner Location
              </label>

              <input
                id="mess-owner-location"
                name="location"
                type="text"
                placeholder="Example: Nashik, Maharashtra"
                value={formData.location}
                onChange={handleChange}
                required
              />

            </div>


            {/* Password */}

            <div className="mess-form-group mess-password-group">

              <label htmlFor="mess-owner-password">
                Password
              </label>

              <div className="mess-password-wrapper">

                <input
                  id="mess-owner-password"
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
                  className="mess-password-toggle"
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


            {/* Information */}

            <div className="owner-info-box">

              <div className="owner-info-number">
                i
              </div>

              <p>
                After creating your account, you can
                complete your mess profile with your
                mess name, address, menu and other
                required details.
              </p>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="mess-register-submit"
            >
              Create Owner Account

              <span>
                →
              </span>

            </button>

          </form>


          {/* Login */}

          <div className="mess-already-account">

            <p>
              Already registered?
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

export default MessRegister;