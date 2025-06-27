import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import { addDays, addMonths, addWeeks, addYears, format, isAfter, isBefore, parseISO } from "date-fns";
import scenarioService from "@/services/api/scenarioService";
import transactionService from "@/services/api/transactionService";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import ErrorState from "@/components/molecules/ErrorState";
import Button from "@/components/atoms/Button";

const CashFlowChart = ({ scenarios = [] }) => {
  const [chartData, setChartData] = useState([]);
  const [scenarioData, setScenarioData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30); // days

  const colors = scenarios.length > 0 
    ? scenarios.map(s => s.color)
    : ['#0891b2'];

  useEffect(() => {
    const generateForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (scenarios.length === 0) {
          // Generate default forecast when no scenarios
          const transactions = await transactionService.getAll();
          const startDate = new Date();
          
          // Calculate initial balance (original logic)
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

          // Generate daily forecast (original logic)
          const forecastData = [];
          let runningBalance = currentBalance;
          
          for (let i = 0; i <= dateRange; i++) {
            const currentDate = addDays(startDate, i);
            let dailyChange = 0;
            
            transactions.forEach(transaction => {
              const transactionDate = parseISO(transaction.date);
              
              if (transaction.recurrence === 'none') {
                if (currentDate.toDateString() === transactionDate.toDateString()) {
                  dailyChange += transaction.type === 'income' ? transaction.amount : -transaction.amount;
                }
              } else {
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
                      checkDate = addDays(checkDate, 365);
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
          setScenarioData({});
        } else {
          // Generate scenario-based forecasts
          const results = await scenarioService.calculateMultipleScenarios(scenarios, dateRange);
          setScenarioData(results);
          
          // Set default chart data to first scenario for backward compatibility
          const firstScenario = scenarios[0];
          if (results[firstScenario.Id]) {
            setChartData(results[firstScenario.Id].data);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to generate forecast');
      } finally {
        setLoading(false);
      }
    };

    generateForecast();
}, [dateRange, scenarios]);

  const chartOptions = {
    chart: {
      type: scenarios.length > 1 ? 'line' : 'area',
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
      width: scenarios.length > 1 ? 2 : 3,
      colors: colors
    },
    fill: {
      type: scenarios.length > 1 ? 'solid' : 'gradient',
      opacity: scenarios.length > 1 ? 0.1 : 0.3,
      gradient: scenarios.length === 1 ? {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: colors[0], opacity: 0.3 },
          { offset: 100, color: colors[0], opacity: 0.1 }
        ]
      } : undefined
    },
    legend: scenarios.length > 1 ? {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      markers: {
        width: 8,
        height: 8,
        radius: 4
      }
    } : { show: false },
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
        if (scenarios.length > 0 && scenarioData[scenarios[seriesIndex]?.Id]) {
          const data = scenarioData[scenarios[seriesIndex].Id].data[dataPointIndex];
          const scenario = scenarios[seriesIndex];
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
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-3 h-3 rounded-full" style="background-color: ${scenario.color}"></div>
                  <span class="font-medium">${scenario.name}</span>
                </div>
                <div>Balance: <span class="font-semibold">${balance}</span></div>
                <div>Change: <span class="font-semibold ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}">${change}</span></div>
              </div>
            </div>
          `;
        } else {
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
      }
    },
    colors: colors
  };
const chartSeries = scenarios.length > 0 
    ? scenarios.map(scenario => ({
        name: scenario.name,
        data: scenarioData[scenario.Id] ? scenarioData[scenario.Id].data.map(d => d.balance) : [],
        color: scenario.color
      }))
    : [{
        name: 'Balance',
        data: chartData.map(d => d.balance),
        color: '#0891b2'
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
      
{(chartData.length > 0 || Object.keys(scenarioData).length > 0) && (
        <div className="mt-4 p-4 bg-surface-50 rounded-lg">
          {scenarios.length > 1 ? (
            <div className="space-y-4">
              <h4 className="font-medium text-surface-900">Scenario Comparison ({dateRange}d)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map(scenario => {
                  const data = scenarioData[scenario.Id]?.data || [];
                  if (data.length === 0) return null;
                  
                  const finalBalance = data[data.length - 1].balance;
                  const maxBalance = Math.max(...data.map(d => d.balance));
                  const minBalance = Math.min(...data.map(d => d.balance));
                  
                  return (
                    <div key={scenario.Id} className="p-3 bg-white rounded-lg border border-surface-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: scenario.color }}
                        />
                        <span className="font-medium text-surface-900 text-sm">{scenario.name}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-surface-600">Final:</span>
                          <span className={`font-semibold ${finalBalance >= 0 ? 'text-accent' : 'text-red-500'}`}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              notation: 'compact'
                            }).format(finalBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-surface-600">High:</span>
                          <span className="font-semibold text-accent">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              notation: 'compact'
                            }).format(maxBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-surface-600">Low:</span>
                          <span className="font-semibold text-red-500">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              notation: 'compact'
                            }).format(minBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-surface-600">Projected Balance ({dateRange}d)</p>
                <p className={`font-semibold font-display ${
                  chartData[chartData.length - 1]?.balance >= 0 ? 'text-accent' : 'text-red-500'
                }`}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(chartData[chartData.length - 1]?.balance || 0)}
                </p>
              </div>
              <div>
                <p className="text-surface-600">Highest Balance</p>
                <p className="font-semibold font-display text-accent">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(chartData.length > 0 ? Math.max(...chartData.map(d => d.balance)) : 0)}
                </p>
              </div>
              <div>
                <p className="text-surface-600">Lowest Balance</p>
                <p className="font-semibold font-display text-red-500">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(chartData.length > 0 ? Math.min(...chartData.map(d => d.balance)) : 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CashFlowChart;