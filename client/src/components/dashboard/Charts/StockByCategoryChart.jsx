import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'];

export const StockByCategoryChart = ({ data = [], isLoading = false }) => {
  // If data is empty, show clean empty state
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <PieIcon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Stock by Category</h3>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">Category Breakdown</span>
      </div>

      <div className="h-64 w-full flex items-center justify-center">
        {isLoading ? (
          <div className="text-xs text-gray-400">Loading chart data...</div>
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} units`, name]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-xs text-gray-400">
            No category inventory recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StockByCategoryChart;
