import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Badge, Button } from '../components/common';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [savedNotice, setSavedNotice] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice('System preferences updated successfully.');
    setTimeout(() => setSavedNotice(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600" />
          System Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configure notification thresholds, facility defaults, and platform parameters.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Inventory Guardrails */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Inventory Safeguards</h2>
              <p className="text-xs text-gray-500">Business rules for order validations</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Strict Negative Stock Guard (Enforced by Backend)
                </span>
                <span className="text-[11px] text-gray-500">
                  Prevents delivery validation if requested quantity exceeds current available stock.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Automated Low Stock Threshold Alerts
                </span>
                <span className="text-[11px] text-gray-500">
                  Highlight items in the top navbar and dashboard when inventory drops &le; reorder point.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* User Session Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Active Tenant & Session</h2>
              <p className="text-xs text-gray-500">Signed-in profile credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 block">Account:</span>
              <span className="font-semibold text-gray-900">{user?.name} ({user?.email})</span>
            </div>
            <div>
              <span className="text-gray-500 block">Role Access:</span>
              <Badge variant="purple" size="sm" dot>{user?.role}</Badge>
            </div>
            <div>
              <span className="text-gray-500 block">Default Warehouse:</span>
              <span className="font-semibold text-gray-900">Central Distribution Hub (WH-CENTRAL-01)</span>
            </div>
            <div>
              <span className="text-gray-500 block">API Environment:</span>
              <span className="font-semibold text-emerald-600">Online &bull; Production</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
