
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Decimal } from 'decimal.js';
import { 
  ArrowRightLeft, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  BrainCircuit, 
  RefreshCcw,
  Eraser,
  SquareActivity,
  Calculator,
  Download,
  Lock,
  X,
  Check,
  Database,
  Crown,
  History,
  Save,
  Wrench,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Receipt,
  Layers,
  Search,
  Zap,
  FlaskConical,
  Coins,
  ShieldCheck,
  Activity,
  ShieldAlert,
  Package,
  Boxes
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

import { FinancialItem, BusinessData, CalculationResult, BankAccount, AccountType, Transaction, HistoryRecord, BudgetTargets, PricingItem, InventoryItem, AssetCategory } from './types';
import FinancialInput from '@/components/financial/FinancialInput';
import BankInput from '@/components/financial/BankInput';
import BusinessTools from '@/components/tools/BusinessTools';
import CommandPalette from '@/components/common/CommandPalette';
import RunwayPredictor from '@/components/financial/RunwayPredictor';
import ChatBot from '@/components/common/ChatBot';
import CashFlowRiver from '@/components/financial/CashFlowRiver';
import { generateFinancialInsight } from './services/geminiService';
import { APP_CONFIG } from './config';
import { initiateCheckout, getFormattedPrice } from './services/paymentService';
import { triggerHaptic } from './services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { setupDatabase, loadSnapshot, saveSnapshot, saveHistoryRecord, getHistoryRecords, getSetting, setSetting } from './services/databaseService';

import LogViewer from '@/components/common/LogViewer';
import { logInfo, logError, logSuccess } from '@/services/loggerService';

const INITIAL_DATA: BusinessData = {
  transactions: [
    { id: 'ar1', name: 'Pending Invoice #1024', amount: 8500, type: 'INCOME', date_occurred: new Date().toISOString() },
    { id: 'ar2', name: 'Consulting Retainer', amount: 3200, type: 'INCOME', date_occurred: new Date().toISOString() },
    { id: 'ap1', name: 'Raw Material Supplier', amount: 1200, type: 'EXPENSE', date_occurred: new Date().toISOString() },
  ],
  monthlyOverhead: [
    { id: 're1', name: 'Office Rent', amount: 2200 },
    { id: 're2', name: 'Cloud Server Overhead', amount: 450 },
    { id: 're3', name: 'Professional Insurance', amount: 200 },
  ],
  annualOverhead: [
    { id: 'ao1', name: 'Federal Tax Estimate', amount: 12000 },
    { id: 'ao2', name: 'Legal Retainer (Yearly)', amount: 2400 },
  ],
  accounts: [
    { id: 'cc1', name: 'Business Amex', bankName: 'Amex', type: AccountType.CREDIT, amount: 1850 },
    { id: '1', name: 'Operating', bankName: 'Chase', type: AccountType.CHECKING, amount: 28000 },
    { id: '2', name: 'Tax Savings', bankName: 'Chase', type: AccountType.SAVINGS, amount: 12000 },
  ],
  targets: {
    arTarget: 15000,
    apTarget: 5000,
    creditTarget: 2500
  },
  pricingSheet: [],
  inventory: [
    { id: 'inv1', name: 'Raw Lumber (Oak)', quantity: 250, unitCost: 12.50, category: AssetCategory.MATERIAL },
    { id: 'inv2', name: 'CNC Machine v3', quantity: 1, unitCost: 15000, category: AssetCategory.EQUIPMENT }
  ],
  taxRate: 25,
  reserveMonths: 3
};

const formatCurrency = (value: number) => {
  return value.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

const HealthScoreDisplay = ({ bne, monthlyExpenses }: { bne: number, monthlyExpenses: number }) => {
  const ratio = monthlyExpenses > 0 ? bne / monthlyExpenses : 12;
  const daysRunway = Math.floor(ratio * 30);
  
  let grade = 'F';
  let label = 'Critical';
  let color = 'text-red-600 bg-red-50';

  if (ratio > 10) { grade = 'A+'; label = 'Fortress'; color = 'text-brand-blue bg-blue-50'; }
  else if (ratio > 6) { grade = 'A'; label = 'Prime'; color = 'text-green-600 bg-green-50'; }
  else if (ratio > 3) { grade = 'B'; label = 'Stable'; color = 'text-green-600 bg-green-50'; }
  else if (ratio > 1) { grade = 'C'; label = 'Tight'; color = 'text-yellow-700 bg-yellow-50'; }
  else if (ratio > 0) { grade = 'D'; label = 'At Risk'; color = 'text-orange-700 bg-orange-50'; }

  return (
    <div className={`p-4 border-2 border-black shadow-swiss flex items-center gap-4 ${color}`}>
       <div className="text-4xl font-black">{grade}</div>
       <div className="h-10 w-0.5 bg-black/20"></div>
       <div>
         <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Runway Health</p>
         <p className="text-sm font-black uppercase tracking-tight">{label} ({daysRunway} Days)</p>
       </div>
    </div>
  );
};

const PaywallModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const handleSubscribe = async () => {
    try {
        setLoading(true);
        await triggerHaptic(ImpactStyle.Heavy);
        await initiateCheckout(APP_CONFIG.pricing.annualPrice, APP_CONFIG.pricing.currency);
        onSuccess();
        onClose();
    } catch (error) { console.error("Payment failed"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-swiss max-w-md w-full relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6 text-brand-blue">
            <Lock size={32} strokeWidth={2.5} />
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Unlock Pro</h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">Access AI Invoice Auditing, 6-Month Forecaster, and Market Intel.</p>
          <div className="bg-gray-50 border-2 border-black p-4 mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold uppercase text-sm">Annual Access</span>
              <span className="font-mono text-2xl font-bold text-brand-blue">{getFormattedPrice()}</span>
            </div>
          </div>
          <button onClick={handleSubscribe} disabled={loading} className="w-full py-3 bg-black text-white font-bold uppercase hover:bg-brand-blue transition-colors">
            {loading ? "Processing..." : "Subscribe Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryModal = ({ onClose, history }: { onClose: () => void, history: HistoryRecord[] }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white border-2 border-black shadow-swiss max-w-2xl w-full relative flex flex-col max-h-[85vh]">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={24} /></button>
      <div className="p-6 border-b-2 border-black flex items-center gap-2"><History size={28} /><h2 className="text-xl font-extrabold uppercase">Balance History</h2></div>
      <div className="overflow-y-auto p-0 flex-grow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-black sticky top-0">
            <tr><th className="p-4 text-left">Date</th><th className="p-4 text-right">Assets</th><th className="p-4 text-right">BNE</th></tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record.id} className="border-b border-gray-100">
                <td className="p-4 font-mono">{new Date(record.date).toLocaleDateString()}</td>
                <td className="p-4 text-right font-mono">${formatCurrency(record.assets)}</td>
                <td className="p-4 text-right font-mono font-bold">${formatCurrency(record.bne)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [data, setData] = useState<BusinessData>(INITIAL_DATA);
  const [sandboxData, setSandboxData] = useState<BusinessData | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const currentData = isSandbox && sandboxData ? sandboxData : data;

  const [isApExpanded, setIsApExpanded] = useState(true);
  const [isOverheadsExpanded, setIsOverheadsExpanded] = useState(true);

  useEffect(() => {
    const init = async () => {
      logInfo('App booting...');
      const isDbReady = await setupDatabase();
      if (isDbReady) {
        const savedData = await loadSnapshot();
        if (savedData) setData(savedData);
        
        // Ensure pro status is loaded correctly
        const savedProStatus = await getSetting('pro_status');
        logInfo('Loaded Pro Status', { status: savedProStatus });
        setIsPro(savedProStatus === 'true');
        
        const savedHistory = await getHistoryRecords();
        setHistory(savedHistory);
      }
      setIsInitialized(true);
      logSuccess('App initialized');
    };
    init();
  }, []);

  useEffect(() => {
    if (isInitialized && !isSandbox) saveSnapshot(data);
  }, [data, isInitialized, isSandbox]);

  const handleProSuccess = async () => {
    logSuccess('Upgrade Successful', { timestamp: new Date() });
    setIsPro(true);
    await setSetting('pro_status', 'true');
  };

  const handleResetPro = async () => {
    logInfo('Resetting Pro Status');
    setIsPro(false);
    await setSetting('pro_status', 'false');
    triggerHaptic(ImpactStyle.Heavy);
    window.location.reload(); // Force reload to clear any cached states
  };

  const accountsReceivable = currentData.transactions.filter(t => t.type === 'INCOME');
  const accountsPayable = currentData.transactions.filter(t => t.type === 'EXPENSE');
  const monthlyOverhead = currentData.monthlyOverhead || [];
  const annualOverhead = currentData.annualOverhead || [];
  const bankAccounts = currentData.accounts.filter(a => a.type !== AccountType.CREDIT);
  const creditCards = currentData.accounts.filter(a => a.type === AccountType.CREDIT);
  const inventory = currentData.inventory || [];

  const calculations: CalculationResult = useMemo(() => {
    const sumItems = (items: {amount: number}[]) => 
      items.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));

    const totalAR = sumItems(accountsReceivable);
    const totalOneOffAP = sumItems(accountsPayable);
    const totalMonthlyAP = sumItems(monthlyOverhead);
    const totalAnnualAP = sumItems(annualOverhead);
    const totalAP = totalOneOffAP.plus(totalMonthlyAP).plus(totalAnnualAP);

    const totalCredit = sumItems(creditCards);
    const totalBank = sumItems(bankAccounts);

    const materialValue = inventory.filter(i => i.category === AssetCategory.MATERIAL)
      .reduce((acc, i) => acc.plus(new Decimal(i.quantity).times(i.unitCost)), new Decimal(0)).toNumber();
    const equipmentValue = inventory.filter(i => i.category === AssetCategory.EQUIPMENT)
      .reduce((acc, i) => acc.plus(new Decimal(i.quantity).times(i.unitCost)), new Decimal(0)).toNumber();
    const inventoryValue = materialValue + equipmentValue;

    const bankBreakdown: Record<string, number> = {};
    bankAccounts.forEach(acc => {
      const name = acc.bankName || 'Other';
      bankBreakdown[name] = (bankBreakdown[name] || 0) + (acc.amount || 0);
    });

    const netReceivables = totalAR.minus(totalAP);
    const netBank = totalBank.minus(totalCredit);
    const bne = netReceivables.plus(netBank);
    
    const taxRate = currentData.taxRate || 0;
    const provisionedTax = netReceivables.gt(0) ? netReceivables.times(new Decimal(taxRate).div(100)).toNumber() : 0;
    const postTaxBne = bne.minus(provisionedTax).toNumber();

    return {
      totalAR: totalAR.toNumber(),
      totalAP: totalAP.toNumber(),
      totalCredit: totalCredit.toNumber(),
      totalBank: totalBank.toNumber(),
      bankBreakdown,
      netReceivables: netReceivables.toNumber(),
      netBank: netBank.toNumber(),
      bne: bne.toNumber(),
      bneFormulaStr: `(AR - AP) + (B - C)`,
      provisionedTax,
      postTaxBne,
      inventoryValue,
      materialValue,
      equipmentValue
    };
  }, [accountsReceivable, accountsPayable, monthlyOverhead, annualOverhead, creditCards, bankAccounts, currentData.taxRate, inventory]);

  const totalMonthlyOverhead = useMemo(() => {
    return monthlyOverhead.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0)).toNumber();
  }, [monthlyOverhead]);

  const totalOverhead = useMemo(() => {
    const m = monthlyOverhead.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));
    const a = annualOverhead.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));
    return m.plus(a).toNumber();
  }, [monthlyOverhead, annualOverhead]);

  const safeDrawAmount = useMemo(() => {
    const monthlyEx = totalMonthlyOverhead || currentData.targets.apTarget || 5000;
    const fortressReserves = monthlyEx * (currentData.reserveMonths || 3); 
    const liquidBuffer = calculations.bne - (calculations.provisionedTax || 0) - fortressReserves;
    return Math.max(liquidBuffer, 0);
  }, [calculations, currentData.reserveMonths, totalMonthlyOverhead, currentData.targets.apTarget]);

  const handleUpdateTransactions = (type: 'INCOME' | 'EXPENSE', items: FinancialItem[]) => {
    const updater = (prev: BusinessData) => {
      const others = prev.transactions.filter(t => t.type !== type);
      const updated = items.map(item => ({ ...item, type, date_occurred: (item as any).date_occurred || new Date().toISOString() })) as Transaction[];
      return { ...prev, transactions: [...others, ...updated] };
    };
    if (isSandbox) setSandboxData(prev => updater(prev || data)); else setData(updater);
  };

  const updateField = (field: keyof BusinessData, value: any) => {
    if (isSandbox) setSandboxData(prev => ({ ...(prev || data), [field]: value }));
    else setData(prev => ({ ...prev, [field]: value }));
  };

  if (!isInitialized) return <div className="h-screen bg-brand-white flex items-center justify-center font-mono">BOOTING CORE...</div>;

  return (
    <div className="min-h-screen bg-brand-white p-4 md:p-8 pb-32 relative">
      <div 
        style={{ position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 999999, display: 'flex', gap: '10px' }}
        className="no-print"
      >
        <LogViewer />
        <button 
          onClick={handleResetPro} 
          className="bg-red-600 text-white px-4 py-2 rounded-none border-4 border-white shadow-lg font-black text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <Eraser size={14} /> Reset Pro
        </button>
      </div>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onExecute={() => {}} />
      <ChatBot isPro={isPro} onShowPaywall={() => setShowPaywall(true)} onPostTransaction={(tx) => updateField('transactions', [...currentData.transactions, tx])} currentDataSummary={`BNE: $${calculations.bne.toFixed(2)}`} />
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onSuccess={handleProSuccess} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} history={history} />}

      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b-4 border-black pb-6">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <SquareActivity className="text-brand-blue w-10 h-10" />
              <h1 className="text-4xl font-extrabold tracking-tighter text-black uppercase">Solventless</h1>
              {isSandbox && <span className="bg-amber-500 text-white px-2 py-0.5 text-xs font-bold rounded-sm uppercase">Sandbox</span>}
              {isPro && <span className="bg-brand-blue text-white px-2 py-0.5 text-xs font-bold rounded-sm uppercase flex items-center gap-1"><Crown size={12}/> Pro</span>}
            </div>
            <p className="font-medium text-black">Precision Strategic Liquidity Control.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Salary Guard</p>
                <div className={`px-4 py-3 border-2 border-black font-black uppercase text-sm shadow-swiss flex items-center gap-3 ${safeDrawAmount > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                   <ShieldAlert size={18} />
                   <span>Safe Draw: ${formatCurrency(safeDrawAmount)}</span>
                </div>
             </div>
             <HealthScoreDisplay bne={calculations.bne} monthlyExpenses={totalOverhead} />
             <div className="flex gap-2">
                <button onClick={() => setIsSandbox(!isSandbox)} className={`px-4 py-3 border-2 border-black font-bold uppercase text-xs flex items-center gap-2 ${isSandbox ? 'bg-amber-100' : 'bg-white'}`}>
                   <FlaskConical size={16}/> {isSandbox ? "Live Mode" : "What-If"}
                </button>
                <button onClick={() => setShowHistory(true)} className="px-4 py-3 bg-white border-2 border-black font-bold uppercase text-xs flex items-center gap-2"><History size={16}/> History</button>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className={`lg:col-span-8 bg-white border-2 border-black p-8 shadow-swiss ${isSandbox ? 'bg-amber-50/50' : ''}`}>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold uppercase tracking-tight">Liquidity Runway (Exact)</h2>
                <span className="font-mono text-[10px] bg-black text-white px-2 py-1 uppercase">{calculations.bneFormulaStr}</span>
              </div>
              <div className="flex flex-col md:flex-row items-baseline gap-4 mb-8">
                <div className={`font-mono text-5xl md:text-7xl font-bold tracking-tight ${calculations.bne >= 0 ? 'text-green-600' : 'text-red-600'}`}>${formatCurrency(calculations.bne)}</div>
                {calculations.postTaxBne !== calculations.bne && <div className="font-mono text-2xl text-gray-600">→ ${formatCurrency(calculations.postTaxBne)} <span className="text-[10px] uppercase align-middle">Post-Tax</span></div>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 border-t-2 border-black pt-6">
                <div><span className="text-xs font-bold uppercase text-gray-500 block mb-1">Receivables</span><span className="text-2xl font-mono font-bold">${formatCurrency(calculations.netReceivables)}</span></div>
                <div><span className="text-xs font-bold uppercase text-gray-500 block mb-1">Liquid</span><span className="text-2xl font-mono font-bold text-brand-blue">${formatCurrency(calculations.netBank)}</span></div>
                <div><span className="text-xs font-bold uppercase text-gray-500 block mb-1">Asset Value</span><span className="text-2xl font-mono font-bold text-amber-600">${formatCurrency(calculations.inventoryValue)}</span></div>
                <div><span className="text-xs font-bold uppercase text-gray-500 block mb-1">Tax Provision</span><span className="text-2xl font-mono font-bold text-orange-600">${formatCurrency(calculations.provisionedTax!)}</span></div>
              </div>
           </div>
           <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white border-2 border-black p-6 flex-1 shadow-swiss">
                 <h3 className="text-xs font-bold uppercase text-gray-500 mb-4">Liquid Assets</h3>
                 <div className="text-4xl font-mono font-bold">${formatCurrency(calculations.totalBank)}</div>
              </div>
              <div className="bg-black text-white p-6 flex-1 shadow-swiss border-2 border-black">
                 <h3 className="text-xs font-bold uppercase text-gray-600 mb-4">Total Liabilities</h3>
                 <div className="text-4xl font-mono font-bold">${formatCurrency(calculations.totalAP + calculations.totalCredit)}</div>
              </div>
        </div>
        </div>

        {/* New Asset Breakdown Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-6 bg-white border-2 border-black shadow-swiss flex items-center gap-4">
              <Boxes className="text-amber-500" size={32} />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-600">Materials on Hand</p>
                <p className="text-xl font-mono font-black">${formatCurrency(calculations.materialValue)}</p>
              </div>
           </div>
           <div className="p-6 bg-white border-2 border-black shadow-swiss flex items-center gap-4">
              <Package className="text-brand-blue" size={32} />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-600">Equipment Equity</p>
                <p className="text-xl font-mono font-black">${formatCurrency(calculations.equipmentValue)}</p>
              </div>
           </div>
           <div className="p-6 bg-gray-50 border-2 border-black shadow-swiss flex items-center gap-4 border-dashed">
              <Coins className="text-green-600" size={32} />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-600">Total Net Worth</p>
                <p className="text-xl font-mono font-black">${formatCurrency(calculations.bne + calculations.inventoryValue)}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <CashFlowRiver data={calculations} taxRate={currentData.taxRate || 0} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <BankInput accounts={bankAccounts} onUpdate={(accs) => updateField('accounts', [...creditCards, ...accs])} />
                 <FinancialInput title="Credit Cards" items={creditCards} icon={<CreditCard size={24}/>} onUpdate={(ccs) => updateField('accounts', [...bankAccounts, ...ccs])} />
              </div>
              <RunwayPredictor bne={calculations.bne} monthlyBurn={totalOverhead} pendingAr={calculations.totalAR} isPro={isPro} onShowPaywall={() => setShowPaywall(true)} />
           </div>
           <div className="space-y-8">
              <FinancialInput title="Receivables" items={accountsReceivable} icon={<ArrowRightLeft size={24}/>} onUpdate={(items) => handleUpdateTransactions('INCOME', items)} />
              <div className="bg-white border-2 border-black p-6 shadow-swiss">
                 <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4 cursor-pointer" onClick={() => setIsApExpanded(!isApExpanded)}>
                    <div className="flex items-center gap-3"><Wallet size={24}/><h3 className="font-bold uppercase tracking-tight">Payables</h3></div>
                    <span className="font-mono font-bold">${formatCurrency(calculations.totalAP)}</span>
                 </div>
                 {isApExpanded && (
                   <div className="space-y-8">
                      <FinancialInput title="Monthly Overheads" items={monthlyOverhead} icon={<Layers size={18}/>} variant="nested" onUpdate={(items) => updateField('monthlyOverhead', items)} />
                      <FinancialInput title="Annual Overheads" items={annualOverhead} icon={<Layers size={18}/>} variant="nested" onUpdate={(items) => updateField('annualOverhead', items)} />
                      <FinancialInput title="One-Off Costs" items={accountsPayable} icon={<Receipt size={18}/>} variant="nested" onUpdate={(items) => handleUpdateTransactions('EXPENSE', items)} />
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <button onClick={() => setIsToolsExpanded(!isToolsExpanded)} className="w-full py-4 border-b-2 border-black/10 hover:border-black flex justify-between items-center transition-all">
              <div className="flex items-center gap-2"><Wrench size={20} className="text-brand-blue" /><h2 className="text-xl font-extrabold uppercase">Strategic Growth Tools</h2></div>
              {isToolsExpanded ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
           </button>
           {isToolsExpanded && (
             <BusinessTools 
               isPro={isPro} 
               onShowPaywall={() => setShowPaywall(true)} 
               onRecordToAR={(tx) => updateField('transactions', [...currentData.transactions, tx])} 
               targets={currentData.targets} 
               onUpdateTargets={(t) => updateField('targets', t)}
               pricingSheet={currentData.pricingSheet}
               onUpdatePricing={(p) => updateField('pricingSheet', p)}
               onUpdateTaxRate={(r) => updateField('taxRate', r)}
               taxRate={currentData.taxRate}
               actuals={{ ar: calculations.totalAR, ap: calculations.totalAP, credit: calculations.totalCredit }}
               calculations={{
                 bne: calculations.bne,
                 provisionedTax: calculations.provisionedTax || 0,
                 totalAP: calculations.totalAP,
                 totalCredit: calculations.totalCredit
               }}
               reserveMonths={currentData.reserveMonths || 3}
               onUpdateReserveMonths={(val) => updateField('reserveMonths', val)}
               monthlyOverhead={totalMonthlyOverhead}
               inventory={currentData.inventory || []}
               onUpdateInventory={(inv) => updateField('inventory', inv)}
             />
           )}
        </div>
      </div>
    </div>
  );
}

export default App;

