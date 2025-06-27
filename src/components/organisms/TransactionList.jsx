import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import transactionService from '@/services/api/transactionService';
import categoryService from '@/services/api/categoryService';
import TransactionCard from '@/components/molecules/TransactionCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const TransactionList = ({ onEdit, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleDelete = async (transaction) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionService.delete(transaction.Id);
      setTransactions(prev => prev.filter(t => t.Id !== transaction.Id));
      toast.success('Transaction deleted successfully');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const getCategoryForTransaction = (transaction) => {
    return categories.find(cat => 
      cat.name.toLowerCase() === transaction.category.toLowerCase() &&
      cat.type === transaction.type
    );
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const staggerItemInitial = { opacity: 0, y: 20 };
  const staggerItemAnimate = { opacity: 1, y: 0 };
  const getStaggerTransition = (index) => ({ delay: index * 0.1 });

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-900">Recent Transactions</h2>
          <div className="animate-pulse">
            <div className="h-9 bg-surface-200 rounded w-32"></div>
          </div>
        </div>
        <SkeletonLoader count={5} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
        <ErrorState 
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-surface-900">
          Recent Transactions
        </h2>
        <div className="flex items-center gap-2 text-sm text-surface-600">
          <ApperIcon name="List" className="w-4 h-4" />
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-3">
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Add your first income or expense to start tracking your cash flow"
            actionLabel="Add Transaction"
            onAction={() => {/* This will be handled by parent component */}}
            icon="CreditCard"
          />
        ) : (
          <AnimatePresence>
            {sortedTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.Id}
                initial={staggerItemInitial}
                animate={staggerItemAnimate}
                exit={{ opacity: 0, x: -20 }}
                transition={getStaggerTransition(index)}
                layout
              >
                <TransactionCard
                  transaction={transaction}
                  category={getCategoryForTransaction(transaction)}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {transactions.length > 5 && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          <Button
            variant="outline"
            className="w-full"
            icon="MoreHorizontal"
          >
            Load More Transactions
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionList;