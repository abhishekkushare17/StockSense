import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAME_MAP = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  stock: 'Stock Levels',
  warehouse: 'Warehouses',
  receipts: 'Inbound Receipts',
  deliveries: 'Delivery Orders',
  transfers: 'Internal Transfers',
  adjustments: 'Stock Adjustments',
  'move-history': 'Stock Ledger',
  ledger: 'Stock Ledger',
  analytics: 'Analytics',
  reports: 'Reports & Exports',
  scanner: 'Barcode Scanner',
  'audit-logs': 'Audit Logs',
  settings: 'System Settings',
  profile: 'User Profile'
};

const PARENT_GROUP_MAP = {
  receipts: 'Operations',
  deliveries: 'Operations',
  transfers: 'Operations',
  adjustments: 'Operations',
  scanner: 'Operations',
  'move-history': 'Auditing',
  ledger: 'Auditing',
  'audit-logs': 'Auditing',
  analytics: 'Intelligence',
  reports: 'Intelligence'
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If on root or login/signup/forgot, don't show or show simple
  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return (
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-1.5 text-indigo-600 font-semibold">
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </div>
      </nav>
    );
  }

  const currentSegment = pathnames[0];
  const groupName = PARENT_GROUP_MAP[currentSegment];
  const pageName = ROUTE_NAME_MAP[currentSegment] || currentSegment;

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex items-center text-xs text-gray-400 font-medium print:hidden">
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>

        {groupName && (
          <>
            <li className="text-gray-300">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-gray-400">
              <span>{groupName}</span>
            </li>
          </>
        )}

        <li className="text-gray-300">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li className="text-gray-900 font-semibold">
          <span aria-current="page">{pageName}</span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
