import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../src/pages/HomePage";
import NotFoundPage from "../src/pages/HomePage";
import AdminLayout from "../src/pages/admin/AdminLayout";
import DashboardPage from "../src/pages/admin/DashboardPage";
import ComingSoonPage from "../src/pages/admin/ComingSoonPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}