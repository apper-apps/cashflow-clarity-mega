import { addDays, addWeeks, addMonths, addYears, format, parseISO, isBefore, isAfter } from 'date-fns';
import transactionService from './transactionService';

// Delay utility to match existing service patterns
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scenarioService = {
  async calculateScenarioForecast(scenario, dateRange = 30) {
    await delay(200); // Match existing service delay patterns
    
    try {
      const transactions = await transactionService.getAll();
      const startDate = new Date();
      const endDate = addDays(startDate, dateRange);
      
      // Calculate initial balance (same as original forecast)
      let currentBalance = 0;
      transactions.forEach(transaction => {
        const transactionDate = parseISO(transaction.date);
        
        if (transaction.recurrence === 'none') {
          if (!isAfter(transactionDate, startDate)) {
            const amount = transaction.type === 'income' 
              ? transaction.amount * scenario.incomeMultiplier
              : transaction.amount * scenario.expenseMultiplier;
            currentBalance += transaction.type === 'income' ? amount : -amount;
          }
        } else {
          let currentDate = transactionDate;
          while (isBefore(currentDate, startDate) || currentDate.toDateString() === startDate.toDateString()) {
            const amount = transaction.type === 'income' 
              ? transaction.amount * scenario.incomeMultiplier
              : transaction.amount * scenario.expenseMultiplier;
            currentBalance += transaction.type === 'income' ? amount : -amount;
            
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
            if (currentDate.getFullYear() > startDate.getFullYear() + 2) {
              break;
            }
          }
        }
      });

      // Generate daily forecast with scenario adjustments
      const forecastData = [];
      let runningBalance = currentBalance;
      
      for (let i = 0; i <= dateRange; i++) {
        const currentDate = addDays(startDate, i);
        let dailyChange = 0;
        
        // Check for transactions on this date with scenario multipliers
        transactions.forEach(transaction => {
          const transactionDate = parseISO(transaction.date);
          
          if (transaction.recurrence === 'none') {
            if (currentDate.toDateString() === transactionDate.toDateString()) {
              const amount = transaction.type === 'income' 
                ? transaction.amount * scenario.incomeMultiplier
                : transaction.amount * scenario.expenseMultiplier;
              dailyChange += transaction.type === 'income' ? amount : -amount;
            }
          } else {
            // Check if this is a recurring occurrence
            let checkDate = transactionDate;
            while (isBefore(checkDate, addDays(currentDate, 1))) {
              if (checkDate.toDateString() === currentDate.toDateString()) {
                const amount = transaction.type === 'income' 
                  ? transaction.amount * scenario.incomeMultiplier
                  : transaction.amount * scenario.expenseMultiplier;
                dailyChange += transaction.type === 'income' ? amount : -amount;
                break;
              }
              
              switch (transaction.recurrence) {
                case 'daily':
                  checkDate = addDays(checkDate, 1);
                  break;
                case 'weekly':
                  checkDate = addWeeks(checkDate, 1);
                  break;
                case 'biweekly':
                  checkDate = addWeeks(checkDate, 2);
                  break;
                case 'monthly':
                  checkDate = addMonths(checkDate, 1);
                  break;
                case 'yearly':
                  checkDate = addYears(checkDate, 1);
                  break;
                default:
                  checkDate = addDays(checkDate, 365); // Break the loop
                  break;
              }
              
              if (transaction.recurrenceEnd && isAfter(checkDate, parseISO(transaction.recurrenceEnd))) {
                break;
              }
              if (checkDate.getFullYear() > currentDate.getFullYear() + 1) {
                break;
              }
            }
          }
        });
        
        runningBalance += dailyChange;
        forecastData.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          balance: runningBalance,
          change: dailyChange,
          scenarioId: scenario.Id,
          scenarioName: scenario.name
        });
      }
      
      return forecastData;
    } catch (error) {
      throw new Error(`Failed to calculate scenario forecast: ${error.message}`);
    }
  },

  async calculateMultipleScenarios(scenarios, dateRange = 30) {
    await delay(100);
    
    try {
      const results = {};
      
      for (const scenario of scenarios) {
        const forecastData = await this.calculateScenarioForecast(scenario, dateRange);
        results[scenario.Id] = {
          scenario: scenario,
          data: forecastData
        };
      }
      
      return results;
    } catch (error) {
      throw new Error(`Failed to calculate multiple scenarios: ${error.message}`);
    }
  }
};

export default scenarioService;