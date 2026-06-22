import { ConvexProvider } from "convex/react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PublicLayout } from "@/components/PublicLayout";
import { AdminPasswordGate } from "@/components/AdminPasswordGate";
import {
  DashboardPage,
  LandingPage,
  SettingsPage,
  ServicesPage,
  GalleryPage,
  AvailabilityPage,
  SectionsPage,
} from "@/pages";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { convex } from "../convexClient";

function AdminRoutes() {
  return (
    <AdminPasswordGate>
      <AppLayout />
    </AdminPasswordGate>
  );
}

export function SpaceAuthAppRoutes() {
  return (
    <ConvexProvider client={convex}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        <Route path="/admin" element={<AdminRoutes />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConvexProvider>
  );
}
