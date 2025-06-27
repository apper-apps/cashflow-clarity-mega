import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { addDays, addMonths, parseISO, isBefore, isAfter, addWeeks, addYears } from 'date-fns';
import transactionService from '@/services/api/transactionService';
import StatCard from '@/components/molecules/StatCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';

const QuickStats = () => {
  const [stats, setStats] = useState({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    nextMonthBalance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const transactions = await transactionService.getAll();
        const today = new Date();
        const nextMonth = addMonths(today, 1);
        
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        let currentBalance = 0;

        // Calculate current balance and monthly totals
        transactions.forEach(transaction => {
          const transactionDate = parseISO(transaction.date);
          const amount = transaction.amount;
          const isIncome = transaction.type === 'income';
          
          // Calculate current balance (all past transactions)
          if (transaction.recurrence === 'none') {
            if (!isAfter(transactionDate, today)) {
              currentBalance += isIncome ? amount : -amount;
            }
          } else {
            let currentDate = transactionDate;
            while (isBefore(currentDate, today) || currentDate.toDateString() === today.toDateString()) {
              currentBalance += isIncome ? amount : -amount;
              
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
              
              if (transaction.recurrenceEnd && isAfter(currentDate, parseISO(transaction.recurrenceEnd))) {
                break;
              }
              if (currentDate.getFullYear() > today.getFullYear() + 1) {
                break;
              }
            }
          }

          // Calculate monthly recurring amounts
          if (transaction.recurrence === 'monthly') {
            if (isIncome) {
              monthlyIncome += amount;
            } else {
              monthlyExpenses += amount;
            }
          } else if (transaction.recurrence === 'weekly') {
            const monthlyAmount = amount * 4.33; // Average weeks per month
            if (isIncome) {
              monthlyIncome += monthlyAmount;
            } else {
              monthlyExpenses += monthlyAmount;
            }
          } else if (transaction.recurrence === 'biweekly') {
            const monthlyAmount = amount * 2.17; // Average bi-weeks per month
            if (isIncome) {
              monthlyIncome += monthlyAmount;
            } else {
              monthlyExpenses += monthlyAmount;
            }
          } else if (transaction.recurrence === 'yearly') {
            const monthlyAmount = amount / 12;
            if (isIncome) {
              monthlyIncome += monthlyAmount;
            } else {
              monthlyExpenses += monthlyAmount;
            }
          }
        });

        // Calculate next month's projected balance
        const nextMonthBalance = currentBalance + monthlyIncome - monthlyExpenses;

        setStats({
          monthlyIncome,
          monthlyExpenses,
          nextMonthBalance
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  if (loading) {
    return <SkeletonLoader count={3} type="stats" />;
  }

  const staggerItemInitial = { opacity: 0, y: 20 };
  const staggerItemAnimate = { opacity: 1, y: 0 };
  const getStaggerTransition = (index) => ({ delay: index * 0.1 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        initial={staggerItemInitial}
        animate={staggerItemAnimate}
        transition={getStaggerTransition(0)}
      >
        <StatCard
          title="Monthly Income"
          value={formatCurrency(stats.monthlyIncome)}
          icon="TrendingUp"
          color="accent"
          trend="up"
          trendValue="+12%"
        />
      </motion.div>
      
      <motion.div
        initial={staggerItemInitial}
        animate={staggerItemAnimate}
        transition={getStaggerTransition(1)}
      >
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(stats.monthlyExpenses)}
          icon="TrendingDown"
          color="error"
          trend="down"
          trendValue="-3%"
        />
      </motion.div>
      
      <motion.div
        initial={staggerItemInitial}
        animate={staggerItemAnimate}
        transition={getStaggerTransition(2)}
      >
        <StatCard
          title="Next Month Projection"
          value={formatCurrency(stats.nextMonthBalance)}
          icon="Calendar"
          color={stats.nextMonthBalance >= 0 ? 'accent' : 'error'}
          trend={stats.nextMonthBalance >= 0 ? 'up' : 'down'}
          trendValue={stats.nextMonthBalance >= 0 ? '+' : ''}
        />
      </motion.div>
    </div>
  );
};

export default QuickStats;