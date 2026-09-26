import React, { useState } from 'react';
import {
  TrendingDown,
  Calendar,
  Layers,
  HelpCircle,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { Badge, Button } from '../common';

export const StockForecastWidget = ({
  forecasts = [],
  onExplainStock,
  onOpenSimulator
}) => {
  const [filterRisk, setFilterRisk] = useState('ALL');

  const filtered = forecasts.filter((f) => {
    if (filterRisk === 'ALL') return true;
    if (filterRisk === 'CRITICAL_OOS') return f.riskClassification === 'CRITICAL' || f.riskClassification === 'OUT_OF_STOCK';
    return f.riskClassification === filterRisk;
  });

  const getRiskBadge = (item) => {
    switch (item.riskClassification) {
      case 'OUT_OF_STOCK':
        return <Badge variant="danger" size="sm">Out of Stock</Badge>;
      case 'CRITICAL':
        return <Badge variant="danger" size="sm">Critical (&lt;3d)</Badge>;
      case 'WARNING':
        return <Badge variant="warning" size="sm">Warning (3–7d)</Badge>;
      case 'MONITOR':
        return <Badge variant="info" size="sm">Monitor (7–30d)</Badge>;
      default:
        return <Badge variant="success" size="sm">Healthy (&gt;30d)</Badge>;
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Stock Forecast
              </h3>
              <p className="text-xs text-gray-500">
                Rule-based stockout projections based on historical 14-day daily usage velocity
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setFilterRisk('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterRisk === 'ALL' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            All ({forecasts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterRisk('CRITICAL_OOS')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterRisk === 'CRITICAL_OOS' ? 'bg-rose-50 text-rose-700 shadow-2xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            At Risk
          </button>
          <button
            type="button"
            onClick={() => setFilterRisk('HEALTHY')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterRisk === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700 shadow-2xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Healthy
          </button>
        </div>
      </div>

      {/* Forecast Items List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            No products match the selected risk category.
          </div>
        ) : (
          filtered.slice(0, 6).map((item) => {
            const formattedRunoutDate = new Date(item.estimatedRunoutDate).toLocaleDateString(
              undefined,
              { month: 'short', day: 'numeric' }
            );

            return (
              <div
                key={item.productId}
                className="p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {item.sku}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Category: {item.category} • Reorder Lvl: {item.reorderLevel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Estimated Runout
                      </span>
                      <span className="text-xs font-mono font-extrabold text-gray-900">
                        {item.currentStock === 0 ? (
                          <span className="text-rose-600 font-bold">Depleted</span>
                        ) : (
                          `${item.daysRemaining} days (${formattedRunoutDate})`
                        )}
                      </span>
                    </div>
                    {getRiskBadge(item)}
                  </div>
                </div>

                {/* Progress bar representing coverage days */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>
                      Stock: <strong className="text-gray-800">{item.currentStock}</strong> {item.unitOfMeasure}
                    </span>
                    <span>
                      Avg Usage: <strong className="text-gray-800">{item.averageDailyUsage}</strong>/day
                      {item.isEstimatedBaseline && (
                        <span className="text-gray-400 text-[10px] ml-1">(est.)</span>
                      )}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item)}`}
                      style={{ width: `${Math.max(5, item.coveragePercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onExplainStock && onExplainStock(item.productId)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <HelpCircle className="w-3 h-3" />
                    Explain Stock
                  </button>
                  <span className="text-gray-300">&bull;</span>
                  <button
                    type="button"
                    onClick={() => onOpenSimulator && onOpenSimulator(item.productId)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Layers className="w-3 h-3 text-indigo-500" />
                    Simulate
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StockForecastWidget;
