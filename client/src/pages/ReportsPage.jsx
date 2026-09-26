import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  RefreshCw,
  Warehouse as WarehouseIcon,
  Layers,
  AlertTriangle,
  Package,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Button, Input, Badge } from '../components/common';
import { getAllStockLevels, getRecentMovements } from '../services/dashboardService';
import { warehouseService } from '../services/warehouseService';
import { categoryService } from '../services/categoryService';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('STOCK_SUMMARY'); // 'STOCK_SUMMARY', 'LOW_STOCK', 'MOVEMENT_AUDIT'
  const [stocks, setStocks] = useState([]);
  const [movements, setMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const printRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [reportType, selectedWarehouse, selectedCategory]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedWarehouse) params.warehouse = selectedWarehouse;
      if (selectedCategory) params.category = selectedCategory;

      const [stockRes, movRes, whRes, catRes] = await Promise.all([
        getAllStockLevels(params),
        getRecentMovements(100, params),
        warehouseService.getWarehouses().catch(() => []),
        categoryService.getCategories().catch(() => [])
      ]);

      setStocks(stockRes.stocks || []);
      setMovements(movRes || []);
      setWarehouses(Array.isArray(whRes) ? whRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Stock Items
  const filteredStocks = useMemo(() => {
    let list = stocks;
    if (reportType === 'LOW_STOCK') {
      list = list.filter((item) => (item.quantity ?? 0) <= (item.product?.reorderLevel ?? 10));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.product?.name?.toLowerCase().includes(q) ||
          item.product?.sku?.toLowerCase().includes(q) ||
          item.warehouse?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [stocks, reportType, searchQuery]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    let list = movements;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.product?.name?.toLowerCase().includes(q) ||
          m.warehouse?.name?.toLowerCase().includes(q) ||
          m.documentNumber?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [movements, searchQuery]);

  // CSV Export Handler
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const timestamp = new Date().toISOString().split('T')[0];

    if (reportType === 'MOVEMENT_AUDIT') {
      const headers = ['Date', 'Document Number', 'Operation Type', 'Product', 'Warehouse', 'Quantity Change', 'Balance After'];
      csvContent += headers.join(',') + '\r\n';

      filteredMovements.forEach((m) => {
        const row = [
          `"${new Date(m.timestamp || m.createdAt).toLocaleDateString()}"`,
          `"${m.documentNumber || 'N/A'}"`,
          `"${m.operationType || 'Movement'}"`,
          `"${(m.product?.name || 'Item').replace(/"/g, '""')}"`,
          `"${(m.warehouse?.name || 'Facility').replace(/"/g, '""')}"`,
          m.quantityChange ?? m.quantityChanged ?? 0,
          m.stockAfter ?? 'N/A'
        ];
        csvContent += row.join(',') + '\r\n';
      });
    } else {
      const headers = ['Product Name', 'SKU', 'Category', 'Warehouse', 'Current Quantity', 'Reorder Level', 'Unit of Measure', 'Status'];
      csvContent += headers.join(',') + '\r\n';

      filteredStocks.forEach((s) => {
        const qty = s.quantity ?? 0;
        const reorder = s.product?.reorderLevel ?? 10;
        const status = qty === 0 ? 'Out of Stock' : qty <= reorder ? 'Low Stock' : 'Optimal';
        const row = [
          `"${(s.product?.name || 'Product').replace(/"/g, '""')}"`,
          `"${s.product?.sku || 'N/A'}"`,
          `"${s.product?.category?.name || 'General'}"`,
          `"${(s.warehouse?.name || 'Main').replace(/"/g, '""')}"`,
          qty,
          reorder,
          `"${s.product?.unitOfMeasure || 'units'}"`,
          `"${status}"`
        ];
        csvContent += row.join(',') + '\r\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_${reportType}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  const totalQuantity = useMemo(
    () => filteredStocks.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [filteredStocks]
  );

  return (
    <div className="space-y-6">
      {/* Header and Print/Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            Inventory Reports & Ledger Exports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Generate audit-ready reports, export live CSV spreadsheets, and print inventory statements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={Printer}
          >
            Print Report
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            icon={Download}
          >
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Printable Report Header (Visible only when printing) */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">StockSense Inventory System — Official Report</h2>
        <p className="text-xs text-gray-500 mt-1">
          Generated on {new Date().toLocaleString()} &bull; Report Type: {reportType}
        </p>
      </div>

      {/* Report Controls & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 pb-4">
          {/* Report Type Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setReportType('STOCK_SUMMARY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                reportType === 'STOCK_SUMMARY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Master Stock Balance
            </button>
            <button
              type="button"
              onClick={() => setReportType('LOW_STOCK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                reportType === 'LOW_STOCK'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Deficit & Reorder Forecast
            </button>
            <button
              type="button"
              onClick={() => setReportType('MOVEMENT_AUDIT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                reportType === 'MOVEMENT_AUDIT'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Operational Audit Ledger
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            icon={RefreshCw}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search in report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="">All Warehouse Facilities</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>

          {reportType !== 'MOVEMENT_AUDIT' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Report Records
          </span>
          <span className="text-xl font-black text-gray-900 mt-1 block">
            {reportType === 'MOVEMENT_AUDIT' ? filteredMovements.length : filteredStocks.length}
          </span>
        </div>

        {reportType !== 'MOVEMENT_AUDIT' && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Stock Volume
            </span>
            <span className="text-xl font-black text-indigo-600 mt-1 block">
              {totalQuantity.toLocaleString()} units
            </span>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Active Facilities
          </span>
          <span className="text-xl font-black text-gray-900 mt-1 block">
            {warehouses.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Compliance Status
          </span>
          <span className="text-xs font-bold text-emerald-600 mt-2 block inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Audited & Verified
          </span>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          {reportType === 'MOVEMENT_AUDIT' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Document / Ref</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredMovements.length > 0 ? (
                  filteredMovements.map((m, idx) => {
                    const qty = m.quantityChange ?? m.quantityChanged ?? 0;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(m.timestamp || m.createdAt).toLocaleDateString()}{' '}
                          <span className="text-[10px] text-gray-400">
                            {new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {m.documentNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="purple" size="sm">
                            {m.operationType || 'Movement'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-bold">
                          {m.product?.name || 'Product'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {m.warehouse?.name || 'Facility'}
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span className={qty > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {qty > 0 ? `+${qty}` : qty}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                          {m.stockAfter ?? '—'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400">
                      No operational movements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Warehouse Facility</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Inventory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((s, idx) => {
                    const qty = s.quantity ?? 0;
                    const reorder = s.product?.reorderLevel ?? 10;
                    const isOut = qty === 0;
                    const isLow = qty <= reorder;

                    return (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {s.product?.name || 'Product'}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">
                          {s.product?.sku || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {s.product?.category?.name || 'General'}
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {s.warehouse?.name || 'Central'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {qty.toLocaleString()} {s.product?.unitOfMeasure || 'units'}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {reorder}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}
                            size="sm"
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400">
                      No stock records match current report filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
