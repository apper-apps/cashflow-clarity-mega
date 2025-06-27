import { useState, forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({ 
  label,
  type = 'text',
  error,
  icon,
  iconPosition = 'left',
  className = '',
  required = false,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value || props.defaultValue;

  const inputClasses = `
    w-full px-3 py-2.5 border rounded-md transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    ${error ? 'border-red-500' : 'border-surface-300'}
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `;

  return (
    <div className="relative">
      {label && (
        <label className={`
          absolute left-3 transition-all duration-200 pointer-events-none
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
      
      {icon && iconPosition === 'left' && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <ApperIcon name={icon} className="w-4 h-4 text-surface-400" />
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      
      {icon && iconPosition === 'right' && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <ApperIcon name={icon} className="w-4 h-4 text-surface-400" />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;