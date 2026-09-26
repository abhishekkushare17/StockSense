import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({
  title = 'Error',
  message,
  onDismiss,
  onRetry,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      className={`rounded-lg bg-red-50 p-4 border border-red-200 text-red-800 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="shrink-0">
          <AlertCircle className="h-5 h-5 text-red-500" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between items-center">
          <div>
            {title && <p className="text-sm font-semibold text-red-800">{title}</p>}
            <p className="text-sm text-red-700 mt-0.5">{message}</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 md:mt-0 text-xs font-semibold text-red-700 hover:text-red-900 underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
              aria-label="Dismiss error"
            >
              <X className="h-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
