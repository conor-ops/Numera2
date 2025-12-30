
import React, { useState } from 'react';
import { Plus, Trash2, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { Decimal } from 'decimal.js';
import { BankAccount, AccountType } from '../types';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';

interface BankInputProps {
  accounts: BankAccount[];
  onUpdate: (accounts: BankAccount[]) => void;
  defaultExpanded?: boolean;
}

const BankInput: React.FC<BankInputProps> = ({ accounts, onUpdate, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const addAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(ImpactStyle.Medium);
    onUpdate([
      ...accounts, 
      { 
        id: crypto.randomUUID(), 
        name: '', 
        bankName: '',
        type: AccountType.CHECKING, 
        amount: 0 
      }
    ]);
    if (!isExpanded) setIsExpanded(true);
  };

  const updateAccount = (id: string, field: keyof BankAccount, value: string | number | AccountType) => {
    triggerHaptic(ImpactStyle.Light);
    const newAccounts = accounts.map(acc => {
      if (acc.id === id) {
        return { ...acc, [field]: value };
      }
      return acc;
    });
    onUpdate(newAccounts);
  };

  const removeAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(ImpactStyle.Medium);
    onUpdate(accounts.filter(acc => acc.id !== id));
  };

  const handleFocus = () => {
    triggerHaptic(ImpactStyle.Light);
  };

  const toggleExpand = () => {
    triggerHaptic(ImpactStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const total = accounts.reduce((acc, item) => acc.plus(new Decimal(item.amount || 0)), new Decimal(0)).toNumber();

  return (
    <div className="p-4 md:p-6 bg-white border-2 border-black shadow-swiss flex flex-col">
      <div 
        className="flex justify-between items-center mb-4 border-b-2 border-black pb-4 shrink-0 cursor-pointer group select-none"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-400 group-hover:text-black transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <Building2 size={24} className="text-black" />
          <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-brand-blue transition-colors">Bank Accounts</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xl font-mono font-bold">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button 
            onClick={addAccount}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors text-gray-400 hover:text-brand-blue"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 border border-gray-200 hover:border-black transition-colors bg-gray-50/50">
                
                {/* Bank Name & Nickname */}
                <div className="md:col-span-5 grid grid-cols-1 gap-2">
                  <input
                      type="text"
                      placeholder="Bank Name"
                      value={acc.bankName}
                      onChange={(e) => updateAccount(acc.id, 'bankName', e.target.value)}
                      onFocus={handleFocus}
                      className="w-full text-sm font-bold bg-transparent border-b border-gray-300 focus:border-brand-blue outline-none placeholder-gray-400 py-1 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Nickname"
                      value={acc.name}
                      onChange={(e) => updateAccount(acc.id, 'name', e.target.value)}
                      onFocus={handleFocus}
                      className="w-full text-xs text-gray-600 bg-transparent border-b border-transparent focus:border-brand-blue outline-none placeholder-gray-400 py-1 transition-colors"
                    />
                </div>

                {/* Type Select */}
                <div className="md:col-span-3">
                  <div className="relative w-full">
                      <select
                        value={acc.type}
                        onChange={(e) => updateAccount(acc.id, 'type', e.target.value as AccountType)}
                        className="w-full py-2 px-2 text-xs font-bold uppercase tracking-wider bg-white text-gray-700 focus:text-brand-blue outline-none cursor-pointer border border-gray-200 focus:border-brand-blue appearance-none"
                      >
                          <option value={AccountType.CHECKING}>Checking</option>
                          <option value={AccountType.SAVINGS}>Savings</option>
                      </select>
                  </div>
                </div>

                {/* Amount */}
                <div className="md:col-span-4 flex items-center gap-2 justify-end">
                    <div className="relative w-32 md:w-full">
                        <span className="absolute left-2 top-2 text-gray-400 font-mono text-xs">$</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={acc.amount || ''}
                            onChange={(e) => updateAccount(acc.id, 'amount', parseFloat(e.target.value))}
                            onFocus={handleFocus}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full py-2 pl-5 pr-2 text-base font-mono font-bold bg-white border border-gray-200 focus:border-brand-blue outline-none text-right transition-colors"
                        />
                    </div>
                    <button
                        onClick={(e) => removeAccount(acc.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 rounded-sm"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            ))}
            
            {accounts.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm italic border-2 border-dashed border-gray-200">
                  No bank accounts connected.
              </div>
            )}
          </div>

          <button
            onClick={addAccount}
            className="mt-2 w-full py-3 flex justify-center items-center gap-2 text-sm font-bold uppercase bg-brand-blue text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all shrink-0"
          >
            <Plus size={16} />
            Add Bank Account
          </button>
        </div>
      )}
    </div>
  );
};

export default BankInput;
