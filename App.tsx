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
  Shield,
  FileText,
  Wrench,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Receipt,
  Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

import { FinancialItem, BusinessData, CalculationResult, BankAccount, AccountType, Transaction, HistoryRecord, BudgetTargets, PricingItem } from './types';
import FinancialInput from './components/FinancialInput';
import BankInput from './components/BankInput';
import RecurringTransactions from './components/RecurringTransactions';
import CashFlowForecast from './components/CashFlowForecast';
import BusinessTools from './components/BusinessTools';
import CommandPalette from './components/CommandPalette'; // New import
import { generateFinancialInsight } from './services/geminiService';
import { APP_CONFIG } from './config';
import { initiateCheckout, getFormattedPrice } from './services/paymentService';
import { triggerHaptic } from './services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { setupDatabase, loadSnapshot, saveSnapshot, saveHistoryRecord, getHistoryRecords } from './services/databaseService';
import { processPendingRecurring } from './services/recurringService';

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
  pricingSheet: []
};

// --- LEGAL MODAL COMPONENT ---
const LegalModal = ({ type, onClose }: { type: 'privacy' | 'terms', onClose: () => void }) => {
  const isPrivacy = type === 'privacy';
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
            {isPrivacy ? <Shield size={28} strokeWidth={2.5} /> : <FileText size={28} strokeWidth={2.5} />}
            <h2 className="text-xl font-extrabold uppercase tracking-tight">{isPrivacy ? 'Privacy Policy' : 'Terms of Use'}</h2>
          </div>
        </div>

        <div className="overflow-y-auto p-6 text-sm text-gray-600 leading-relaxed space-y-4">
          {isPrivacy ? (
             <>
               <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
               <p>At {APP_CONFIG.branding.name}, we prioritize your privacy. This policy outlines how we handle your data.</p>
               <h3 className="text-black font-bold uppercase mt-4">1. Data Minimization</h3>
               <p>We practice local-first data storage. Your financial data is stored primarily on your device (via SQLite on mobile or LocalStorage on web). We do not sell your personal data.</p>
               <h3 className="text-black font-bold uppercase mt-4">2. AI Processing</h3>
               <p>When you use the AI Analysis feature, a momentary snapshot of your balance data is sent to our secure servers to interface with Google's Gemini API. This data is not persisted on our servers after the analysis is returned.</p>
               <h3 className="text-black font-bold uppercase mt-4">3. Third Party Services</h3>
               <p>We use RevenueCat for payment processing on mobile and Google Cloud for hosting. These services may collect standard usage telemetry.</p>
             </>
          ) : (
             <>
               <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
               <h3 className="text-black font-bold uppercase mt-4">1. Acceptance</h3>
               <p>By using {APP_CONFIG.branding.name}, you agree to these terms.</p>
               <h3 className="text-black font-bold uppercase mt-4">2. Disclaimer</h3>
               <p>{APP_CONFIG.legal.disclaimer} The calculations provided are for estimation purposes only. Always consult a certified accountant.</p>
               <h3 className="text-black font-bold uppercase mt-4">3. Subscriptions</h3>
               <p>Pro subscriptions are billed annually. You may cancel at any time via your device settings (iOS/Android) or account dashboard (Web).</p>
             </>
          )}
        </div>
        
        <div className="p-4 border-t-2 border-black bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-black text-white font-bold uppercase text-sm hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAYWALL COMPONENT ---
const PaywallModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
        setLoading(true);
        await triggerHaptic(ImpactStyle.Heavy);
        
        // Simulating the checkout flow here. 
        // If Stripe is configured, this will redirect away from the page.
        // If Mock is configured, it will return success immediately.
        const result = await initiateCheckout(APP_CONFIG.pricing.annualPrice, APP_CONFIG.pricing.currency);
        
        if (result.success) {
            onSuccess();
            onClose();
        } else {
            throw new Error(result.error || "Payment initiation failed");
        }
    } catch (error) {
        console.error("Payment cancelled or failed", error);
        alert("Payment could not be initiated. Please try again.");
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
              Unlimited AI Insights
            </li>
            <li className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-brand-blue text-white p-0.5 rounded-full"><Check size={12} /></div>
              Unlimited Bank Accounts
            </li>
            <li className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-brand-blue text-white p-0.5 rounded-full"><Check size={12} /></div>
              Full History & Trends
            </li>
            <li className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-brand-blue text-white p-0.5 rounded-full"><Check size={12} /></div>
              PDF Export (Coming Soon)
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
  
  // Freemium limits for FREE users
  const [aiInsightsUsed, setAiInsightsUsed] = useState(0);
  const FREE_AI_INSIGHTS_LIMIT = 1; // 1 free AI insight per month
  const FREE_ACCOUNTS_LIMIT = 3; // Max 3 bank accounts

  const handleProUpgrade = () => {
    setIsPro(true);
    localStorage.setItem('numera_pro_status', 'true');
    // Remove query param without refreshing to keep URL clean
    if (window.history.pushState) {
        const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newurl},'',newurl);
    }
  };

  // Reset AI insights counter monthly
  useEffect(() => {
    const checkAndResetCounter = () => {
      const lastReset = localStorage.getItem('numera_ai_reset_date');
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
      
      if (lastReset !== currentMonth) {
        localStorage.setItem('numera_ai_reset_date', currentMonth);
        localStorage.setItem('numera_ai_used', '0');
        setAiInsightsUsed(0);
      } else {
        const used = parseInt(localStorage.getItem('numera_ai_used') || '0');
        setAiInsightsUsed(used);
      }
    };
    
    checkAndResetCounter();
  }, []);

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
          
          // 3. Load Pro Status (Local)
          const savedProStatus = localStorage.getItem('numera_pro_status');
          if (savedProStatus === 'true') {
            setIsPro(true);
          }

          // 4. Check for Stripe Redirects (Success or Cancel)
          const params = new URLSearchParams(window.location.search);
          const paymentSuccess = params.get('payment_success');
          const paymentCanceled = params.get('payment_canceled');

          if (paymentSuccess === 'true') {
             setIsPro(true);
             localStorage.setItem('numera_pro_status', 'true');
             alert("Thank you! Pro features have been unlocked successfully.");
          } else if (paymentCanceled === 'true') {
             alert("Payment was canceled. No charges were made.");
          }

          // Clean URL parameters if present
          if (paymentSuccess || paymentCanceled) {
             if (window.history.pushState) {
                 const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                 window.history.pushState({path:newurl},'',newurl);
             }
          }

          // 5. Load History
          const savedHistory = await getHistoryRecords();
          setHistory(savedHistory);
          
          // 6. Process recurring transactions
          console.log('[Recurring] Checking for pending recurring transactions...');
          const { toAdd, toNotify } = processPendingRecurring();
          console.log('[Recurring] Found:', { toAdd: toAdd.length, toNotify: toNotify.length });
          
          if (toAdd.length > 0) {
            console.log('[Recurring] Auto-adding transactions:', toAdd);
            setData(prev => ({
              ...prev,
              transactions: [...prev.transactions, ...toAdd]
            }));
          }
          
          if (toNotify.length > 0) {
            console.log('[Recurring] Items waiting for confirmation:', toNotify);
            // TODO: Show notification modal
          }
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
  const [showCommandPalette, setShowCommandPalette] = useState(false); // New state
  const [isLogging, setIsLogging] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showTodo, setShowTodo] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showHourlyRate, setShowHourlyRate] = useState(false);
  const [showCashForecast, setShowCashForecast] = useState(false);
  const [legalView, setLegalView] = useState<'privacy' | 'terms' | null>(null);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  
  // Collapse States
  const [isApExpanded, setIsApExpanded] = useState(true);
  const [isOverheadsExpanded, setIsOverheadsExpanded] = useState(true);

  // Command Palette Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        triggerHaptic(ImpactStyle.Medium);
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandExecute = (action: string, params: any) => {
    console.log('[Command Engine] Executing:', action, params);
    triggerHaptic(ImpactStyle.Light);

    switch (action) {
      case 'NAVIGATION':
      case 'COMMAND':
        if (params.id === 'go_pricing') {
          setIsToolsExpanded(true);
          // Small delay to allow expansion animation
          setTimeout(() => {
            const el = document.getElementById('tools-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else if (params.id === 'go_history') {
          setShowHistory(true);
        } else if (params.id === 'go_profile') {
          setIsToolsExpanded(true);
          // Logic to set BusinessTools view would go here if we expose it
        }
        break;
      case 'ADD_EXPENSE':
        handleUpdateTransactions('EXPENSE', [
          ...accountsPayable,
          { id: crypto.randomUUID(), name: params.desc || 'Quick Expense', amount: params.amount }
        ]);
        break;
      case 'ADD_INCOME':
        handleUpdateTransactions('INCOME', [
          ...accountsReceivable,
          { id: crypto.randomUUID(), name: params.desc || 'Quick Income', amount: params.amount }
        ]);
        break;
    }
  };

  // Persistence: Auto-save when data changes
  useEffect(() => {
    if (isInitialized) {
      saveSnapshot(data).catch(err => console.error("Auto-save failed", err));
    }
  }, [data, isInitialized]);

  // Derived State
  const accountsReceivable = data.transactions.filter(t => t.type === 'INCOME');
  const accountsPayable = data.transactions.filter(t => t.type === 'EXPENSE');
  const monthlyOverhead = data.monthlyOverhead || [];
  const annualOverhead = data.annualOverhead || [];
  const bankAccounts = data.accounts.filter(a => a.type !== AccountType.CREDIT);
  const creditCards = data.accounts.filter(a => a.type === AccountType.CREDIT);

  const totalOverhead = useMemo(() => {
    const m = monthlyOverhead.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));
    const a = annualOverhead.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));
    return m.plus(a).toNumber();
  }, [monthlyOverhead, annualOverhead]);

  // Calculations
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
  }, [accountsReceivable, accountsPayable, monthlyOverhead, annualOverhead, creditCards, bankAccounts, useStrictFormula]);

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
  
  const handleUpdateMonthly = (items: FinancialItem[]) => {
    setData(prev => ({ ...prev, monthlyOverhead: items }));
  };

  const handleUpdateAnnual = (items: FinancialItem[]) => {
    setData(prev => ({ ...prev, annualOverhead: items }));
  };

  const handleUpdatePricing = (items: PricingItem[]) => {
    setData(prev => ({ ...prev, pricingSheet: items }));
  };

  const handleRecordTransaction = (tx: Transaction) => {
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, tx]
    }));
  };

  const handleUpdateTargets = (targets: BudgetTargets) => {
    setData(prev => ({ ...prev, targets }));
  };
  
  const toggleTools = () => {
    triggerHaptic(ImpactStyle.Medium);
    setIsToolsExpanded(!isToolsExpanded);
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
    if (isLogging) return;
    await triggerHaptic(ImpactStyle.Heavy);
    setIsLogging(true);
    
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
      setHistory(prev => [record, ...prev]);
      // alert("Balance Logged Successfully"); // Consider replacing alerts with a less intrusive toast notification system in the future
    } catch (err) {
      console.error(err);
      alert("Failed to log balance");
    } finally {
      setIsLogging(false);
    }
  };

  const handleAiGenerate = async () => {
    await triggerHaptic(ImpactStyle.Medium);
    
    // Check if free user has exceeded limit
    if (!isPro && aiInsightsUsed >= FREE_AI_INSIGHTS_LIMIT) {
      setShowPaywall(true);
      return;
    }
    
    try {
        setIsGeneratingAi(true);
        const bankDetails = Object.entries(calculations.bankBreakdown)
            .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`)
            .join(', ');
            
        const result = await generateFinancialInsight(calculations, bankDetails);
        setAiInsight(result);
        
        // Increment usage counter for free users
        if (!isPro) {
          const newCount = aiInsightsUsed + 1;
          setAiInsightsUsed(newCount);
          localStorage.setItem('numera_ai_used', newCount.toString());
        }
    } catch (e) {
        setAiInsight("Unable to generate insight at this time.");
    } finally {
        setIsGeneratingAi(false);
    }
  };

  const handleClearData = async () => {
    await triggerHaptic(ImpactStyle.Heavy);
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setData({ transactions: [], accounts: [] });
      if (Capacitor.getPlatform() === 'web') {
        localStorage.removeItem('numera_web_db');
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
      <CommandPalette 
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onExecute={handleCommandExecute}
      />

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
      
      {legalView && (
        <LegalModal 
          type={legalView} 
          onClose={() => setLegalView(null)} 
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
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start md:items-end gap-4 w-full md:w-auto">
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
                 disabled={isLogging}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-bold uppercase text-sm border-2 border-transparent hover:bg-brand-blue hover:shadow-swiss transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isLogging ? (
                   <>
                     <RefreshCcw size={18} className="animate-spin" />
                     Logging...
                   </>
                 ) : (
                   <>
                     <Save size={18} />
                     Log Balance
                   </>
                 )}
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
            <BankInput accounts={bankAccounts} onUpdate={handleUpdateBanks} defaultExpanded={true} />
            <FinancialInput title="Credit Cards" items={creditCards} onUpdate={handleUpdateCredit} icon={<CreditCard className="text-black" size={24} />} defaultExpanded={true} />
          </div>
          <div className="space-y-8">
            <FinancialInput title="Accounts Receivable" items={accountsReceivable} onUpdate={(items) => handleUpdateTransactions('INCOME', items)} icon={<ArrowRightLeft className="text-black" size={24} />} defaultExpanded={true} />
            
            {/* UNIFIED ACCOUNTS PAYABLE SECTION */}
            <div className="p-4 md:p-6 bg-white border-2 border-black shadow-swiss flex flex-col">
              <div 
                className="flex justify-between items-center mb-8 border-b-2 border-black pb-4 shrink-0 cursor-pointer group select-none"
                onClick={() => { triggerHaptic(ImpactStyle.Light); setIsApExpanded(!isApExpanded); }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-400 group-hover:text-black transition-colors">
                    {isApExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </div>
                  <Wallet className="text-black" size={24} />
                  <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-brand-blue transition-colors">Accounts Payable</h3>
                </div>
                <span className="text-xl font-mono font-bold">
                  ${calculations.totalAP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {isApExpanded && (
                <div className="space-y-12 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Overheads Category Group */}
                  <div className="border-2 border-black p-4 bg-gray-50/40 relative">
                      <div 
                        className="flex items-center gap-2 mb-6 border-b border-black pb-2 cursor-pointer group select-none"
                        onClick={() => { triggerHaptic(ImpactStyle.Light); setIsOverheadsExpanded(!isOverheadsExpanded); }}
                      >
                          <div className="text-gray-400 group-hover:text-black transition-colors">
                            {isOverheadsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                          <Layers size={18} className="text-brand-blue" />
                          <h4 className="font-extrabold uppercase text-sm tracking-tight group-hover:text-black transition-colors">Overheads</h4>
                          <div className="ml-auto font-mono text-xs font-bold bg-black text-white px-2 py-0.5">
                              ${totalOverhead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                      </div>
                      
                      {isOverheadsExpanded && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
                            <FinancialInput 
                            title="Monthly" 
                            items={monthlyOverhead} 
                            onUpdate={handleUpdateMonthly} 
                            icon={<CalendarDays className="text-brand-blue" size={18} />} 
                            variant="nested"
                            defaultExpanded={false}
                            />

                            <FinancialInput 
                            title="Annual" 
                            items={annualOverhead} 
                            onUpdate={handleUpdateAnnual} 
                            icon={<CalendarDays className="text-black" size={18} />} 
                            variant="nested"
                            defaultExpanded={false}
                            />
                        </div>
                      )}
                  </div>

                  <FinancialInput
                    title="One-Off Expenses"
                    items={accountsPayable}
                    onUpdate={(items) => handleUpdateTransactions('EXPENSE', items)}
                    icon={<Receipt className="text-black" size={20} />}
                    variant="nested"
                    defaultExpanded={true}
                  />
                </div>
              )}
            </div>
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


        <div className="space-y-6" id="tools-section">
           <button 
             onClick={toggleTools}
             className="w-full flex items-center justify-between group py-2 border-b-2 border-black/10 hover:border-black transition-all"
           >
              <div className="flex items-center gap-2">
                 <Wrench size={20} className={`${isToolsExpanded ? 'text-brand-blue' : 'text-gray-400'} group-hover:text-brand-blue transition-colors`} />
                 <h2 className={`text-xl font-extrabold uppercase tracking-tight ${isToolsExpanded ? 'text-black' : 'text-gray-400'} group-hover:text-black transition-colors`}>
                   Sales & Billing Tools
                 </h2>
              </div>
              <div className="p-1 border-2 border-transparent group-hover:border-black transition-all">
                {isToolsExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
           </button>
           
           {isToolsExpanded && (
             <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <BusinessTools 
                  isPro={isPro} 
                  onShowPaywall={() => setShowPaywall(true)} 
                  onRecordToAR={handleRecordTransaction} 
                  targets={data.targets}
                  actuals={{
                    ar: calculations.totalAR,
                    ap: calculations.totalAP,
                    credit: calculations.totalCredit
                  }}
                  onUpdateTargets={handleUpdateTargets}
                  pricingSheet={data.pricingSheet}
                  onUpdatePricing={handleUpdatePricing}
                  monthlyBurn={totalOverhead}
                  bne={calculations.bne}
                />
             </div>
           )}
        </div>

        {showRecurring && (
          <RecurringTransactions
            isPro={isPro}
            onUpgradeClick={() => { setShowRecurring(false); setShowPaywall(true); }}
            onClose={() => setShowRecurring(false)}
          />
        )}

        {showCashForecast && (
          <CashFlowForecast
            currentBNE={calculations.bne}
            isPro={isPro}
            onUpgradeClick={() => { setShowCashForecast(false); setShowPaywall(true); }}
            onClose={() => setShowCashForecast(false)}
          />
        )}

        <footer className="border-t-4 border-black mt-16 pt-12 pb-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm font-bold">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <button onClick={() => setLegalView('privacy')} className="hover:text-brand-blue underline decoration-2 text-left">Privacy Policy</button>
                  <button onClick={() => setLegalView('terms')} className="hover:text-brand-blue underline decoration-2 text-left">Terms of Use</button>
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