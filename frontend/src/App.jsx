import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import StudentRegister from "./pages/StudentRegister/StudentRegister";
import MessRegister from "./pages/MessRegister/MessRegister";

import MessOwnerLayout from "./pages/MessOwner/MessOwnerLayout";

import MessDashboard from "./pages/MessOwner/MessDashboard";
import MessProfile from "./pages/MessOwner/MessProfile";
import MenuManagement from "./pages/MessOwner/MenuManagement";

import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC PAGES
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register/student"
          element={<StudentRegister />}
        />

        <Route
          path="/register/mess"
          element={<MessRegister />}
        />


        {/* =================================================
            MESS OWNER AREA
        ================================================= */}

        <Route
          path="/mess"
          element={<MessOwnerLayout />}
        >

          {/* Dashboard */}

          <Route
            path="dashboard"
            element={<MessDashboard />}
          />


          {/* Mess Profile */}

          <Route
            path="profile"
            element={<MessProfile />}
          />


          {/* Edit Mess Profile */}

          <Route
            path="profile/edit"
            element={<MessProfile />}
          />


          {/* Menu Management */}

          <Route
            path="menu"
            element={<MenuManagement />}
          />


          {/* Capacity Management */}

          <Route
            path="capacity"
            element={
              <div style={{ padding: "40px" }}>
                Capacity Management
              </div>
            }
          />


          {/* Monthly Price Management */}

          <Route
            path="monthly-price"
            element={
              <div style={{ padding: "40px" }}>
                Monthly Price Management
              </div>
            }
          />


          {/* Orders Management */}

          <Route
            path="orders"
            element={
              <div style={{ padding: "40px" }}>
                Orders Management
              </div>
            }
          />


          {/* Reviews Management */}

          <Route
            path="reviews"
            element={
              <div style={{ padding: "40px" }}>
                Reviews Management
              </div>
            }
          />

        </Route>


        {/* =================================================
            ADMIN AREA
        ================================================= */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* Admin Dashboard */}

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;