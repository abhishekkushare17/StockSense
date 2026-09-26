import React, { useState, useEffect } from 'react';
import { Modal, Badge, Button, Table, Loading } from '../common';
import { Package, Hash, Warehouse, Layers, History, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export const ProductDetailModal = ({ isOpen, onClose, productId }) => {
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        api.get(`/ledger?product=${productId}&limit=5`)
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
          <span className="font-bold text-xs text-gray-900 block">
            {row.warehouse?.name || 'Main Warehouse'}
          </span>
          <span className="text-[11px] font-mono text-gray-500">
            {row.warehouse?.code || 'WH-MAIN'}
          </span>
        </div>
      ),
    },
    {
      key: 'locationBin',
      header: 'Bin Location',
      render: (val) => <span className="text-xs text-gray-600">{val || 'Aisle 1'}</span>,
    },
    {
      key: 'quantity',
      header: 'On-Hand Stock',
      render: (val) => <span className="font-extrabold text-xs text-gray-900">{val ?? 0}</span>,
    },
    {
      key: 'reservedQuantity',
      header: 'Allocated / Reserved',
      render: (val) => <span className="text-xs text-gray-500">{val ?? 0}</span>,
    },
  ];

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

            <Badge variant={product.status === 'active' ? 'success' : 'neutral'} dot size="md">
              {product.status || 'active'}
            </Badge>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Stock</span>
              <span className={`text-xl font-extrabold ${product.lowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                {product.totalStock ?? 0} {product.unitOfMeasure}
              </span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Available</span>
              <span className="text-xl font-extrabold text-emerald-600">
                {product.availableStock ?? product.totalStock ?? 0} {product.unitOfMeasure}
              </span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reorder Level</span>
              <span className="text-xl font-extrabold text-indigo-600">
                {product.reorderLevel ?? 10} {product.unitOfMeasure}
              </span>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Stock Status</span>
              <span className="text-xs font-bold mt-1 inline-block">
                {product.outOfStock ? (
                  <span className="text-rose-600">Out of Stock</span>
                ) : product.lowStock ? (
                  <span className="text-amber-600">Low Stock Alert</span>
                ) : (
                  <span className="text-emerald-600">Optimal Buffer</span>
                )}
              </span>
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

          {/* Recent Movements */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
              Recent Ledger Movements
            </h4>
            {movements.length > 0 ? (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                {movements.map((m) => (
                  <div key={m._id} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      {getOpBadge(m.operationType)}
                      <span className="font-mono text-gray-600 font-medium">Ref: {m.referenceId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold ${m.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.quantityChange > 0 ? '+' : ''}{m.quantityChange}
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        {new Date(m.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
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
