import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "./dashboardlayout/DashboardLayout";
import Home from "./pages/Home";
import Leads from "./pages/Leads";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import VenueProfile from "./profileitems/venueprofile/VenueProfile";
import ViewSpaces from "./profileitems/spaces/ViewSpaces";
import PricingHome from "./profileitems/pricing/PricingHome";
import GalleryHome from "./profileitems/gallery/GalleryHome";
import ViewUsers from "./pages/admin/ViewUsers";
import ViewVenues from "./pages/admin/ViewVenues";
import LoginPage from "./pages/login/LoginPage";
import { ROLES } from "../config";

function LoginGuard() {
  const { is_logged_in, role } = useSelector((state) => state.user.value);
  if (is_logged_in) {
    if (role === ROLES.INCHARGE) return <Navigate to="/" replace />;
    if (role === ROLES.ADMIN) return <Navigate to="/users" replace />;
  }
  return <LoginPage />;
}

function RequireAuth() {
  const { is_logged_in } = useSelector((state) => state.user.value);
  if (!is_logged_in) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function DashboardIndex() {
  const { role } = useSelector((state) => state.user.value);
  if (role === ROLES.ADMIN) return <Navigate to="/users" replace />;
  return <Home />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGuard />} />
      <Route path="/" element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardIndex />} />
          <Route path="leads" element={<Leads />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<Outlet />}>
            <Route index element={<Profile />} />
            <Route path="venue" element={<VenueProfile />} />
            <Route path="spaces" element={<ViewSpaces />} />
            <Route path="pricing" element={<PricingHome />} />
            <Route path="gallery" element={<GalleryHome />} />
          </Route>
          <Route path="users" element={<ViewUsers />} />
          <Route path="venues" element={<ViewVenues />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
