import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { addDays, addWeeks, addMonths, addYears, format, parseISO, isBefore, isAfter } from 'date-fns';
import transactionService from '@/services/api/transactionService';
import Button from '@/components/atoms/Button';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';

const CashFlowChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30); // days

  useEffect(() => {
    const generateForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const transactions = await transactionService.getAll();
        const startDate = new Date();
        const endDate = addDays(startDate, dateRange);
        
        // Calculate initial balance
        let currentBalance = 0;
        transactions.forEach(transaction => {
          const transactionDate = parseISO(transaction.date);
          
          if (transaction.recurrence === 'none') {
            if (!isAfter(transactionDate, startDate)) {
              currentBalance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
            }
          } else {
            let currentDate = transactionDate;
            while (isBefore(currentDate, startDate) || currentDate.toDateString() === startDate.toDateString()) {
              currentBalance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
              
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

        // Generate daily forecast
        const forecastData = [];
        let runningBalance = currentBalance;
        
        for (let i = 0; i <= dateRange; i++) {
          const currentDate = addDays(startDate, i);
          let dailyChange = 0;
          
          // Check for transactions on this date
          transactions.forEach(transaction => {
            const transactionDate = parseISO(transaction.date);
            
            if (transaction.recurrence === 'none') {
              if (currentDate.toDateString() === transactionDate.toDateString()) {
                dailyChange += transaction.type === 'income' ? transaction.amount : -transaction.amount;
              }
            } else {
              // Check if this is a recurring occurrence
              let checkDate = transactionDate;
              while (isBefore(checkDate, addDays(currentDate, 1))) {
                if (checkDate.toDateString() === currentDate.toDateString()) {
                  dailyChange += transaction.type === 'income' ? transaction.amount : -transaction.amount;
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
            change: dailyChange
          });
        }
        
        setChartData(forecastData);
      } catch (err) {
        setError(err.message || 'Failed to generate forecast');
      } finally {
        setLoading(false);
      }
    };

    generateForecast();
  }, [dateRange]);

  const chartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#0891b2']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: '#0891b2', opacity: 0.3 },
          { offset: 100, color: '#0891b2', opacity: 0.1 }
        ]
      }
    },
    grid: {
      show: true,
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    xaxis: {
      categories: chartData.map(d => format(parseISO(d.date), 'MMM dd')),
      labels: {
        style: { colors: '#64748b', fontSize: '12px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontSize: '12px' },
        formatter: (value) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact'
          }).format(value);
        }
      }
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const data = chartData[dataPointIndex];
        const balance = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(data.balance);
        
        const change = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(data.change);
        
        return `
          <div class="bg-white p-3 shadow-lg rounded-lg border">
            <div class="font-medium">${format(parseISO(data.date), 'MMM dd, yyyy')}</div>
            <div class="text-sm mt-1">
              <div>Balance: <span class="font-semibold">${balance}</span></div>
              <div>Change: <span class="font-semibold ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}">${change}</span></div>
            </div>
          </div>
        `;
      }
    },
    colors: ['#0891b2']
  };

  const chartSeries = [{
    name: 'Balance',
    data: chartData.map(d => d.balance)
  }];

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-200 rounded w-48 mb-4"></div>
          <div className="h-80 bg-surface-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
        <ErrorState 
          message={error}
          onRetry={() => window.location.reload()}
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
          Cash Flow Forecast
        </h2>
        <div className="flex gap-2">
          {[30, 60, 90].map(days => (
            <Button
              key={days}
              variant={dateRange === days ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange(days)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-80">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="area"
          height="100%"
        />
      </div>
      
      {chartData.length > 0 && (
        <div className="mt-4 p-4 bg-surface-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-surface-600">Projected Balance ({dateRange}d)</p>
              <p className={`font-semibold font-display ${
                chartData[chartData.length - 1].balance >= 0 ? 'text-accent' : 'text-red-500'
              }`}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(chartData[chartData.length - 1].balance)}
              </p>
            </div>
            <div>
              <p className="text-surface-600">Highest Balance</p>
              <p className="font-semibold font-display text-accent">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(Math.max(...chartData.map(d => d.balance)))}
              </p>
            </div>
            <div>
              <p className="text-surface-600">Lowest Balance</p>
              <p className="font-semibold font-display text-red-500">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(Math.min(...chartData.map(d => d.balance)))}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CashFlowChart;