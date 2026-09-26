import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import ReceiptsPage from '../pages/ReceiptsPage';
import DeliveriesPage from '../pages/DeliveriesPage';
import TransfersPage from '../pages/TransfersPage';
import AdjustmentsPage from '../pages/AdjustmentsPage';
import MoveHistoryPage from '../pages/MoveHistoryPage';
import WarehousePage from '../pages/WarehousePage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { Boxes } from 'lucide-react';
import Button from '../components/common/Button';

// 404 Fallback component
const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
      <Boxes className="w-8 h-8" />
    </div>
    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404</h1>
    <h2 className="text-xl font-bold text-gray-800 mt-2">Page Not Found</h2>
    <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6">
      The requested resource or module does not exist or has been moved.
    </p>
    <Button variant="primary" onClick={() => (window.location.href = '/dashboard')}>
      Return to Dashboard
    </Button>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes inside MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/deliveries" element={<DeliveriesPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/adjustments" element={<AdjustmentsPage />} />
          <Route path="/move-history" element={<MoveHistoryPage />} />
          <Route path="/warehouse" element={<WarehousePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-All 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
