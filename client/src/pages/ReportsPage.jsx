import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  Truck,
  ArrowRightLeft,
  FileText
} from 'lucide-react';
import { Button, Badge } from '../components/common';
import { getAllStockLevels, getRecentMovements } from '../services/dashboardService';
import { productService } from '../services/productService';
import { warehouseService } from '../services/warehouseService';
import { categoryService } from '../services/categoryService';
import { getReceipts } from '../services/receiptService';
import { getDeliveries } from '../services/deliveryService';
import { getTransfers } from '../services/transferService';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('STOCK'); // 'PRODUCT', 'STOCK', 'LOW_STOCK', 'LEDGER', 'RECEIPT', 'DELIVERY', 'TRANSFER'
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [reportType, selectedWarehouse, selectedCategory]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedWarehouse) params.warehouse = selectedWarehouse;
      if (selectedCategory) params.category = selectedCategory;

      const [whRes, catRes] = await Promise.all([
        warehouseService.getWarehouses().catch(() => []),
        categoryService.getCategories().catch(() => [])
      ]);
      setWarehouses(Array.isArray(whRes) ? whRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);

      if (reportType === 'PRODUCT') {
        const pRes = await productService.getProducts(params);
        setProducts(pRes.products || []);
      } else if (reportType === 'STOCK' || reportType === 'LOW_STOCK') {
        const sRes = await getAllStockLevels(params);
        setStocks(sRes.stocks || []);
      } else if (reportType === 'LEDGER') {
        const mRes = await getRecentMovements(200, params);
        setMovements(mRes || []);
      } else if (reportType === 'RECEIPT') {
        const rRes = await getReceipts(params);
        setReceipts(rRes.receipts || []);
      } else if (reportType === 'DELIVERY') {
        const dRes = await getDeliveries(params);
        setDeliveries(dRes.deliveries || []);
      } else if (reportType === 'TRANSFER') {
        const tRes = await getTransfers(params);
        setTransfers(tRes.transfers || []);
      }
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

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let list = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, searchQuery]);

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

  // Filtered Receipts
  const filteredReceipts = useMemo(() => {
    let list = receipts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) => r.receiptNumber?.toLowerCase().includes(q) || r.supplier?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [receipts, searchQuery]);

  // Filtered Deliveries
  const filteredDeliveries = useMemo(() => {
    let list = deliveries;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) => d.deliveryNumber?.toLowerCase().includes(q) || d.customer?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [deliveries, searchQuery]);

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    let list = transfers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.transferNumber?.toLowerCase().includes(q) ||
          t.sourceWarehouse?.name?.toLowerCase().includes(q) ||
          t.destinationWarehouse?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transfers, searchQuery]);

  // CSV Export Handler
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const timestamp = new Date().toISOString().split('T')[0];

    if (reportType === 'PRODUCT') {
      csvContent += 'Name,SKU,Category,Unit,Reorder Level,Status\r\n';
      filteredProducts.forEach((p) => {
        csvContent += `"${p.name}","${p.sku}","${p.category?.name || 'General'}","${p.unitOfMeasure || 'units'}",${p.reorderLevel ?? 10},"${p.status || 'active'}"\r\n`;
      });
    } else if (reportType === 'LEDGER') {
      csvContent += 'Date,Document Number,Operation,Product,Warehouse,Quantity Change,Balance After\r\n';
      filteredMovements.forEach((m) => {
        csvContent += `"${new Date(m.timestamp || m.createdAt).toLocaleDateString()}","${m.documentNumber || 'N/A'}","${m.operationType || 'Movement'}","${m.product?.name || 'Item'}","${m.warehouse?.name || 'Main'}",${m.quantityChange ?? 0},${m.stockAfter ?? 0}\r\n`;
      });
    } else if (reportType === 'RECEIPT') {
      csvContent += 'Receipt Number,Supplier,Warehouse,Status,Items Count,Created Date\r\n';
      filteredReceipts.forEach((r) => {
        csvContent += `"${r.receiptNumber}","${r.supplier || 'N/A'}","${r.warehouse?.name || 'Main'}","${r.status}",${r.items?.length || 0},"${new Date(r.createdAt).toLocaleDateString()}"\r\n`;
      });
    } else if (reportType === 'DELIVERY') {
      csvContent += 'Delivery Number,Customer,Warehouse,Status,Items Count,Created Date\r\n';
      filteredDeliveries.forEach((d) => {
        csvContent += `"${d.deliveryNumber}","${d.customer || 'Direct'}","${d.warehouse?.name || 'Main'}","${d.status}",${d.items?.length || 0},"${new Date(d.createdAt).toLocaleDateString()}"\r\n`;
      });
    } else if (reportType === 'TRANSFER') {
      csvContent += 'Transfer Number,Source Warehouse,Destination Warehouse,Status,Created Date\r\n';
      filteredTransfers.forEach((t) => {
        csvContent += `"${t.transferNumber}","${t.sourceWarehouse?.name || 'Origin'}","${t.destinationWarehouse?.name || 'Destination'}","${t.status}","${new Date(t.createdAt).toLocaleDateString()}"\r\n`;
      });
    } else {
      csvContent += 'Product Name,SKU,Category,Warehouse,Current Quantity,Reorder Level,Status\r\n';
      filteredStocks.forEach((s) => {
        const qty = s.quantity ?? 0;
        const reorder = s.product?.reorderLevel ?? 10;
        const status = qty === 0 ? 'Out of Stock' : qty <= reorder ? 'Low Stock' : 'Optimal';
        csvContent += `"${s.product?.name || 'Product'}","${s.product?.sku || 'N/A'}","${s.product?.category?.name || 'General'}","${s.warehouse?.name || 'Main'}",${qty},${reorder},"${status}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_${reportType}_Report_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export Handler
  const handleExportPDF = () => {
    window.print();
  };

  const currentRecordsCount =
    reportType === 'PRODUCT'
      ? filteredProducts.length
      : reportType === 'LEDGER'
      ? filteredMovements.length
      : reportType === 'RECEIPT'
      ? filteredReceipts.length
      : reportType === 'DELIVERY'
      ? filteredDeliveries.length
      : reportType === 'TRANSFER'
      ? filteredTransfers.length
      : filteredStocks.length;

  return (
    <div className="space-y-6">
      {/* Header and Print/Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            Official Inventory Reports & Data Exports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Generate and export operational statements across 7 core inventory modules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            icon={Printer}
          >
            Export PDF
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            icon={Download}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Printable Report Header (Visible only when printing to PDF) */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="/logo.png" alt="StockSense Logo" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">StockSense Inventory System — Official Statement</h2>
            <p className="text-xs text-gray-500">
              Generated on {new Date().toLocaleString()} &bull; Module: {reportType}
            </p>
          </div>
        </div>
      </div>

      {/* Report Controls & Module Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 print:hidden">
        {/* 7 Report Types Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'STOCK', label: 'Stock Report' },
            { id: 'LOW_STOCK', label: 'Low Stock Report' },
            { id: 'PRODUCT', label: 'Product Report' },
            { id: 'LEDGER', label: 'Stock Ledger' },
            { id: 'RECEIPT', label: 'Receipt Report' },
            { id: 'DELIVERY', label: 'Delivery Report' },
            { id: 'TRANSFER', label: 'Transfer Report' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                reportType === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter current report..."
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
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>

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
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Records in Report
          </span>
          <span className="text-xl font-black text-gray-900 mt-1 block">
            {currentRecordsCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Report Scope
          </span>
          <span className="text-sm font-bold text-indigo-600 mt-1 block">
            {reportType} MODULE
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Warehouses Filtered
          </span>
          <span className="text-xl font-black text-gray-900 mt-1 block">
            {selectedWarehouse ? '1 Facility' : `${warehouses.length} Facilities`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Audit State
          </span>
          <span className="text-xs font-bold text-emerald-600 mt-2 block inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Certified
          </span>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          {reportType === 'PRODUCT' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">UOM</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{p.sku}</td>
                    <td className="py-3 px-4 text-gray-600">{p.category?.name || 'General'}</td>
                    <td className="py-3 px-4 text-gray-600">{p.unitOfMeasure || 'units'}</td>
                    <td className="py-3 px-4 font-mono text-gray-900">{p.reorderLevel ?? 10}</td>
                    <td className="py-3 px-4">
                      <Badge variant="success" size="sm">
                        {p.status || 'Active'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'LEDGER' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredMovements.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(m.timestamp || m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{m.documentNumber || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="purple" size="sm">{m.operationType || 'Movement'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-bold">{m.product?.name || 'Product'}</td>
                    <td className="py-3 px-4 text-gray-600">{m.warehouse?.name || 'Facility'}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={(m.quantityChange ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {(m.quantityChange ?? 0) > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900">{m.stockAfter ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'RECEIPT' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Items Count</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredReceipts.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{r.receiptNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{r.supplier || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{r.warehouse?.name || 'Main Facility'}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{r.items?.length || 0} SKU items</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={r.status === 'Done' ? 'success' : 'info'} size="sm">{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'DELIVERY' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Delivery Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Items Count</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredDeliveries.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{d.deliveryNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{d.customer || 'Direct'}</td>
                    <td className="py-3 px-4 text-gray-600">{d.warehouse?.name || 'Main Facility'}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{d.items?.length || 0} SKU items</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={d.status === 'Done' ? 'success' : 'purple'} size="sm">{d.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'TRANSFER' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Transfer Number</th>
                  <th className="py-3 px-4">Source Warehouse</th>
                  <th className="py-3 px-4">Destination Warehouse</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredTransfers.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{t.transferNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{t.sourceWarehouse?.name || 'Origin'}</td>
                    <td className="py-3 px-4 text-gray-700">{t.destinationWarehouse?.name || 'Destination'}</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={t.status === 'Done' ? 'success' : 'warning'} size="sm">{t.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredStocks.map((s, idx) => {
                  const qty = s.quantity ?? 0;
                  const reorder = s.product?.reorderLevel ?? 10;
                  const isOut = qty === 0;
                  const isLow = qty <= reorder;

                  return (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{s.product?.name || 'Product'}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">{s.product?.sku || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{s.product?.category?.name || 'General'}</td>
                      <td className="py-3 px-4 text-gray-700">{s.warehouse?.name || 'Central'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {qty.toLocaleString()} {s.product?.unitOfMeasure || 'units'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">{reorder}</td>
                      <td className="py-3 px-4">
                        <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'} size="sm">
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
