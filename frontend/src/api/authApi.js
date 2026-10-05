const API_BASE_URL = "http://127.0.0.1:8000";


// ------------------------------------------------
// REGISTER USER
// ------------------------------------------------

export async function registerUser(userData) {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed"
    );
  }

  return data;
}


// ------------------------------------------------
// LOGIN USER
// ------------------------------------------------

export async function loginUser(loginData) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    );
  }

  if (data.message !== "Login successful") {
    throw new Error(
      data.message || "Invalid email or password"
    );
  }

  return data;
}


// ------------------------------------------------
// GET MESS OWNER PROFILE
// ------------------------------------------------

/*
  Check whether the logged-in mess owner
  already has a mess profile.

  Returns:
  - Mess profile object → profile exists
  - null → profile does not exist
*/

export async function getMessProfile(token) {
  const response = await fetch(
    `${API_BASE_URL}/mess/profile`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  // Debug information
  console.log(
    "Mess profile response status:",
    response.status
  );

  console.log(
    "Mess profile response data:",
    data
  );

  /*
    404 means the mess owner has not
    created/submitted a mess profile yet.
  */
  if (response.status === 404) {
    return null;
  }

  /*
    Any other unsuccessful response
    should be treated as an error.
  */
  if (!response.ok) {
    throw new Error(
      data.detail ||
      `Unable to check mess profile. Status: ${response.status}`
    );
  }

  /*
    Profile exists.
  */
  return data;
}