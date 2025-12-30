import React, { useState } from 'react';
import { X, DollarSign, TrendingUp } from 'lucide-react';

interface HourlyRateCalculatorProps {
  onClose: () => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

export default function HourlyRateCalculator({ onClose, isPro, onUpgradeClick }: HourlyRateCalculatorProps) {
  const [desiredAnnualIncome, setDesiredAnnualIncome] = useState<number>(80000);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(30);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(48);
  const [annualOverhead, setAnnualOverhead] = useState<number>(15000);
  const [profitMargin, setProfitMargin] = useState<number>(20);
  const [taxRate, setTaxRate] = useState<number>(25);

  const totalBillableHours = billableHoursPerWeek * weeksPerYear;
  const totalCosts = desiredAnnualIncome + annualOverhead;
  const targetRevenue = totalCosts / (1 - profitMargin / 100);
  const targetRevenueWithTax = targetRevenue / (1 - taxRate / 100);
  const suggestedHourlyRate = totalBillableHours > 0 ? targetRevenueWithTax / totalBillableHours : 0;

  const actualAnnualRevenue = suggestedHourlyRate * totalBillableHours;
  const taxAmount = actualAnnualRevenue * (taxRate / 100);
  const afterTaxRevenue = actualAnnualRevenue - taxAmount;
  const profitAmount = afterTaxRevenue - totalCosts;
  const actualProfitMargin = totalCosts > 0 ? (profitAmount / afterTaxRevenue) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 overflow-y-auto flex-1">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase border-b-4 border-black pb-2">Your Goals</h3>
            
            <div>
              <label className="block text-sm font-bold mb-2">Desired Annual Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">$</span>
                <input
                  type="number"
                  value={desiredAnnualIncome}
                  onChange={(e) => setDesiredAnnualIncome(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 border-2 border-black rounded-lg font-mono"
                  step="1000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Billable Hours per Week</label>
              <input
                type="number"
                value={billableHoursPerWeek}
                onChange={(e) => setBillableHoursPerWeek(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-mono"
                step="1"
                min="0"
                max="168"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Working Weeks per Year</label>
              <input
                type="number"
                value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-mono"
                step="1"
                min="0"
                max="52"
              />
              <p className="text-xs text-gray-600 mt-1">Total: {totalBillableHours} billable hours/year</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase border-b-4 border-black pb-2">Business Costs</h3>
            
            <div>
              <label className="block text-sm font-bold mb-2">Annual Overhead</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">$</span>
                <input
                  type="number"
                  value={annualOverhead}
                  onChange={(e) => setAnnualOverhead(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 border-2 border-black rounded-lg font-mono"
                  step="1000"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Software, insurance, office, etc.</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Desired Profit Margin (%)</label>
              <input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-mono"
                step="1"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Estimated Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-black rounded-lg font-mono"
                step="1"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-4 border-black">
          <h3 className="text-2xl font-black uppercase mb-4 text-center">Recommended Rate</h3>
          <div className="text-center">
            <div className="text-6xl font-black text-green-600 mb-2">
              ${suggestedHourlyRate.toFixed(0)}
            </div>
            <div className="text-lg font-bold text-gray-700">per hour</div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-black">
            <h4 className="font-bold text-sm uppercase mb-2">Annual Breakdown</h4>
            <div className="space-y-1 text-sm font-mono">
              <div className="flex justify-between">
                <span>Revenue:</span>
                <span className="font-bold">${actualAnnualRevenue.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Taxes ({taxRate}%):</span>
                <span className="font-bold">${taxAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>After Tax:</span>
                <span className="font-bold">${afterTaxRevenue.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Overhead:</span>
                <span className="font-bold">${annualOverhead.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Your Income:</span>
                <span className="font-bold">${desiredAnnualIncome.toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-black pt-1 text-green-600">
                <span>Profit:</span>
                <span className="font-bold">${profitAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Actual Margin:</span>
                <span className="font-bold">{actualProfitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border-2 border-black">
            <h4 className="font-bold text-sm uppercase mb-2">Quick Reference</h4>
            <div className="space-y-1 text-sm font-mono">
              <div className="flex justify-between">
                <span>Per Day (8hr):</span>
                <span className="font-bold">${(suggestedHourlyRate * 8).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Per Week ({billableHoursPerWeek}hr):</span>
                <span className="font-bold">${(suggestedHourlyRate * billableHoursPerWeek).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Per Month:</span>
                <span className="font-bold">${(actualAnnualRevenue / 12).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-600 rounded-lg">
          <p className="text-sm font-bold">💡 Tip: This rate covers all your costs, taxes, and desired profit. Consider market rates in your industry and adjust accordingly.</p>
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
  );
}