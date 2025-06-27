import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendValue,
  color = 'primary',
  className = '' 
}) => {
  const cardHover = { y: -2 };
  
  const colors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-surface-500'
  };

  return (
    <motion.div
      whileHover={cardHover}
      className={`bg-white rounded-lg p-6 shadow-sm border border-surface-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-surface-50 ${colors[color]}`}>
          <ApperIcon name={icon} className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trendColors[trend]}`}>
            <ApperIcon 
              name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
              className="w-4 h-4 mr-1" 
            />
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-semibold text-surface-900 mb-1">
          {value}
        </p>
        <p className="text-sm text-surface-600">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;