import React from 'react';
import { History, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Table } from '../common';

export const RecentActivityTable = ({ activities = [], isLoading = false }) => {
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
        return <Badge variant="neutral" size="sm">{type || 'OP'}</Badge>;
    }
  };

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-bold text-xs text-gray-900 block truncate">
            {row.product?.name || val?.name || 'Stock Movement'}
          </span>
          <span className="text-[11px] font-mono text-gray-500">
            {row.product?.sku || val?.sku || row.referenceId || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'operationType',
      header: 'Operation',
      render: (val, row) => getOpBadge(val || row.transactionType),
    },
    {
      key: 'quantityChange',
      header: 'Quantity',
      render: (val, row) => {
        const qty = val !== undefined ? val : row.quantityChanged ?? 0;
        const isPos = qty > 0;
        return (
          <span className={`font-mono font-bold text-xs ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPos ? '+' : ''}{qty}
          </span>
        );
      },
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (val, row) => (
        <span className="text-xs text-gray-700">
          {row.warehouse?.name || 'Main Warehouse'}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (val, row) => (
        <span className="text-xs text-gray-600">
          {row.user?.name || row.createdBy?.name || 'Admin'}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Date',
      render: (val, row) => (
        <span className="text-[11px] text-gray-500 font-mono">
          {val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <Badge variant="success" dot size="sm">
          Done
        </Badge>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Inventory Activity</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live audit trail of the latest receipts, dispatches, and warehouse movements.
            </p>
          </div>
        </div>

        <Link
          to="/move-history"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading recent movements...</div>
      ) : activities.length > 0 ? (
        <div className="overflow-x-auto">
          <Table columns={columns} data={activities.slice(0, 7)} />
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-gray-400">
          No stock transactions recorded yet.
        </div>
      )}
    </div>
  );
};

export default RecentActivityTable;
