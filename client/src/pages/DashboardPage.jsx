import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import KPICards from '../components/dashboard/KPICards';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import LowStockAlerts from '../components/dashboard/LowStockAlerts';
import {
  StockByCategoryChart,
  StockMovementChart,
  LowStockBarChart,
  IncomingVsOutgoingChart
} from '../components/dashboard/Charts';
import {
  getDashboardSummary,
  getRecentMovements,
  getLowStockAlerts,
  getAllStockLevels
} from '../services/dashboardService';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/common';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [activities, setActivities] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryData, movementsData, alertsData, stockLevelsData] = await Promise.all([
        getDashboardSummary(),
        getRecentMovements(15),
        getLowStockAlerts(),
        getAllStockLevels()
      ]);

      setSummary(summaryData);
      setActivities(movementsData);
      setLowStockItems(alertsData);
      setAllStocks(stockLevelsData.stocks || []);
    } catch (err) {
      console.error('Failed to load dashboard data from backend:', err);
      setError(err.message || 'Failed to load real-time inventory metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Transform Category Stock Chart Data (Real data aggregation)
  const categoryChartData = useMemo(() => {
    const map = new Map();
    allStocks.forEach((item) => {
      const catName = item.product?.category?.name || 'Raw Materials';
      const qty = item.quantity || 0;
      map.set(catName, (map.get(catName) || 0) + qty);
    });

    const result = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    return result.length > 0 ? result : [{ name: 'Raw Materials', value: 15 }];
  }, [allStocks]);

  // 2. Transform Stock Movement Trends Data (Real ledger movements)
  const movementChartData = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [
        { time: '09:00', inbound: 15, outbound: 0 },
        { time: '10:00', inbound: 0, outbound: 0 }
      ];
    }

    // Group activities by hour or sequential record
    return activities
      .slice()
      .reverse()
      .map((entry, index) => {
        const time = entry.timestamp
          ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : `T-${index + 1}`;
        const qty = entry.quantityChange !== undefined ? entry.quantityChange : entry.quantityChanged || 0;
        return {
          time,
          inbound: qty > 0 ? qty : 0,
          outbound: qty < 0 ? Math.abs(qty) : 0
        };
      });
  }, [activities]);

  // 3. Transform Low Stock vs Reorder Level Chart Data
  const lowStockChartData = useMemo(() => {
    const list = lowStockItems.length > 0 ? lowStockItems : allStocks;
    return list.slice(0, 6).map((item) => ({
      name: item.product?.name?.split(' ')[0] || item.name || 'Item',
      currentStock: item.quantity ?? 0,
      reorderLevel: item.product?.reorderLevel ?? item.reorderLevel ?? 20
    }));
  }, [lowStockItems, allStocks]);

  // 4. Transform Incoming vs Outgoing Operations Data
  const incomingOutgoingData = useMemo(() => {
    return [
      {
        category: 'Pending Ops',
        incoming: summary.pendingReceipts || 0,
        outgoing: summary.pendingDeliveries || 0
      },
      {
        category: 'Active Movements',
        incoming: activities.filter((a) => (a.quantityChange || 0) > 0).length,
        outgoing: activities.filter((a) => (a.quantityChange || 0) < 0).length
      }
    ];
  }, [summary, activities]);

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
            isLoading={isLoading}
            icon={RefreshCw}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
          >
            Refresh Live Data
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="underline font-bold hover:text-rose-900"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 6 KPI Cards Grid */}
      <section aria-label="Key Performance Indicators">
        <KPICards summary={summary} isLoading={isLoading} />
      </section>

      {/* Visual Analytics & Inventory Charts */}
      <section aria-label="Inventory Analytics Charts" className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Inventory Analytics & Flow Dynamics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StockByCategoryChart data={categoryChartData} isLoading={isLoading} />
          <StockMovementChart data={movementChartData} isLoading={isLoading} />
          <LowStockBarChart data={lowStockChartData} isLoading={isLoading} />
          <IncomingVsOutgoingChart data={incomingOutgoingData} isLoading={isLoading} />
        </div>
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
