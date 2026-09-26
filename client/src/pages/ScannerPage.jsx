import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  ScanLine,
  Search,
  Package,
  Layers,
  Warehouse as WarehouseIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  SlidersHorizontal,
  ArrowRight,
  RefreshCw,
  Camera,
  History
} from 'lucide-react';
import { Button, Badge, Input, ErrorMessage } from '../components/common';
import { productService } from '../services/productService';
import { stockService } from '../services/stockService';
import { getRecentMovements } from '../services/dashboardService';

export const ScannerPage = () => {
  const [skuInput, setSkuInput] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [stockDetails, setStockDetails] = useState([]);
  const [productMovements, setProductMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Demo SKU presets
  const demoSKUs = ['ST-ROD-01', 'OFF-CHR-02', 'COP-WIR-04', 'SAF-HLM-05'];

  const handleLookupProduct = async (skuToSearch) => {
    const targetSku = (skuToSearch || skuInput).trim();
    if (!targetSku) {
      setError('Please enter or scan a valid SKU code.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // 1. Fetch products matching SKU
      const res = await productService.getProducts({ search: targetSku });
      const found = res.products?.find(
        (p) => p.sku.toLowerCase() === targetSku.toLowerCase()
      ) || res.products?.[0];

      if (!found) {
        setError(`No product found with SKU "${targetSku}".`);
        setScannedProduct(null);
        setStockDetails([]);
        setProductMovements([]);
        return;
      }

      setScannedProduct(found);

      // 2. Fetch warehouse stock breakdown for this product
      const stockRes = await stockService.getStockLevels({ product: found._id });
      setStockDetails(stockRes.stocks || []);

      // 3. Fetch recent ledger movements for this product
      const movementsRes = await getRecentMovements(10, { product: found._id });
      setProductMovements(movementsRes || []);
    } catch (err) {
      setError(err.message || 'Failed to scan product details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto scan first demo SKU on load for immediate interactive demonstration
  useEffect(() => {
    handleLookupProduct('ST-ROD-01');
  }, []);

  const totalCurrentStock = stockDetails.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const reorderLvl = scannedProduct?.reorderLevel || 10;
  const isOutOfStock = totalCurrentStock === 0;
  const isLowStock = totalCurrentStock <= reorderLvl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-indigo-600" />
            Barcode & QR Product Scanner
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Scan physical warehouse labels, look up real-time inventory, and dispatch rapid operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsScanning(!isScanning)}
            icon={Camera}
          >
            {isScanning ? 'Scanner Active' : 'Enable Camera View'}
          </Button>
        </div>
      </div>

      {/* Scanner Viewport & Manual Fallback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Scanner Viewport */}
        <div className="lg:col-span-5 bg-gray-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[320px]">
          {/* Subtle camera view background overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 opacity-90" />

          {/* Scanner Targeting Frame */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-56 h-56 border-2 border-indigo-400/60 rounded-2xl flex items-center justify-center p-4">
              {/* Corner targeting brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

              {/* Animated laser line */}
              {isScanning && (
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#EF4444] animate-pulse" />
              )}

              <div className="text-center space-y-2">
                <ScanLine className="w-12 h-12 text-indigo-400/80 mx-auto animate-pulse" />
                <p className="text-[11px] text-gray-300 font-medium">
                  Align Barcode or QR inside frame
                </p>
              </div>
            </div>
          </div>

          {/* Preset Demo SKU Shortcuts */}
          <div className="relative z-10 pt-4 border-t border-gray-800">
            <p className="text-[11px] text-gray-400 font-semibold mb-2 uppercase tracking-wider">
              Quick Scan Simulation:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {demoSKUs.map((sku) => (
                <button
                  key={sku}
                  type="button"
                  onClick={() => {
                    setSkuInput(sku);
                    handleLookupProduct(sku);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-indigo-600 text-gray-200 text-xs font-mono font-medium transition-colors border border-gray-700 hover:border-indigo-500"
                >
                  {sku}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Manual SKU Search & Scanned Product Details */}
        <div className="lg:col-span-7 space-y-4">
          {/* Manual Input Search Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Manual SKU / Barcode Input
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookupProduct();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. ST-ROD-01 or enter numeric barcode"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                icon={ScanLine}
              >
                Scan SKU
              </Button>
            </form>

            {error && (
              <ErrorMessage message={error} onDismiss={() => setError('')} />
            )}
          </div>

          {/* Scanned Product Card */}
          {scannedProduct ? (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {scannedProduct.sku}
                    </span>
                    <Badge
                      variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}
                      size="sm"
                    >
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {scannedProduct.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Category: <span className="font-semibold text-gray-700">{scannedProduct.category?.name || 'General'}</span> &bull; UOM: {scannedProduct.unitOfMeasure || 'units'}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Stock</span>
                  <span className={`text-2xl font-black ${isOutOfStock ? 'text-rose-600' : 'text-gray-900'}`}>
                    {totalCurrentStock} {scannedProduct.unitOfMeasure || 'units'}
                  </span>
                  <span className="text-[11px] text-gray-400 block">
                    Reorder Threshold: {reorderLvl}
                  </span>
                </div>
              </div>

              {/* Warehouse Locations Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                  <WarehouseIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Facility Inventory Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stockDetails.length > 0 ? (
                    stockDetails.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-gray-700">
                          {s.warehouse?.name || 'Warehouse'}
                        </span>
                        <span className="font-mono font-bold text-gray-900">
                          {s.quantity} {scannedProduct.unitOfMeasure || 'units'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-gray-400 italic">
                      No stock allocated to warehouse locations yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Package}
                  onClick={() => navigate('/receipts')}
                >
                  Receive Stock
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Truck}
                  onClick={() => navigate('/deliveries')}
                >
                  Create Delivery
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={SlidersHorizontal}
                  onClick={() => navigate('/adjustments')}
                >
                  Adjust Stock
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => navigate('/products')}
                >
                  View in Catalog
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
              <ScanLine className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-600">No Product Scanned Yet</p>
              <p className="mt-1">Enter a SKU code above or click one of the quick simulation buttons.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Movements Timeline for Scanned Product */}
      {scannedProduct && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Audit Movement Timeline for {scannedProduct.name}
            </h3>
            <span className="text-xs text-gray-400 font-mono">SKU: {scannedProduct.sku}</span>
          </div>

          <div className="space-y-3">
            {productMovements.length > 0 ? (
              productMovements.map((entry, idx) => {
                const qty = entry.quantityChange ?? entry.quantityChanged ?? 0;
                const isPositive = qty > 0;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/70 transition-colors border border-gray-100"
                  >
                    <div
                      className={`p-2 rounded-lg font-mono font-bold text-xs shrink-0 ${
                        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isPositive ? `+${qty}` : qty}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900">
                          {entry.operationType || 'Movement'} &bull; {entry.documentNumber || 'System Ref'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(entry.timestamp || entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Facility: <span className="font-semibold text-gray-700">{entry.warehouse?.name || 'Main Facility'}</span> &bull; Balance After: <span className="font-bold text-gray-800">{entry.stockAfter ?? '—'}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-gray-400 italic py-4 text-center">
                No recent movements recorded in ledger for this product.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
