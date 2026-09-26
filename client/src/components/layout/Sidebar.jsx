import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Boxes,
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  ClipboardList,
  Truck,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  Settings,
  User,
  LogOut,
  ChevronDown,
  X,
  Shield,
  BarChart2,
  FileSpreadsheet,
  ScrollText
} from 'lucide-react';
import { ROLES } from '../../utils/constants';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Keep Operations group open if current route is within operations
  const isOperationsActive = [
    '/receipts',
    '/deliveries',
    '/transfers',
    '/adjustments',
    '/move-history'
  ].some((path) => location.pathname.startsWith(path));

  const [operationsOpen, setOperationsOpen] = useState(true);

  // Close sidebar on route change on mobile
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isInventoryManager = user?.role === ROLES.INVENTORY_MANAGER;

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-gray-200 w-64 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-gray-900 tracking-tight block leading-tight">
                StockSense
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                Inventory OS
              </span>
            </div>
          </NavLink>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {/* Main Group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Overview
            </p>
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/products" className={navItemClass}>
              <Package className="w-4 h-4 shrink-0" />
              <span>Products</span>
            </NavLink>
            <NavLink to="/categories" className={navItemClass}>
              <Layers className="w-4 h-4 shrink-0" />
              <span>Categories</span>
            </NavLink>
            <NavLink to="/warehouse" className={navItemClass}>
              <Warehouse className="w-4 h-4 shrink-0" />
              <span>Warehouse</span>
            </NavLink>
            <NavLink to="/stock" className={navItemClass}>
              <Boxes className="w-4 h-4 shrink-0" />
              <span>Stock Levels</span>
            </NavLink>
          </div>

          {/* Operations Group (Expandable) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              <span>Operations</span>
              <button
                type="button"
                onClick={() => setOperationsOpen(!operationsOpen)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Toggle operations menu"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    operationsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {operationsOpen && (
              <div className="space-y-1 pl-2 border-l border-gray-100 ml-3">
                <NavLink to="/receipts" className={subNavItemClass}>
                  <ClipboardList className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Receipts</span>
                </NavLink>
                <NavLink to="/deliveries" className={subNavItemClass}>
                  <Truck className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                  <span>Deliveries</span>
                </NavLink>
                <NavLink to="/transfers" className={subNavItemClass}>
                  <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Internal Transfers</span>
                </NavLink>
                <NavLink to="/adjustments" className={subNavItemClass}>
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                  <span>Adjustments</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Intelligence & Audit Group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Auditing & Reports
            </p>
            <NavLink to="/move-history" className={navItemClass}>
              <ScrollText className="w-4 h-4 shrink-0" />
              <span>Stock Ledger</span>
            </NavLink>
            <NavLink to="/analytics" className={navItemClass}>
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span>Analytics</span>
            </NavLink>
            <NavLink to="/reports" className={navItemClass}>
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Reports</span>
            </NavLink>
          </div>

          {/* System & Profile Group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              System
            </p>
            <NavLink to="/settings" className={navItemClass}>
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </NavLink>
            <NavLink to="/profile" className={navItemClass}>
              <User className="w-4 h-4 shrink-0" />
              <span>My Profile</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* User Footer Card & Logout */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              {(user?.name || 'U')[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                {user?.name || 'Staff User'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-indigo-500" />
                <span className="text-[10px] font-medium text-gray-500 truncate">
                  {user?.role || 'Staff'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Sliding Drawer with Backdrop Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
