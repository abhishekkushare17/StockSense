import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import KPICards from '../components/dashboard/KPICards';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import LowStockAlerts from '../components/dashboard/LowStockAlerts';
import api from '../services/api';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../components/common';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [activities, setActivities] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, actRes, stockRes] = await Promise.allSettled([
        api.get('/dashboard/summary'),
        api.get('/ledger?limit=10'),
        api.get('/stock?lowStock=true')
      ]);

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value.data?.data || {});
      }
      if (actRes.status === 'fulfilled') {
        setActivities(actRes.value.data?.data?.entries || []);
      }
      if (stockRes.status === 'fulfilled') {
        setLowStockItems(stockRes.value.data?.data?.stocks || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & System State Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold mb-3 backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Inventory Operations Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Manager'}
          </h1>
          <p className="mt-2 text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Monitor real-time warehouse fulfillment, track supply receipts, and manage inventory movements across your distribution network.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDashboardData}
            icon={RefreshCw}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <section aria-label="Key Performance Indicators">
        <KPICards summary={summary} isLoading={isLoading} />
      </section>

      {/* Operations Activity & Low Stock Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-label="Low Stock Alerts">
          <LowStockAlerts items={lowStockItems} isLoading={isLoading} />
        </section>

        <section aria-label="Recent Operations Ledger">
          <RecentActivityTable activities={activities} isLoading={isLoading} />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
