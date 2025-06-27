import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  message = 'Something went wrong',
  onRetry,
  className = '' 
}) => {
  const iconBounce = {
    y: [0, -10, 0],
    transition: { repeat: Infinity, duration: 2 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <motion.div animate={iconBounce}>
        <ApperIcon name="AlertCircle" className="w-16 h-16 text-red-400 mx-auto" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium text-surface-900">
        Oops! Something went wrong
      </h3>
      <p className="mt-2 text-surface-600">{message}</p>
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button 
            onClick={onRetry}
            icon="RefreshCw"
            variant="outline"
          >
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ErrorState;