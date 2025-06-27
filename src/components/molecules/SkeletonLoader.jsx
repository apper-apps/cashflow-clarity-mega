import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const shimmer = {
    backgroundColor: ['#f1f5f9', '#e2e8f0', '#f1f5f9'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }
  };

  if (type === 'card') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-surface-200"
          >
            <div className="animate-pulse flex items-start gap-3">
              <motion.div 
                animate={shimmer}
                className="w-1 h-12 rounded-full bg-surface-200"
              />
              <div className="flex-1 space-y-3">
                <motion.div 
                  animate={shimmer}
                  className="h-4 bg-surface-200 rounded w-3/4"
                />
                <motion.div 
                  animate={shimmer}
                  className="h-3 bg-surface-200 rounded w-1/2"
                />
                <div className="flex gap-2">
                  <motion.div 
                    animate={shimmer}
                    className="h-6 bg-surface-200 rounded-full w-16"
                  />
                  <motion.div 
                    animate={shimmer}
                    className="h-6 bg-surface-200 rounded-full w-20"
                  />
                </div>
              </div>
              <motion.div 
                animate={shimmer}
                className="h-6 bg-surface-200 rounded w-20"
              />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
          >
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  animate={shimmer}
                  className="w-10 h-10 bg-surface-200 rounded-lg"
                />
                <motion.div 
                  animate={shimmer}
                  className="h-4 bg-surface-200 rounded w-12"
                />
              </div>
              <motion.div 
                animate={shimmer}
                className="h-8 bg-surface-200 rounded w-24 mb-2"
              />
              <motion.div 
                animate={shimmer}
                className="h-4 bg-surface-200 rounded w-32"
              />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-4">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          animate={shimmer}
          className="h-20 bg-surface-200 rounded-lg"
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;