
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, ArrowRight, Zap, Calculator, History, Settings, X, CreditCard, Wallet } from 'lucide-react';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (action: string, params: any) => void;
}

interface CommandAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'NAVIGATION' | 'ACTION' | 'FINANCE';
  shortcut?: string;
}

const COMMANDS: CommandAction[] = [
  { id: 'go_pricing', title: 'Go to Pricing Strategy', description: 'Open COGS & Markup Sheet', icon: <Calculator size={18} />, category: 'NAVIGATION' },
  { id: 'go_history', title: 'View Balance History', description: 'See your solvency timeline', icon: <History size={18} />, category: 'NAVIGATION' },
  { id: 'go_profile', title: 'Edit Business Profile', description: 'Update company info & billing details', icon: <Settings size={18} />, category: 'NAVIGATION' },
  { id: 'add_expense', title: 'Add Expense...', description: 'Log a new one-off business cost', icon: <Plus size={18} className="text-red-500" />, category: 'FINANCE' },
  { id: 'add_income', title: 'Add Income...', description: 'Record a new payment or receivable', icon: <Plus size={18} className="text-green-500" />, category: 'FINANCE' },
  { id: 'add_bank', title: 'Add Bank Account', description: 'Connect a new liquidity source', icon: <Wallet size={18} />, category: 'ACTION' },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onExecute }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // Simple NLP Parsing logic
  const parseQuery = (text: string) => {
    const expenseMatch = text.match(/(?:exp|expense|cost|pay)\s+\$?(\d+(?:\.\d+)?)\s*(?:for|on|to)?\s*(.*)/i);
    const incomeMatch = text.match(/(?:inc|income|get|earn)\s+\$?(\d+(?:\.\d+)?)\s*(?:from|for)?\s*(.*)/i);
    
    if (expenseMatch) return { type: 'ADD_EXPENSE', amount: parseFloat(expenseMatch[1]), desc: expenseMatch[2] };
    if (incomeMatch) return { type: 'ADD_INCOME', amount: parseFloat(incomeMatch[1]), desc: incomeMatch[2] };
    return null;
  };

  const parsedAction = parseQuery(query);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      if (parsedAction) {
        onExecute(parsedAction.type, parsedAction);
        onClose();
      } else if (filteredCommands[selectedIndex]) {
        onExecute('COMMAND', filteredCommands[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b-4 border-black flex items-center gap-4 bg-gray-50">
          <Search className="text-black" size={24} strokeWidth={3} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or 'expense $50 for AWS'..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent outline-none font-mono text-lg font-bold placeholder-gray-400"
          />
          <div className="flex items-center gap-1">
             <span className="text-[10px] font-bold border-2 border-black px-1.5 py-0.5 bg-white">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {parsedAction ? (
            <div className="p-4 bg-brand-blue/10 border-2 border-brand-blue mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 border-2 border-black ${parsedAction.type === 'ADD_EXPENSE' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-brand-blue tracking-widest">Natural Language Action Detected</p>
                  <p className="text-sm font-bold uppercase">
                    {parsedAction.type === 'ADD_EXPENSE' ? 'Record Expense' : 'Record Income'} of 
                    <span className="font-mono ml-2">${parsedAction.amount.toFixed(2)}</span>
                    {parsedAction.desc && <span className="text-gray-500 italic"> for {parsedAction.desc}</span>}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold border-2 border-black px-2 py-1 bg-white flex items-center gap-1">
                Press ENTER <ArrowRight size={10} />
              </span>
            </div>
          ) : null}

          <div className="space-y-1">
            {filteredCommands.map((cmd, index) => (
              <div
                key={cmd.id}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => { onExecute('COMMAND', cmd); onClose(); }}
                className={`p-3 border-2 transition-all flex items-center justify-between cursor-pointer ${
                  index === selectedIndex ? 'border-black bg-brand-blue text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1' : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-1.5 border ${index === selectedIndex ? 'border-white' : 'border-black'}`}>
                    {cmd.icon}
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs tracking-tight">{cmd.title}</p>
                    <p className={`text-[10px] font-medium ${index === selectedIndex ? 'text-blue-100' : 'text-gray-400'}`}>{cmd.description}</p>
                  </div>
                </div>
                {index === selectedIndex && (
                  <ArrowRight size={16} />
                )}
              </div>
            ))}
            {filteredCommands.length === 0 && !parsedAction && (
              <div className="p-8 text-center text-gray-400 font-mono text-sm italic">
                No commands matching "{query}"
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t-2 border-black bg-gray-50 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
           <div className="flex gap-4">
              <span className="flex items-center gap-1"><ArrowRight size={10} /> Select</span>
              <span className="flex items-center gap-1"><Zap size={10} /> Execute</span>
           </div>
           <div>CMD+K to toggle</div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
