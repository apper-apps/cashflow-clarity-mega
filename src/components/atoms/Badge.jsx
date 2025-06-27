import { motion } from 'framer-motion';

const Badge = ({ 
  children, 
  variant = 'default',
  color,
  size = 'md',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-surface-100 text-surface-700',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  const customStyle = color ? {
    backgroundColor: `${color}20`,
    color: color
  } : {};

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        ${baseClasses}
        ${color ? '' : variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      style={customStyle}
    >
      {children}
    </motion.span>
  );
};

export default Badge;