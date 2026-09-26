import React from 'react';

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
  neutral: 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/10',
  purple: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
};

const dotStyles = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-gray-400',
  purple: 'bg-indigo-500',
};

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClass} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant] || dotStyles.neutral}`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
