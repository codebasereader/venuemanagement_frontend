import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "./dashboardlayout/DashboardLayout";
import Home from "./pages/Home";
import Leads from "./pages/Leads";
import LeadDetailsPage from "./pages/leads/LeadDetailsPage.jsx";
import Calendar from "./pages/admin/calendar/Calendar.jsx";
import Profile from "./pages/Profile";
import VenueProfile from "./profileitems/venueprofile/VenueProfile";
import ViewSpaces from "./profileitems/spaces/ViewSpaces";
import PricingHome from "./profileitems/pricing/PricingHome";
import GalleryHome from "./profileitems/gallery/GalleryHome";
import ViewUsers from "./pages/admin/users/ViewUsers";
import ViewVenues from "./pages/admin/venues/ViewVenues";
import LoginPage from "./pages/login/LoginPage";
import { ROLES } from "../config";
import CalendarMonthly from "./pages/CalendarMonthly.jsx";
import Vendorslist from "./pages/Vendorslist.jsx";
import VendorDetailsPage from "./pages/VendorDetailsPage.jsx";
import Daybookhome from "./pages/daybook/Daybookhome.jsx";
import TargetHome from "./pages/target/TargetHome.jsx";
import EmiHome from "./pages/emi/EmiHome.jsx";

function LoginGuard() {
  const { is_logged_in, role } = useSelector((state) => state.user.value);
  if (is_logged_in) {
    if (role === ROLES.INCHARGE || role === ROLES.OWNER)
      return <Navigate to="/" replace />;
    if (role === ROLES.ADMIN) return <Navigate to="/users" replace />;
  }
  return <LoginPage />;
}

function RequireAuth() {
  const { is_logged_in } = useSelector((state) => state.user.value);
  if (!is_logged_in) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireRole({ roles }) {
  const { role } = useSelector((state) => state.user.value);
  if (!roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

function DashboardIndex() {
  const { role } = useSelector((state) => state.user.value);
  if (role === ROLES.ADMIN) return <Navigate to="/users" replace />;
  return <Home />;
}

function CalendarPage() {
  const { role } = useSelector((state) => state.user.value);
  if (role === ROLES.ADMIN) return <Calendar />;
  return <CalendarMonthly />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGuard />} />
      <Route path="/" element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardIndex />} />
          <Route path="calendar" element={<CalendarPage />} />

          {/* Owner + Incharge only */}
          <Route
            element={<RequireRole roles={[ROLES.OWNER, ROLES.INCHARGE]} />}
          >
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:leadId" element={<LeadDetailsPage />} />
            <Route path="vendors" element={<Vendorslist />} />
            <Route path="vendors/:vendorId" element={<VendorDetailsPage />} />
            <Route path="profile" element={<Outlet />}>
              <Route index element={<Profile />} />
              <Route path="venue" element={<VenueProfile />} />
              <Route path="spaces" element={<ViewSpaces />} />
              <Route path="pricing" element={<PricingHome />} />
              <Route path="gallery" element={<GalleryHome />} />
            </Route>
          </Route>

          {/* Owner only */}
          <Route element={<RequireRole roles={[ROLES.OWNER]} />}>
            <Route path="daybook" element={<Daybookhome />} />
            <Route path="target" element={<TargetHome />} />
            <Route path="emi" element={<EmiHome />} />
          </Route>

          {/* Admin only */}
          <Route element={<RequireRole roles={[ROLES.ADMIN]} />}>
            <Route path="users" element={<ViewUsers />} />
            <Route path="venues" element={<ViewVenues />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
