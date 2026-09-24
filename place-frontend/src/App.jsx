import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import { AuthLayout } from "@/components/auth/AuthLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import DashboardPage from "@/pages/admin/DashboardPage";
import ComingSoonPage from "@/pages/admin/ComingSoonPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/corretor" element={<ComingSoonPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}