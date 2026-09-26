import React, { useState, useEffect } from 'react';
import {
  Radar,
  AlertTriangle,
  Truck,
  ArrowRightLeft,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Package,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Button, Badge } from '../components/common';
import { getRiskRadar } from '../services/intelligenceService';
import { ExplainStockModal, WhatIfSimulatorModal } from '../components/intelligence';

export const RiskRadarPage = () => {
  const [radarData, setRadarData] = useState(null);
  const [activeTab, setActiveTab] = useState('stockRisk');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [explainProductId, setExplainProductId] = useState(null);
  const [simulatorProductId, setSimulatorProductId] = useState(null);

  const fetchRadar = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getRiskRadar();
      setRadarData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch risk radar assessment');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar();
  }, []);

  const categories = radarData?.categories || {};
  const currentCategory = categories[activeTab] || { items: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Radar className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Inventory Risk Radar
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Multidimensional risk assessment scanning product depletion, outbound order risks, and transfer delays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchRadar}
            isLoading={isLoading}
          >
            Refresh Radar
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* 4 Quadrants Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => setActiveTab('stockRisk')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'stockRisk'
              ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200'
              : 'border-gray-200 bg-white hover:border-rose-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-2xl font-black text-rose-700">
              {categories.stockRisk?.count || 0}
            </span>
          </div>
          <h3 className="text-xs font-bold text-gray-900">Stock Risk</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Depleted or critical stockout threat
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deliveryRisk')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'deliveryRisk'
              ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-200'
              : 'border-gray-200 bg-white hover:border-purple-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </span>
            <span className="text-2xl font-black text-purple-700">
              {categories.deliveryRisk?.count || 0}
            </span>
          </div>
          <h3 className="text-xs font-bold text-gray-900">Delivery Risk</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Shortages or fulfillment bottlenecks
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transferRisk')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'transferRisk'
              ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-200'
              : 'border-gray-200 bg-white hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
            <span className="text-2xl font-black text-amber-700">
              {categories.transferRisk?.count || 0}
            </span>
          </div>
          <h3 className="text-xs font-bold text-gray-900">Transfer Risk</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Transit delays or unbalanced distribution
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lowRisk')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'lowRisk'
              ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200'
              : 'border-gray-200 bg-white hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {categories.lowRisk?.count || 0}
            </span>
          </div>
          <h3 className="text-xs font-bold text-gray-900">Low Risk</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Healthy items (&gt;30d safe coverage)
          </p>
        </button>
      </div>

      {/* Active Category Detail Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            {categories[activeTab]?.title || 'Category'} Detail Inspection ({currentCategory.items?.length || 0} records)
          </h2>
          <span className="text-xs text-gray-400">
            Real-time evaluation
          </span>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'stockRisk' || activeTab === 'lowRisk' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Runout Forecast</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {currentCategory.items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400">
                      No records in this risk category.
                    </td>
                  </tr>
                ) : (
                  currentCategory.items.map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="font-mono text-[11px] text-gray-400">{item.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{item.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {item.currentStock} {item.unitOfMeasure}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">{item.reorderLevel}</td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {item.currentStock === 0 ? (
                          <span className="text-rose-600 font-bold">Depleted</span>
                        ) : (
                          `${item.daysRemaining} days`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={item.riskClassification === 'OUT_OF_STOCK' || item.riskClassification === 'CRITICAL' ? 'danger' : item.riskClassification === 'WARNING' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {item.riskLabel}
                        </Badge>
                      </td>
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
                  ))
                )}
              </tbody>
            </table>
          ) : activeTab === 'deliveryRisk' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Delivery Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Risk Evaluation</th>
                  <th className="py-3 px-4">Shortage Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {currentCategory.items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      No delivery risk issues found.
                    </td>
                  </tr>
                ) : (
                  currentCategory.items.map((del) => (
                    <tr key={del.deliveryId} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        #{del.deliveryNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{del.customerName}</td>
                      <td className="py-3 px-4 text-gray-500">{del.warehouse}</td>
                      <td className="py-3 px-4">
                        <Badge variant="info" size="sm">{del.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{del.reason}</td>
                      <td className="py-3 px-4">
                        {del.hasShortageRisk ? (
                          <Badge variant="danger" size="sm">Stock Shortage Detected</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">Waiting Dispatch</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Transfer Number</th>
                  <th className="py-3 px-4">Origin Facility</th>
                  <th className="py-3 px-4">Destination Facility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Elapsed Hours</th>
                  <th className="py-3 px-4">Risk Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {currentCategory.items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      No transfer risk issues found.
                    </td>
                  </tr>
                ) : (
                  currentCategory.items.map((trf) => (
                    <tr key={trf.transferId} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">
                        #{trf.transferNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{trf.fromWarehouse}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{trf.toWarehouse}</td>
                      <td className="py-3 px-4">
                        <Badge variant="warning" size="sm">{trf.status}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">{trf.hoursElapsed}h elapsed</td>
                      <td className="py-3 px-4 text-gray-600">{trf.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
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
        onApplied={() => fetchRadar()}
      />
    </div>
  );
};

export default RiskRadarPage;
