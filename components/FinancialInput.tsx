import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Decimal } from 'decimal.js';
import { FinancialItem } from '../types';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { parseAmount, sanitizeText } from '../utils/validation';

interface FinancialInputProps {
  title: string;
  items: FinancialItem[];
  onUpdate: (items: FinancialItem[]) => void;
  colorClass?: string;
  icon?: React.ReactNode;
}

const FinancialInput: React.FC<FinancialInputProps> = ({ 
  title, 
  items, 
  onUpdate, 
  icon
}) => {
  const addItem = () => {
    triggerHaptic(ImpactStyle.Medium);
    onUpdate([...items, { id: crypto.randomUUID(), name: '', amount: 0 }]);
  };

  const updateItem = (id: string, field: keyof FinancialItem, value: string | number) => {
    if (field === 'amount') triggerHaptic(ImpactStyle.Light);
    
    const newItems = items.map(item => {
      if (item.id === id) {
        if (field === 'amount') {
          return { ...item, [field]: parseAmount(value) };
        } else if (field === 'name') {
          return { ...item, [field]: sanitizeText(value as string) };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    onUpdate(newItems);
  };

  const removeItem = (id: string) => {
    triggerHaptic(ImpactStyle.Medium);
    onUpdate(items.filter(item => item.id !== id));
  };

  const handleFocus = () => {
    triggerHaptic(ImpactStyle.Light);
  };

  const total = items.reduce((acc, item) => acc.plus(new Decimal(item.amount || 0)), new Decimal(0)).toNumber();

  return (
    <div className="p-4 md:p-6 bg-white border-2 border-black shadow-swiss flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4 shrink-0">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
        </div>
        <span className="text-xl font-mono font-bold">
          ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-2 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
            
            {/* Description */}
            <div className="md:col-span-7">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  onFocus={handleFocus}
                  className="w-full py-2 px-2 text-sm font-medium bg-transparent border-b border-transparent focus:border-brand-blue outline-none transition-colors"
                />
            </div>

            {/* Amount & Actions */}
            <div className="md:col-span-5 flex items-center gap-2 justify-end">
                <div className="relative w-32 md:w-full">
                    <span className="absolute left-2 top-2 text-gray-400 font-mono text-xs">$</span>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={item.amount || ''}
                        onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value))}
                        onFocus={handleFocus}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full py-2 pl-5 pr-2 text-sm font-mono font-bold bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-brand-blue outline-none text-right transition-colors"
                    />
                </div>
                <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 rounded-sm"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
           <div className="text-center py-6 text-gray-400 text-sm italic">
              No items added.
           </div>
        )}
      </div>

      <button
        onClick={addItem}
        className="mt-6 w-full py-3 flex justify-center items-center gap-2 text-sm font-bold uppercase bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:text-brand-blue hover:border-brand-blue hover:bg-blue-50 transition-all shrink-0"
      >
        <Plus size={16} />
        Add Item
      </button>
    </div>
  );
};

export default FinancialInput;