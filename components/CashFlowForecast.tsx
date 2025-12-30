import React, { useState } from 'react';
import { X, TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface CashFlowForecastProps {
  onClose: () => void;
  currentBNE: number;
  isPro: boolean;
  onUpgradeClick: () => void;
}

export default function CashFlowForecast({ onClose, currentBNE, isPro, onUpgradeClick }: CashFlowForecastProps) {
  const [forecastDays, setForecastDays] = useState<30 | 60 | 90>(30);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(10000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(7000);
  const [expectedPayments, setExpectedPayments] = useState<Array<{ date: string; amount: number; type: 'income' | 'expense' }>>([]);

  const dailyIncome = monthlyIncome / 30;
  const dailyExpenses = monthlyExpenses / 30;
  const dailyNet = dailyIncome - dailyExpenses;

  const generateForecast = () => {
    const data = [];
    let balance = currentBNE;
    
    for (let i = 0; i <= forecastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      balance += dailyNet;
      
      const expectedPayment = expectedPayments.find(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.toDateString() === date.toDateString();
      });
      
      if (expectedPayment) {
        balance += expectedPayment.type === 'income' ? expectedPayment.amount : -expectedPayment.amount;
      }
      
      if (i % 7 === 0 || i === forecastDays) {
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: Math.round(balance),
          income: Math.round(dailyIncome * (i === 0 ? 0 : 7)),
          expenses: Math.round(dailyExpenses * (i === 0 ? 0 : 7))
        });
      }
    }
    
    return data;
  };

  const forecastData = generateForecast();
  const lowestBalance = Math.min(...forecastData.map(d => d.balance));
  const finalBalance = forecastData[forecastData.length - 1]?.balance || currentBNE;
  const cashCrunch = lowestBalance < 1000;
  
  const addExpectedPayment = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExpectedPayments([...expectedPayments, { 
      date: tomorrow.toISOString().split('T')[0], 
      amount: 0, 
      type: 'income' 
    }]);
  };

  const updatePayment = (index: number, field: string, value: any) => {
    const updated = [...expectedPayments];
    updated[index] = { ...updated[index], [field]: value };
    setExpectedPayments(updated);
  };

  const removePayment = (index: number) => {
    setExpectedPayments(expectedPayments.filter((_, i) => i !== index));
  };

  const canUseFeature = (days: number) => {
    if (days === 30) return true;
    return isPro;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-white" size={32} />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Cash Flow Forecast</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="text-white" size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="flex gap-2 mb-6">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => {
                  if (canUseFeature(days)) {
                    setForecastDays(days as 30 | 60 | 90);
                  } else {
                    onUpgradeClick();
                  }
                }}
                className={`px-6 py-2 font-bold rounded-lg border-2 border-black transition-colors ${
                  forecastDays === days
                    ? 'bg-blue-600 text-white'
                    : canUseFeature(days)
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {days} Days {!canUseFeature(days) && '🔒'}
              </button>
            ))}
          </div>

          {cashCrunch && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-600 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-black uppercase text-red-600">Cash Crunch Warning</h3>
                <p className="text-sm font-bold">Your balance drops to ${lowestBalance.toFixed(0)} during this period. Consider reducing expenses or accelerating collections.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg border-2 border-black">
              <div className="text-sm font-bold mb-1">Current Balance</div>
              <div className="text-3xl font-black text-green-600">${currentBNE.toFixed(0)}</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-black">
              <div className="text-sm font-bold mb-1">Projected ({forecastDays} days)</div>
              <div className={`text-3xl font-black ${finalBalance > currentBNE ? 'text-green-600' : 'text-red-600'}`}>
                ${finalBalance.toFixed(0)}
              </div>
              <div className="text-xs font-bold mt-1">
                {finalBalance > currentBNE ? '+' : ''}{((finalBalance - currentBNE) / currentBNE * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-black">
              <div className="text-sm font-bold mb-1">Daily Net Change</div>
              <div className={`text-3xl font-black ${dailyNet > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dailyNet > 0 ? '+' : ''}${dailyNet.toFixed(0)}
              </div>
            </div>
          </div>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg border-2 border-black">
            <h3 className="font-black uppercase mb-4">Forecast Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={forecastData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="balance" fill="#3b82f6" />
                <Line type="monotone" dataKey="balance" stroke="#1e40af" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-black uppercase mb-4 border-b-4 border-black pb-2">Monthly Averages</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold mb-2">Average Monthly Income</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">$</span>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border-2 border-black rounded-lg font-mono"
                      step="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Average Monthly Expenses</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">$</span>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border-2 border-black rounded-lg font-mono"
                      step="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-black uppercase mb-4 border-b-4 border-black pb-2">
                Expected Payments 
                {!isPro && expectedPayments.length >= 3 && (
                  <span className="text-sm text-gray-500 ml-2">(3 max - Upgrade for unlimited)</span>
                )}
              </h3>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {expectedPayments.map((payment, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="date"
                      value={payment.date}
                      onChange={(e) => updatePayment(index, 'date', e.target.value)}
                      className="flex-1 px-2 py-1 border-2 border-black rounded text-sm font-mono"
                    />
                    <select
                      value={payment.type}
                      onChange={(e) => updatePayment(index, 'type', e.target.value)}
                      className="px-2 py-1 border-2 border-black rounded text-sm font-bold"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <input
                      type="number"
                      value={payment.amount}
                      onChange={(e) => updatePayment(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border-2 border-black rounded text-sm font-mono"
                      placeholder="$"
                    />
                    <button
                      onClick={() => removePayment(index)}
                      className="px-2 py-1 bg-red-100 hover:bg-red-200 border-2 border-black rounded text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (!isPro && expectedPayments.length >= 3) {
                    onUpgradeClick();
                  } else {
                    addExpectedPayment();
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors border-2 border-black text-sm"
              >
                {!isPro && expectedPayments.length >= 3 ? '🔒 Upgrade for More' : '+ Add Payment'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-black font-bold rounded-lg hover:bg-gray-300 transition-colors border-2 border-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
