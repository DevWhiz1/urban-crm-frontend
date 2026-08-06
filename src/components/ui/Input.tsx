import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  required = false, 
  className = '', 
  type,
  value,
  icon,
  rightElement,
  ...props 
}) => {
  let formattedValue = value;
  if (type === 'date' && typeof value === 'string' && value) {
    if (value.includes('T')) {
      formattedValue = value.split('T')[0];
    } else if (value.length > 10 && !isNaN(Date.parse(value))) {
      try {
        formattedValue = new Date(value).toISOString().split('T')[0];
      } catch (e) {
        // fallback
      }
    }
  }

  return (
    <div className={label ? "space-y-2" : ""}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative group w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10 flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={formattedValue}
          className={`
            w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            placeholder-gray-400 transition-colors duration-200
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${icon ? 'pl-12' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};