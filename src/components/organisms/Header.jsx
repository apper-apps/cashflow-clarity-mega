import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import transactionService from '@/services/api/transactionService';
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, parseISO } from 'date-fns';

const Header = () => {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateCurrentBalance = async () => {
      try {
        const transactions = await transactionService.getAll();
        const today = new Date();
        let balance = 0;

        // Calculate balance from all past and current transactions
        transactions.forEach(transaction => {
          const transactionDate = parseISO(transaction.date);
          
          if (transaction.recurrence === 'none') {
            // One-time transaction
            if (!isAfter(transactionDate, today)) {
              balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
            }
          } else {
            // Recurring transaction - count all occurrences up to today
            let currentDate = transactionDate;
            while (isBefore(currentDate, today) || currentDate.toDateString() === today.toDateString()) {
              balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
              
              // Calculate next occurrence
              switch (transaction.recurrence) {
                case 'daily':
                  currentDate = addDays(currentDate, 1);
                  break;
                case 'weekly':
                  currentDate = addWeeks(currentDate, 1);
                  break;
                case 'biweekly':
                  currentDate = addWeeks(currentDate, 2);
                  break;
                case 'monthly':
                  currentDate = addMonths(currentDate, 1);
                  break;
                case 'yearly':
                  currentDate = addYears(currentDate, 1);
                  break;
                default:
                  break;
              }
              
              // Prevent infinite loop
              if (transaction.recurrenceEnd && isAfter(currentDate, parseISO(transaction.recurrenceEnd))) {
                break;
              }
              if (currentDate.getFullYear() > today.getFullYear() + 1) {
                break;
              }
            }
          }
        });

        setCurrentBalance(balance);
      } catch (error) {
        console.error('Error calculating balance:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateCurrentBalance();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const balanceColor = currentBalance >= 0 ? 'text-accent' : 'text-red-500';

  return (
    <header className="bg-white border-b border-surface-200 px-6 py-4 flex-shrink-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <ApperIcon name="BarChart3" className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-xl font-heading font-semibold text-surface-900">
              CashFlow Clarity
            </h1>
            <p className="text-sm text-surface-600">
              Predict your financial future
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-surface-600 mb-1">Current Balance</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-surface-200 rounded w-24"></div>
            </div>
          ) : (
            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-2xl font-display font-semibold ${balanceColor}`}
            >
              {formatCurrency(currentBalance)}
            </motion.p>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;