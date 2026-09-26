import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Badge, Button } from '../components/common';
import { Boxes, LayoutDashboard, UserCircle, LogOut } from 'lucide-react';
import { ROLES } from '../utils/constants';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isInventoryManager = user?.role === ROLES.INVENTORY_MANAGER;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 tracking-tight block leading-tight">
                    StockSense
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 block">
                    Core Platform
                  </span>
                </div>
              </Link>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex space-x-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User profile & actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">
                  {user?.name || 'User'}
                </span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>

              {user?.role && (
                <Badge
                  variant={isInventoryManager ? 'purple' : 'info'}
                  size="md"
                  dot
                >
                  {user.role}
                </Badge>
              )}

              <div className="h-6 w-px bg-gray-200" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={LogOut}
                className="text-gray-600 hover:text-red-600"
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <span>
            StockSense Inventory Management System &bull; Lead Core Foundation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            System Status: Healthy & Ready for Modules
          </span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
