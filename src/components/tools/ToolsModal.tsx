import React, { useState } from 'react';
import { X, Wrench, ListTodo, DollarSign, Clock, TrendingUp } from 'lucide-react';
import TodoList from './TodoList';
import PricingSheet from './PricingSheet';
import HourlyRateCalculator from './HourlyRateCalculator';
import CashFlowForecast from './CashFlowForecast';

type ToolType = 'todo' | 'pricing' | 'hourly' | 'cashflow';

interface ToolsModalProps {
  onClose: () => void;
}

const ToolsModal: React.FC<ToolsModalProps> = ({ onClose }) => {
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);

  const tools = [
    { id: 'todo' as ToolType, name: 'Todo List', icon: ListTodo, description: 'Manage tasks' },
    { id: 'pricing' as ToolType, name: 'Pricing Sheet', icon: DollarSign, description: 'Create quotes' },
    { id: 'hourly' as ToolType, name: 'Hourly Rate', icon: Clock, description: 'Calculate rates' },
    { id: 'cashflow' as ToolType, name: 'Cash Flow', icon: TrendingUp, description: '30/60/90 day forecast' },
  ];

  if (selectedTool) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black shadow-swiss max-w-4xl w-full relative flex flex-col max-h-[90vh]">
          <div className="p-4 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench size={24} strokeWidth={2.5} />
              <h2 className="text-xl font-extrabold uppercase tracking-tight">
                {tools.find(t => t.id === selectedTool)?.name}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTool(null)}
                className="px-4 py-2 bg-gray-200 text-black font-bold uppercase text-sm hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedTool === 'todo' && <TodoList />}
            {selectedTool === 'pricing' && <PricingSheet />}
            {selectedTool === 'hourly' && <HourlyRateCalculator />}
            {selectedTool === 'cashflow' && <CashFlowForecast />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-swiss max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-6 border-b-2 border-black">
          <div className="flex items-center gap-2 text-black">
            <Wrench size={28} strokeWidth={2.5} />
            <h2 className="text-xl font-extrabold uppercase tracking-tight">Business Tools</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className="p-6 border-2 border-black bg-white hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-black text-white group-hover:bg-gray-800 transition-colors">
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-bold uppercase text-lg mb-1">{tool.name}</h3>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsModal;
