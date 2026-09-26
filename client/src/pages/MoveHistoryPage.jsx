import React, { useState, useEffect } from 'react';
import { History, Filter, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../components/common';
import api from '../services/api';

export const MoveHistoryPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opTypeFilter, setOpTypeFilter] = useState('');

  useEffect(() => {
    fetchLedger();
  }, [opTypeFilter]);

  const fetchLedger = async () => {
    try {
      setIsLoading(true);
      const params = { limit: 50 };
      if (opTypeFilter) params.operationType = opTypeFilter;
      const res = await api.get('/ledger', { params });
      setEntries(res.data?.data?.entries || []);
    } catch (err) {
      setEntries([]);
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

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (val) => (
        <span className="text-xs text-gray-500 font-mono">
          {val ? new Date(val).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      render: (val) => (
        <div>
          <span className="font-bold text-xs text-gray-900 block">{val?.name || 'Stock Item'}</span>
          <span className="text-[11px] font-mono text-gray-500">{val?.sku || 'SKU'}</span>
        </div>
      ),
    },
    {
      key: 'operationType',
      header: 'Movement Type',
      render: (val) => getOpBadge(val),
    },
    {
      key: 'quantityChange',
      header: 'Change',
      render: (val) => {
        const isPositive = (val ?? 0) > 0;
        return (
          <span className={`font-bold text-xs inline-flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '+' : ''}{val ?? 0}
          </span>
        );
      },
    },
    {
      key: 'quantityAfter',
      header: 'Balance After',
      render: (val) => <span className="font-semibold text-xs text-gray-900">{val ?? 0}</span>,
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (val) => <span className="text-xs text-gray-700">{val?.name || 'Central'}</span>,
    },
    {
      key: 'referenceId',
      header: 'Reference Document',
      render: (val, row) => (
        <span className="text-xs font-mono font-medium text-indigo-700">
          {val || row.referenceNumber || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600" />
            Stock Ledger & Move History
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete audit trail recording every inventory increment, dispatch, transfer, and count.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">Movement:</span>
          {['', 'RECEIPT', 'DELIVERY', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'].map((op) => (
            <button
              key={op}
              onClick={() => setOpTypeFilter(op)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                opTypeFilter === op
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {op || 'All Movements'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading ledger movements..." size="lg" />
        </div>
      ) : entries.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <Table columns={columns} data={entries} />
        </div>
      ) : (
        <EmptyState
          title="No Movements Recorded"
          message="No ledger transactions match this filter."
          actionText="Clear Filter"
          onAction={() => setOpTypeFilter('')}
        />
      )}
    </div>
  );
};

export default MoveHistoryPage;
