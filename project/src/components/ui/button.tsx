import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'default';
  size?: 'icon' | 'default';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    let base = 'inline-flex items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-primary-400';
    if (variant === 'ghost') base += ' bg-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60';
    if (size === 'icon') base += ' w-9 h-9 p-0';
    else base += ' px-4 py-2';
    return (
      <button ref={ref} className={`${base} ${className}`} {...props} />
    );
  }
);
Button.displayName = 'Button';
