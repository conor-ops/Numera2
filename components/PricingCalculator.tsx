
import React from 'react';
import { Plus, Trash2, Tag, Calculator, TrendingUp, Package, X } from 'lucide-react';
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
    triggerHaptic(ImpactStyle.Light);
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
    <div className="bg-white border-2 border-black shadow-swiss flex flex-col min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Calculator size={20} className="text-brand-blue" />
          <h3 className="font-bold uppercase text-xs tracking-widest">COGS & Pricing Strategy</h3>
        </div>
        <button onClick={onClose} className="hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 border-2 border-black flex items-center gap-4">
            <Package className="text-brand-blue" />
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">Inventory Items</p>
              <p className="text-xl font-mono font-bold">{items.length}</p>
            </div>
          </div>
          <div className="p-4 bg-black text-white border-2 border-black flex items-center gap-4">
            <TrendingUp className="text-brand-blue" />
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500">Average Markup</p>
              <p className="text-xl font-mono font-bold">
                {items.length > 0 
                  ? (items.reduce((acc, i) => acc + (i.markupPercent || 0), 0) / items.length).toFixed(1)
                  : "0.0"}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const metrics = calculateMetrics(item);
            return (
              <div key={item.id} className="border-2 border-black p-4 md:p-6 bg-white hover:bg-gray-50 transition-colors group">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  
                  {/* Basic Info */}
                  <div className="xl:col-span-4 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Item / SKU Description</label>
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={e => updateItem(item.id, 'name', e.target.value)}
                        placeholder="e.g. Premium Leather Widget"
                        className="w-full p-2 border-b border-black text-sm font-bold bg-transparent outline-none focus:text-brand-blue transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Supplier Cost</label>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-[10px] font-mono">$</span>
                          <input 
                            type="number"
                            value={item.supplierCost || ''}
                            onChange={e => updateItem(item.id, 'supplierCost', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 pl-5 text-xs font-mono font-bold border border-gray-200 outline-none focus:border-black"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Freight/Ops</label>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-[10px] font-mono">$</span>
                          <input 
                            type="number"
                            value={item.freightCost || ''}
                            onChange={e => updateItem(item.id, 'freightCost', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 pl-5 text-xs font-mono font-bold border border-gray-200 outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Markup Control */}
                  <div className="xl:col-span-3">
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Markup Strategy (%)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        min="0"
                        max="200"
                        value={item.markupPercent}
                        onChange={e => updateItem(item.id, 'markupPercent', parseInt(e.target.value))}
                        className="flex-grow accent-brand-blue"
                      />
                      <div className="w-16">
                        <input 
                          type="number"
                          value={item.markupPercent}
                          onChange={e => updateItem(item.id, 'markupPercent', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border-2 border-black text-center text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-100 border border-gray-200 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-gray-500">Total Unit COGS</span>
                      <span className="text-sm font-mono font-bold">${metrics.unitCOGS.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Results Panel */}
                  <div className="xl:col-span-5 grid grid-cols-2 gap-4 border-l-0 xl:border-l-2 border-black xl:pl-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-gray-400">Unit Profit</p>
                      <p className="text-xl font-mono font-bold text-green-600">+${metrics.grossProfit.toFixed(2)}</p>
                      <div className="text-[10px] font-bold uppercase bg-green-50 text-green-700 px-2 py-0.5 inline-block">
                        {metrics.margin.toFixed(1)}% Margin
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <p className="text-[10px] font-bold uppercase text-gray-400">Suggested Retail (SRP)</p>
                      <p className="text-3xl font-mono font-bold text-brand-blue">${metrics.srp.toFixed(2)}</p>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-gray-200">
              <Tag size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-sm font-bold uppercase text-gray-400 tracking-widest">No pricing strategies recorded</p>
              <button 
                onClick={addItem}
                className="mt-4 px-6 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-brand-blue transition-all"
              >
                Add My First Item
              </button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <button 
            onClick={addItem}
            className="w-full py-4 border-2 border-dashed border-black hover:border-brand-blue hover:bg-blue-50 text-gray-400 hover:text-brand-blue font-bold uppercase text-xs transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Pricing Strategy
          </button>
        )}
      </div>

      <div className="p-6 border-t-2 border-black bg-gray-50 mt-auto flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <p className="text-[10px] font-bold uppercase text-gray-400 leading-tight">
            PRICING LOGIC: SRP = (Supplier Cost + Freight) × (1 + Markup %). 
            Gross Margin reflects the percentage of SRP that is profit after COGS.
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-8 py-3 bg-black text-white font-bold uppercase text-xs hover:bg-brand-blue transition-all shadow-swiss hover:shadow-none"
        >
          Confirm Strategies
        </button>
      </div>
    </div>
  );
};

export default PricingCalculator;
