import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "./dashboardlayout/DashboardLayout";
import Home from "./pages/Home";
import Leads from "./pages/Leads";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import VenueProfile from "./profileitems/venueprofile/VenueProfile";
import ViewSpaces from "./profileitems/spaces/ViewSpaces";
import PricingHome from "./profileitems/pricing/PricingHome";
import GalleryHome from "./profileitems/gallery/GalleryHome";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Home />} />
        <Route path="leads" element={<Leads />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Outlet />}>
          <Route index element={<Profile />} />
          <Route path="venue" element={<VenueProfile />} />
          <Route path="spaces" element={<ViewSpaces />} />
          <Route path="pricing" element={<PricingHome />} />
          <Route path="gallery" element={<GalleryHome />} />
        </Route>

        {/* Fallback: redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
