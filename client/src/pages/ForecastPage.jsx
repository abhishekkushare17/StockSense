import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  HelpCircle,
  Layers,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Button, Badge } from '../components/common';
import { getStockForecast } from '../services/intelligenceService';
import { ExplainStockModal, WhatIfSimulatorModal } from '../components/intelligence';

export const ForecastPage = () => {
  const [forecasts, setForecasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');

  // Modals state
  const [explainProductId, setExplainProductId] = useState(null);
  const [simulatorProductId, setSimulatorProductId] = useState(null);

  const fetchForecasts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getStockForecast({
        search: search.trim() || undefined,
        risk: selectedRisk || undefined
      });
      setForecasts(data);
    } catch (err) {
      setError(err.message || 'Failed to generate stock forecasts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, [selectedRisk]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchForecasts();
  };

  const getRiskBadge = (item) => {
    switch (item.riskClassification) {
      case 'OUT_OF_STOCK':
        return <Badge variant="danger">Out of Stock</Badge>;
      case 'CRITICAL':
        return <Badge variant="danger">Critical (&lt;3d)</Badge>;
      case 'WARNING':
        return <Badge variant="warning">Warning (3–7d)</Badge>;
      case 'MONITOR':
        return <Badge variant="info">Monitor (7–30d)</Badge>;
      default:
        return <Badge variant="success">Healthy (&gt;30d)</Badge>;
    }
  };

  const getProgressColor = (item) => {
    switch (item.riskClassification) {
      case 'OUT_OF_STOCK':
      case 'CRITICAL':
        return 'bg-rose-500';
      case 'WARNING':
        return 'bg-amber-500';
      case 'MONITOR':
        return 'bg-blue-500';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Stock Forecast Intelligence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Rule-based projection of stockout dates and runout coverage calculated from historical 14-day ledger usage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchForecasts}
            isLoading={isLoading}
          >
            Refresh Forecasts
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product by name or SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium text-gray-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical (&lt;3 days)</option>
            <option value="WARNING">Warning (3–7 days)</option>
            <option value="MONITOR">Monitor (7–30 days)</option>
            <option value="HEALTHY">Healthy (&gt;30 days)</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Forecast Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Avg Daily Usage</th>
                <th className="py-3 px-4">Estimated Runout</th>
                <th className="py-3 px-4 min-w-[140px]">Coverage Buffer</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Calculating historical usage velocities...
                  </td>
                </tr>
              ) : forecasts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                forecasts.map((item) => {
                  const formattedDate = new Date(item.estimatedRunoutDate).toLocaleDateString(
                    undefined,
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  );

                  return (
                    <tr key={item.productId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="font-mono text-[11px] text-gray-400">{item.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{item.category}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900">
                          {item.currentStock} {item.unitOfMeasure}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Reorder: {item.reorderLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-800">
                          {item.averageDailyUsage}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">
                          {item.unitOfMeasure}/day
                        </span>
                        {item.isEstimatedBaseline && (
                          <span className="text-[9px] text-gray-400 block">(baseline est.)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {item.currentStock === 0 ? (
                          <span className="text-rose-600 font-bold">Depleted</span>
                        ) : (
                          <div>
                            <span className="font-bold text-gray-900">{item.daysRemaining} days</span>
                            <span className="text-[10px] text-gray-400 block">{formattedDate}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-1">
                          <div
                            className={`h-full rounded-full ${getProgressColor(item)}`}
                            style={{ width: `${Math.max(5, item.coveragePercentage)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {item.daysRemaining >= 30 ? '30+ days safe' : `${item.daysRemaining}d coverage`}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getRiskBadge(item)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={HelpCircle}
                            onClick={() => setExplainProductId(item.productId)}
                          >
                            Explain
                          </Button>
                          <Button
                            variant="primary"
                            size="xs"
                            icon={Layers}
                            onClick={() => setSimulatorProductId(item.productId)}
                          >
                            Simulate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExplainStockModal
        isOpen={!!explainProductId}
        productId={explainProductId}
        onClose={() => setExplainProductId(null)}
      />

      <WhatIfSimulatorModal
        isOpen={!!simulatorProductId}
        initialProductId={simulatorProductId}
        onClose={() => setSimulatorProductId(null)}
        onApplied={() => fetchForecasts()}
      />
    </div>
  );
};

export default ForecastPage;
