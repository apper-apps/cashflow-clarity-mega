import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const NotFound = () => {
  const navigate = useNavigate();

  const iconFloat = {
    y: [0, -10, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div animate={iconFloat} className="mb-8">
          <ApperIcon name="AlertTriangle" className="w-24 h-24 text-surface-300 mx-auto" />
        </motion.div>
        
        <h1 className="text-4xl font-heading font-bold text-surface-900 mb-4">
          404
        </h1>
        <h2 className="text-xl font-semibold text-surface-700 mb-2">
          Page Not Found
        </h2>
        <p className="text-surface-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="primary"
            icon="Home"
            onClick={() => navigate('/')}
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;