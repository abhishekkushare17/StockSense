import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Warehouse, Layers, Tag, CheckCircle } from 'lucide-react';
import { getWarehouses, getCategories } from '../../services/catalogService';

export const DashboardFilters = ({ filters = {}, onFilterChange, onReset }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [whList, catList] = await Promise.all([
          getWarehouses(),
          getCategories()
        ]);
        setWarehouses(whList);
        setCategories(catList);
      } catch (err) {
        // non-fatal
      }
    };
    loadOptions();
  }, []);

  const docTypes = [
    { id: '', label: 'All Documents' },
    { id: 'RECEIPT', label: 'Receipts' },
    { id: 'DELIVERY', label: 'Delivery' },
    { id: 'TRANSFER', label: 'Internal' },
    { id: 'ADJUSTMENT', label: 'Adjustments' }
  ];

  const statuses = [
    { id: '', label: 'All Statuses' },
    { id: 'Draft', label: 'Draft' },
    { id: 'Waiting', label: 'Waiting' },
    { id: 'Ready', label: 'Ready' },
    { id: 'Done', label: 'Done' },
    { id: 'Canceled', label: 'Canceled' }
  ];

  const isFiltered =
    Boolean(filters.docType) ||
    Boolean(filters.status) ||
    Boolean(filters.warehouse) ||
    Boolean(filters.category);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Inventory Operations Filter Bar</h3>
            <p className="text-[11px] text-gray-500">
              Filter metrics, flow dynamics, and activity feeds across documents, lifecycle states, and facilities.
            </p>
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Document Type Selector */}
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            Document Type
          </label>
          <select
            value={filters.docType || ''}
            onChange={(e) => onFilterChange('docType', e.target.value)}
            className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          >
            {docTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lifecycle Status Selector */}
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Operation Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse Selector */}
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5 text-purple-500" />
            Warehouse Facility
          </label>
          <select
            value={filters.warehouse || ''}
            onChange={(e) => onFilterChange('warehouse', e.target.value)}
            className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            Product Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
