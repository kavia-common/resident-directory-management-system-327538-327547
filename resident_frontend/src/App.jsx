import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ResidentDetailPage from "./pages/ResidentDetailPage.jsx";
import ResidentListPage from "./pages/ResidentListPage.jsx";
import AdminResidentsPage from "./pages/AdminResidentsPage.jsx";

/**
 * Application root with routes.
 * - Public: resident list + resident detail
 * - Admin: CRUD UI (guarded by local admin session)
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ResidentListPage />} />
        <Route path="/residents/:id" element={<ResidentDetailPage />} />
        <Route path="/admin" element={<AdminResidentsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
