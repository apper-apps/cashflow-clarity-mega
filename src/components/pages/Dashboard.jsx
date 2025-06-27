import { useState } from 'react';
import { motion } from 'framer-motion';
import CashFlowChart from '@/components/organisms/CashFlowChart';
import TransactionList from '@/components/organisms/TransactionList';
import QuickStats from '@/components/organisms/QuickStats';
import TransactionModal from '@/components/organisms/TransactionModal';
import ScenarioComparisonPanel from '@/components/organisms/ScenarioComparisonPanel';
import Button from '@/components/atoms/Button';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scenarios, setScenarios] = useState([]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleModalSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
};

  const handleScenariosChange = (updatedScenarios) => {
    setScenarios(updatedScenarios);
  };

  const pageInitial = { opacity: 0, x: 20 };
  const pageAnimate = { opacity: 1, x: 0 };
  const pageTransitionConfig = { duration: 0.3 };
  return (
    <motion.div
      initial={pageInitial}
      animate={pageAnimate}
      transition={pageTransitionConfig}
      className="main-content p-6 space-y-8"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-surface-900">
            Financial Dashboard
          </h1>
          <p className="text-surface-600 mt-1">
            Track your cash flow and predict your financial future
          </p>
        </div>
        <Button
          variant="accent"
          icon="Plus"
          onClick={() => setIsModalOpen(true)}
          className="shadow-lg"
        >
          Add Transaction
        </Button>
      </div>

      {/* Quick Stats */}
      <QuickStats />

{/* Scenario Comparison Panel */}
      <ScenarioComparisonPanel onScenariosChange={handleScenariosChange} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2">
          <CashFlowChart scenarios={scenarios} />
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-1">
          <TransactionList
            onEdit={handleEditTransaction}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transaction={editingTransaction}
        onSuccess={handleModalSuccess}
      />
    </motion.div>
  );
};

export default Dashboard;