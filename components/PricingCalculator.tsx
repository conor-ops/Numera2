
import React from 'react';
import { Plus, Trash2, Tag, Calculator, TrendingUp, Package, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PricingItem } from '../types';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { Decimal } from 'decimal.js';

interface PricingCalculatorProps {
  items: PricingItem[];
  onUpdate: (items: PricingItem[]) => void;
  onClose: () => void;
  isPro: boolean;
  onShowPaywall: () => void;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({ 
  items, 
  onUpdate, 
  onClose, 
  isPro, 
  onShowPaywall 
}) => {
  const addItem = () => {
    triggerHaptic(ImpactStyle.Medium);
    onUpdate([...items, { 
      id: crypto.randomUUID(), 
      name: '', 
      supplierCost: 0, 
      freightCost: 0, 
      markupPercent: 30 
    }]);
  };

  const updateItem = (id: string, field: keyof PricingItem, value: any) => {
    if (field === 'markupPercent') triggerHaptic(ImpactStyle.Light);
    onUpdate(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    triggerHaptic(ImpactStyle.Medium);
    onUpdate(items.filter(item => item.id !== id));
  };

  const calculateMetrics = (item: PricingItem) => {
    const cost = new Decimal(item.supplierCost || 0);
    const freight = new Decimal(item.freightCost || 0);
    const unitCOGS = cost.plus(freight);
    const markupMultiplier = new Decimal(item.markupPercent || 0).div(100).plus(1);
    const srp = unitCOGS.times(markupMultiplier);
    const grossProfit = srp.minus(unitCOGS);
    const margin = srp.isZero() ? new Decimal(0) : grossProfit.div(srp).times(100);

    return {
      unitCOGS: unitCOGS.toNumber(),
      srp: srp.toNumber(),
      grossProfit: grossProfit.toNumber(),
      margin: margin.toNumber()
    };
  };

  return (
    <div className="bg-white border-3 border-black shadow-swiss flex flex-col min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-brand-blue text-white p-4 flex justify-between items-center sticky top-0 z-20 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <Calculator size={20} className="text-white" />
          <h3 className="font-black uppercase text-xs tracking-widest">Profitability Intel Engine</h3>
        </div>
        <button onClick={onClose} className="hover:rotate-90 transition-transform duration-200">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 border-2 border-black flex items-center gap-4">
            <Package className="text-brand-blue" size={32} />
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Strategic SKUs</p>
              <p className="text-2xl font-mono font-black">{items.length}</p>
            </div>
          </div>
          <div className="p-4 bg-black text-white border-2 border-black flex items-center gap-4">
            <TrendingUp className="text-brand-blue" size={32} />
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Fleet Margin Avg</p>
              <p className="text-2xl font-mono font-black text-brand-blue">
                {items.length > 0 
                  ? (items.reduce((acc, i) => {
                      const m = calculateMetrics(i);
                      return acc + m.margin;
                    }, 0) / items.length).toFixed(1)
                  : "0.0"}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {items.map((item) => {
            const metrics = calculateMetrics(item);
            const isDangerZone = metrics.margin < 30;
            const isOptimalZone = metrics.margin >= 50;

            return (
              <div key={item.id} className={`border-3 border-black p-4 md:p-6 bg-white transition-all ${isDangerZone ? 'shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]' : 'shadow-swiss'}`}>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* Basic Info */}
                  <div className="xl:col-span-4 space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Entity / Service Name</label>
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={e => updateItem(item.id, 'name', e.target.value)}
                        placeholder="e.g. Agency Retainer / Hardware Kit"
                        className="w-full p-2 border-b-2 border-black text-sm font-black bg-transparent outline-none focus:text-brand-blue transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 underline">Unit COGS</label>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-[10px] font-mono font-bold">$</span>
                          <input 
                            type="number"
                            value={item.supplierCost || ''}
                            onChange={e => updateItem(item.id, 'supplierCost', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 pl-5 text-xs font-mono font-black border-2 border-black outline-none focus:bg-gray-50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 underline">Ops/Freight</label>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-[10px] font-mono font-bold">$</span>
                          <input 
                            type="number"
                            value={item.freightCost || ''}
                            onChange={e => updateItem(item.id, 'freightCost', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 pl-5 text-xs font-mono font-black border-2 border-black outline-none focus:bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Markup Control */}
                  <div className="xl:col-span-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Target Markup (%)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        min="0"
                        max="300"
                        value={item.markupPercent}
                        onChange={e => updateItem(item.id, 'markupPercent', parseInt(e.target.value))}
                        className="flex-grow accent-black"
                      />
                      <div className="w-20">
                        <input 
                          type="number"
                          value={item.markupPercent}
                          onChange={e => updateItem(item.id, 'markupPercent', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border-2 border-black text-center text-sm font-mono font-black"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                       {isDangerZone ? (
                         <div className="p-3 bg-red-600 text-white border-2 border-black flex items-center gap-2 animate-pulse">
                            <AlertCircle size={16} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-red-100">Caution: Critical Margin</span>
                         </div>
                       ) : isOptimalZone ? (
                         <div className="p-3 bg-green-600 text-white border-2 border-black flex items-center gap-2">
                            <CheckCircle2 size={16} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-green-100">Safe: Optimal Growth</span>
                         </div>
                       ) : (
                         <div className="p-3 bg-gray-100 border-2 border-black flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-400">Total Unit COGS</span>
                            <span className="text-sm font-mono font-black">${metrics.unitCOGS.toFixed(2)}</span>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Results Panel */}
                  <div className="xl:col-span-5 grid grid-cols-2 gap-4 border-l-0 xl:border-l-2 border-black xl:pl-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Unit Profit</p>
                      <p className={`text-2xl font-mono font-black ${isDangerZone ? 'text-red-600' : 'text-green-600'}`}>
                        +${metrics.grossProfit.toFixed(2)}
                      </p>
                      <div className={`text-[10px] font-black uppercase px-2 py-1 inline-block border ${isDangerZone ? 'bg-red-50 border-red-600 text-red-600' : 'bg-green-50 border-green-600 text-green-600'}`}>
                        {metrics.margin.toFixed(1)}% Margin
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recommended SRP</p>
                      <p className="text-4xl font-mono font-black text-black tracking-tighter">${metrics.srp.toFixed(2)}</p>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-600 transition-colors mt-4"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="py-24 text-center border-4 border-dashed border-gray-100 grayscale hover:grayscale-0 transition-all">
              <Tag size={64} className="mx-auto text-gray-200 mb-4" />
              <p className="text-sm font-black uppercase text-gray-400 tracking-widest">Pricing Strategy Required</p>
              <button 
                onClick={addItem}
                className="mt-6 px-10 py-4 bg-black text-white text-xs font-black uppercase hover:bg-brand-blue transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 hover:translate-y-1"
              >
                Launch Strategizer
              </button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <button 
            onClick={addItem}
            className="w-full py-6 border-2 border-dashed border-black hover:border-brand-blue hover:bg-blue-50 text-gray-400 hover:text-brand-blue font-black uppercase text-xs transition-all flex items-center justify-center gap-3"
          >
            <Plus size={20} /> Add Next Strategic Item
          </button>
        )}
      </div>

      <div className="p-6 border-t-3 border-black bg-gray-50 mt-auto flex flex-col sm:flex-row gap-6">
        <div className="flex-grow">
          <p className="text-[9px] font-black uppercase text-gray-400 leading-tight max-w-xl">
            PRECISION LOGIC: Suggested Retail Price (SRP) leverages Unit COGS × (1 + Markup Strategy). 
            Gross Margin represents the percentage of total revenue remaining after direct costs. 
            Maintain fleet margins above 30% for sustainable operations.
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-12 py-4 bg-black text-white font-black uppercase text-xs hover:bg-green-600 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 border-2 border-black"
        >
          Deploy Pricing Strategies
        </button>
      </div>
    </div>
  );
};

export default PricingCalculator;
