import React, { useState, useRef, useEffect } from 'react';
import { Wrench, ListTodo, DollarSign, TrendingUp, Calculator, ChevronDown } from 'lucide-react';

interface ToolsMenuProps {
  onToolSelect: (tool: 'todo' | 'pricing' | 'hourly' | 'forecast') => void;
}

export default function ToolsMenu({ onToolSelect }: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const tools = [
    { id: 'todo' as const, icon: ListTodo, label: 'To-Do List', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'pricing' as const, icon: DollarSign, label: 'Pricing Sheet', color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'hourly' as const, icon: Calculator, label: 'Hourly Rate', color: 'bg-teal-600 hover:bg-teal-700' },
    { id: 'forecast' as const, icon: TrendingUp, label: 'Cash Forecast', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  const handleToolClick = (toolId: 'todo' | 'pricing' | 'hourly' | 'forecast') => {
    onToolSelect(toolId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold uppercase text-sm border-2 border-black hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        <Wrench size={18} />
        Tools
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50">
          <div className="p-2 space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 ${tool.color} text-white font-bold rounded-lg transition-all border-2 border-black`}
              >
                <tool.icon size={20} />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
