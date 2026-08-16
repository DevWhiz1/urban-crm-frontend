import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle, Search, X } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  required = false,
  options,
  placeholder = "Select an option",
  className = '',
  value,
  onChange,
  disabled,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(option =>
    option.value !== '' && option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={label ? "space-y-2" : ""} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          className={`
            w-full px-4 py-3 border border-gray-300 rounded-lg
            flex items-center justify-between cursor-pointer bg-white transition-colors duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:border-gray-400'}
            ${error ? 'border-red-300' : ''}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
            ${className}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
            size={20}
          />
        </div>

        {/* Hidden select for native form integration and props spreading */}
        <select 
          className="hidden" 
          value={value} 
          onChange={onChange} 
          disabled={disabled}
          required={required}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {searchTerm && (
                <button
                   onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              <div
                className={`px-4 py-2.5 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${!value ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700'}`}
                onClick={() => {
                   if (onChange) {
                     const event = {
                       target: { value: '', name: props.name }
                     } as React.ChangeEvent<HTMLSelectElement>;
                     onChange(event);
                   }
                   setIsOpen(false);
                   setSearchTerm('');
                }}
              >
                {placeholder}
              </div>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-4 py-2.5 cursor-pointer text-sm hover:bg-blue-50 transition-colors
                      ${option.value === value ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700'}
                    `}
                    onClick={() => {
                      if (onChange) {
                        const event = {
                          target: { value: option.value, name: props.name }
                        } as React.ChangeEvent<HTMLSelectElement>;
                        onChange(event);
                      }
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options found
                </div>
              )}
            </div>
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