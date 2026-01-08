
import React, { useState, useMemo } from 'react';
import { ShieldAlert, Plus, Trash2, TrendingDown, Target, Info, X, DollarSign } from 'lucide-react';
import { Decimal } from 'decimal.js';
import { triggerHaptic } from '@/services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';

interface ScopeChange {
  id: string;
  description: string;
  addedHours: number;
}

const ScopeGuard: React.FC = () => {
  const [projectValue, setProjectValue] = useState<number>(5000);
  const [estimatedHours, setEstimatedHours] = useState<number>(40);
  const [changes, setChanges] = useState<ScopeChange[]>([]);

  const addChange = () => {
    triggerHaptic(ImpactStyle.Medium);
    setChanges([...changes, { id: crypto.randomUUID(), description: '', addedHours: 2 }]);
  };

  const updateChange = (id: string, field: keyof ScopeChange, value: string | number) => {
    setChanges(changes.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeChange = (id: string) => {
    triggerHaptic(ImpactStyle.Light);
    setChanges(changes.filter(c => c.id !== id));
  };

  const metrics = useMemo(() => {
    const totalValue = new Decimal(projectValue);
    const originalRate = totalValue.div(estimatedHours || 1);
    
    const addedHours = changes.reduce((acc, c) => acc + (Number(c.addedHours) || 0), 0);
    const totalHours = new Decimal(estimatedHours).plus(addedHours);
    const newRate = totalValue.div(totalHours || 1);
    
    const rateDrop = originalRate.minus(newRate);
    const effectiveLoss = rateDrop.times(totalHours);

    return {
      originalRate: originalRate.toNumber(),
      newRate: newRate.toNumber(),
      totalHours: totalHours.toNumber(),
      addedHours,
      rateDrop: rateDrop.toNumber(),
      effectiveLoss: effectiveLoss.toNumber()
    };
  }, [projectValue, estimatedHours, changes]);

  return (
    <div className="bg-white border-4 border-black p-6 md:p-10 shadow-swiss animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Scope Guard</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Margin Protection Calculator</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Base Project */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Project Value</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 font-mono text-gray-400">$</span>
                <input 
                  type="number"
                  value={projectValue}
                  onChange={(e) => setProjectValue(parseFloat(e.target.value) || 0)}
                  className="w-full p-4 pl-8 border-2 border-black font-mono font-bold outline-none focus:bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Est. Hours</label>
              <input 
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                className="w-full p-4 border-2 border-black font-mono font-bold outline-none focus:bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Added Requests (The Creep)</h3>
                <button 
                  onClick={addChange}
                  className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1 hover:bg-red-600 transition-colors"
                >
                  <Plus size={12} /> Add Request
                </button>
             </div>
             
             <div className="space-y-3">
                {changes.map(change => (
                  <div key={change.id} className="flex gap-2 animate-in slide-in-from-left-2">
                    <input 
                      placeholder="Request description..."
                      value={change.description}
                      onChange={(e) => updateChange(change.id, 'description', e.target.value)}
                      className="flex-grow p-3 border-2 border-black font-bold text-xs uppercase outline-none"
                    />
                    <div className="relative w-24">
                      <input 
                        type="number"
                        value={change.addedHours}
                        onChange={(e) => updateChange(change.id, 'addedHours', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border-2 border-black font-mono font-bold text-xs outline-none text-center"
                      />
                    </div>
                    <button onClick={() => removeChange(change.id)} className="text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
                {changes.length === 0 && (
                  <div className="p-8 border-2 border-dashed border-gray-200 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    No scope changes added yet.
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Side: Impact Analysis */}
        <div className="bg-gray-50 border-4 border-black p-8 flex flex-col justify-between shadow-swiss">
           <div className="space-y-8">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Effective Hourly Rate</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 line-through">${metrics.originalRate.toFixed(2)}/hr</p>
                  <p className="text-4xl font-mono font-black text-red-600">${metrics.newRate.toFixed(2)}<span className="text-xs">/hr</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8 border-t-2 border-black/10">
                 <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Total Hours</p>
                    <p className="text-xl font-mono font-black">{metrics.totalHours} hrs</p>
                    <p className="text-[9px] font-bold text-red-500">+{metrics.addedHours} from creep</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Rate Dilution</p>
                    <p className="text-xl font-mono font-black text-red-600">-${metrics.rateDrop.toFixed(2)}/hr</p>
                 </div>
              </div>

              <div className="p-4 bg-red-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <div className="flex items-center gap-2 mb-1">
                    <TrendingDown size={14} />
                    <span className="text-[10px] font-black uppercase">Invisible Profit Loss</span>
                 </div>
                 <p className="text-2xl font-mono font-black">${metrics.effectiveLoss.toFixed(2)}</p>
                 <p className="text-[9px] font-medium leading-relaxed mt-2 opacity-80 uppercase font-black">
                   This is the amount you are effectively paying the client to take on this extra work.
                 </p>
              </div>
           </div>

           <div className="mt-8 flex gap-4 items-start">
              <Info size={16} className="text-brand-blue shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium italic text-gray-600 leading-relaxed">
                "Scope Guard exposes the 'Yes' tax. Use these numbers to justify a Change Order or to know when to walk away from a feature request."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeGuard;
