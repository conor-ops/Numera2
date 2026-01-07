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
  Plus,
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
  Layers,
  AlertCircle,
  Building,
  HelpCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

// --- TOUR CONFIGURATION ---
const TOUR_STEPS = [
  {
    id: 'step-switcher',
    title: 'Workspace Switcher',
    content: 'Manage multiple businesses. Switch between different entities like Freelance and Agency here.',
    position: 'bottom'
  },
  {
    id: 'step-bne',
    title: 'Business Net Exact',
    content: 'Your true solvency metric. It calculates (AR - AP) + (Liquid - Credit) to show what you really own.',
    position: 'bottom'
  },
  {
    id: 'step-ai',
    title: 'AI Executive Summary',
    content: 'Click the calculator to get a direct stress-test and recommendation from Gemini AI.',
    position: 'left'
  },
  {
    id: 'step-ledger',
    title: 'Precision Ledger',
    content: 'The source of truth. Log bank balances, pending invoices, and upcoming bills here.',
    position: 'top'
  },
  {
    id: 'step-tools',
    title: 'Business Tools',
    content: 'Access professional invoicing, COGS calculators, and the 30-day Runway Trend predictor.',
    position: 'top'
  },
  {
    id: 'step-palette',
    title: 'Command Palette',
    content: 'Pro tip: Press CTRL+K (or CMD+K) anywhere to quickly log expenses using natural language.',
    position: 'center'
  }
];
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
import { setupDatabase, loadSnapshot, saveSnapshot, saveHistoryRecord, getHistoryRecords, getBusinesses, createBusiness, ensureDefaultBusiness } from './services/databaseService';
import { processPendingRecurring } from './services/recurringService';

const INITIAL_DATA: BusinessData = {
  businessId: '',
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

// --- FEATURE TOUR COMPONENT ---
const FeatureTour = ({ 
  step, 
  onNext, 
  onClose 
}: { 
  step: typeof TOUR_STEPS[0], 
  onNext: () => void, 
  onClose: () => void 
}) => {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    console.log(`[Tour] Navigating to step: ${step.id}`);
    const el = document.getElementById(step.id);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.warn(`[Tour] Target element NOT FOUND: ${step.id}`);
      // Default to center if element is missing to prevent crash
      setCoords({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        width: 0,
        height: 0
      });
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Backdrop with hole */}
      <div 
        className="absolute inset-0 bg-black/60 transition-all duration-500"
        style={{
          clipPath: coords.width > 0 
            ? `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />

      {/* Tip Card */}
      <div 
        className="absolute p-6 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-72 pointer-events-auto animate-in fade-in zoom-in duration-300"
        style={{
          top: step.position === 'bottom' ? coords.top + coords.height + 20 : Math.max(20, coords.top - 200),
          left: Math.max(20, Math.min(window.innerWidth - 300, coords.left + (coords.width / 2) - 144))
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Feature Tip</span>
          <button onClick={onClose}><X size={16}/></button>
        </div>
        <h3 className="text-lg font-black uppercase mb-2 leading-none">{step.title}</h3>
        <p className="text-xs font-medium text-gray-600 leading-relaxed mb-6">{step.content}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${TOUR_STEPS.indexOf(step) === i ? 'bg-black' : 'bg-gray-200'}`} />
            ))}
          </div>
          <button 
            onClick={() => {
              console.log('[Tour] Next clicked');
              onNext();
            }}
            className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue transition-colors flex items-center gap-2"
          >
            {TOUR_STEPS.indexOf(step) === TOUR_STEPS.length - 1 ? 'Finish' : 'Next Step'}
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- WORKSPACE SWITCHER COMPONENT ---
const WorkspaceSwitcher = ({ 
  businesses, 
  activeBusiness, 
  onSwitch, 
  onCreate, 
  isPro,
  planType 
}: { 
  businesses: Business[], 
  activeBusiness: Business, 
  onSwitch: (id: string) => void, 
  onCreate: () => void,
  isPro: boolean,
  planType: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isBusinessTier = isPro && planType === 'business';

  if (!activeBusiness) return null;

  return (
    <div className="relative">
      <button 
        id="step-switcher"
        onClick={() => {
          console.log('[Switcher] Toggle clicked');
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-2 border-black hover:bg-gray-200 transition-all text-xs font-black uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-0 active:translate-y-0.5"
      >
        <Building size={14} />
        {activeBusiness.name}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-40 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 bg-black text-white text-[10px] font-black uppercase tracking-widest flex justify-between items-center">
              Workspaces
              {isBusinessTier && <span className="bg-brand-blue px-1.5 py-0.5 rounded-sm">Business</span>}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y-2 divide-black/5">
              {businesses.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { 
                    console.log(`[Switcher] Switching to: ${b.name}`);
                    onSwitch(b.id); 
                    setIsOpen(false); 
                  }}
                  className={`w-full text-left p-4 hover:bg-brand-blue/5 transition-colors flex items-center justify-between group ${activeBusiness.id === b.id ? 'bg-brand-blue/10' : ''}`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase">{b.name}</span>
                    <span className="text-[9px] text-gray-400 font-mono">Created {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                  {activeBusiness.id === b.id && <Check size={14} className="text-brand-blue" />}
                </button>
              ))}
            </div>
            <div className="p-2 border-t-2 border-black bg-gray-50">
              <button
                onClick={() => { 
                  console.log('[Switcher] Create new clicked');
                  onCreate(); 
                  setIsOpen(false); 
                }}
                className="w-full py-2 flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 text-[10px] font-black uppercase text-gray-500 hover:text-brand-blue hover:border-brand-blue transition-all"
              >
                <Plus size={14} />
                New Workspace
              </button>
              {!isBusinessTier && (
                <p className="mt-2 text-[8px] text-center text-gray-400 font-bold uppercase">Upgrade to Business for Unlimited Workspaces</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
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
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business'>('pro');

  const handleSubscribe = async () => {
    try {
        setLoading(true);
        await triggerHaptic(ImpactStyle.Heavy);
        
        // Passing planType to initiateCheckout
        const result = await initiateCheckout(
          selectedPlan === 'pro' ? APP_CONFIG.pricing.annualPrice : 25, 
          APP_CONFIG.pricing.currency,
          selectedPlan
        );
        
        if (result.success) {
            onSuccess();
            onClose();
        } else {
            throw new Error(result.error || "Payment initiation failed");
        }
    } catch (error: any) {
        console.error("Payment cancelled or failed", error);
        alert(`Payment Error: ${error.message || 'Please try again.'}`);
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
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Choose Your Plan</h2>
          </div>
          
          {/* Plan Switcher */}
          <div className="flex border-2 border-black mb-6">
            <button 
              onClick={() => setSelectedPlan('pro')}
              className={`flex-1 py-3 text-sm font-bold uppercase transition-all ${selectedPlan === 'pro' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              Pro
            </button>
            <button 
              onClick={() => setSelectedPlan('business')}
              className={`flex-1 py-3 text-sm font-bold uppercase transition-all ${selectedPlan === 'business' ? 'bg-brand-blue text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              Business
            </button>
          </div>

          <div className="bg-gray-50 border-2 border-black p-4 mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold uppercase text-sm">{selectedPlan === 'pro' ? 'Pro Access' : 'Business Tier'}</span>
              <span className="font-mono text-2xl font-bold text-brand-blue">
                {selectedPlan === 'pro' ? getFormattedPrice() : '$25.00'}
              </span>
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
              {selectedPlan === 'pro' ? 'Unlimited Bank Accounts' : 'Unlimited Businesses & Teams'}
            </li>
            <li className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-brand-blue text-white p-0.5 rounded-full"><Check size={12} /></div>
              Full History & Trends
            </li>
            {selectedPlan === 'business' && (
              <li className="flex items-center gap-3 text-sm font-medium">
                <div className="bg-brand-blue text-white p-0.5 rounded-full"><Check size={12} /></div>
                Advanced Multi-Step Forecasting
              </li>
            )}
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
            {loading ? "Processing..." : `Get ${selectedPlan === 'pro' ? 'Pro' : 'Business'} Now`}
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

// --- ERROR BOUNDARY COMPONENT ---
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, errorInfo: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[Fatal Render Error]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
          <div className="max-w-2xl w-full border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6 overflow-hidden">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={40} strokeWidth={3} />
              <h1 className="text-2xl font-black uppercase tracking-tight">Render Crash Detected</h1>
            </div>
            
            <div className="bg-red-50 border-2 border-red-200 p-4 space-y-2">
              <p className="font-bold text-red-800 text-sm uppercase">Error Message:</p>
              <p className="font-mono text-xs font-bold text-red-600 break-words bg-white p-2 border border-red-100">
                {this.state.error?.toString()}
              </p>
            </div>

            {this.state.errorInfo && (
              <div className="space-y-2">
                <p className="font-bold text-gray-500 text-[10px] uppercase tracking-widest">Component Stack Trace:</p>
                <pre className="text-[9px] font-mono p-4 bg-gray-900 text-green-400 border-2 border-black overflow-x-auto max-h-[200px] leading-relaxed">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-red-600 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-0 active:translate-y-1"
              >
                Nuke All Local Data & Restart
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-tight hover:bg-gray-100 transition-colors border-2 border-black"
              >
                Simple Refresh
              </button>
            </div>
            
            <p className="text-[10px] font-medium text-gray-400 leading-tight">
              A "Nuke" will delete all locally stored ledger entries and documents. 
              Only use this if a Simple Refresh does not resolve the crash.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- MAIN APP COMPONENT ---
function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [data, setData] = useState<BusinessData>(INITIAL_DATA);
  const [isPro, setIsPro] = useState(false);
  const [planType, setPlanType] = useState<'pro' | 'business'>('pro');
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
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
      console.log('[App] Starting initialization...');
      try {
        // 1. Setup Database
        console.log('[App] Setting up database...');
        const isDbReady = await setupDatabase();
        
        if (isDbReady) {
          // 2. Ensure Business Exists & Load All
          console.log('[App] Loading businesses...');
          await ensureDefaultBusiness();
          const businessList = await getBusinesses();
          setBusinesses(businessList);

          // 3. Determine Active Business
          const lastActiveId = localStorage.getItem('numera_active_business_id');
          const found = businessList.find(b => b.id === lastActiveId) || businessList[0];
          setActiveBusiness(found);

          // 4. Load Persisted Snapshot for THIS business
          console.log(`[App] Loading snapshot for ${found.name}...`);
          const savedData = await loadSnapshot(found.id);
          if (savedData) {
            setData(savedData);
          } else {
            setData({ ...INITIAL_DATA, businessId: found.id });
          }
          
          // 5. Force Pro/Business Status for Testing
          setIsPro(true);
          setPlanType('business');
          console.log('[App] Paywalls removed for testing (Business Tier Active)');

          // 6. Check for Stripe Redirects (Success or Cancel)
          const params = new URLSearchParams(window.location.search);
          const paymentSuccess = params.get('payment_success');
          const paymentCanceled = params.get('payment_canceled');
          const purchasedPlan = (params.get('plan') || 'pro') as 'pro' | 'business';

          if (paymentSuccess === 'true') {
             setIsPro(true);
             setPlanType(purchasedPlan);
             localStorage.setItem('numera_pro_status', 'true');
             localStorage.setItem('numera_plan_type', purchasedPlan);
             
             const planLabel = purchasedPlan.toUpperCase();
             alert(`Thank you! Your ${planLabel} features have been unlocked successfully.`);
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

          // 7. Load History
          console.log('[App] Loading history records...');
          const savedHistory = await getHistoryRecords(found.id);
          setHistory(savedHistory);
          
          // 8. Process recurring transactions
          console.log('[Recurring] Checking for pending recurring transactions...');
          const { toAdd, toNotify } = processPendingRecurring();
          
          if (toAdd.length > 0) {
            setData(prev => ({
              ...prev,
              transactions: [...prev.transactions, ...toAdd]
            }));
          }
          
          console.log('[App] Initialization complete.');
        } else {
          throw new Error("Database setup failed");
        }
      } catch (error: any) {
        console.error("[App] Initialization failed:", error);
        setInitError(error.message || "Unknown boot error");
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

  const handleSwitchBusiness = async (id: string) => {
    if (!activeBusiness || id === activeBusiness.id) return;
    triggerHaptic(ImpactStyle.Medium);
    
    // 1. Save current
    await saveSnapshot(data);

    // 2. Load new
    const next = businesses.find(b => b.id === id);
    if (!next) return;

    setActiveBusiness(next);
    localStorage.setItem('numera_active_business_id', next.id);
    
    const nextData = await loadSnapshot(next.id);
    if (nextData) setData(nextData);
    else setData({ ...INITIAL_DATA, businessId: next.id });

    const nextHistory = await getHistoryRecords(next.id);
    setHistory(nextHistory);
  };

  const handleCreateBusiness = async () => {
    const isBusinessTier = isPro && planType === 'business';
    if (!isBusinessTier && businesses.length >= 1) {
      setShowPaywall(true);
      return;
    }

    const name = window.prompt("Enter workspace name (e.g., 'Freelance', 'Agency'):");
    if (!name) return;

    triggerHaptic(ImpactStyle.Heavy);
    const nb = await createBusiness(name);
    setBusinesses(prev => [...prev, nb]);
    await handleSwitchBusiness(nb.id);
  };

  // Persistence: Auto-save when data changes
  useEffect(() => {
    if (isInitialized && !initError && activeBusiness) {
      saveSnapshot(data).catch(err => console.error("Auto-save failed", err));
    }
  }, [data, isInitialized, initError, activeBusiness]);

  // Derived State
  const accountsReceivable = data.transactions.filter(t => t.type === 'INCOME');
  const accountsPayable = data.transactions.filter(t => t.type === 'EXPENSE');
  const monthlyOverhead = data.monthlyOverhead || [];
  const annualOverhead = data.annualOverhead || [];
  const bankAccounts = data.accounts.filter(a => a.type !== AccountType.CREDIT);
  const creditCards = data.accounts.filter(a => a.type === AccountType.CREDIT);

  const totalFixedOverhead = useMemo(() => {
    const m = monthlyOverhead.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));
    const a = annualOverhead.reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0)).div(12);
    return m.plus(a).toNumber();
  }, [monthlyOverhead, annualOverhead]);

  // Dynamic Burn: Fixed Overheads + Average of last 3 months of one-off expenses
  const dynamicBurn = useMemo(() => {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const recentExpenses = accountsPayable.filter(tx => {
        if (!tx.date_occurred) return false;
        const d = new Date(tx.date_occurred);
        return !isNaN(d.getTime()) && d >= threeMonthsAgo;
      });
      
      const totalRecent = recentExpenses.reduce((acc, tx) => acc.plus(new Decimal(tx.amount || 0)), new Decimal(0));
      const monthlyAverageOneOff = totalRecent.div(3).toNumber();
      
      const result = totalFixedOverhead + (isNaN(monthlyAverageOneOff) ? 0 : monthlyAverageOneOff);
      return isNaN(result) ? totalFixedOverhead : result;
    } catch (e) {
      console.error("Burn calculation failed", e);
      return totalFixedOverhead;
    }
  }, [accountsPayable, totalFixedOverhead]);

  const solvencyScore = useMemo(() => {
    try {
      if (calculations.totalBank === 0 && calculations.totalAR === 0) return 100;

      // 1. Cash to Debt Ratio (Goal: 2x cash vs credit)
      const cashRatio = calculations.totalCredit > 0 
        ? Math.min(1, calculations.totalBank / (calculations.totalCredit * 2))
        : 1;
      
      // 2. Burn Coverage (Goal: 3 months of dynamic burn)
      const burnCoverage = dynamicBurn > 0
        ? Math.min(1, calculations.totalBank / (dynamicBurn * 3))
        : 1;

      // 3. AR Health (Penalty for overdue)
      const overdueAr = accountsReceivable.filter((tx: any) => {
        if (!tx.date_due) return false;
        return new Date(tx.date_due) < new Date() && tx.status !== 'PAID';
      }).reduce((acc, tx) => acc + (tx.amount || 0), 0);
      
      const arPenalty = calculations.totalAR > 0 
        ? (overdueAr / calculations.totalAR) * 30 
        : 0;

      const baseScore = (cashRatio * 40) + (burnCoverage * 60);
      return Math.max(0, Math.round(baseScore - arPenalty));
    } catch (e) {
      return 0;
    }
  }, [calculations, dynamicBurn, accountsReceivable]);

  // Calculations
  const calculations: CalculationResult = useMemo(() => {
    try {
      const sumItems = (items: {amount: number}[]) => 
        (items || []).reduce((acc, i) => acc.plus(new Decimal(i.amount || 0)), new Decimal(0));

      const totalAR = sumItems(accountsReceivable);
      const totalOneOffAP = sumItems(accountsPayable);
      const totalMonthlyAP = sumItems(monthlyOverhead);
      const totalAnnualAP = sumItems(annualOverhead);
      const totalAP = totalOneOffAP.plus(totalMonthlyAP).plus(totalAnnualAP);
      const totalCredit = sumItems(creditCards);
      const totalBank = sumItems(bankAccounts);

      const bankBreakdown: Record<string, number> = {};
      (bankAccounts || []).forEach(acc => {
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

      const finalizeNum = (d: Decimal) => {
        const n = d.toNumber();
        return isNaN(n) ? 0 : n;
      };

      return {
        totalAR: finalizeNum(totalAR),
        totalAP: finalizeNum(totalAP),
        totalCredit: finalizeNum(totalCredit),
        totalBank: finalizeNum(totalBank),
        bankBreakdown,
        netReceivables: finalizeNum(netReceivables),
        netBank: finalizeNum(netBank),
        bne: finalizeNum(bne),
        bneFormulaStr
      };
    } catch (e) {
      console.error("Calculations crash", e);
      return {
        totalAR: 0, totalAP: 0, totalCredit: 0, totalBank: 0,
        bankBreakdown: {}, netReceivables: 0, netBank: 0, bne: 0,
        bneFormulaStr: 'ERROR'
      };
    }
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
    if (isLogging || !activeBusiness) return;
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
      await saveHistoryRecord(record, activeBusiness.id);
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
    if (!activeBusiness) return;
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
    if (window.confirm("Are you sure you want to clear ALL data? This will wipe your ledger, documents, and settings. This cannot be undone.")) {
      setData({ transactions: [], accounts: [], targets: { arTarget: 0, apTarget: 0, creditTarget: 0 }, monthlyOverhead: [], annualOverhead: [], pricingSheet: [] });
      if (Capacitor.getPlatform() === 'web') {
        const keysToRemove = [
          'numera_mock_db', 
          'numera_docs', 
          'numera_mock_history', 
          'numera_runway_history',
          'numera_pro_status',
          'numera_ai_used',
          'numera_ai_reset_date'
        ];
        // Remove individual keys + any keys starting with numera_setting_
        keysToRemove.forEach(k => localStorage.removeItem(k));
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('numera_setting_')) localStorage.removeItem(k);
        });
      }
      window.location.reload();
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

  if (initError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6">
           <div className="flex items-center gap-3 text-red-600">
             <AlertCircle size={40} strokeWidth={3} />
             <h1 className="text-2xl font-black uppercase">Recovery Mode</h1>
           </div>
           <p className="font-mono text-sm font-bold bg-gray-100 p-4 border-2 border-black">
             ERROR: {initError}
           </p>
           <p className="text-xs font-medium leading-relaxed">
             The local database failed to initialize. This can happen if local storage is corrupted or a recent update changed the data format.
           </p>
           <button 
             onClick={handleClearData}
             className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-red-600 transition-colors border-2 border-black"
           >
             Hard Reset (Wipe Data)
           </button>
           <p className="text-[10px] text-center text-gray-400 font-bold uppercase">WARNING: This will delete all your locally stored entries.</p>
        </div>
      </div>
    );
  }

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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SquareActivity className="text-brand-blue w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-black">
                {APP_CONFIG.branding.name}
              </h1>
              {isPro && <div className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase rounded-sm flex items-center gap-1"><Crown size={12}/> PRO</div>}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm md:text-lg font-medium text-black">{APP_CONFIG.branding.description}</p>
              {activeBusiness && (
                <WorkspaceSwitcher 
                  businesses={businesses} 
                  activeBusiness={activeBusiness} 
                  onSwitch={handleSwitchBusiness} 
                  onCreate={handleCreateBusiness}
                  isPro={isPro}
                  planType={planType}
                />
              )}
              <button 
                onClick={() => { 
                  console.log('[App] Feature Tips clicked');
                  if (!activeBusiness) {
                    console.error('[App] Cannot start tour: activeBusiness is null');
                    return;
                  }
                  triggerHaptic(ImpactStyle.Light); 
                  setShowTour(true); 
                  setTourStep(0); 
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white border-2 border-black hover:bg-blue-700 transition-all text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-0 active:translate-y-0.5"
              >
                <HelpCircle size={14} />
                Feature Tips
              </button>
            </div>
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
              {isPro ? "Export Report" : "Unlock Expert"}
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
          <div id="step-bne" className="lg:col-span-8 bg-white border-2 border-black p-4 md:p-8 shadow-swiss relative">
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

        <div id="step-ledger" className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 items-start">
          <div className="space-y-8">
            <BankInput 
              accounts={bankAccounts} 
              onUpdate={handleUpdateBanks} 
              defaultExpanded={true} 
              isPro={isPro}
              onUpgradeClick={() => setShowPaywall(true)}
            />
            <FinancialInput 
              title="Credit Cards" 
              items={creditCards} 
              onUpdate={handleUpdateCredit} 
              icon={<CreditCard className="text-black" size={24} />} 
              defaultExpanded={true} 
              type="OTHER" 
              isPro={isPro}
              onUpgradeClick={() => setShowPaywall(true)}
            />
          </div>
          <div className="space-y-8">
            <FinancialInput 
              title="Accounts Receivable" 
              items={accountsReceivable} 
              onUpdate={(items) => handleUpdateTransactions('INCOME', items)} 
              icon={<ArrowRightLeft className="text-black" size={24} />} 
              defaultExpanded={true} 
              type="INCOME" 
              isPro={isPro}
              onUpgradeClick={() => setShowPaywall(true)}
            />
            
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
                              ${totalFixedOverhead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                            type="OTHER"
                            isPro={isPro}
                            onUpgradeClick={() => setShowPaywall(true)}
                            />

                            <FinancialInput 
                            title="Annual" 
                            items={annualOverhead} 
                            onUpdate={handleUpdateAnnual} 
                            icon={<CalendarDays className="text-black" size={18} />} 
                            variant="nested"
                            defaultExpanded={false}
                            type="OTHER"
                            isPro={isPro}
                            onUpgradeClick={() => setShowPaywall(true)}
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
                    type="EXPENSE"
                    isPro={isPro}
                    onUpgradeClick={() => setShowPaywall(true)}
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

              <div id="step-ai" className="bg-brand-gray p-4 md:p-6 border-2 border-black">
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


        <div id="step-tools" className="space-y-6">
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
                  businessId={activeBusiness?.id || ''}
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
                  monthlyBurn={dynamicBurn}
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
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  localStorage.removeItem('numera_pro_status');
                  localStorage.removeItem('numera_plan_type');
                  setIsPro(false);
                  window.location.reload();
                }}
                className="text-gray-400 hover:text-black px-4 py-2 border-2 border-transparent hover:border-black transition-all flex items-center gap-2 w-full md:w-auto justify-center md:justify-start"
              >
                 <Lock size={16} />
                 RESET PRO STATUS
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

      {showTour && (
        <FeatureTour 
          step={TOUR_STEPS[tourStep]} 
          onNext={() => {
            triggerHaptic(ImpactStyle.Medium);
            if (tourStep < TOUR_STEPS.length - 1) setTourStep(tourStep + 1);
            else setShowTour(false);
          }}
          onClose={() => setShowTour(false)}
        />
      )}
    </div>
  );
}

export default function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}