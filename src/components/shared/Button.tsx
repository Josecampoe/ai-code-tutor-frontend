import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  size?: 'sm' | 'md';
}

const variantMap = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-[#2a2a3e] hover:bg-[#32324a] text-gray-200 border border-[#3a3a5c]',
  ghost: 'hover:bg-[#2a2a3e] text-gray-400 hover:text-gray-200',
};

const sizeMap = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };

export function Button({ children, variant = 'primary', loading = false, size = 'md', className = '', disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantMap[variant]} ${sizeMap[size]} ${className}`}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
