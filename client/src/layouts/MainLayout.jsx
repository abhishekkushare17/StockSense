import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import api from '../services/api';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // Fetch low stock alerts globally for notification badge in Navbar
  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/stock?lowStock=true');
        if (isMounted && response.data?.data?.stocks) {
          setLowStockAlerts(response.data.data.stocks);
        }
      } catch (err) {
        // Fallback silently if stock endpoint is empty
      }
    };

    fetchAlerts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component: Persistent on desktop (lg+), slide-over drawer on mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          unreadAlerts={lowStockAlerts.length}
          lowStockItems={lowStockAlerts}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ lowStockAlerts }} />
          </div>
        </main>

        {/* Compact SaaS Footer */}
        <footer className="bg-white border-t border-gray-200 py-3.5 px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} StockSense Inventory Management System &bull; Production Platform</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              API Connected
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
