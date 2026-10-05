import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

import StudentRegister from "./pages/StudentRegister/StudentRegister";
import StudentDashboard from "./pages/Student/StudentDashboard";

import MessRegister from "./pages/MessRegister/MessRegister";

import MessOwnerLayout from "./pages/MessOwner/MessOwnerLayout";

import MessDashboard from "./pages/MessOwner/MessDashboard";
import MessProfile from "./pages/MessOwner/MessProfile";
import MenuManagement from "./pages/MessOwner/MenuManagement";
import CapacityManagement from "./pages/MessOwner/CapacityManagement";
import PricingManagement from "./pages/MessOwner/PricingManagement";
import OrdersManagement from "./pages/MessOwner/OrdersManagement";
import ReviewsManagement from "./pages/MessOwner/ReviewsManagement";

import Messes from "./pages/Messes/Messes";
import MessDetails from "./pages/MessDetails/MessDetails";

import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ApprovedMesses from "./pages/Admin/ApprovedMesses";
import RejectedMesses from "./pages/Admin/RejectedMesses";
import SuspendedMesses from "./pages/Admin/SuspendedMesses";
import PendingMesses from "./pages/Admin/PendingMesses";


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

        <Route
          path="/messes"
          element={<Messes />}
        />

        <Route
          path="/messes/:messId"
          element={<MessDetails />}
        />


        {/* =================================================
            STUDENT AREA
        ================================================= */}

        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
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
            element={<CapacityManagement />}
          />


          {/* Monthly Price Management */}

          <Route
            path="monthly-price"
            element={<PricingManagement />}
          />


          {/* Orders Management */}

          <Route
            path="orders"
            element={<OrdersManagement />}
          />


          {/* Reviews Management */}

          <Route
            path="reviews"
            element={<ReviewsManagement />}
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


          {/* Approved Messes */}

          <Route
            path="approved-messes"
            element={<ApprovedMesses />}
          />


          {/* Rejected Messes */}

          <Route
            path="rejected-messes"
            element={<RejectedMesses />}
          />


          {/* Suspended Messes */}

          <Route
            path="suspended-messes"
            element={<SuspendedMesses />}
          />


          {/* Pending Messes */}

          <Route
            path="pending-messes"
            element={<PendingMesses />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;