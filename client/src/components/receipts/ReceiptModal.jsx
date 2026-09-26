import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../common';

export const ReceiptModal = ({
  isOpen,
  onClose,
  onSubmit,
  products = [],
  warehouses = [],
  isLoading = false
}) => {
  const [supplier, setSupplier] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 1 }
  ]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSupplier('');
      setWarehouse(warehouses.length > 0 ? warehouses[0]._id : '');
      setNotes('');
      setItems([{ productId: products.length > 0 ? products[0]._id : '', quantity: 1 }]);
      setErrors({});
    }
  }, [isOpen, warehouses, products]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: products.length > 0 ? products[0]._id : '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!supplier.trim()) errs.supplier = 'Supplier name is required';
    if (!warehouse) errs.warehouse = 'Destination warehouse is required';

    const itemErrors = [];
    items.forEach((item, idx) => {
      if (!item.productId) {
        itemErrors.push(`Item ${idx + 1}: Product must be selected`);
      }
      if (!item.quantity || Number(item.quantity) < 1) {
        itemErrors.push(`Item ${idx + 1}: Quantity must be at least 1`);
      }
    });

    if (itemErrors.length > 0) errs.items = itemErrors[0];
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (actionType) => {
    if (!validate()) return;

    const formattedItems = items.map((it) => ({
      product: it.productId,
      quantity: Number(it.quantity)
    }));

    onSubmit({
      supplier: supplier.trim(),
      warehouse,
      items: formattedItems,
      notes: notes.trim(),
      action: actionType // 'draft' or 'validate'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Create Inbound Receipt</h2>
              <p className="text-xs text-gray-500">Record incoming stock received from supplier purchase orders</p>
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
        <div className="p-6 space-y-5 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {errors.items && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.items}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Supplier Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => {
                  setSupplier(e.target.value);
                  if (errors.supplier) setErrors((prev) => ({ ...prev, supplier: '' }));
                }}
                placeholder="e.g. Apex Industrial Supplies Ltd."
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.supplier ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-200'
                } focus:outline-hidden focus:ring-2`}
              />
              {errors.supplier && <p className="text-[11px] text-rose-500 mt-1">{errors.supplier}</p>}
            </div>

            {/* Warehouse Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Destination Warehouse <span className="text-rose-500">*</span>
              </label>
              <select
                value={warehouse}
                onChange={(e) => {
                  setWarehouse(e.target.value);
                  if (errors.warehouse) setErrors((prev) => ({ ...prev, warehouse: '' }));
                }}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.warehouse ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-200'
                } focus:outline-hidden focus:ring-2 bg-white`}
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
              {errors.warehouse && <p className="text-[11px] text-rose-500 mt-1">{errors.warehouse}</p>}
            </div>
          </div>

          {/* Product Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Products to Receive <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Product
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const selectedProd = products.find((p) => p._id === item.productId);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="">Select Product...</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-28 flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-gray-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                      />
                      <span className="text-[11px] text-gray-500 font-medium">
                        {selectedProd?.unitOfMeasure || 'units'}
                      </span>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes / Reference</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. PO-89240 delivered via Express Freight"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 resize-none"
            />
          </div>
        </div>

        {/* Footer with Save Draft & Validate buttons */}
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
              Validate & Receive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
