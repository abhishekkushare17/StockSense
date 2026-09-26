import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Filter } from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../components/common';
import api from '../services/api';

export const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, [statusFilter]);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/receipts', { params });
      setReceipts(res.data?.data?.receipts || []);
    } catch (err) {
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return <Badge variant="success" dot size="sm">Done</Badge>;
      case 'Ready':
        return <Badge variant="purple" dot size="sm">Ready</Badge>;
      case 'Waiting':
        return <Badge variant="warning" dot size="sm">Waiting</Badge>;
      case 'Canceled':
        return <Badge variant="danger" dot size="sm">Canceled</Badge>;
      default:
        return <Badge variant="neutral" dot size="sm">{status || 'Draft'}</Badge>;
    }
  };

  const columns = [
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (val) => <span className="font-mono font-bold text-xs text-indigo-700">{val}</span>,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{val || row.supplierName || 'N/A'}</span>
          <span className="text-[11px] text-gray-500">Warehouse: {row.warehouse?.name || 'Central'}</span>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (val) => (
        <span className="text-xs font-semibold text-gray-700">
          {Array.isArray(val) ? val.length : 0} items
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Lifecycle State',
      render: (val) => getStatusBadge(val),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (val) => (
        <span className="text-xs text-gray-500">
          {val ? new Date(val).toLocaleDateString() : 'Today'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            Inbound Receipts
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Supplier purchase orders, inbound receiving verification, and inventory increments.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">Status:</span>
          {['', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading receipts..." size="lg" />
        </div>
      ) : receipts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <Table columns={columns} data={receipts} />
        </div>
      ) : (
        <EmptyState
          title="No Receipts Found"
          message="There are no inbound receipts matching the active status filter."
          actionText="Clear Filter"
          onAction={() => setStatusFilter('')}
        />
      )}
    </div>
  );
};

export default ReceiptsPage;
