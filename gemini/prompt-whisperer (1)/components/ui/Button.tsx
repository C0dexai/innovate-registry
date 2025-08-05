import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:pointer-events-none';

  const variantStyles = {
    primary: 'bg-fuchsia-500 text-black hover:bg-fuchsia-400 focus:ring-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.5)] hover:shadow-[0_0_20px_rgba(217,70,239,0.7)]',
    secondary: 'bg-transparent border border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] focus:ring-fuchsia-500',
    ghost: 'bg-transparent text-fuchsia-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-200 focus:ring-fuchsia-500',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {leftIcon && <span className={`mr-2 ${iconSize[size]}`}>{leftIcon}</span>}
      {children}
    </button>
  );
};