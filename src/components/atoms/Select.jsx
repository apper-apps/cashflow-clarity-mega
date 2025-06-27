import { useState, forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = forwardRef(({ 
  label,
  options = [],
  error,
  className = '',
  required = false,
  placeholder = 'Select an option',
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value || props.defaultValue;

  const selectClasses = `
    w-full px-3 py-2.5 pr-10 border rounded-md transition-all duration-200 appearance-none bg-white
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    ${error ? 'border-red-500' : 'border-surface-300'}
    ${className}
  `;

  return (
    <div className="relative">
      {label && (
        <label className={`
          absolute left-3 transition-all duration-200 pointer-events-none z-10
          ${focused || hasValue 
            ? 'text-xs text-primary -top-2 bg-white px-1' 
            : 'text-sm text-surface-500 top-2.5'
          }
          ${error ? 'text-red-500' : ''}
        `}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        className={selectClasses}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <ApperIcon name="ChevronDown" className="w-4 h-4 text-surface-400" />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;