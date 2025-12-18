import React, { useState } from 'react';
import { X, ListTodo, DollarSign, Clock, TrendingUp, Package, FileText } from 'lucide-react';
import TodoList from './tools/TodoList';
import PricingSheet from './tools/PricingSheet';
import CogsSheet from './tools/CogsSheet';
import HourlyRateCalculator from './tools/HourlyRateCalculator';
import CashFlowForecast from './tools/CashFlowForecast';
import MaterialsSheet from './tools/MaterialsSheet';

interface ToolsModalProps {
  isPro: boolean;
  onUpgradeClick: () => void;
  onClose: () => void;
}

type ToolType = 'todo' | 'invoice' | 'cogs' | 'materials' | 'hourly' | 'forecast' | null;

const ToolsModal: React.FC<ToolsModalProps> = ({ isPro, onUpgradeClick, onClose }) => {
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);

  const tools = [
    { id: 'todo', name: 'To-Do List', icon: ListTodo, description: 'Track your tasks and reminders', color: 'bg-purple-600' },
    { id: 'invoice', name: 'Invoice Generator', icon: FileText, description: 'Create and export invoices', color: 'bg-green-600' },
    { id: 'cogs', name: 'COGS Sheet', icon: DollarSign, description: 'Track cost of goods sold', color: 'bg-blue-600' },
    { id: 'materials', name: 'Materials Sheet', icon: Package, description: 'Track supplier costs with markup', color: 'bg-indigo-600' },
    { id: 'hourly', name: 'Hourly Rate Calculator', icon: Clock, description: 'Calculate your ideal hourly rate', color: 'bg-blue-600' },
    { id: 'forecast', name: 'Cash Flow Forecast', icon: TrendingUp, description: '30/60/90 day cash projections', color: 'bg-orange-600' },
  ];

  const renderTool = () => {
    switch (selectedTool) {
      case 'todo':
        return <TodoList />;
      case 'invoice':
        return <PricingSheet />;
      case 'cogs':
        return <CogsSheet />;
      case 'materials':
        return <MaterialsSheet />;
      case 'hourly':
        return <HourlyRateCalculator />;
      case 'forecast':
        return <CashFlowForecast />;
      default:
        return null;
    }
  };

  if (selectedTool) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white border-2 border-black shadow-swiss max-w-5xl w-full relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b-2 border-black flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTool(null)}
                className="px-4 py-2 bg-gray-200 text-black font-bold uppercase text-sm hover:bg-gray-300 transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-black">
                {tools.find(t => t.id === selectedTool)?.name}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {renderTool()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border-2 border-black shadow-swiss max-w-4xl w-full relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10"
        >
          <X size={24} />
        </button>
        
        <div className="p-6 border-b-2 border-black">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Contractor Tools</h2>
          <p className="text-sm text-gray-600 mt-1">Select a tool to get started</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id as ToolType)}
                  className="group text-left p-6 border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 bg-white hover:translate-x-[-4px] hover:translate-y-[-4px]"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${tool.color} p-3 border-2 border-black`}>
                      <Icon size={24} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg uppercase text-black group-hover:text-brand-blue transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tool.description}
                      </p>
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
