import React, { useState } from 'react';
import {
  Radar,
  AlertTriangle,
  Truck,
  ArrowRightLeft,
  CheckCircle2,
  ChevronRight,
  X,
  Package,
  ArrowRight
} from 'lucide-react';
import { Badge, Button } from '../common';

export const RiskRadarWidget = ({ radarData }) => {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null);

  if (!radarData || !radarData.categories) return null;

  const { categories, totalIssuesCount = 0 } = radarData;
  const { stockRisk, deliveryRisk, transferRisk, lowRisk } = categories;

  const selectedCategory = selectedCategoryKey ? categories[selectedCategoryKey] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              Inventory Risk Radar
            </h3>
            <p className="text-xs text-gray-500">
              Live operational health analysis across stock, fulfillment, and transport
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
          {totalIssuesCount} Active Issues
        </span>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Quadrant 1: Stock Risk */}
        <button
          type="button"
          onClick={() => setSelectedCategoryKey('stockRisk')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedCategoryKey === 'stockRisk'
              ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200'
              : 'border-rose-100 bg-rose-50/20 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <span className="text-2xl font-black text-rose-700">
              {stockRisk?.count || 0}
            </span>
          </div>
          <h4 className="text-xs font-bold text-gray-900">Stock Risk</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Depleted, critical runout, or below safety buffer
          </p>
          <span className="text-[10px] font-semibold text-rose-600 mt-2 block">
            Click to inspect {stockRisk?.count || 0} items &rarr;
          </span>
        </button>

        {/* Quadrant 2: Delivery Risk */}
        <button
          type="button"
          onClick={() => setSelectedCategoryKey('deliveryRisk')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedCategoryKey === 'deliveryRisk'
              ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-200'
              : 'border-purple-100 bg-purple-50/20 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </span>
            <span className="text-2xl font-black text-purple-700">
              {deliveryRisk?.count || 0}
            </span>
          </div>
          <h4 className="text-xs font-bold text-gray-900">Delivery Risk</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Shortage risks or waiting dispatch validation
          </p>
          <span className="text-[10px] font-semibold text-purple-600 mt-2 block">
            Click to inspect {deliveryRisk?.count || 0} orders &rarr;
          </span>
        </button>

        {/* Quadrant 3: Transfer Risk */}
        <button
          type="button"
          onClick={() => setSelectedCategoryKey('transferRisk')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedCategoryKey === 'transferRisk'
              ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-200'
              : 'border-amber-100 bg-amber-50/20 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </span>
            <span className="text-2xl font-black text-amber-700">
              {transferRisk?.count || 0}
            </span>
          </div>
          <h4 className="text-xs font-bold text-gray-900">Transfer Risk</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            In-transit delays or facility imbalances
          </p>
          <span className="text-[10px] font-semibold text-amber-600 mt-2 block">
            Click to inspect {transferRisk?.count || 0} transfers &rarr;
          </span>
        </button>

        {/* Quadrant 4: Low Risk */}
        <button
          type="button"
          onClick={() => setSelectedCategoryKey('lowRisk')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedCategoryKey === 'lowRisk'
              ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200'
              : 'border-emerald-100 bg-emerald-50/20 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {lowRisk?.count || 0}
            </span>
          </div>
          <h4 className="text-xs font-bold text-gray-900">Low Risk</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Balanced coverage &gt; 30 days buffer
          </p>
          <span className="text-[10px] font-semibold text-emerald-600 mt-2 block">
            Click to inspect {lowRisk?.count || 0} items &rarr;
          </span>
        </button>
      </div>

      {/* Drill-down Drawer / List for Selected Category */}
      {selectedCategory && (
        <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-slate-50/80 animate-fadeIn space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                {selectedCategory.title} Inspection ({selectedCategory.count} items)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategoryKey(null)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Close drill-down"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {selectedCategory.items.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No records in this quadrant.</p>
            ) : (
              selectedCategory.items.map((item, idx) => {
                // If it's a Stock item
                if (item.productId) {
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-gray-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          <span>{item.name}</span>
                          <span className="font-mono text-[10px] text-gray-400">({item.sku})</span>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          Stock: {item.currentStock} {item.unitOfMeasure} • Reorder: {item.reorderLevel} • Runout: {item.daysRemaining} days
                        </span>
                      </div>
                      <Badge
                        variant={item.riskClassification === 'OUT_OF_STOCK' || item.riskClassification === 'CRITICAL' ? 'danger' : item.riskClassification === 'WARNING' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {item.riskLabel}
                      </Badge>
                    </div>
                  );
                }

                // If it's a Delivery item
                if (item.deliveryNumber) {
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-gray-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-900">
                          Order #{item.deliveryNumber} — {item.customerName}
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {item.reason} ({item.warehouse})
                        </span>
                      </div>
                      <Badge variant={item.hasShortageRisk ? 'danger' : 'info'} size="sm">
                        {item.status}
                      </Badge>
                    </div>
                  );
                }

                // If it's a Transfer item
                if (item.transferNumber) {
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-gray-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-900">
                          Transfer #{item.transferNumber}: {item.fromWarehouse} &rarr; {item.toWarehouse}
                        </div>
                        <span className="text-[11px] text-gray-500">{item.reason}</span>
                      </div>
                      <Badge variant={item.isDelayed ? 'danger' : 'warning'} size="sm">
                        {item.status}
                      </Badge>
                    </div>
                  );
                }

                return null;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskRadarWidget;
