import React, { useState, useEffect } from 'react';
import {
  Layers,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Warehouse as WarehouseIcon,
  Package,
  Calendar
} from 'lucide-react';
import { Button, Badge } from '../common';
import { simulateInventory, applySimulation } from '../../services/intelligenceService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';

export const WhatIfSimulatorModal = ({
  isOpen,
  onClose,
  initialProductId = null,
  onApplied
}) => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || '');
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

  // Load products and warehouses on open
  useEffect(() => {
    if (!isOpen) return;

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

        if (!selectedProductId && pList.length > 0) {
          setSelectedProductId(initialProductId || pList[0]._id);
        }
        if (!selectedWarehouseId && wList.length > 0) {
          setSelectedWarehouseId(wList[0]._id);
        }
      } catch (err) {
        setError('Failed to load products or warehouses for simulation.');
      }
    };

    loadData();
  }, [isOpen, initialProductId]);

  // Run simulation whenever inputs change
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
      const res = await applySimulation({
        productId: selectedProductId,
        warehouseId: selectedWarehouseId,
        receiveQty: Number(receiveQty) || 0,
        deliverQty: Number(deliverQty) || 0,
        transferQty: Number(transferQty) || 0,
        transferDirection,
        adjustmentQty: Number(adjustmentQty) || 0,
        notes: 'Applied from What-If Inventory Simulator'
      });

      setSuccessMessage('Simulation successfully executed and applied to real inventory ledger.');
      setShowConfirmApply(false);
      handleReset();
      if (onApplied) onApplied(res);
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      setError(err.message || 'Failed to apply simulation');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                What-If Inventory Simulator
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Zero Risk Sandboxing
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Simulate potential receipts, deliveries, and adjustments before affecting real stock.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Product & Warehouse Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Target Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Facility / Warehouse
              </label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Operational Input Sliders / Numbers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
              <span>Simulated Movement Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Receive */}
              <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-1.5">
                <label className="text-xs font-bold text-emerald-800 block">
                  + Inbound Receipt
                </label>
                <input
                  type="number"
                  min="0"
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                />
                <span className="text-[10px] text-emerald-600 block">Receiving replenishment</span>
              </div>

              {/* Deliver */}
              <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/20 space-y-1.5">
                <label className="text-xs font-bold text-rose-800 block">
                  - Outbound Delivery
                </label>
                <input
                  type="number"
                  min="0"
                  value={deliverQty}
                  onChange={(e) => setDeliverQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-gray-900 focus:ring-2 focus:ring-rose-500"
                  placeholder="0"
                />
                <span className="text-[10px] text-rose-600 block">Customer order dispatch</span>
              </div>

              {/* Transfer */}
              <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-800 block">
                    Transfer
                  </label>
                  <select
                    value={transferDirection}
                    onChange={(e) => setTransferDirection(e.target.value)}
                    className="text-[10px] bg-white border border-amber-200 rounded px-1.5 py-0.5 font-semibold text-gray-700"
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
                  className="w-full text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-gray-900 focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
                <span className="text-[10px] text-amber-600 block">Inter-hub distribution</span>
              </div>

              {/* Adjustment */}
              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/20 space-y-1.5">
                <label className="text-xs font-bold text-indigo-800 block">
                  &plusmn; Stock Adjustment
                </label>
                <input
                  type="number"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                  className="w-full text-xs bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
                <span className="text-[10px] text-indigo-600 block">Audit correction</span>
              </div>
            </div>
          </div>

          {/* Simulation Output Dashboard */}
          {simResult && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    Simulated Projection Result
                  </span>
                  <h4 className="text-base font-extrabold text-white">
                    {simResult.product.name} ({simResult.product.sku})
                  </h4>
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stock</span>
                  <span className="text-xl font-mono font-bold text-slate-200">
                    {simResult.current.warehouseStock}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{simResult.product.unitOfMeasure}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Change</span>
                  <span className={`text-xl font-mono font-extrabold ${
                    simResult.projected.netChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {simResult.projected.netChange >= 0 ? `+${simResult.projected.netChange}` : simResult.projected.netChange}
                  </span>
                  <span className="text-[10px] text-slate-400 block">units applied</span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 block">Projected Stock</span>
                  <span className={`text-2xl font-mono font-black ${
                    simResult.projected.warehouseStock < 0 ? 'text-rose-400' : 'text-white'
                  }`}>
                    {simResult.projected.warehouseStock}
                  </span>
                  <span className="text-[10px] text-indigo-200 block">{simResult.product.unitOfMeasure}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Coverage</span>
                  <span className="text-xl font-mono font-bold text-slate-200">
                    {simResult.projected.coverageDays} days
                  </span>
                  <span className="text-[10px] text-slate-400 block">runout buffer</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Warning if Applying */}
          {showConfirmApply && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Confirm Real Inventory Transaction
              </div>
              <p className="text-xs text-amber-800">
                You are about to commit these simulated numbers into real database transactions. This will update physical stock and append permanent entries to the Stock Ledger.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isApplying}
                  onClick={handleApplyToInventory}
                >
                  Yes, Apply to Real Inventory
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowConfirmApply(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
          >
            Reset
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              disabled={
                !simResult ||
                simResult.projected.warehouseStock < 0 ||
                (receiveQty === 0 && deliverQty === 0 && transferQty === 0 && adjustmentQty === 0)
              }
              onClick={() => setShowConfirmApply(true)}
            >
              Apply to Inventory
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulatorModal;
