import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Decimal } from 'decimal.js';
import { FinancialItem, Transaction, TransactionStatus } from '../types';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';

interface FinancialInputProps {
  title: string;
  items: FinancialItem[];
  onUpdate: (items: any[]) => void;
  colorClass?: string;
  icon?: React.ReactNode;
  variant?: 'card' | 'nested';
  defaultExpanded?: boolean;
  type?: 'INCOME' | 'EXPENSE' | 'OTHER';
}

const FinancialInput: React.FC<FinancialInputProps> = ({
  title,
  items,
  onUpdate,
  icon,
  variant = 'card',
  defaultExpanded = true,
  type = 'OTHER'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const addItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(ImpactStyle.Medium);
    const newItem: any = { id: crypto.randomUUID(), name: '', amount: 0 };
    if (type !== 'OTHER') {
      newItem.date_occurred = new Date().toISOString();
      newItem.status = 'PENDING';
    }
    onUpdate([...items, newItem]);
    if (!isExpanded) setIsExpanded(true);
  };

  const updateItem = (id: string, field: string, value: any) => {
    if (field === 'amount') triggerHaptic(ImpactStyle.Light);
    
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onUpdate(newItems);
  };

  const getOverdueDays = (dueDate?: string) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = now.getTime() - due.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const total = items.reduce((acc, item) => acc.plus(new Decimal(item.amount || 0)), new Decimal(0)).toNumber();

  return (
    <div className={variant === 'card' ? "p-4 md:p-6 bg-white border-2 border-black shadow-swiss flex flex-col" : "flex flex-col space-y-4"}>
      <div 
        className={`flex justify-between items-center mb-4 border-b-2 border-black pb-4 shrink-0 cursor-pointer group select-none ${variant === 'nested' ? 'mt-4' : ''}`}
        onClick={() => { triggerHaptic(ImpactStyle.Light); setIsExpanded(!isExpanded); }}
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
            {items.map((item: any) => {
              const overdueDays = getOverdueDays(item.date_due);
              const isHighRisk = overdueDays > 30;

              return (
                <div key={item.id} className="flex flex-col p-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors gap-2">
                  <div className="flex items-center gap-3">
                    {/* Description */}
                    <div className="flex-grow">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full text-sm font-bold bg-transparent outline-none focus:text-brand-blue"
                        />
                    </div>

                    {/* Status & Risk (AR only) */}
                    {type === 'INCOME' && item.date_due && (
                      <div className="flex items-center gap-2">
                        {isHighRisk ? (
                          <div className="flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase animate-pulse">
                            <AlertCircle size={10} /> Critical
                          </div>
                        ) : overdueDays > 0 ? (
                          <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase">
                            <Clock size={10} /> {overdueDays}d Late
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Amount */}
                    <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">$</span>
                        <input
                            type="number"
                            value={item.amount || ''}
                            onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full py-1 pl-5 pr-2 text-sm font-mono font-bold bg-gray-50 focus:bg-white border border-transparent focus:border-black outline-none text-right"
                        />
                    </div>

                    <button
                        onClick={(e) => removeItem(item.id, e)}
                        className="p-1.5 text-gray-300 hover:text-red-600 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Extended Fields (AR/AP only) */}
                  {type !== 'OTHER' && (
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                       <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Due:</span>
                          <input 
                            type="date" 
                            value={item.date_due ? item.date_due.split('T')[0] : ''} 
                            onChange={(e) => updateItem(item.id, 'date_due', e.target.value)}
                            className="bg-transparent border-none p-0 focus:text-black outline-none font-mono"
                          />
                       </div>
                       <div className="flex items-center gap-1">
                          <span>Status:</span>
                          <select 
                            value={item.status || 'PENDING'} 
                            onChange={(e) => updateItem(item.id, 'status', e.target.value)}
                            className="bg-transparent border-none p-0 focus:text-black outline-none"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="VOID">Void</option>
                          </select>
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
            
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