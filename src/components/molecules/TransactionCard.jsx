import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

const TransactionCard = ({ 
  transaction, 
  category,
  onEdit, 
  onDelete,
  className = '' 
}) => {
  const cardHover = { scale: 1.02 };
  const isIncome = transaction.type === 'income';
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatRecurrence = (recurrence) => {
    if (recurrence === 'none') return 'One-time';
    return recurrence.charAt(0).toUpperCase() + recurrence.slice(1);
  };

  return (
    <motion.div
      whileHover={cardHover}
      className={`bg-white rounded-lg p-4 shadow-sm border border-surface-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div 
            className="w-1 h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: category?.color || '#64748b' }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-surface-900 truncate">
              {transaction.description}
            </h3>
            <p className="text-sm text-surface-600 mt-1">
              {format(new Date(transaction.date), 'MMM dd, yyyy')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge color={category?.color} size="sm">
                {category?.name || 'Uncategorized'}
              </Badge>
              <Badge variant="default" size="sm">
                {formatRecurrence(transaction.recurrence)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <p className={`font-semibold font-display text-lg ${
            isIncome ? 'text-accent' : 'text-red-500'
          }`}>
            {isIncome ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              icon="Edit2"
              onClick={() => onEdit(transaction)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon="Trash2"
              onClick={() => onDelete(transaction)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionCard;