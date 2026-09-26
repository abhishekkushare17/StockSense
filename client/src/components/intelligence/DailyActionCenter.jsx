import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  AlertTriangle,
  Truck,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button, Badge } from '../common';

export const DailyActionCenter = ({ data, onRefresh, onOpenSimulator, onOpenFindStock }) => {
  const navigate = useNavigate();

  if (!data) return null;

  const { greeting, totalActionsCount, summary = {}, actions = [] } = data;

  const handleActionClick = (action) => {
    if (action.targetUrl) {
      navigate(action.targetUrl);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Daily Action Center
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {greeting}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              You have <span className="font-bold text-white underline decoration-indigo-400 decoration-2">{totalActionsCount} inventory actions</span> requiring attention today.
            </p>
          </div>

          {/* Quick Access Utility Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenFindStock}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/10"
            >
              <Search className="w-3.5 h-3.5 text-indigo-300" />
              Find My Stock
            </button>
            <button
              type="button"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-900/50 transition-all border border-indigo-400/30"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-200" />
              What-If Simulator
            </button>
          </div>
        </div>

        {/* 4 Summary Indicator Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_#F43F5E]" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-none">Out of Stock</span>
              <span className="text-sm font-bold text-white">{summary.outOfStockCount || 0} products</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_#F59E0B]" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-none">Need Reorder</span>
              <span className="text-sm font-bold text-white">{summary.reorderNeededCount || 0} products</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#3B82F6]" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-none">Pending Delivery</span>
              <span className="text-sm font-bold text-white">{summary.pendingDeliveriesCount || 0} orders</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_#10B981]" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-none">Transfers Scheduled</span>
              <span className="text-sm font-bold text-white">{summary.scheduledTransfersCount || 0} transfers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Container */}
      <div className="p-5 sm:p-6 bg-slate-50/60">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Recommended Action Items
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Prioritized by operational impact
          </span>
        </div>

        {actions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-800">All Operations Clear</h4>
            <p className="text-xs text-gray-500 mt-1">No urgent actions required right now. Inventory buffer is healthy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {actions.map((item) => {
              const isRed = item.badgeColor === 'red';
              const isOrange = item.badgeColor === 'orange';
              const isBlue = item.badgeColor === 'blue';
              const isGreen = item.badgeColor === 'green';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between bg-white ${
                    isRed
                      ? 'border-rose-200/80 hover:border-rose-300 hover:shadow-xs'
                      : isOrange
                      ? 'border-amber-200/80 hover:border-amber-300 hover:shadow-xs'
                      : isBlue
                      ? 'border-blue-200/80 hover:border-blue-300 hover:shadow-xs'
                      : 'border-emerald-200/80 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Header line with badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isRed
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isOrange
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isBlue
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                      {item.suggestedQty && (
                        <span className="text-[11px] font-mono font-semibold text-gray-500">
                          Rec: +{item.suggestedQty}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-gray-900 tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {item.subtitle}
                    </p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-400">
                      Action required
                    </span>
                    <Button
                      variant={isRed ? 'danger' : isOrange ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleActionClick(item)}
                      icon={ArrowRight}
                    >
                      {item.actionLabel}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyActionCenter;
