import React from 'react';
import { Boxes } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
          <Boxes className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          StockSense
        </h1>
        <p className="mt-1 text-sm text-indigo-200">
          Centralized Real-Time Inventory Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-black/10 rounded-2xl sm:px-10 border border-gray-100">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>

        <p className="text-center text-xs text-indigo-300/70 mt-6">
          &copy; {new Date().getFullYear()} StockSense. Modular Architecture & Secure Core.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
