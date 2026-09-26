import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Calendar,
  Layers,
  Activity,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button, Badge } from '../components/common';
import { getAllStockLevels, getRecentMovements, getStockByWarehouse } from '../services/dashboardService';
import { warehouseService } from '../services/warehouseService';

const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'];

export const AnalyticsPage = () => {
  const [stocks, setStocks] = useState([]);
  const [movements, setMovements] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedWarehouse, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const params = selectedWarehouse ? { warehouse: selectedWarehouse } : {};

      const [stockRes, movRes, whRes, allWh] = await Promise.all([
        getAllStockLevels(params),
        getRecentMovements(50, params),
        getStockByWarehouse().catch(() => []),
        warehouseService.getWarehouses().catch(() => [])
      ]);

      setStocks(stockRes.stocks || []);
      setMovements(movRes || []);
      setWarehouseData(Array.isArray(whRes) ? whRes : []);
      setWarehouses(Array.isArray(allWh) ? allWh : []);
    } catch (err) {
      console.error('Failed to load analytics metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute Category Performance metrics
  const categoryStats = useMemo(() => {
    const map = new Map();
    stocks.forEach((item) => {
      const cat = item.product?.category?.name || 'Uncategorized';
      const qty = item.quantity || 0;
      const reorder = item.product?.reorderLevel || 10;

      if (!map.has(cat)) {
        map.set(cat, { name: cat, totalStock: 0, itemsCount: 0, lowStockCount: 0 });
      }
      const entry = map.get(cat);
      entry.totalStock += qty;
      entry.itemsCount += 1;
      if (qty <= reorder) {
        entry.lowStockCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalStock - a.totalStock);
  }, [stocks]);

  // Compute Fast vs Slow moving items based on movement frequency in the ledger
  const movementVelocity = useMemo(() => {
    const productFrequency = new Map();
    movements.forEach((m) => {
      const name = m.product?.name || 'Item';
      const qty = Math.abs(m.quantityChange || m.quantityChanged || 1);
      productFrequency.set(name, (productFrequency.get(name) || 0) + qty);
    });

    return Array.from(productFrequency.entries())
      .map(([name, velocity]) => ({ name, velocity }))
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 6);
  }, [movements]);

  // Total summary figures
  const totalStockUnits = useMemo(() => stocks.reduce((sum, s) => sum + (s.quantity || 0), 0), [stocks]);
  const averageStockPerSKU = stocks.length > 0 ? Math.round(totalStockUnits / stocks.length) : 0;
  const healthyStockPercent = stocks.length > 0
    ? Math.round(
        (stocks.filter((s) => (s.quantity || 0) > (s.product?.reorderLevel || 10)).length / stocks.length) *
          100
      )
    : 100;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            Inventory Analytics & Forecasting
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Evaluate warehouse turnover, category stock concentration, and movement dynamics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
          >
            <option value="">All Facilities</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Unit Inventory</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {totalStockUnits.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Units distributed across facilities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Average Units / SKU</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {averageStockPerSKU}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Mean inventory volume</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Inventory Health Index</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {healthyStockPercent}%
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Above minimum safety buffer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Recorded Operations</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">
            {movements.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Audited ledger transactions</p>
        </div>
      </div>

      {/* Analytics Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Concentration Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Stock Concentration by Category</h3>
              <p className="text-xs text-gray-400 mt-0.5">Total units segmented by product type</p>
            </div>
            <Badge variant="indigo" size="sm">Distribution</Badge>
          </div>

          <div className="h-72 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">Loading chart...</div>
            ) : categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(val) => [`${val.toLocaleString()} units`, 'Stock Units']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
                  />
                  <Bar dataKey="totalStock" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No category stock data available</div>
            )}
          </div>
        </div>

        {/* Movement Velocity Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Highest Movement Velocity Items</h3>
              <p className="text-xs text-gray-400 mt-0.5">Top SKUs by throughput in stock ledger</p>
            </div>
            <Badge variant="purple" size="sm">Velocity</Badge>
          </div>

          <div className="h-72 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">Loading chart...</div>
            ) : movementVelocity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={movementVelocity}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#4B5563' }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} units moved`, 'Turnover Volume']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
                  />
                  <Bar dataKey="velocity" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No movement history detected</div>
            )}
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Category Efficiency & Replenishment Matrix</h3>
            <p className="text-xs text-gray-500 mt-0.5">Inventory breakdown and risk distribution</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total SKUs</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Deficit Risks</th>
                <th className="py-3 px-4">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {categoryStats.map((cat, idx) => {
                const isAtRisk = cat.lowStockCount > 0;
                return (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{cat.name}</td>
                    <td className="py-3 px-4 text-gray-600">{cat.itemsCount} SKUs</td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                      {cat.totalStock.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {isAtRisk ? (
                        <span className="text-amber-600 font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {cat.lowStockCount} below reorder
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={isAtRisk ? 'warning' : 'success'} size="sm">
                        {isAtRisk ? 'Replenish' : 'Balanced'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
