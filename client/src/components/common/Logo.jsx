import React from 'react';

export const Logo = ({
  size = 'md',
  showText = true,
  subtitle = 'Inventory OS',
  lightText = false,
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Flight Bird Brand Icon */}
      <div
        className={`${sizeMap[size] || sizeMap.md} overflow-hidden bg-[#cecfd2] border border-slate-300/90 shadow-xs flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
      >
        <img
          src="/logo.png"
          alt="StockSense Flight Bird Logo"
          className="w-full h-full object-cover select-none"
          loading="eager"
        />
      </div>

      {showText && (
        <div className="min-w-0">
          <span
            className={`text-base font-black tracking-tight block leading-tight ${
              lightText ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}
          >
            StockSense
          </span>
          {subtitle && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block ${
                lightText ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
