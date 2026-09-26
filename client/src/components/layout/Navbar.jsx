import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../common';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Warehouse,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ROLES } from '../../utils/constants';

export const Navbar = ({ onOpenSidebar, unreadAlerts = 0, lowStockItems = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isInventoryManager = user?.role === ROLES.INVENTORY_MANAGER;
  const userInitials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Button & Brand / Breadcrumb */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search */}
          <div className="hidden sm:flex items-center relative max-w-xs md:max-w-sm w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, operations, SKU..."
              className="w-64 md:w-80 pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Right Section: Warehouse Info, Notifications & Profile Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Active Facility Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 border border-gray-200/80">
            <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
            <span>Facility:</span>
            <span className="text-gray-900 font-semibold">Central Hub</span>
          </div>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </button>

            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Inventory Alerts
                    </span>
                    {unreadAlerts > 0 && (
                      <Badge variant="danger" size="sm">
                        {unreadAlerts} Action Required
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">Live Feed</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3"
                      >
                        <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {item.product?.name || item.name || 'Low Stock Item'}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            SKU: <span className="font-mono text-gray-700">{item.product?.sku || item.sku || 'N/A'}</span> &bull; Current: <span className="font-semibold text-rose-600">{item.quantity ?? 0}</span> (Reorder: {item.product?.reorderLevel ?? item.reorderLevel ?? 0})
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-gray-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      <p className="font-medium text-gray-700">All stock levels healthy</p>
                      <p className="text-gray-400 mt-0.5">No critical inventory deficits detected.</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                  <Link
                    to="/products"
                    onClick={() => setNotificationDropdownOpen(false)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                  >
                    View All Stock Levels <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-hidden"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitials}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  {user?.role || 'Staff'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-fadeIn">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  <div className="mt-1.5">
                    <Badge variant={isInventoryManager ? 'purple' : 'info'} size="sm" dot>
                      {user?.role}
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    System Settings
                  </Link>
                </div>

                <div className="pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
