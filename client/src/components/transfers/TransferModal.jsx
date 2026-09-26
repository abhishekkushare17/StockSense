import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, ArrowDown, AlertCircle } from 'lucide-react';
import { Button } from '../common';

export const TransferModal = ({
  isOpen,
  onClose,
  onSubmit,
  products = [],
  warehouses = [],
  isLoading = false
}) => {
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destinationWarehouse, setDestinationWarehouse] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const src = warehouses.length > 0 ? warehouses[0]._id : '';
      const dest = warehouses.length > 1 ? warehouses[1]._id : '';
      setSourceWarehouse(src);
      setDestinationWarehouse(dest);
      setProduct(products.length > 0 ? products[0]._id : '');
      setQuantity(1);
      setNotes('');
      setErrors({});
    }
  }, [isOpen, warehouses, products]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!sourceWarehouse) errs.sourceWarehouse = 'Source warehouse is required';
    if (!destinationWarehouse) errs.destinationWarehouse = 'Destination warehouse is required';
    if (sourceWarehouse && destinationWarehouse && sourceWarehouse === destinationWarehouse) {
      errs.destinationWarehouse = 'Destination warehouse must be different from source facility';
    }
    if (!product) errs.product = 'Product is required';
    if (!quantity || Number(quantity) < 1) errs.quantity = 'Quantity must be at least 1';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (actionType = 'draft') => {
    if (!validate()) return;

    onSubmit({
      sourceWarehouse,
      destinationWarehouse,
      product,
      quantity: Number(quantity),
      notes: notes.trim(),
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
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Initiate Internal Transfer</h2>
              <p className="text-xs text-gray-500">Relocate stock between facilities without changing total company stock</p>
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
          {/* Transfer Route Visual Card */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-3">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Facility Transfer Route
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Source Warehouse (Origin) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={sourceWarehouse}
                  onChange={(e) => {
                    setSourceWarehouse(e.target.value);
                    if (errors.sourceWarehouse) setErrors((prev) => ({ ...prev, sourceWarehouse: '' }));
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-amber-300 bg-white"
                >
                  <option value="">Select Origin...</option>
                  {warehouses.map((wh) => (
                    <option key={wh._id} value={wh._id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
                {errors.sourceWarehouse && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.sourceWarehouse}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Destination Warehouse <span className="text-rose-500">*</span>
                </label>
                <select
                  value={destinationWarehouse}
                  onChange={(e) => {
                    setDestinationWarehouse(e.target.value);
                    if (errors.destinationWarehouse) setErrors((prev) => ({ ...prev, destinationWarehouse: '' }));
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-amber-300 bg-white"
                >
                  <option value="">Select Destination...</option>
                  {warehouses.map((wh) => (
                    <option key={wh._id} value={wh._id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
                {errors.destinationWarehouse && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.destinationWarehouse}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Product to Transfer <span className="text-rose-500">*</span>
              </label>
              <select
                value={product}
                onChange={(e) => {
                  setProduct(e.target.value);
                  if (errors.product) setErrors((prev) => ({ ...prev, product: '' }));
                }}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.product ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-200'
                } focus:outline-hidden focus:ring-2 bg-white`}
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border ${
                    errors.quantity ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-200'
                  } focus:outline-hidden focus:ring-2`}
                />
                <span className="text-xs text-gray-500 font-medium shrink-0">
                  {selectedProd?.unitOfMeasure || 'units'}
                </span>
              </div>
              {errors.quantity && <p className="text-[11px] text-rose-500 mt-1">{errors.quantity}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Transfer Reason / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Replenishment for assembly line, internal request #31"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 resize-none"
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
              Validate & Transfer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
