
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
  Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

import { FinancialItem, BusinessData, CalculationResult, BankAccount, AccountType, Transaction, HistoryRecord } from './types';
import FinancialInput from './components/FinancialInput';
import BankInput from './components/BankInput';
import { generateFinancialInsight } from './services/geminiService';
import { APP_CONFIG } from './config';
import { initiateCheckout, getFormattedPrice } from './services/paymentService';
import { triggerHaptic } from './services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { setupDatabase, loadSnapshot, saveSnapshot, saveHistoryRecord, getHistoryRecords } from './services/databaseService';

const INITIAL_DATA: BusinessData = {
  transactions: [
    { id: 'ar1', name: 'Pending Invoice #1024', amount: 8500, type: 'INCOME', date_occurred: new Date().toISOString() },
    { id: 'ar2', name: 'Consulting Retainer', amount: 3200, type: 'INCOME', date_occurred: new Date().toISOString() },
    { id: 'ap1', name: 'Office Rent', amount: 2200, type: 'EXPENSE', date_occurred: new Date().toISOString() },
    { id: 'ap2', name: 'SaaS Subscriptions', amount: 450, type: 'EXPENSE', date_occurred: new Date().toISOString() },
  ],
  accounts: [
    { id: 'cc1', name: 'Business Amex', bankName: 'Amex', type: AccountType.CREDIT, amount: 1850 },
    { id: '1', name: 'Operating', bankName: 'Chase', type: AccountType.CHECKING, amount: 28000 },
    { id: '2', name: 'Tax Savings', bankName: 'Chase', type: AccountType.SAVINGS, amount: 12000 },
  ]
};

// --- PAYWALL COMPONENT ---
const PaywallModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
        setLoading(true);
        await triggerHaptic(ImpactStyle.Heavy);
        
        // Simulating the checkout flow here
        await initiateCheckout(APP_CONFIG.pricing.annualPrice, APP_CONFIG.pricing.currency);
        
        // If checkout succeeds, we run the success handler
        onSuccess();
        onClose();
    } catch (error) {
        console.error("Payment cancelled or failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white border-2 border-black shadow-swiss max-w-md w-full relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6 text-brand-blue">
            <Lock size={32} strokeWidth={2.5} />
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Unlock Pro</h2>
          </div>
          
          <h3 className="text-lg font-bold mb-2">Sustainable Economics</h3>
          <p className="text-gray-600 mb-6 text-sm">
            To preserve our precision infrastructure and unit economics, Numera offers a single optimized annual plan for web users.
          </p>

          <div className="bg-gray-50 border-2 border-black p-4 mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold uppercase text-sm">Annual Access</span>
              <span className="font-mono text-2xl font-bold text-brand-blue">{getFormattedPrice()}</span>
            </div>
            <p className="text-xs text-gray-500 font-mono">Billed yearly. Best value.</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-brand-blue text-white p-0.5 rounded-full"><Check size={12} /></div>
              Unlimited PDF Reports
            </li>
            <li className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-brand-blue text-white p-0.5 rounded-full"><Check size={12} /></div>
              Cross-Device Sync (Mobile/Web)
            </li>
            <li className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-brand-blue text-white p-0.5 rounded-full"><Check size={12} /></div>
              Priority Support
            </li>
          </ul>

          <button 
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors shadow-none hover:shadow-swiss border-2 border-transparent disabled:opacity-50"
          >
            {loading ? "Processing..." : "Subscribe Now"}
          </button>
          
          <div className="mt-4 text-center">
            <button onClick={onClose} className="text-xs text-gray-500 hover:text-black underline">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HISTORY COMPONENT ---
const HistoryModal = ({ onClose, history }: { onClose: () => void, history: HistoryRecord[] }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white border-2 border-black shadow-swiss max-w-2xl w-full relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="p-6 border-b-2 border-black">
          <div className="flex items-center gap-2 text-black">
            <History size={28} strokeWidth={2.5} />
            <h2 className="text-xl font-extrabold uppercase tracking-tight">Balance History</h2>
          </div>
        </div>

        <div className="overflow-y-auto p-0 flex-grow">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic">
              No history recorded yet. Use "Log Balance" to save a snapshot.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-black sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left font-bold uppercase text-xs text-gray-500">Date</th>
                  <th className="p-4 text-right font-bold uppercase text-xs text-gray-500">Assets</th>
                  <th className="p-4 text-right font-bold uppercase text-xs text-gray-500">Liabilities</th>
                  <th className="p-4 text-right font-bold uppercase text-xs text-black">BNE</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-medium text-gray-600">
                      {new Date(record.date).toLocaleDateString()} <span className="text-gray-400 text-xs ml-1">{new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-4 text-right font-mono text-gray-600">
                      {APP_CONFIG.branding.currencySymbol}{record.assets.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono text-gray-600">
                      {APP_CONFIG.branding.currencySymbol}{record.liabilities.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-black">
                      {APP_CONFIG.branding.currencySymbol}{record.bne.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [data, setData] = useState<BusinessData>(INITIAL_DATA);
  const [isPro, setIsPro] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Initialization Logic
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Setup Database
        const isDbReady = await setupDatabase();
        
        if (isDbReady) {
          // 2. Load Persisted Snapshot
          const savedData = await loadSnapshot();
          if (savedData) {
            setData(savedData);
          }
          
          // 3. Load Pro Status
          const savedProStatus = localStorage.getItem('numera_pro_status');
          if (savedProStatus === 'true') {
            setIsPro(true);
          }

          // 4. Load History
          const savedHistory = await getHistoryRecords();
          setHistory(savedHistory);
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    init();
  }, []);

  const [aiInsight, setAiInsight] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [useStrictFormula, setUseStrictFormula] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Persistence: Auto-save when data changes
  useEffect(() => {
    if (isInitialized) {
      saveSnapshot(data).catch(err => console.error("Auto-save failed", err));
    }
  }, [data, isInitialized]);

  // Derived State
  const accountsReceivable = data.transactions.filter(t => t.type === 'INCOME');
  const accountsPayable = data.transactions.filter(t => t.type === 'EXPENSE');
  const bankAccounts = data.accounts.filter(a => a.type !== AccountType.CREDIT);
  const creditCards = data.accounts.filter(a => a.type === AccountType.CREDIT);

  // Calculations
  const calculations: CalculationResult = useMemo(() => {
    const sumItems = (items: {amount: number}[]) => 
      items.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));

    const totalAR = sumItems(accountsReceivable);
    const totalAP = sumItems(accountsPayable);
    const totalCredit = sumItems(creditCards);
    const totalBank = sumItems(bankAccounts);

    const bankBreakdown: Record<string, number> = {};
    bankAccounts.forEach(acc => {
      const name = acc.bankName || 'Other';
      const current = new Decimal(bankBreakdown[name] || 0);
      bankBreakdown[name] = current.plus(acc.amount || 0).toNumber();
    });

    const netReceivables = totalAR.minus(totalAP);
    const netBank = totalBank.minus(totalCredit);
    
    const bneStrict = netReceivables.minus(netBank);
    const bneEquity = netReceivables.plus(netBank);

    const bne = useStrictFormula ? bneStrict : bneEquity;
    const operator = useStrictFormula ? '-' : '+';
    const bneFormulaStr = `(AR - AP) ${operator} (B - C)`;

    return {
      totalAR: totalAR.toNumber(),
      totalAP: totalAP.toNumber(),
      totalCredit: totalCredit.toNumber(),
      totalBank: totalBank.toNumber(),
      bankBreakdown,
      netReceivables: netReceivables.toNumber(),
      netBank: netBank.toNumber(),
      bne: bne.toNumber(),
      bneFormulaStr
    };
  }, [accountsReceivable, accountsPayable, creditCards, bankAccounts, useStrictFormula]);

  // Handlers
  const handleUpdateTransactions = (type: 'INCOME' | 'EXPENSE', items: FinancialItem[]) => {
    const others = data.transactions.filter(t => t.type !== type);
    const updated = items.map(item => ({
       ...item,
       type,
       date_occurred: (item as any).date_occurred || new Date().toISOString()
    })) as Transaction[];
    
    setData(prev => ({ ...prev, transactions: [...others, ...updated] }));
  };

  const handleUpdateBanks = (items: BankAccount[]) => {
    const others = data.accounts.filter(a => a.type === AccountType.CREDIT);
    setData(prev => ({ ...prev, accounts: [...others, ...items] }));
  };

  const handleUpdateCredit = (items: FinancialItem[]) => {
    const others = data.accounts.filter(a => a.type !== AccountType.CREDIT);
    const updated = items.map(item => ({
        ...item,
        type: AccountType.CREDIT,
        bankName: (item as any).bankName || 'Credit Card'
    })) as BankAccount[];
    setData(prev => ({ ...prev, accounts: [...others, ...updated] }));
  };

  const handleProUpgrade = () => {
    setIsPro(true);
    localStorage.setItem('numera_pro_status', 'true');
    alert("Welcome to Numera Pro! Export unlocked.");
  };

  const handleExportClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    triggerHaptic(ImpactStyle.Light);

    if (isPro) {
        alert("Generating PDF Report... (Success)");
    } else {
        setShowPaywall(true);
    }
  };

  const handleLogBalance = async () => {
    await triggerHaptic(ImpactStyle.Heavy);
    
    const assets = calculations.totalAR + calculations.totalBank;
    const liabilities = calculations.totalAP + calculations.totalCredit;

    const record: HistoryRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      bne: calculations.bne,
      assets,
      liabilities
    };

    try {
      await saveHistoryRecord(record);
      // Update local state immediately
      setHistory(prev => [record, ...prev]);
      alert("Balance Logged Successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to log balance");
    }
  };

  const handleAiGenerate = async () => {
    await triggerHaptic(ImpactStyle.Medium);
    setIsGeneratingAi(true);
    const bankDetails = Object.entries(calculations.bankBreakdown)
        .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`)
        .join(', ');
        
    const result = await generateFinancialInsight(calculations, bankDetails);
    setAiInsight(result);
    setIsGeneratingAi(false);
  };

  const handleClearData = async () => {
    await triggerHaptic(ImpactStyle.Heavy);
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setData({ transactions: [], accounts: [] });
      if (Capacitor.getPlatform() === 'web') {
        localStorage.removeItem('numera_mock_db');
      }
    }
  };

  const toggleFormula = (strict: boolean) => {
    triggerHaptic(ImpactStyle.Light);
    setUseStrictFormula(strict);
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (Capacitor.getPlatform() !== 'web') {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') {
        Keyboard.hide().catch(() => {});
      }
    }
  };

  const chartData = [
    { name: 'Assets', value: calculations.totalAR + calculations.totalBank, fill: '#000000' },
    { name: 'Liabilities', value: calculations.totalAP + calculations.totalCredit, fill: '#000000' }, 
    { name: 'Net', value: calculations.bne, fill: '#2563EB' }, 
  ];

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-brand-white flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4">
           <Database className="w-16 h-16 mx-auto text-brand-blue animate-pulse" />
           <h1 className="text-2xl font-extrabold text-black uppercase">Initializing Core</h1>
           <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
             Securing Local Storage...
           </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-brand-white p-3 md:p-8 pb-32 font-sans relative"
      onClick={handleBackgroundClick}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {showPaywall && (
        <PaywallModal 
            onClose={() => setShowPaywall(false)} 
            onSuccess={handleProUpgrade} 
        />
      )}

      {showHistory && (
        <HistoryModal 
          onClose={() => setShowHistory(false)}
          history={history}
        />
      )}
      
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b-4 border-black pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <SquareActivity className="text-brand-blue w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-black">
                {APP_CONFIG.branding.name}
              </h1>
              {isPro && <div className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase rounded-sm flex items-center gap-1"><Crown size={12}/> PRO</div>}
            </div>
            <p className="text-sm md:text-lg font-medium text-black">{APP_CONFIG.branding.description}</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 w-full md:w-auto">
            {/* History and Capture Buttons */}
            <div className="flex gap-2 w-full md:w-auto">
               <button
                 onClick={() => setShowHistory(true)}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-bold uppercase text-sm border-2 border-black hover:bg-gray-100 transition-all"
               >
                 <History size={18} />
                 History
               </button>
               <button
                 onClick={handleLogBalance}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-bold uppercase text-sm border-2 border-transparent hover:bg-brand-blue hover:shadow-swiss transition-all"
               >
                 <Save size={18} />
                 Log Balance
               </button>
            </div>

            <button 
              onClick={handleExportClick}
              className={`flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-sm border-2 transition-all w-full md:w-auto ${isPro ? 'bg-brand-blue text-white border-black hover:bg-blue-600' : 'bg-black text-white border-transparent hover:bg-gray-800'}`}
            >
              {isPro ? <Download size={18} /> : <Lock size={18} />}
              {isPro ? "Export Report" : "Unlock Export"}
            </button>
            
            <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Mode</span>
              <div className="flex border-2 border-black w-full md:w-auto">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFormula(false); }}
                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold uppercase transition-colors ${!useStrictFormula ? 'bg-brand-blue text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                      Standard
                  </button>
                  <div className="w-0.5 bg-black"></div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFormula(true); }}
                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold uppercase transition-colors ${useStrictFormula ? 'bg-brand-blue text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                      Strict
                  </button>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 bg-white border-2 border-black p-4 md:p-8 shadow-swiss relative">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-2">
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight">Business Net Exact</h2>
                <span className="font-mono text-xs bg-black text-white px-2 py-1">
                  {calculations.bneFormulaStr}
                </span>
              </div>
              
              <div className="font-mono text-5xl md:text-7xl font-bold tracking-tight text-black mb-8 break-all">
                {APP_CONFIG.branding.currencySymbol}{calculations.bne.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 border-t-2 border-black pt-6">
                <div>
                  <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Net Receivables</span>
                  <span className={`text-xl md:text-2xl font-mono font-bold ${calculations.netReceivables >= 0 ? 'text-black' : 'text-red-600'}`}>
                    {APP_CONFIG.branding.currencySymbol}{calculations.netReceivables.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Net Liquid</span>
                  <span className={`text-xl md:text-2xl font-mono font-bold ${calculations.netBank >= 0 ? 'text-brand-blue' : 'text-red-600'}`}>
                    {APP_CONFIG.branding.currencySymbol}{calculations.netBank.toLocaleString()}
                  </span>
                </div>
              </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
            <div className="bg-white border-2 border-black p-4 md:p-6 flex-1 shadow-swiss flex flex-col justify-center min-h-[140px]">
              <h3 className="text-sm font-bold uppercase mb-2 md:mb-4 text-gray-500">Liquid Assets</h3>
              <div className="text-3xl md:text-4xl font-mono font-bold text-black">
                {APP_CONFIG.branding.currencySymbol}{calculations.totalBank.toLocaleString()}
              </div>
            </div>
            <div className="bg-brand-black text-white p-4 md:p-6 flex-1 shadow-swiss border-2 border-black min-h-[140px]">
               <h3 className="text-sm font-bold uppercase mb-2 md:mb-4 text-gray-400">Total Liability</h3>
               <div className="text-3xl font-mono font-bold">
                 {APP_CONFIG.branding.currencySymbol}{(calculations.totalAP + calculations.totalCredit).toLocaleString()}
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 items-start">
          <div className="space-y-8">
            <BankInput 
              accounts={bankAccounts} 
              onUpdate={handleUpdateBanks} 
            />
            <FinancialInput
              title="Credit Cards"
              items={creditCards}
              onUpdate={handleUpdateCredit}
              icon={<CreditCard className="text-black" size={24} />}
            />
          </div>

          <div className="space-y-8">
            <FinancialInput
              title="Accounts Receivable"
              items={accountsReceivable}
              onUpdate={(items) => handleUpdateTransactions('INCOME', items)}
              icon={<ArrowRightLeft className="text-black" size={24} />}
            />
             <FinancialInput
              title="Accounts Payable"
              items={accountsPayable}
              onUpdate={(items) => handleUpdateTransactions('EXPENSE', items)}
              icon={<Wallet className="text-black" size={24} />}
            />
          </div>

          <div className="space-y-8 lg:col-span-2 2xl:col-span-1">
              <div className="bg-white p-4 md:p-6 border-2 border-black shadow-swiss flex flex-col">
                 <h3 className="text-black font-bold uppercase mb-4 flex items-center gap-2 shrink-0">
                    <TrendingUp size={20} />
                    Distribution
                 </h3>
                 <div className="h-48 md:h-56 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 600 }} />
                           <Tooltip 
                               cursor={{ fill: '#f3f4f6' }}
                               contentStyle={{ border: '2px solid black', borderRadius: '0px', boxShadow: '4px 4px 0px 0px black' }}
                               itemStyle={{ fontFamily: 'Roboto Mono', fontWeight: 'bold' }}
                           />
                           <Bar dataKey="value">
                               {chartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-brand-gray p-4 md:p-6 border-2 border-black">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-black font-bold uppercase flex items-center gap-2">
                        <BrainCircuit size={20} />
                        AI Analysis
                    </h3>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleAiGenerate(); }}
                        disabled={isGeneratingAi}
                        className="p-3 bg-brand-blue text-white border-2 border-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                        {isGeneratingAi ? <RefreshCcw className="animate-spin" size={20}/> : <Calculator size={20}/>}
                    </button>
                 </div>
                 
                 <div className="min-h-[140px] text-sm font-medium leading-relaxed font-mono bg-white p-4 border-2 border-black">
                    {isGeneratingAi ? (
                        <div className="flex items-center gap-2 text-brand-blue">
                            <span className="animate-pulse">Crunching numbers...</span>
                        </div>
                    ) : aiInsight ? (
                        <div className="prose prose-sm">
                            {aiInsight}
                        </div>
                    ) : (
                        <p className="text-gray-400">
                            Generate an AI executive summary of your liquidity and solvency position.
                        </p>
                    )}
                 </div>
              </div>
          </div>
        </div>

        <footer className="border-t-4 border-black mt-16 pt-12 pb-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm font-bold">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <a href={APP_CONFIG.legal.privacyUrl} className="hover:text-brand-blue underline decoration-2">Privacy Policy</a>
                  <a href={APP_CONFIG.legal.termsUrl} className="hover:text-brand-blue underline decoration-2">Terms of Use</a>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleClearData(); }}
                className="text-red-600 hover:bg-red-50 px-4 py-2 border-2 border-transparent hover:border-red-600 transition-all flex items-center gap-2 w-full md:w-auto justify-center md:justify-start"
              >
                 <Eraser size={16} />
                 RESET DATA
              </button>
           </div>
           
           <div className="mt-8 text-xs text-gray-500 max-w-2xl font-mono leading-relaxed">
              <p className="mb-2">© 2025 {APP_CONFIG.branding.name}. All rights reserved.</p>
              <p>
                <strong>DISCLAIMER:</strong> {APP_CONFIG.legal.disclaimer} 
                The calculations provided herein do not constitute financial, legal, or tax advice. 
                Users should consult with a qualified professional before making any financial decisions. 
                {APP_CONFIG.branding.name} assumes no liability for errors, omissions, or actions taken based on these results.
              </p>
           </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
