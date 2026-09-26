import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Badge, Button, Table, Loading } from '../common';
import {
  Package,
  Hash,
  Warehouse,
  Layers,
  History,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowRightLeft,
  SlidersHorizontal,
  PackagePlus,
  Activity
} from 'lucide-react';
import api from '../../services/api';

export const ProductDetailModal = ({ isOpen, onClose, productId }) => {
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && productId) {
      loadProductDetails();
    }
  }, [isOpen, productId]);

  const loadProductDetails = async () => {
    try {
      setIsLoading(true);
      const [prodRes, movRes] = await Promise.allSettled([
        api.get(`/products/${productId}`),
        api.get(`/ledger?product=${productId}&limit=8`)
      ]);

      if (prodRes.status === 'fulfilled') {
        setProduct(prodRes.value.data?.data?.product || null);
      }
      if (movRes.status === 'fulfilled') {
        setMovements(movRes.value.data?.data?.entries || []);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (path) => {
    onClose();
    navigate(path);
  };

  const getOpBadge = (type) => {
    switch (type) {
      case 'RECEIPT':
        return <Badge variant="success" size="sm">RECEIPT</Badge>;
      case 'DELIVERY':
        return <Badge variant="danger" size="sm">DELIVERY</Badge>;
      case 'TRANSFER_IN':
        return <Badge variant="purple" size="sm">TRANSFER IN</Badge>;
      case 'TRANSFER_OUT':
        return <Badge variant="warning" size="sm">TRANSFER OUT</Badge>;
      case 'ADJUSTMENT':
        return <Badge variant="info" size="sm">ADJUSTMENT</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{type}</Badge>;
    }
  };

  const warehouseColumns = [
    {
      key: 'warehouse',
      header: 'Warehouse Facility',
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900 block text-xs">
            {row.warehouse?.name || 'Main Warehouse'}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {row.warehouse?.code || 'WH-MAIN'}
          </span>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Available Stock',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs text-gray-900">
          {val} {product?.unitOfMeasure}
        </span>
      ),
    },
    {
      key: 'reservedQuantity',
      header: 'Allocated / Reserved',
      render: (val) => <span className="text-xs text-gray-500">{val ?? 0}</span>,
    },
  ];

  const totalStock = product?.totalStock ?? 0;
  const reorder = product?.reorderLevel ?? 10;
  const isOut = totalStock === 0;
  const isLow = totalStock <= reorder;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details & Inventory Metrics"
      size="lg"
    >
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loading text="Loading product profile..." size="md" />
        </div>
      ) : product ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-200 shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                    {product.sku}
                  </span>
                  <span className="text-xs text-gray-500">
                    Category: <strong className="text-gray-700">{product.category?.name || 'Raw Materials'}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'} size="md">
                {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy Stock'}
              </Badge>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Stock</span>
              <span className={`text-xl font-extrabold ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                {totalStock} {product.unitOfMeasure}
              </span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Available</span>
              <span className="text-xl font-extrabold text-emerald-600">
                {product.availableStock ?? totalStock} {product.unitOfMeasure}
              </span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reorder Level</span>
              <span className="text-xl font-extrabold text-indigo-600">
                {reorder} {product.unitOfMeasure}
              </span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Inventory Health</span>
              <span className="text-xs font-bold mt-1 inline-flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                {isOut ? '0% (Depleted)' : isLow ? '50% (At Risk)' : '100% (Optimal)'}
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Quick Operations:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="primary"
                size="sm"
                icon={PackagePlus}
                onClick={() => handleAction('/receipts')}
              >
                Receive
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Truck}
                onClick={() => handleAction('/deliveries')}
              >
                Deliver
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowRightLeft}
                onClick={() => handleAction('/transfers')}
              >
                Transfer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => handleAction('/adjustments')}
              >
                Adjust
              </Button>
            </div>
          </div>

          {/* Stock by Warehouse Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
              Stock Availability by Warehouse
            </h4>
            {product.stocks && product.stocks.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <Table columns={warehouseColumns} data={product.stocks} />
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                No warehouse stock allocations found for this item.
              </div>
            )}
          </div>

          {/* Visual Stock Movement Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600" />
                Stock Movement Timeline
              </h4>
              <span className="text-xs font-bold text-gray-900 font-mono">
                Current Stock: {totalStock} {product.unitOfMeasure}
              </span>
            </div>

            {movements.length > 0 ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
                {movements.map((m, idx) => {
                  const qty = m.quantityChange ?? m.quantityChanged ?? 0;
                  const isPositive = qty > 0;
                  return (
                    <div key={m._id || idx} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 ${
                          isPositive
                            ? 'bg-emerald-500 ring-emerald-200'
                            : 'bg-rose-500 ring-rose-200'
                        }`}
                      />

                      <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs hover:border-indigo-300 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {isPositive ? `+${qty}` : qty} {product.unitOfMeasure}
                            </span>
                            <span className="font-bold text-gray-800 text-xs">
                              {m.operationType || 'Movement'}
                            </span>
                            <span className="font-mono text-gray-400 text-[11px]">
                              {m.documentNumber || m.referenceId || ''}
                            </span>
                          </div>
                          <span className="text-gray-400 text-[10px]">
                            {new Date(m.timestamp || m.createdAt).toLocaleDateString()}{' '}
                            {new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5 pt-1.5 border-t border-gray-100">
                          <span>
                            Warehouse: <strong className="text-gray-700">{m.warehouse?.name || 'Facility'}</strong>
                          </span>
                          <span>
                            Balance After: <strong className="font-mono text-gray-900">{m.stockAfter ?? '—'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                No recent movements recorded in ledger.
              </div>
            )}
          </div>

          {/* Close Action */}
          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={onClose}>
              Close Window
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-gray-500">
          Product record could not be retrieved.
        </div>
      )}
    </Modal>
  );
};

export default ProductDetailModal;
