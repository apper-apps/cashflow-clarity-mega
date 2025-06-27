import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  title = 'No data found',
  description = 'Get started by adding your first item',
  actionLabel = 'Add Item',
  onAction,
  icon = 'Package',
  className = '' 
}) => {
  const iconFloat = {
    y: [0, -8, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
  };

  const buttonHover = { scale: 1.05 };
  const buttonTap = { scale: 0.95 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <motion.div animate={iconFloat}>
        <ApperIcon name={icon} className="w-16 h-16 text-surface-300 mx-auto" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium text-surface-900">{title}</h3>
      <p className="mt-2 text-surface-600 max-w-sm mx-auto">{description}</p>
      {onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Button onClick={onAction} variant="accent">
              {actionLabel}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;