import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Calculator, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../common';
import { fetchCurrentStockForProduct } from '../../services/adjustmentService';

export const AdjustmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  products = [],
  warehouses = [],
  isLoading = false
}) => {
  const [warehouse, setWarehouse] = useState('');
  const [product, setProduct] = useState('');
  const [recordedQuantity, setRecordedQuantity] = useState(0);
  const [physicalCount, setPhysicalCount] = useState(0);
  const [reason, setReason] = useState('Physical count reconciliation');
  const [isFetchingStock, setIsFetchingStock] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const wh = warehouses.length > 0 ? warehouses[0]._id : '';
      const prod = products.length > 0 ? products[0]._id : '';
      setWarehouse(wh);
      setProduct(prod);
      setReason('Physical count reconciliation');
      setErrors({});

      if (wh && prod) {
        loadStockBalance(prod, wh);
      }
    }
  }, [isOpen, warehouses, products]);

  // When warehouse or product changes, update recorded quantity
  const handleWarehouseChange = (whId) => {
    setWarehouse(whId);
    if (product && whId) {
      loadStockBalance(product, whId);
    }
  };

  const handleProductChange = (prodId) => {
    setProduct(prodId);
    if (prodId && warehouse) {
      loadStockBalance(prodId, warehouse);
    }
  };

  const loadStockBalance = async (prodId, whId) => {
    setIsFetchingStock(true);
    try {
      const qty = await fetchCurrentStockForProduct(prodId, whId);
      setRecordedQuantity(qty);
      setPhysicalCount(qty); // default physical count to recorded
    } finally {
      setIsFetchingStock(false);
    }
  };

  if (!isOpen) return null;

  // Difference = Physical Count - Recorded Quantity
  const numRec = Number(recordedQuantity) || 0;
  const numPhys = Number(physicalCount) || 0;
  const difference = numPhys - numRec;

  const validate = () => {
    const errs = {};
    if (!warehouse) errs.warehouse = 'Warehouse is required';
    if (!product) errs.product = 'Product is required';
    if (physicalCount === '' || isNaN(numPhys) || numPhys < 0) {
      errs.physicalCount = 'Physical count must be a non-negative number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (actionType = 'draft') => {
    if (!validate()) return;

    onSubmit({
      warehouse,
      product,
      recordedQuantity: numRec,
      physicalQuantity: numPhys,
      difference,
      reason: reason.trim(),
      action: actionType
    });
  };

  const selectedProd = products.find((p) => p._id === product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Inventory Stock Adjustment</h2>
              <p className="text-xs text-gray-500">Reconcile physical stock count against system recorded quantities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Warehouse */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Warehouse Facility <span className="text-rose-500">*</span>
              </label>
              <select
                value={warehouse}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
              >
                <option value="">Select Warehouse...</option>
                {warehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
              {errors.warehouse && <p className="text-[11px] text-rose-500 mt-1">{errors.warehouse}</p>}
            </div>

            {/* Product */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Product Item <span className="text-rose-500">*</span>
              </label>
              <select
                value={product}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
              >
                <option value="">Select Product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              {errors.product && <p className="text-[11px] text-rose-500 mt-1">{errors.product}</p>}
            </div>
          </div>

          {/* Reconciliation Card with Auto Difference Display */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-indigo-600" /> Count Reconciliation
              </span>
              {isFetchingStock && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Fetching live stock...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Recorded Quantity */}
              <div className="p-3 rounded-xl bg-white border border-gray-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Recorded Quantity
                </span>
                <span className="text-lg font-black font-mono text-gray-900 block">
                  {numRec}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {selectedProd?.unitOfMeasure || 'units'}
                </span>
              </div>

              {/* Physical Count Input */}
              <div className="p-3 rounded-xl bg-white border border-indigo-200 ring-2 ring-indigo-50">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                  Physical Count <span className="text-rose-500">*</span>
                </span>
                <input
                  type="number"
                  min="0"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(e.target.value)}
                  className="w-full text-lg font-black font-mono text-indigo-900 bg-transparent border-none p-0 focus:outline-hidden"
                />
                <span className="text-[10px] text-indigo-500 font-medium">
                  actual counted
                </span>
              </div>

              {/* Automatically Show Difference */}
              <div
                className={`p-3 rounded-xl border ${
                  difference < 0
                    ? 'bg-rose-50 border-rose-200'
                    : difference > 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                    difference < 0
                      ? 'text-rose-700'
                      : difference > 0
                      ? 'text-emerald-700'
                      : 'text-gray-400'
                  }`}
                >
                  Difference
                </span>
                <span
                  className={`text-lg font-black font-mono block ${
                    difference < 0
                      ? 'text-rose-700'
                      : difference > 0
                      ? 'text-emerald-700'
                      : 'text-gray-700'
                  }`}
                >
                  {difference > 0 ? `+${difference}` : difference}
                </span>
                <span
                  className={`text-[10px] font-medium block ${
                    difference < 0
                      ? 'text-rose-600'
                      : difference > 0
                      ? 'text-emerald-600'
                      : 'text-gray-500'
                  }`}
                >
                  {difference < 0
                    ? 'Deficit / Shrink'
                    : difference > 0
                    ? 'Surplus / Found'
                    : 'Exact match'}
                </span>
              </div>
            </div>
            {errors.physicalCount && (
              <p className="text-[11px] text-rose-500">{errors.physicalCount}</p>
            )}
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Adjustment Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Physical inventory count reconciliation, damaged goods write-off"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => handleSubmit('draft')}
              isLoading={isLoading}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => handleSubmit('validate')}
              isLoading={isLoading}
            >
              Validate & Adjust Stock
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentModal;
