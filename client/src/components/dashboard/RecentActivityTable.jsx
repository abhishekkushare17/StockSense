import React, { useState } from 'react';
import { History, ArrowRight, ExternalLink, Activity, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, SlidersHorizontal, PackagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Table } from '../common';

// Helper to format relative time
const formatTimeAgo = (date) => {
  if (!date) return 'just now';
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.max(1, Math.floor((now - past) / 1000));

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const RecentActivityTable = ({ activities = [], isLoading = false }) => {
  const [viewMode, setViewMode] = useState('feed'); // 'feed' or 'table'

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

  const getOpActionText = (activity) => {
    const userName = activity.user?.name || activity.createdBy?.name || 'Operator';
    const prodName = activity.product?.name || 'Item';
    const qty = Math.abs(activity.quantityChange ?? activity.quantityChanged ?? 0);
    const op = activity.operationType || 'TRANSACTION';

    switch (op) {
      case 'RECEIPT':
        return {
          title: `${userName} received ${qty} ${prodName}`,
          icon: PackagePlus,
          color: 'text-emerald-600 bg-emerald-50'
        };
      case 'DELIVERY':
        return {
          title: `${userName} delivered ${qty} ${prodName}`,
          icon: ArrowUpRight,
          color: 'text-rose-600 bg-rose-50'
        };
      case 'TRANSFER_OUT':
      case 'TRANSFER_IN':
        return {
          title: `${userName} transferred ${qty} ${prodName}`,
          icon: ArrowRightLeft,
          color: 'text-amber-600 bg-amber-50'
        };
      case 'ADJUSTMENT':
        return {
          title: `${userName} adjusted ${qty} items (${activity.notes || 'audit reconciliation'})`,
          icon: SlidersHorizontal,
          color: 'text-indigo-600 bg-indigo-50'
        };
      default:
        return {
          title: `${userName} updated ${prodName}`,
          icon: Activity,
          color: 'text-blue-600 bg-blue-50'
        };
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
      header: 'Time',
      render: (val) => (
        <span className="text-[11px] text-gray-500 font-medium">
          {formatTimeAgo(val)}
        </span>
      ),
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Live Inventory Activity Feed</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time audit events from warehouse operations and order dispatches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Feed vs Table */}
          <div className="bg-gray-100 p-0.5 rounded-lg flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                viewMode === 'feed' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Feed
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Table
            </button>
          </div>

          <Link
            to="/move-history"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Ledger <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 bg-gray-50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          viewMode === 'feed' ? (
            <div className="space-y-2.5">
              {activities.slice(0, 6).map((activity, idx) => {
                const actionMeta = getOpActionText(activity);
                const IconComponent = actionMeta.icon;
                const timeAgo = formatTimeAgo(activity.timestamp || activity.createdAt);

                return (
                  <div
                    key={activity._id || idx}
                    className="p-3 rounded-xl bg-gray-50/60 hover:bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${actionMeta.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {actionMeta.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {activity.warehouse?.name || 'Main Warehouse'} &bull; Doc: <span className="font-mono">{activity.documentNumber || activity.referenceId || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap shrink-0">
                      {timeAgo}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table columns={columns} data={activities.slice(0, 6)} />
            </div>
          )
        ) : (
          <div className="p-8 text-center text-xs text-gray-400">
            No stock transactions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityTable;
