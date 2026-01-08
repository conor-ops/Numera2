
import React from 'react';
import { ArrowRight, Wallet, Receipt, Percent, Landmark, TrendingUp } from 'lucide-react';
import { CalculationResult } from '../types';

interface CashFlowRiverProps {
  data: CalculationResult;
  taxRate: number;
}

const CashFlowRiver: React.FC<CashFlowRiverProps> = ({ data, taxRate }) => {
  const format = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const totalIn = data.totalBank + data.totalAR;
  const totalOut = data.totalAP + data.totalCredit + (data.provisionedTax || 0);
  const net = data.bne;

  const getWidth = (val: number) => {
    if (totalIn === 0) return '0%';
    return `${Math.max((val / totalIn) * 100, 5)}%`;
  };

  return (
    <div className="bg-white border-2 border-black p-4 md:p-8 shadow-swiss animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-2 mb-8 border-b-2 border-black pb-4">
        <TrendingUp className="text-brand-blue" size={24} />
        <h3 className="text-lg font-black uppercase tracking-tight">Visual Cash Flow River</h3>
      </div>

      <div className="space-y-12">
        {/* Sources Level */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
             <div className="p-3 border-2 border-black bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Landmark size={14} className="text-brand-blue" />
                   <span className="text-[10px] font-black uppercase">Bank Liquidity</span>
                </div>
                <span className="font-mono font-bold text-xs">${format(data.totalBank)}</span>
             </div>
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 w-0.5 bg-black"></div>
          </div>
          <div className="relative">
             <div className="p-3 border-2 border-black bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Wallet size={14} className="text-brand-blue" />
                   <span className="text-[10px] font-black uppercase">Pending AR</span>
                </div>
                <span className="font-mono font-bold text-xs">${format(data.totalAR)}</span>
             </div>
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 w-0.5 bg-black"></div>
          </div>
        </div>

        {/* The Confluence / Bridge */}
        <div className="flex flex-col items-center">
            <div className="w-full h-8 border-2 border-black bg-brand-blue flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                <span className="relative z-10 text-[10px] font-black text-white uppercase tracking-widest">Total Assets Pool: ${format(totalIn)}</span>
            </div>
        </div>

        {/* Deductions / Outflows */}
        <div className="grid grid-cols-3 gap-2">
           <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-black mb-1"></div>
              <div className="w-full p-2 border-2 border-black bg-white text-center">
                 <p className="text-[8px] font-black uppercase text-gray-400">Liabilities</p>
                 <p className="text-[10px] font-mono font-bold text-red-600">-${format(data.totalAP + data.totalCredit)}</p>
              </div>
           </div>
           <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-black mb-1"></div>
              <div className="w-full p-2 border-2 border-black bg-white text-center">
                 <p className="text-[8px] font-black uppercase text-gray-400">Tax Provision</p>
                 <p className="text-[10px] font-mono font-bold text-orange-600">-${format(data.provisionedTax || 0)}</p>
              </div>
           </div>
           <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-black mb-1"></div>
              <div className="w-full p-2 border-2 border-black bg-black text-white text-center">
                 <p className="text-[8px] font-black uppercase text-gray-400">Net Profit (BNE)</p>
                 <p className="text-[10px] font-mono font-bold text-brand-blue">${format(data.bne)}</p>
              </div>
           </div>
        </div>

        {/* Final River Visualisation */}
        <div className="mt-8">
           <div className="h-12 w-full flex border-2 border-black overflow-hidden bg-gray-100">
              <div 
                className="bg-red-500/80 h-full border-r border-black relative group"
                style={{ width: getWidth(data.totalAP + data.totalCredit) }}
              >
                <div className="hidden group-hover:block absolute bottom-full mb-2 left-0 p-2 bg-black text-white text-[8px] whitespace-nowrap z-50">Debt & Expenses</div>
              </div>
              <div 
                className="bg-orange-500/80 h-full border-r border-black relative group"
                style={{ width: getWidth(data.provisionedTax || 0) }}
              >
                <div className="hidden group-hover:block absolute bottom-full mb-2 left-0 p-2 bg-black text-white text-[8px] whitespace-nowrap z-50">Tax Reserve</div>
              </div>
              <div 
                className="bg-brand-blue h-full flex-grow relative group"
              >
                <div className="hidden group-hover:block absolute bottom-full mb-2 right-0 p-2 bg-black text-white text-[8px] whitespace-nowrap z-50">Business Net Exact</div>
              </div>
           </div>
           <div className="flex justify-between mt-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Input Stream</span>
              <div className="flex items-center gap-1 text-[9px] font-black uppercase text-brand-blue">
                 Flow To Equity <ArrowRight size={10} />
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase">Retention Pool</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowRiver;
