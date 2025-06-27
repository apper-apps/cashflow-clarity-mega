import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import scenarioService from '@/services/api/scenarioService';

const ScenarioComparisonPanel = ({ onScenariosChange }) => {
  const [scenarios, setScenarios] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initialize with default scenario
    const defaultScenario = {
      Id: 1,
      name: 'Current Forecast',
      incomeMultiplier: 1.0,
      expenseMultiplier: 1.0,
      color: '#0891b2',
      isDefault: true
    };
    setScenarios([defaultScenario]);
    onScenariosChange([defaultScenario]);
  }, [onScenariosChange]);

  const addScenario = () => {
    const newScenario = {
      Id: Date.now(), // Simple ID generation for scenarios
      name: `Scenario ${scenarios.length}`,
      incomeMultiplier: 1.0,
      expenseMultiplier: 1.0,
      color: getScenarioColor(scenarios.length),
      isDefault: false
    };
    
    const updatedScenarios = [...scenarios, newScenario];
    setScenarios(updatedScenarios);
    onScenariosChange(updatedScenarios);
  };

  const removeScenario = (scenarioId) => {
    const updatedScenarios = scenarios.filter(s => s.Id !== scenarioId);
    setScenarios(updatedScenarios);
    onScenariosChange(updatedScenarios);
  };

  const updateScenario = (scenarioId, field, value) => {
    const updatedScenarios = scenarios.map(scenario => 
      scenario.Id === scenarioId 
        ? { ...scenario, [field]: value }
        : scenario
    );
    setScenarios(updatedScenarios);
    onScenariosChange(updatedScenarios);
  };

  const getScenarioColor = (index) => {
    const colors = ['#0891b2', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0d9488'];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-surface-900">
          Scenario Comparison
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon="Plus"
            onClick={addScenario}
            disabled={scenarios.length >= 5}
          >
            Add Scenario
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={isExpanded ? "ChevronUp" : "ChevronDown"}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {scenarios.map((scenario) => (
            <div
              key={scenario.Id}
              className="p-4 border border-surface-200 rounded-lg space-y-3"
              style={{ borderLeftColor: scenario.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                  <Input
                    value={scenario.name}
                    onChange={(e) => updateScenario(scenario.Id, 'name', e.target.value)}
                    className="font-medium text-surface-900 border-none bg-transparent p-0 focus:ring-0"
                    placeholder="Scenario name"
                  />
                </div>
                {!scenario.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="X"
                    onClick={() => removeScenario(scenario.Id)}
                    className="text-red-500 hover:text-red-700"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Income Adjustment
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={scenario.incomeMultiplier}
                      onChange={(e) => updateScenario(scenario.Id, 'incomeMultiplier', parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${scenario.color} 0%, ${scenario.color} ${(scenario.incomeMultiplier - 0.5) / 1.5 * 100}%, #e2e8f0 ${(scenario.incomeMultiplier - 0.5) / 1.5 * 100}%, #e2e8f0 100%)`
                      }}
                    />
                    <span className="text-sm font-medium text-surface-900 min-w-[60px]">
                      {(scenario.incomeMultiplier * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Expense Adjustment
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={scenario.expenseMultiplier}
                      onChange={(e) => updateScenario(scenario.Id, 'expenseMultiplier', parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${scenario.color} 0%, ${scenario.color} ${(scenario.expenseMultiplier - 0.5) / 1.5 * 100}%, #e2e8f0 ${(scenario.expenseMultiplier - 0.5) / 1.5 * 100}%, #e2e8f0 100%)`
                      }}
                    />
                    <span className="text-sm font-medium text-surface-900 min-w-[60px]">
                      {(scenario.expenseMultiplier * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-surface-600">
                Income: {scenario.incomeMultiplier === 1 ? 'No change' : 
                  scenario.incomeMultiplier > 1 ? 
                    `+${((scenario.incomeMultiplier - 1) * 100).toFixed(0)}% increase` : 
                    `-${((1 - scenario.incomeMultiplier) * 100).toFixed(0)}% decrease`}
                {' • '}
                Expenses: {scenario.expenseMultiplier === 1 ? 'No change' : 
                  scenario.expenseMultiplier > 1 ? 
                    `+${((scenario.expenseMultiplier - 1) * 100).toFixed(0)}% increase` : 
                    `-${((1 - scenario.expenseMultiplier) * 100).toFixed(0)}% decrease`}
              </div>
            </div>
          ))}

          {scenarios.length >= 5 && (
            <div className="text-sm text-surface-600 bg-surface-50 p-3 rounded-lg">
              <ApperIcon name="Info" size={16} className="inline mr-2" />
              Maximum of 5 scenarios can be compared at once for optimal readability.
            </div>
          )}
        </motion.div>
      )}

      {!isExpanded && scenarios.length > 1 && (
        <div className="flex items-center gap-2 text-sm text-surface-600">
          <ApperIcon name="BarChart3" size={16} />
          {scenarios.length} scenarios active
        </div>
      )}
    </motion.div>
  );
};

export default ScenarioComparisonPanel;