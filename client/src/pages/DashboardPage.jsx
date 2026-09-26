import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import KPICards from '../components/dashboard/KPICards';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import LowStockAlerts from '../components/dashboard/LowStockAlerts';
import InventoryHealthWidget from '../components/dashboard/InventoryHealthWidget';
import {
  StockByCategoryChart,
  StockMovementChart,
  IncomingVsOutgoingChart,
  StockByWarehouseChart
} from '../components/dashboard/Charts';
import {
  getDashboardSummary,
  getRecentMovements,
  getLowStockAlerts,
  getAllStockLevels,
  getStockByWarehouse
} from '../services/dashboardService';
import { Sparkles, RefreshCw, AlertCircle, BarChart3, TrendingUp, Layers } from 'lucide-react';
import { Button } from '../components/common';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [activities, setActivities] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [warehouseStockData, setWarehouseStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filter state
  const [filters, setFilters] = useState({
    docType: '',
    status: '',
    warehouse: '',
    category: ''
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      docType: '',
      status: '',
      warehouse: '',
      category: ''
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Construct API query parameters based on active filters
      const summaryParams = {};
      if (filters.warehouse) summaryParams.warehouse = filters.warehouse;

      const ledgerParams = {};
      if (filters.warehouse) ledgerParams.warehouse = filters.warehouse;
      if (filters.docType) ledgerParams.operationType = filters.docType;

      const stockParams = {};
      if (filters.warehouse) stockParams.warehouse = filters.warehouse;
      if (filters.category) stockParams.category = filters.category;

      const [summaryData, movementsData, alertsData, stockLevelsData, whData] = await Promise.all([
        getDashboardSummary(summaryParams),
        getRecentMovements(15, ledgerParams),
        getLowStockAlerts(stockParams),
        getAllStockLevels(stockParams),
        getStockByWarehouse().catch(() => [])
      ]);

      setSummary(summaryData);
      setActivities(movementsData);
      setLowStockItems(alertsData);
      setAllStocks(stockLevelsData.stocks || []);
      setWarehouseStockData(Array.isArray(whData) ? whData : []);
    } catch (err) {
      console.error('Failed to load dashboard data from backend:', err);
      setError(err.message || 'Failed to load real-time inventory metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Transform Category Stock Chart Data
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

  // 2. Transform Stock Movement Trends Data
  const movementChartData = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [
        { time: '09:00', inbound: 15, outbound: 0 },
        { time: '10:00', inbound: 0, outbound: 0 }
      ];
    }

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

  // 3. Transform Stock by Warehouse Chart Data
  const warehouseChartData = useMemo(() => {
    if (warehouseStockData && warehouseStockData.length > 0) {
      return warehouseStockData;
    }
    const map = new Map();
    allStocks.forEach((item) => {
      const wName = item.warehouse?.name || 'Central Facility';
      map.set(wName, (map.get(wName) || 0) + (item.quantity || 0));
    });
    const res = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    return res.length > 0 ? res : [{ name: 'Main Facility', value: 250 }];
  }, [warehouseStockData, allStocks]);

  // 4. Transform Incoming vs Outgoing Operations Data
  const incomingOutgoingData = useMemo(() => {
    return [
      {
        category: 'Pending Ops',
        incoming: summary.pendingReceipts || 0,
        outgoing: summary.pendingDeliveries || 0
      },
      {
        category: 'Movements',
        incoming: activities.filter((a) => (a.quantityChange || 0) > 0).length,
        outgoing: activities.filter((a) => (a.quantityChange || 0) < 0).length
      }
    ];
  }, [summary, activities]);

  return (
    <div className="space-y-7">
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

      {/* 7 KPI Cards Grid */}
      <section aria-label="Key Performance Indicators">
        <KPICards summary={summary} isLoading={isLoading} />
      </section>

      {/* Filter Toolbar (Document Type, Status, Warehouse, Category) */}
      <section aria-label="Dashboard Filters">
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </section>

      {/* Upper Visual Analytics Section: Trends & Health */}
      <section aria-label="Inventory Analytics & Health" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Stock Flow Dynamics & System Health
          </h2>
          <span className="text-xs text-gray-400">Real-time telemetry</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <StockMovementChart data={movementChartData} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <InventoryHealthWidget
              summary={summary}
              healthScore={summary.healthPercentage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>

      {/* Lower Visual Analytics Section: Distribution & Fulfillment */}
      <section aria-label="Distribution Breakdown" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Warehouse Distribution & Category Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StockByCategoryChart data={categoryChartData} isLoading={isLoading} />
          <StockByWarehouseChart data={warehouseChartData} isLoading={isLoading} />
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
