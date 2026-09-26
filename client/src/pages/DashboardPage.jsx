import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import KPICards from '../components/dashboard/KPICards';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import LowStockAlerts from '../components/dashboard/LowStockAlerts';
import InventoryHealthWidget from '../components/dashboard/InventoryHealthWidget';
import SmartReorderWidget from '../components/dashboard/SmartReorderWidget';
import {
  StockByCategoryChart,
  StockMovementChart,
  IncomingVsOutgoingChart,
  StockByWarehouseChart
} from '../components/dashboard/Charts';
import {
  DailyActionCenter,
  StockForecastWidget,
  RiskRadarWidget,
  AnomalyAlertsWidget,
  WhatIfSimulatorModal,
  FindMyStockModal,
  ExplainStockModal
} from '../components/intelligence';
import {
  getDashboardSummary,
  getRecentMovements,
  getLowStockAlerts,
  getAllStockLevels,
  getStockByWarehouse,
  getSmartReorderRecommendations
} from '../services/dashboardService';
import intelligenceService from '../services/intelligenceService';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Layers,
  Shield,
  QrCode,
  PackagePlus,
  Truck,
  ArrowRightLeft,
  SlidersHorizontal,
  Search,
  Radar,
  HelpCircle
} from 'lucide-react';
import { Button, Badge } from '../components/common';
import { ROLES } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core KPIs & Operational State
  const [summary, setSummary] = useState({});
  const [activities, setActivities] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [warehouseStockData, setWarehouseStockData] = useState([]);
  const [reorderRecs, setReorderRecs] = useState([]);

  // Intelligence State
  const [dailyActions, setDailyActions] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [riskRadar, setRiskRadar] = useState(null);
  const [anomalies, setAnomalies] = useState([]);

  // Intelligence Modals State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorProductId, setSimulatorProductId] = useState(null);
  const [isFindStockOpen, setIsFindStockOpen] = useState(false);
  const [explainProductId, setExplainProductId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filter state
  const [filters, setFilters] = useState({
    docType: '',
    status: '',
    warehouse: '',
    category: ''
  });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const userRole = user?.role || ROLES.INVENTORY_MANAGER;
  const isStaff = userRole === ROLES.WAREHOUSE_STAFF;

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

      const summaryParams = {};
      if (filters.warehouse) summaryParams.warehouse = filters.warehouse;

      const ledgerParams = {};
      if (filters.warehouse) ledgerParams.warehouse = filters.warehouse;
      if (filters.docType) ledgerParams.operationType = filters.docType;

      const stockParams = {};
      if (filters.warehouse) stockParams.warehouse = filters.warehouse;
      if (filters.category) stockParams.category = filters.category;

      const [
        summaryData,
        movementsData,
        alertsData,
        stockLevelsData,
        whData,
        recsData,
        actionsData,
        forecastData,
        radarData,
        anomaliesData
      ] = await Promise.all([
        getDashboardSummary(summaryParams),
        getRecentMovements(15, ledgerParams),
        getLowStockAlerts(stockParams),
        getAllStockLevels(stockParams),
        getStockByWarehouse().catch(() => []),
        getSmartReorderRecommendations(stockParams).catch(() => []),
        intelligenceService.getDailyActions().catch(() => null),
        intelligenceService.getStockForecast().catch(() => []),
        intelligenceService.getRiskRadar().catch(() => null),
        intelligenceService.getAnomalies().catch(() => [])
      ]);

      setSummary(summaryData);
      setActivities(movementsData);
      setLowStockItems(alertsData);
      setAllStocks(stockLevelsData.stocks || []);
      setWarehouseStockData(Array.isArray(whData) ? whData : []);
      setReorderRecs(Array.isArray(recsData) ? recsData : []);

      // Set Intelligence Data
      setDailyActions(actionsData);
      setForecasts(forecastData || []);
      setRiskRadar(radarData);
      setAnomalies(anomaliesData || []);
    } catch (err) {
      console.error('Failed to load dashboard data from backend:', err);
      setError(err.message || 'Failed to load real-time inventory metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  // Transform Category Stock Chart Data
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

  // Transform Stock Movement Trends Data
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

  // Transform Stock by Warehouse Chart Data
  const warehouseChartData = useMemo(() => {
    if (warehouseStockData && warehouseStockData.length > 0) {
      return warehouseStockData.map((item) => ({
        name: item.name || 'Warehouse',
        value: Number(item.totalStock ?? item.value ?? 0),
        code: item.code || ''
      }));
    }
    const map = new Map();
    allStocks.forEach((item) => {
      const wName = item.warehouse?.name || 'Central Facility';
      map.set(wName, (map.get(wName) || 0) + (item.quantity || 0));
    });
    const res = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    return res.length > 0 ? res : [{ name: 'Main Facility', value: 250 }];
  }, [warehouseStockData, allStocks]);

  // Transform Incoming vs Outgoing Operations Data
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
    <div className="space-y-8">
      {/* Command Center Greeting & Hero Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold mb-3 backdrop-blur-md border border-white/15">
            <img src="/logo.png" alt="StockSense Logo" className="w-4 h-4 rounded-md object-cover shrink-0" />
            <span>StockSense Inventory Intelligence Platform &bull; {userRole}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {greeting}, {user?.name || 'Inventory Lead'} 👋
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Welcome to your intelligent decision center. StockSense doesn't just show inventory quantities—it forecasts stockouts, highlights risks, detects anomalies, and guides today's operational actions.
          </p>

          {/* Quick Intelligence Tool Launchers */}
          <div className="mt-4 flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFindStockOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              <Search className="w-3.5 h-3.5 text-indigo-300" />
              Where is My Stock?
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulatorProductId(null);
                setIsSimulatorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 transition-all border border-indigo-400/30"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-200" />
              Run What-If Simulation
            </button>
            <button
              type="button"
              onClick={() => navigate('/scanner')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold transition-all border border-white/10"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-300" />
              Scan Barcode
            </button>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isLoading}
            icon={RefreshCw}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Sync Intelligence
          </Button>
        </div>

        {/* Ambient background decoration with subtle flight bird emblem */}
        <div className="absolute -right-6 -bottom-6 w-44 h-44 opacity-10 pointer-events-none rounded-3xl overflow-hidden select-none">
          <img src="/logo.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 SECTION: TOP SIDE INVENTORY METRICS & VISUAL GRAPHS                     */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
            <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">
              Inventory Foundation & Live Analytics
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Top Overview
            </span>
          </div>
        </div>

        {/* 7 Standard KPIs */}
        <KPICards summary={summary} isLoading={isLoading} />

        {/* Real-time Filter Bar */}
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Visual Charts Grid (The 4 Graphs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StockByCategoryChart data={categoryChartData} isLoading={isLoading} />
          <StockMovementChart data={movementChartData} isLoading={isLoading} />
          <IncomingVsOutgoingChart data={incomingOutgoingData} isLoading={isLoading} />
          <StockByWarehouseChart data={warehouseChartData} isLoading={isLoading} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🧠 SECTION: STOCKSENSE INTELLIGENCE PLATFORM                              */}
      {/* ========================================================================= */}
      <section className="space-y-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
            <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">
              StockSense Intelligence & Actions
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Heuristics & Forecasting
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live Engine Active
            </span>
          </div>
        </div>

        {/* 1. Daily Action Center — "What Should I Do Today?" */}
        <DailyActionCenter
          data={dailyActions}
          onRefresh={fetchDashboardData}
          onOpenSimulator={() => {
            setSimulatorProductId(null);
            setIsSimulatorOpen(true);
          }}
          onOpenFindStock={() => setIsFindStockOpen(true)}
        />

        {/* 2. Stock Forecast & Risk Radar (2-Column Intelligence Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <StockForecastWidget
              forecasts={forecasts}
              onExplainStock={(prodId) => setExplainProductId(prodId)}
              onOpenSimulator={(prodId) => {
                setSimulatorProductId(prodId);
                setIsSimulatorOpen(true);
              }}
            />
          </div>

          <div className="lg:col-span-5">
            <RiskRadarWidget radarData={riskRadar} />
          </div>
        </div>

        {/* 3. Inventory Anomaly Detection Alerts */}
        <AnomalyAlertsWidget
          anomalies={anomalies}
          onRefresh={fetchDashboardData}
        />
      </section>

      {/* ========================================================================= */}
      {/* ⚙️ SECTION: REORDER HEALTH & RECENT ACTIVITY                              */}
      {/* ========================================================================= */}
      <section className="space-y-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-slate-800 rounded-full" />
            <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">
              Reorder Health & Operations Ledger
            </h2>
          </div>
        </div>

        {/* Smart Reorder & Circular Health Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <SmartReorderWidget
              recommendations={reorderRecs}
              onRefresh={fetchDashboardData}
            />
          </div>

          <div className="lg:col-span-5">
            <InventoryHealthWidget healthData={summary.inventoryHealth} />
          </div>
        </div>

        {/* Live Activity & Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivityTable activities={activities} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-1">
            <LowStockAlerts items={lowStockItems} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🛠️ MODAL TOOLS: SIMULATOR, LOCATION FINDER, EXPLAIN STOCK                 */}
      {/* ========================================================================= */}
      <WhatIfSimulatorModal
        isOpen={isSimulatorOpen}
        initialProductId={simulatorProductId}
        onClose={() => {
          setIsSimulatorOpen(false);
          setSimulatorProductId(null);
        }}
        onApplied={() => fetchDashboardData()}
      />

      <FindMyStockModal
        isOpen={isFindStockOpen}
        onClose={() => setIsFindStockOpen(false)}
      />

      <ExplainStockModal
        isOpen={!!explainProductId}
        productId={explainProductId}
        onClose={() => setExplainProductId(null)}
      />
    </div>
  );
};

export default DashboardPage;
