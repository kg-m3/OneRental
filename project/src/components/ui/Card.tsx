import React from 'react';

type CardProps = React.HTMLAttributes<HTMLElement> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
};

export function Card({ 
  title, 
  subtitle, 
  actions, 
  className = '', 
  children,
  isLoading = false,
  ...rest
}: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm transition-all ${className}`}
      {...rest}
    >
      {(title || actions || subtitle) && (
        <header className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className={`p-6 ${isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
