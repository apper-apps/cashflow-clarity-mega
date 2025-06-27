import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import transactionService from '@/services/api/transactionService';
import categoryService from '@/services/api/categoryService';

const TransactionModal = ({ isOpen, onClose, transaction = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    recurrence: 'none',
    recurrenceEnd: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allCategories = await categoryService.getAll();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    if (isOpen) {
      loadCategories();
      
      if (transaction) {
        setFormData({
          type: transaction.type,
          amount: transaction.amount.toString(),
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
          recurrence: transaction.recurrence,
          recurrenceEnd: transaction.recurrenceEnd || ''
        });
      }
    }
  }, [isOpen, transaction]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (formData.recurrence !== 'none' && formData.recurrenceEnd && formData.recurrenceEnd <= formData.date) {
      newErrors.recurrenceEnd = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        recurrenceEnd: formData.recurrenceEnd || null
      };

      if (transaction) {
        await transactionService.update(transaction.Id, transactionData);
        toast.success('Transaction updated successfully');
      } else {
        await transactionService.create(transactionData);
        toast.success('Transaction created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      recurrence: 'none',
      recurrenceEnd: ''
    });
    setErrors({});
    onClose();
  };

  const filteredCategories = categories
    .filter(cat => cat.type === formData.type)
    .map(cat => ({ value: cat.name.toLowerCase(), label: cat.name }));

  const recurrenceOptions = [
    { value: 'none', label: 'One-time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const backdropInitial = { opacity: 0 };
  const backdropAnimate = { opacity: 1 };
  const backdropExit = { opacity: 0 };

  const modalInitial = { opacity: 0, scale: 0.95 };
  const modalAnimate = { opacity: 1, scale: 1 };
  const modalExit = { opacity: 0, scale: 0.95 };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={backdropInitial}
            animate={backdropAnimate}
            exit={backdropExit}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={modalInitial}
            animate={modalAnimate}
            exit={modalExit}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-surface-900">
                    {transaction ? 'Edit Transaction' : 'Add Transaction'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="X"
                    onClick={handleClose}
                  />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={formData.type === 'income' ? 'accent' : 'outline'}
                      onClick={() => handleChange('type', 'income')}
                      icon="TrendingUp"
                      className="justify-center"
                    >
                      Income
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'expense' ? 'primary' : 'outline'}
                      onClick={() => handleChange('type', 'expense')}
                      icon="TrendingDown"
                      className="justify-center"
                    >
                      Expense
                    </Button>
                  </div>

                  <FormField
                    type="number"
                    label="Amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    error={errors.amount}
                    required
                    step="0.01"
                    min="0"
                    icon="DollarSign"
                  />

                  <FormField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    required
                    placeholder="e.g., Monthly rent payment"
                  />

                  <FormField
                    type="select"
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    error={errors.category}
                    required
                    options={filteredCategories}
                    placeholder="Select a category"
                  />

                  <FormField
                    type="date"
                    label="Date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    error={errors.date}
                    required
                  />

                  <FormField
                    type="select"
                    label="Recurrence"
                    name="recurrence"
                    value={formData.recurrence}
                    onChange={handleChange}
                    options={recurrenceOptions}
                  />

                  {formData.recurrence !== 'none' && (
                    <FormField
                      type="date"
                      label="End Date (Optional)"
                      name="recurrenceEnd"
                      value={formData.recurrenceEnd}
                      onChange={handleChange}
                      error={errors.recurrenceEnd}
                      placeholder="Leave blank for no end date"
                    />
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="flex-1"
                    >
                      {transaction ? 'Update' : 'Create'} Transaction
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;