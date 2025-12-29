import React from 'react';
import { Target, AlertCircle, CheckCircle } from 'lucide-react';
import { BudgetTargets } from '@/types';

interface BudgetPlannerProps {
  targets: BudgetTargets;
  actuals: {
    ar: number;
    ap: number;
    credit: number;
  };
  onUpdate: (targets: BudgetTargets) => void;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ targets, actuals, onUpdate }) => {
  const handleChange = (field: keyof BudgetTargets, value: string) => {
    onUpdate({
      ...targets,
      [field]: parseFloat(value) || 0
    });
  };

  const renderMetric = (
    label: string,
    field: keyof BudgetTargets,
    actual: number,
    target: number,
    type: 'min' | 'max' 
  ) => {
    const isGood = type === 'min' ? actual >= target : actual <= target;
    const percentage = target === 0 ? 0 : Math.min((actual / target) * 100, 100);
    const width = `${percentage}%`;
    
    // High contrast Swiss colors
    let colorClass = 'bg-black'; // Default to black
    if (type === 'max') {
        if (actual > target) colorClass = 'bg-red-600'; // Over budget
        else if (actual > target * 0.8) colorClass = 'bg-yellow-400'; // Warning
    } else {
        if (actual < target * 0.5) colorClass = 'bg-red-600'; // Way under revenue
        else if (actual < target) colorClass = 'bg-yellow-400'; // Under revenue
        else colorClass = 'bg-brand-blue'; // Hit target
    }

    const barWidth = type === 'max' && actual > target ? '100%' : width;

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <label className="text-sm font-bold uppercase text-black">{label}</label>
          <div className="text-right">
             <span className={`text-xs font-mono font-bold px-2 py-1 border-2 border-black ${isGood ? 'bg-green-100 text-black' : 'bg-red-100 text-black'} flex items-center gap-1 inline-flex`}>
                {isGood ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                {type === 'min' ? (actual - target >= 0 ? '+' : '') : (actual - target > 0 ? '+' : '')}${(actual - target).toLocaleString(undefined, { maximumFractionDigits: 0 })}
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="relative flex-grow group">
                 <div className="flex justify-between text-xs font-mono font-bold text-gray-400 mb-1">
                    <span>$0</span>
                    <span className="text-black">Target: ${target.toLocaleString()}</span>
                 </div>
                 <div className="h-4 bg-white border-2 border-black w-full relative">
                    <div 
                        className={`h-full transition-all duration-500 ${colorClass}`} 
                        style={{ width: barWidth }}
                    ></div>
                 </div>
                 <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs font-bold font-mono text-black">Actual: ${actual.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-gray-400">
                        {target > 0 ? Math.round((actual / target) * 100) : 0}%
                    </span>
                 </div>
             </div>

             <div className="w-28 shrink-0">
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-black font-mono font-bold">$</span>
                    <input
                        type="number"
                        value={targets[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full p-2 pl-6 text-sm font-mono font-bold border-2 border-gray-300 focus:border-black rounded-none text-right outline-none bg-gray-50 focus:bg-white transition-all"
                        placeholder="Target"
                    />
                </div>
             </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 border-2 border-black shadow-swiss">
      <div className="flex items-center gap-3 mb-8 border-b-2 border-black pb-4">
        <Target className="text-brand-blue" size={28} strokeWidth={2.5} />
        <div>
            <h3 className="text-xl font-extrabold uppercase tracking-tight text-black">Budget Targets</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Performance Goals</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {renderMetric("Revenue (AR)", "arTarget", actuals.ar, targets.arTarget, 'min')}
        {renderMetric("Expenses (AP)", "apTarget", actuals.ap, targets.apTarget, 'max')}
        {renderMetric("Credit Limit", "creditTarget", actuals.credit, targets.creditTarget, 'max')}
      </div>
    </div>
  );
};

export default BudgetPlanner;