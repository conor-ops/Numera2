
import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Decimal } from 'decimal.js';
import { FinancialItem } from '../types';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';

interface FinancialInputProps {
  title: string;
  items: FinancialItem[];
  onUpdate: (items: FinancialItem[]) => void;
  colorClass?: string;
  icon?: React.ReactNode;
  variant?: 'card' | 'nested';
  defaultExpanded?: boolean;
}

const FinancialInput: React.FC<FinancialInputProps> = ({ 
  title, 
  items, 
  onUpdate, 
  icon,
  variant = 'card',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const addItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(ImpactStyle.Medium);
    onUpdate([...items, { id: crypto.randomUUID(), name: '', amount: 0 }]);
    if (!isExpanded) setIsExpanded(true);
  };

  const updateItem = (id: string, field: keyof FinancialItem, value: string | number) => {
    if (field === 'amount') triggerHaptic(ImpactStyle.Light);
    
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onUpdate(newItems);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(ImpactStyle.Medium);
    onUpdate(items.filter(item => item.id !== id));
  };

  const handleFocus = () => {
    triggerHaptic(ImpactStyle.Light);
  };

  const toggleExpand = () => {
    triggerHaptic(ImpactStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const total = items.reduce((acc, item) => acc.plus(new Decimal(item.amount || 0)), new Decimal(0)).toNumber();

  const containerClasses = variant === 'card' 
    ? "p-4 md:p-6 bg-white border-2 border-black shadow-swiss flex flex-col"
    : "flex flex-col space-y-4";

  return (
    <div className={containerClasses}>
      <div 
        className={`flex justify-between items-center mb-4 border-b-2 border-black pb-4 shrink-0 cursor-pointer group select-none ${variant === 'nested' ? 'mt-4' : ''}`}
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-400 group-hover:text-black transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {icon}
          <h3 className={`${variant === 'card' ? 'text-lg' : 'text-sm'} font-bold uppercase tracking-tight group-hover:text-brand-blue transition-colors`}>{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className={`${variant === 'card' ? 'text-xl' : 'text-base'} font-mono font-bold`}>
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {variant === 'card' && (
            <button 
              onClick={addItem}
              className="p-1 hover:bg-gray-100 rounded-sm transition-colors text-gray-400 hover:text-brand-blue"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
                        onClick={(e) => removeItem(item.id, e)}
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
            className="mt-2 w-full py-3 flex justify-center items-center gap-2 text-[10px] font-bold uppercase bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:text-brand-blue hover:border-brand-blue hover:bg-blue-50 transition-all shrink-0"
          >
            <Plus size={14} />
            Add to {title}
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialInput;
