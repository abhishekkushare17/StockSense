import React, { useState, useEffect } from 'react';
import {
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Warehouse as WarehouseIcon,
  Package,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button, Badge } from '../components/common';
import { simulateInventory, applySimulation } from '../services/intelligenceService';
import { productService } from '../services/productService';
import { warehouseService } from '../services/warehouseService';

export const SimulatorPage = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  // Operational simulation inputs
  const [receiveQty, setReceiveQty] = useState(0);
  const [deliverQty, setDeliverQty] = useState(0);
  const [transferQty, setTransferQty] = useState(0);
  const [transferDirection, setTransferDirection] = useState('out');
  const [adjustmentQty, setAdjustmentQty] = useState(0);

  // Simulation Results
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmApply, setShowConfirmApply] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, whRes] = await Promise.all([
          productService.getProducts({ limit: 50 }),
          warehouseService.getAllWarehouses()
        ]);
        const pList = prodRes.products || [];
        const wList = whRes || [];
        setProducts(pList);
        setWarehouses(wList);

        if (pList.length > 0) setSelectedProductId(pList[0]._id);
        if (wList.length > 0) setSelectedWarehouseId(wList[0]._id);
      } catch (err) {
        setError('Failed to load products or facilities for simulation.');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      runSimulation();
    }
  }, [
    selectedProductId,
    selectedWarehouseId,
    receiveQty,
    deliverQty,
    transferQty,
    transferDirection,
    adjustmentQty
  ]);

  const runSimulation = async () => {
    if (!selectedProductId) return;

    try {
      setIsSimulating(true);
      setError('');
      const result = await simulateInventory({
        productId: selectedProductId,
        warehouseId: selectedWarehouseId || undefined,
        receiveQty: Number(receiveQty) || 0,
        deliverQty: Number(deliverQty) || 0,
        transferQty: Number(transferQty) || 0,
        transferDirection,
        adjustmentQty: Number(adjustmentQty) || 0
      });
      setSimResult(result);
    } catch (err) {
      setError(err.message || 'Simulation error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setReceiveQty(0);
    setDeliverQty(0);
    setTransferQty(0);
    setTransferDirection('out');
    setAdjustmentQty(0);
    setError('');
    setSuccessMessage('');
    setShowConfirmApply(false);
  };

  const handleApplyToInventory = async () => {
    try {
      setIsApplying(true);
      setError('');
      await applySimulation({
        productId: selectedProductId,
        warehouseId: selectedWarehouseId,
        receiveQty: Number(receiveQty) || 0,
        deliverQty: Number(deliverQty) || 0,
        transferQty: Number(transferQty) || 0,
        transferDirection,
        adjustmentQty: Number(adjustmentQty) || 0,
        notes: 'Applied from What-If Simulator Workspace'
      });

      setSuccessMessage('Simulation committed! Physical inventory balances and Stock Ledger updated.');
      setShowConfirmApply(false);
      handleReset();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to apply simulation');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              What-If Inventory Simulator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Test inventory flow hypotheses with real-time coverage calculations before committing changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={handleReset}>
            Reset Inputs
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selector & Variable Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-100">
              1. Select Inventory Target
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-medium text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                Facility / Warehouse
              </label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-medium text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Operational Inputs */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-100">
              2. Simulated Transaction Quantities
            </h3>

            {/* Inbound Receipt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700">+ Inbound Receipt (Qty)</span>
                <span className="font-mono text-gray-400">+{receiveQty} units</span>
              </div>
              <input
                type="number"
                min="0"
                value={receiveQty}
                onChange={(e) => setReceiveQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs bg-emerald-50/30 border border-emerald-200 rounded-xl px-3 py-2 font-mono font-bold text-emerald-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Outbound Delivery */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-700">- Outbound Delivery (Qty)</span>
                <span className="font-mono text-gray-400">-{deliverQty} units</span>
              </div>
              <input
                type="number"
                min="0"
                value={deliverQty}
                onChange={(e) => setDeliverQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs bg-rose-50/30 border border-rose-200 rounded-xl px-3 py-2 font-mono font-bold text-rose-900 focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Internal Transfer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-700">Internal Transfer (Qty)</span>
                <select
                  value={transferDirection}
                  onChange={(e) => setTransferDirection(e.target.value)}
                  className="text-[10px] bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 font-bold text-amber-800"
                >
                  <option value="out">Outbound (-)</option>
                  <option value="in">Inbound (+)</option>
                </select>
              </div>
              <input
                type="number"
                min="0"
                value={transferQty}
                onChange={(e) => setTransferQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs bg-amber-50/30 border border-amber-200 rounded-xl px-3 py-2 font-mono font-bold text-amber-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Stock Adjustment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-700">&plusmn; Stock Adjustment (Count)</span>
                <span className="font-mono text-gray-400">{adjustmentQty > 0 ? `+${adjustmentQty}` : adjustmentQty}</span>
              </div>
              <input
                type="number"
                value={adjustmentQty}
                onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                className="w-full text-xs bg-indigo-50/30 border border-indigo-200 rounded-xl px-3 py-2 font-mono font-bold text-indigo-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Results & Apply Action */}
        <div className="lg:col-span-7 space-y-5">
          {simResult && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    Simulated Projection Outcome
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {simResult.product.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Facility: {simResult.warehouse?.name || 'All Warehouses'} &bull; SKU: {simResult.product.sku}
                  </p>
                </div>

                <Badge
                  variant={
                    simResult.projected.riskClassification === 'HEALTHY'
                      ? 'success'
                      : simResult.projected.riskClassification === 'MONITOR'
                      ? 'info'
                      : simResult.projected.riskClassification === 'WARNING'
                      ? 'warning'
                      : 'danger'
                  }
                  size="md"
                >
                  {simResult.projected.riskLabel}
                </Badge>
              </div>

              {/* 4 Outcome Cards */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline Stock</span>
                  <span className="text-2xl font-mono font-extrabold text-slate-200">
                    {simResult.current.warehouseStock}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{simResult.product.unitOfMeasure}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Simulated Net Delta</span>
                  <span className={`text-2xl font-mono font-extrabold ${
                    simResult.projected.netChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {simResult.projected.netChange >= 0 ? `+${simResult.projected.netChange}` : simResult.projected.netChange}
                  </span>
                  <span className="text-[10px] text-slate-400 block">units applied</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 block">Projected Stock</span>
                  <span className={`text-3xl font-mono font-black ${
                    simResult.projected.warehouseStock < 0 ? 'text-rose-400' : 'text-white'
                  }`}>
                    {simResult.projected.warehouseStock}
                  </span>
                  <span className="text-[10px] text-indigo-200 block">{simResult.product.unitOfMeasure} final</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Projected Coverage</span>
                  <span className="text-2xl font-mono font-extrabold text-slate-200">
                    {simResult.projected.coverageDays} days
                  </span>
                  <span className="text-[10px] text-slate-400 block">estimated buffer</span>
                </div>
              </div>

              {/* Confirmation Panel when applying */}
              {showConfirmApply ? (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Commit Simulated Transactions into Real Database
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    This will create verified inbound/outbound records, adjust warehouse physical count, and append audit events to the Stock Ledger.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isApplying}
                      onClick={handleApplyToInventory}
                    >
                      Confirm & Commit to Ledger
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowConfirmApply(false)}
                      className="text-slate-300 bg-white/10 hover:bg-white/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-between border-t border-white/10">
                  <span className="text-xs text-slate-400">
                    Ready to execute changes?
                  </span>
                  <Button
                    variant="primary"
                    size="md"
                    icon={CheckCircle2}
                    disabled={
                      simResult.projected.warehouseStock < 0 ||
                      (receiveQty === 0 && deliverQty === 0 && transferQty === 0 && adjustmentQty === 0)
                    }
                    onClick={() => setShowConfirmApply(true)}
                  >
                    Apply to Real Inventory
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;
