
import React, { useState, useMemo } from 'react';
import { Zap, Clock, AlertTriangle, TrendingDown, Crown, RefreshCcw, Lock } from 'lucide-react';
import { Decimal } from 'decimal.js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { generateRunwayInsight } from '../services/geminiService';

interface RunwayPredictorProps {
  bne: number;
  monthlyBurn: number;
  pendingAr: number;
  isPro: boolean;
  onShowPaywall: () => void;
}

const RunwayPredictor: React.FC<RunwayPredictorProps> = ({ bne, monthlyBurn, pendingAr, isPro, onShowPaywall }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const dailyBurn = new Decimal(monthlyBurn).div(30);
  const daysRemaining = monthlyBurn > 0 ? new Decimal(bne).div(dailyBurn).toNumber() : 999;
  const survivalMonths = Math.min(Math.floor(daysRemaining / 30), 12);
  
  const handleAnalyze = async () => {
    if (!isPro) {
      onShowPaywall();
      return;
    }
    triggerHaptic(ImpactStyle.Medium);
    setIsGenerating(true);
    const insight = await generateRunwayInsight(bne, monthlyBurn, pendingAr);
    setAiInsight(insight);
    setIsGenerating(false);
  };

  const projectionData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 0; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const burnImpact = dailyBurn.times(30 * i);
      const conservativeBne = new Decimal(bne).minus(burnImpact).toNumber();
      const optimisticBne = new Decimal(bne).plus(pendingAr).minus(burnImpact).toNumber();
      
      data.push({
        name: date.toLocaleDateString(undefined, { month: 'short' }),
        conservative: Math.max(conservativeBne, 0),
        optimistic: Math.max(optimisticBne, 0)
      });
    }
    return data;
  }, [bne, dailyBurn, pendingAr]);

  const statusColor = daysRemaining > 120 ? 'bg-green-500' : daysRemaining > 60 ? 'bg-yellow-400' : 'bg-red-600';

  return (
    <div className="bg-white border-2 border-black shadow-swiss p-4 md:p-6 overflow-hidden">
      <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <Zap className="text-brand-blue" size={24} strokeWidth={2.5} />
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Runway Predictor</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase">AI-Powered Survival Analysis</p>
          </div>
        </div>
        {!isPro && <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-tighter"><Crown size={10} /> PRO</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left: Speedometer/Gauge */}
        <div className="space-y-4">
           <div className="flex justify-between items-end mb-1">
             <span className="text-xs font-bold uppercase text-gray-500">Days of Survival</span>
             <span className="text-2xl font-mono font-black">{daysRemaining === 999 ? '∞' : Math.floor(daysRemaining)}</span>
           </div>
           <div className="h-6 bg-gray-100 border-2 border-black relative">
              <div 
                className={`h-full transition-all duration-700 ${statusColor}`}
                style={{ width: `${Math.min((daysRemaining / 365) * 100, 100)}%` }}
              ></div>
           </div>
           <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase">
             <span>0 Days</span>
             <span>1 Year</span>
           </div>

           <div className="p-4 bg-gray-50 border-2 border-black">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <TrendingDown size={14} />
                <span className="text-[10px] font-bold uppercase">Estimated Burn Rate</span>
              </div>
              <div className="text-xl font-mono font-bold">${monthlyBurn.toLocaleString()}/mo</div>
           </div>
        </div>

        {/* Right: AI Insights Panel */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
             <label className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
               <Clock size={12} /> Stress Test Analysis
             </label>
             <button 
              onClick={handleAnalyze}
              disabled={isGenerating}
              className={`p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all bg-white hover:bg-brand-blue hover:text-white disabled:opacity-50`}
             >
               {isGenerating ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} />}
             </button>
          </div>
          <div className="flex-grow bg-white border-2 border-black p-4 text-xs font-mono font-medium leading-relaxed min-h-[120px]">
            {aiInsight ? (
              <div className="animate-in fade-in duration-500">{aiInsight}</div>
            ) : !isPro ? (
               <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-2">
                 <Lock size={20} />
                 <p className="uppercase font-black text-[9px]">Upgrade to Pro for AI Stress Test</p>
               </div>
            ) : (
              <p className="text-gray-400 italic">Run analysis to see how delays in AR impact your solvency timeline.</p>
            )}
          </div>
        </div>
      </div>

      {/* 6-Month Projection Chart (PRO ONLY) */}
      <div className="relative border-2 border-black p-4">
        {!isPro && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-4">
             <Crown size={32} className="text-brand-blue mb-2" />
             <h4 className="font-black uppercase text-sm mb-1">Unlock 6-Month Forecaster</h4>
             <button onClick={onShowPaywall} className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors">
               Subscribe to Pro
             </button>
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[10px] font-bold uppercase text-gray-500">Cash Flow Trajectory (6mo)</h4>
          <div className="flex gap-4 text-[9px] font-bold uppercase">
             <span className="flex items-center gap-1"><div className="w-2 h-2 bg-brand-blue"></div> Optimistic</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 bg-black"></div> Conservative</span>
          </div>
        </div>
        <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <XAxis dataKey="name" tick={{fontSize: 9, fontFamily: 'Roboto Mono', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 9, fontFamily: 'Roboto Mono', fontWeight: 'bold'}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ border: '2px solid black', borderRadius: '0', fontFamily: 'Roboto Mono', fontWeight: 'bold', fontSize: '10px' }}
                />
                <ReferenceLine y={0} stroke="#FF4F00" strokeWidth={2} />
                <Line type="stepAfter" dataKey="optimistic" stroke="#2563EB" strokeWidth={3} dot={false} />
                <Line type="stepAfter" dataKey="conservative" stroke="#000000" strokeWidth={3} dot={false} />
              </LineChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RunwayPredictor;
