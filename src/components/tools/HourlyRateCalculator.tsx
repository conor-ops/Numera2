import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const HourlyRateCalculator: React.FC = () => {
  const [desiredAnnualIncome, setDesiredAnnualIncome] = useState<number>(75000);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(30);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(48);
  const [annualOverhead, setAnnualOverhead] = useState<number>(15000);
  const [profitMargin, setProfitMargin] = useState<number>(20);

  const totalBillableHours = billableHoursPerWeek * weeksPerYear;
  const totalCosts = desiredAnnualIncome + annualOverhead;
  const targetRevenue = totalCosts / (1 - profitMargin / 100);
  const suggestedHourlyRate = totalBillableHours > 0 ? targetRevenue / totalBillableHours : 0;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-2 border-blue-300 p-4">
        <p className="text-sm text-blue-900">
          <strong>Pro Tip:</strong> This calculator helps you determine a sustainable hourly rate that covers your salary, 
          overhead costs, and desired profit margin.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">
            Desired Annual Income
          </label>
          <input
            type="number"
            value={desiredAnnualIncome}
            onChange={(e) => setDesiredAnnualIncome(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-lg"
            min="0"
            step="1000"
          />
          <p className="text-xs text-gray-600 mt-1">Your take-home salary goal</p>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">
            Billable Hours per Week
          </label>
          <input
            type="number"
            value={billableHoursPerWeek}
            onChange={(e) => setBillableHoursPerWeek(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-lg"
            min="0"
            max="168"
          />
          <p className="text-xs text-gray-600 mt-1">Actual client-facing work hours</p>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">
            Working Weeks per Year
          </label>
          <input
            type="number"
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-lg"
            min="0"
            max="52"
          />
          <p className="text-xs text-gray-600 mt-1">Accounting for vacation and time off</p>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">
            Annual Overhead Expenses
          </label>
          <input
            type="number"
            value={annualOverhead}
            onChange={(e) => setAnnualOverhead(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-lg"
            min="0"
            step="1000"
          />
          <p className="text-xs text-gray-600 mt-1">Software, insurance, office, equipment, etc.</p>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">
            Desired Profit Margin (%)
          </label>
          <input
            type="number"
            value={profitMargin}
            onChange={(e) => setProfitMargin(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-lg"
            min="0"
            max="100"
          />
          <p className="text-xs text-gray-600 mt-1">For growth, savings, and buffer</p>
        </div>
      </div>

      <div className="border-2 border-black bg-black text-white p-6 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={24} strokeWidth={2.5} />
          <h3 className="text-xl font-extrabold uppercase">Your Target Rate</h3>
        </div>
        
        <div className="text-5xl font-extrabold font-mono">
          ${suggestedHourlyRate.toFixed(2)}/hr
        </div>
        
        <div className="pt-4 border-t-2 border-white/20 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Total Billable Hours:</span>
            <span className="font-bold">{totalBillableHours.toLocaleString()} hrs/year</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Costs:</span>
            <span className="font-bold">${totalCosts.toLocaleString()}/year</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Target Revenue:</span>
            <span className="font-bold">${targetRevenue.toLocaleString()}/year</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 p-4">
        <p className="text-sm text-yellow-900">
          <strong>Note:</strong> This is a baseline. Adjust based on market rates, your experience level, 
          and the specific value you provide to clients.
        </p>
      </div>
    </div>
  );
};

export default HourlyRateCalculator;
