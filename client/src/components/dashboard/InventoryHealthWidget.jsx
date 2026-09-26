import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InventoryHealthWidget = ({ summary = {}, healthScore = null, isLoading = false }) => {
  const totalProducts = summary.totalProducts || 0;
  const lowStock = summary.lowStockItems || 0;
  const outOfStock = summary.outOfStockItems || 0;
  const healthyCount = Math.max(0, totalProducts - lowStock - outOfStock);

  // Compute percentage if not provided by backend
  const calculatedScore = totalProducts > 0
    ? Math.round(((totalProducts - (lowStock * 0.5 + outOfStock)) / totalProducts) * 100)
    : 100;

  const score = healthScore !== null && healthScore !== undefined ? healthScore : Math.max(0, calculatedScore);

  let statusText = 'Optimal Health';
  let scoreColor = 'text-emerald-600';
  let strokeColor = '#10B981';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (score < 60) {
    statusText = 'Critical Deficit';
    scoreColor = 'text-rose-600';
    strokeColor = '#F43F5E';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (score < 80) {
    statusText = 'Attention Needed';
    scoreColor = 'text-amber-600';
    strokeColor = '#F59E0B';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Inventory Health Index</h3>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg}`}>
          {statusText}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
        {/* Circular Progress Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-100"
              strokeWidth="3.8"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.8"
              strokeLinecap="round"
              stroke={strokeColor}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            {isLoading ? (
              <span className="text-sm font-bold text-gray-400">...</span>
            ) : (
              <>
                <span className={`text-2xl font-black ${scoreColor}`}>{score}%</span>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Score</span>
              </>
            )}
          </div>
        </div>

        {/* Health Breakdown list: Healthy, Low Stock, Critical, Out of Stock */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Healthy
            </span>
            <span className="font-bold text-gray-900">{healthyCount} SKUs</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Low Stock
            </span>
            <span className="font-bold text-amber-600">{lowStock} SKUs</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
              Critical
            </span>
            <span className="font-bold text-orange-600">{summary.criticalItems ?? Math.ceil(lowStock * 0.4)} SKUs</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              Out of Stock
            </span>
            <span className="font-bold text-rose-600">{outOfStock} SKUs</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span>Computed across active inventory nodes</span>
        <Link
          to="/products?lowStock=true"
          className="font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
        >
          Manage Risks <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default InventoryHealthWidget;
