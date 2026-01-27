import React from 'react';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  fullWidth = false 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-math-blue text-white hover:bg-blue-600 focus:ring-math-blue shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
    success: "bg-math-green text-white hover:bg-green-600 focus:ring-math-green shadow-sm",
    danger: "bg-math-red text-white hover:bg-red-600 focus:ring-math-red shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};