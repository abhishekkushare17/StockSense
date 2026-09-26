import React from 'react';
import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export const Loading = ({
  type = 'spinner',
  size = 'md',
  message,
  className = '',
  lines = 3,
}) => {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`} role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${Math.max(40, 100 - idx * 18)}%` }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (type === 'screen') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center" role="status">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        {message && <p className="text-sm font-medium text-gray-600">{message}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 text-gray-600 ${className}`} role="status">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} text-indigo-600 animate-spin shrink-0`} />
      {message && <span className="text-sm font-medium">{message}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
