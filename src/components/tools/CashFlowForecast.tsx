import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ForecastData {
  day: number;
  balance: number;
  label: string;
}

const CashFlowForecast: React.FC = () => {
  const [currentBalance, setCurrentBalance] = useState<number>(25000);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(8000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(5000);
  const [forecastPeriod, setForecastPeriod] = useState<30 | 60 | 90>(30);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);

  useEffect(() => {
    calculateForecast();
  }, [currentBalance, monthlyIncome, monthlyExpenses, forecastPeriod]);

  const calculateForecast = () => {
    const dailyIncome = monthlyIncome / 30;
    const dailyExpenses = monthlyExpenses / 30;
    const netDailyChange = dailyIncome - dailyExpenses;

    const data: ForecastData[] = [];
    let balance = currentBalance;

    for (let day = 0; day <= forecastPeriod; day += 5) {
      balance += netDailyChange * (day === 0 ? 0 : 5);
      data.push({
        day,
        balance: Math.round(balance),
        label: `Day ${day}`,
      });
    }

    setForecastData(data);
  };

  const finalBalance = forecastData[forecastData.length - 1]?.balance || currentBalance;
  const netChange = finalBalance - currentBalance;
  const isPositive = netChange >= 0;
  const lowestBalance = Math.min(...forecastData.map(d => d.balance));
  const hasWarning = lowestBalance < 5000;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-2 border-blue-300 p-4">
        <p className="text-sm text-blue-900">
          <strong>Cash Flow Forecast:</strong> See where your cash will be in {forecastPeriod} days based on 
          current income and expense patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">
            Current Balance
          </label>
          <input
            type="number"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-lg"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">
            Monthly Income
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-lg"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">
            Monthly Expenses
          </label>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-lg"
            min="0"
            step="100"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {([30, 60, 90] as const).map((period) => (
          <button
            key={period}
            onClick={() => setForecastPeriod(period)}
            className={`flex-1 px-4 py-2 font-bold uppercase text-sm border-2 border-black transition-colors ${
              forecastPeriod === period
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {period} Days
          </button>
        ))}
      </div>

      {hasWarning && (
        <div className="bg-red-50 border-2 border-red-300 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <div className="text-sm text-red-900">
            <strong>Warning:</strong> Your balance is projected to drop below $5,000 
            (minimum: ${lowestBalance.toLocaleString()}) during this period.
          </div>
        </div>
      )}

      <div className="border-2 border-black p-6 bg-gray-50">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData}>
              <XAxis 
                dataKey="label" 
                stroke="#000"
<<<<<<< HEAD
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <YAxis 
                stroke="#000"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
                contentStyle={{ 
                  border: '2px solid black', 
                  backgroundColor: 'white',
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}
              />
              <ReferenceLine y={5000} stroke="#ef4444" strokeDasharray="3 3" />
              <Bar 
                dataKey="balance" 
                fill="#000000"
=======
                style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'Roboto Mono' }}
              />
              <YAxis 
                stroke="#000"
                style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'Roboto Mono' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Projected Balance']}
                contentStyle={{ 
                  border: '2px solid black', 
                  backgroundColor: 'white',
                  fontFamily: 'Roboto Mono',
                  fontWeight: 'bold',
                  borderRadius: 0
                }}
              />
              <ReferenceLine 
                y={5000} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{ 
                  value: 'Safety Threshold ($5k)', 
                  position: 'insideTopRight', 
                  fill: '#ef4444',
                  fontSize: 11,
                  fontWeight: 'bold',
                  fontFamily: 'Roboto Mono'
                }}
              />
              <Bar 
                dataKey="balance" 
                fill="#000000"
                radius={[4, 4, 0, 0]}
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-black p-4 bg-white">
          <div className="text-sm font-bold uppercase text-gray-600 mb-1">Starting Balance</div>
          <div className="text-2xl font-extrabold font-mono">${currentBalance.toLocaleString()}</div>
        </div>
        
        <div className="border-2 border-black p-4 bg-white">
          <div className="text-sm font-bold uppercase text-gray-600 mb-1">Day {forecastPeriod} Balance</div>
          <div className={`text-2xl font-extrabold font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            ${finalBalance.toLocaleString()}
          </div>
        </div>

        <div className="border-2 border-black p-4 bg-white">
          <div className="text-sm font-bold uppercase text-gray-600 mb-1">Net Change</div>
          <div className={`text-2xl font-extrabold font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{netChange.toLocaleString()}
          </div>
        </div>

        <div className="border-2 border-black p-4 bg-white">
          <div className="text-sm font-bold uppercase text-gray-600 mb-1">Lowest Point</div>
          <div className={`text-2xl font-extrabold font-mono ${lowestBalance < 5000 ? 'text-red-600' : 'text-black'}`}>
            ${lowestBalance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 p-4">
        <p className="text-sm text-yellow-900">
          <strong>Note:</strong> This is a simple linear forecast. Actual results may vary based on timing of 
          invoices, unexpected expenses, and seasonal patterns.
        </p>
      </div>
    </div>
  );
};

export default CashFlowForecast;
