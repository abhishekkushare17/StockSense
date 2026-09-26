import React from 'react';
import { Logo } from '../components/common';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f16] via-[#151f2d] to-[#0a0f16] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#cecfd2] border border-slate-300/80 shadow-2xl shadow-black/40 flex items-center justify-center transition-transform hover:scale-105 duration-200">
            <img
              src="/logo.png"
              alt="StockSense Flight Bird Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          StockSense
        </h1>
        <p className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Intelligent Inventory Operating System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl shadow-black/20 rounded-2xl sm:px-10 border border-slate-200/90">
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

        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} StockSense. Precision Intelligence & Modular Core.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
