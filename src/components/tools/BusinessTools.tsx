
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, 
  Receipt, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Download, 
  ArrowRight,
  Database,
  X,
  Building,
  Settings,
  History,
  CheckCircle2,
  Clock,
  Lock,
  Crown,
  Target,
  Calculator,
  Tag,
  RefreshCw,
  Search,
  Globe,
  ExternalLink,
  Percent,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  FileSignature,
  Coins,
  ShieldAlert,
  Loader2,
  Calendar,
  Zap,
  PiggyBank,
  Microscope,
  Briefcase,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Info,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Factory,
  Boxes,
  Hammer
} from 'lucide-react';
import { Decimal } from 'decimal.js';
import { LineItem, BusinessDocument, Transaction, BusinessProfile, BudgetTargets, PricingItem, AuditResult, InventoryItem, AssetCategory } from '../types';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { saveDocument, getDocuments, deleteDocument, getSetting, setSetting } from '../services/databaseService';
import { generateMarketIntel, MarketIntelResponse, performInvoiceAudit, parseContract, ContractExtraction, Milestone, scoreOpportunity, OpportunityScore } from '../services/geminiService';
import BudgetPlanner from './BudgetPlanner';
import PricingCalculator from './PricingCalculator';

interface BusinessToolsProps {
  onRecordToAR: (tx: Transaction) => void;
  isPro: boolean;
  onShowPaywall: () => void;
  targets: BudgetTargets;
  actuals: { ar: number; ap: number; credit: number; };
  onUpdateTargets: (targets: BudgetTargets) => void;
  pricingSheet: PricingItem[];
  onUpdatePricing: (items: PricingItem[]) => void;
  onUpdateTaxRate: (rate: number) => void;
  taxRate?: number;
  calculations: {
    bne: number;
    provisionedTax: number;
    totalAP: number;
    totalCredit: number;
  };
  reserveMonths: number;
  onUpdateReserveMonths: (val: number) => void;
  monthlyOverhead: number;
  inventory: InventoryItem[];
  onUpdateInventory: (inv: InventoryItem[]) => void;
}

const ProBadge = () => (
  <span className="flex items-center gap-1 bg-brand-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
    <Crown size={10} /> Pro
  </span>
);

const BusinessTools: React.FC<BusinessToolsProps> = ({ 
  onRecordToAR, isPro, onShowPaywall, targets, actuals, onUpdateTargets, pricingSheet, onUpdatePricing, onUpdateTaxRate, taxRate, calculations, reserveMonths, onUpdateReserveMonths, monthlyOverhead, inventory, onUpdateInventory
}) => {
  const [activeView, setActiveView] = useState<'PORTAL' | 'EDITOR' | 'PROFILE' | 'TARGETS' | 'PRICING' | 'INTEL' | 'CONTRACT' | 'LAB' | 'SCORER' | 'INVENTORY'>('PORTAL');
  const [savedDocs, setSavedDocs] = useState<BusinessDocument[]>([]);
  const [doc, setDoc] = useState<BusinessDocument | null>(null);
  const [profile, setProfile] = useState<BusinessProfile>({ name: '', address: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Expansion Lab State
  const [ghostExpenses, setGhostExpenses] = useState<{ id: string, name: string, amount: number }[]>([]);
  
  // Scorer State
  const [oppInput, setOppInput] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [oppResult, setOppResult] = useState<OpportunityScore | null>(null);

  // Contract Intelligence State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingContract, setIsProcessingContract] = useState(false);
  const [contractResult, setContractResult] = useState<ContractExtraction | null>(null);

  // Computed totals for the current document
  const totals = useMemo(() => {
    if (!doc) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = doc.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * ((doc.taxRate || 0) / 100);
    return {
      subtotal,
      tax,
      total: subtotal + tax - (doc.discount || 0)
    };
  }, [doc]);

  const runAudit = async () => {
    if (!isPro) { onShowPaywall(); return; }
    if (!doc) return;
    setIsAuditing(true);
    triggerHaptic(ImpactStyle.Medium);
    try {
      const result = await performInvoiceAudit(doc, pricingSheet);
      setAuditResult(result);
    } catch (e) { alert("Audit failed."); } finally { setIsAuditing(false); }
  };

  const syncToPricingSheet = (itemId: string, name: string) => {
    const pricingItem = pricingSheet.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (pricingItem && doc) {
      const srp = (pricingItem.supplierCost + pricingItem.freightCost) * (1 + pricingItem.markupPercent / 100);
      setDoc({ ...doc, items: doc.items.map(i => i.id === itemId ? { ...i, rate: srp } : i) });
      triggerHaptic(ImpactStyle.Light);
    }
  };

  useEffect(() => {
    const loadToolsData = async () => {
      const docs = await getDocuments();
      const savedProfile = await getSetting('business_profile');
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      setSavedDocs(docs);
      setIsLoading(false);
    };
    loadToolsData();
  }, []);

  const totalGhostExpense = useMemo(() => 
    ghostExpenses.reduce((acc, exp) => acc + exp.amount, 0), [ghostExpenses]);

  const fortressReserves = useMemo(() => {
    const monthlyEx = (monthlyOverhead + totalGhostExpense) || targets.apTarget || 5000;
    return monthlyEx * reserveMonths;
  }, [monthlyOverhead, targets.apTarget, reserveMonths, totalGhostExpense]);

  const safeDrawAmount = useMemo(() => {
    const liquidBuffer = calculations.bne - calculations.provisionedTax - fortressReserves;
    return Math.max(liquidBuffer, 0);
  }, [calculations, fortressReserves]);

  const inventoryValue = useMemo(() => 
    inventory.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0), [inventory]);

  const runOpportunityScorer = async () => {
    if (!isPro) { onShowPaywall(); return; }
    if (!oppInput.trim()) return;
    setIsScoring(true);
    triggerHaptic(ImpactStyle.Medium);
    try {
      const context = `Current BNE: $${calculations.bne}, Monthly Overhead: $${monthlyOverhead}, Tax Provision: $${calculations.provisionedTax}, Inventory Assets: $${inventoryValue}`;
      const res = await scoreOpportunity(oppInput, context);
      setOppResult(res);
    } catch (e) { alert("Analysis failed."); } finally { setIsScoring(false); }
  };

  const handleContractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isPro) { onShowPaywall(); return; }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setIsProcessingContract(true);
      setActiveView('CONTRACT');
      triggerHaptic(ImpactStyle.Medium);
      try {
        const result = await parseContract({ data: base64, mimeType: file.type });
        setContractResult(result);
      } catch (err) { alert("Parsing failed."); setActiveView('PORTAL'); } finally { setIsProcessingContract(false); }
    };
    reader.readAsDataURL(file);
  };

  const createNewDoc = (type: 'ESTIMATE' | 'INVOICE') => {
    const newDoc: BusinessDocument = {
      id: crypto.randomUUID(), number: (1000 + savedDocs.length).toString(),
      date: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      clientName: '', clientAddress: '', items: [{ id: '1', description: '', quantity: 1, rate: 0 }],
      taxRate: 0, discount: 0, notes: '', type, status: 'DRAFT', companyInfo: profile
    };
    setDoc(newDoc); setAuditResult(null); setActiveView('EDITOR');
  };

  if (isLoading) return <div className="p-12 text-center animate-pulse">LOADING TOOLS...</div>;

  if (activeView === 'INVENTORY') {
    return (
      <div className="bg-white border-4 border-black shadow-swiss p-8 md:p-12 min-h-[600px] flex flex-col">
         <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
               <Package className="text-brand-blue" size={32} />
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Business Asset Portfolio</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Materials & Equipment Ledger</p>
               </div>
            </div>
            <button onClick={() => setActiveView('PORTAL')}><X size={24}/></button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-50 border-2 border-black">
               <label className="text-[10px] font-black uppercase text-gray-400">Inventory Equity</label>
               <p className="text-2xl font-mono font-black text-brand-blue">${inventoryValue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white border-2 border-black">
               <label className="text-[10px] font-black uppercase text-gray-400">Material Count</label>
               <p className="text-2xl font-mono font-black">{inventory.filter(i => i.category === AssetCategory.MATERIAL).length} SKUs</p>
            </div>
            <div className="md:col-span-2 flex justify-end items-center gap-4">
               <button 
                onClick={() => {
                  triggerHaptic(ImpactStyle.Medium);
                  onUpdateInventory([...inventory, { id: crypto.randomUUID(), name: '', quantity: 0, unitCost: 0, category: AssetCategory.MATERIAL }]);
                }}
                className="px-6 py-3 bg-white text-black border-2 border-black font-black uppercase text-xs flex items-center gap-2"
               >
                 <Plus size={16} /> Add Material
               </button>
               <button 
                onClick={() => {
                  triggerHaptic(ImpactStyle.Medium);
                  onUpdateInventory([...inventory, { id: crypto.randomUUID(), name: '', quantity: 1, unitCost: 0, category: AssetCategory.EQUIPMENT }]);
                }}
                className="px-6 py-3 bg-black text-white font-black uppercase text-xs flex items-center gap-2"
               >
                 <Hammer size={16} /> Add Equipment
               </button>
            </div>
         </div>

         <div className="flex-grow border-2 border-black overflow-hidden bg-white">
            <table className="w-full text-left">
               <thead className="bg-black text-white text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Asset / SKU</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Value/Unit</th>
                    <th className="p-4 text-right">Total Equity</th>
                    <th className="p-4"></th>
                  </tr>
               </thead>
               <tbody className="divide-y-2 divide-black">
                  {inventory.map(item => {
                    const isLow = item.minThreshold && item.quantity <= item.minThreshold;
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isLow ? 'bg-red-50' : ''}`}>
                         <td className="p-4">
                            <select 
                              value={item.category}
                              onChange={e => onUpdateInventory(inventory.map(i => i.id === item.id ? {...i, category: e.target.value as AssetCategory} : i))}
                              className="text-[10px] font-black uppercase bg-gray-100 p-1 border border-black outline-none"
                            >
                               {Object.values(AssetCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                         </td>
                         <td className="p-4">
                            <input 
                              value={item.name} 
                              onChange={e => onUpdateInventory(inventory.map(i => i.id === item.id ? {...i, name: e.target.value} : i))}
                              placeholder="e.g. Oak Timber / CNC Router"
                              className="w-full font-bold uppercase text-sm bg-transparent outline-none focus:text-brand-blue"
                            />
                            <div className="flex items-center gap-2">
                               <input 
                                 value={item.sku || ''} 
                                 onChange={e => onUpdateInventory(inventory.map(i => i.id === item.id ? {...i, sku: e.target.value} : i))}
                                 placeholder="SKU-000"
                                 className="text-[9px] font-mono text-gray-400 bg-transparent outline-none"
                               />
                               {isLow && <span className="text-[8px] bg-red-600 text-white px-1 font-black flex items-center gap-0.5"><AlertTriangle size={8}/> LOW STOCK</span>}
                            </div>
                         </td>
                         <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-3 border-2 border-black bg-white overflow-hidden">
                               <button onClick={() => { triggerHaptic(ImpactStyle.Light); onUpdateInventory(inventory.map(i => i.id === item.id ? {...i, quantity: Math.max(0, i.quantity - 1)} : i)); }} className="p-2 hover:bg-red-50 text-red-500 border-r-2 border-black"><ArrowDownLeft size={14}/></button>
                               <input 
                                 type="number" 
                                 value={item.quantity}
                                 onChange={e => onUpdateInventory(inventory.map(i => i.id === item.id ? {...i, quantity: parseFloat(e.target.value) || 0} : i))}
                                 className="w-16 text-center font-mono font-bold text-sm outline-none"
                               />
                               <button onClick={() => { triggerHaptic(ImpactStyle.Light); onUpdateInventory(inventory.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i)); }} className="p-2 hover:bg-green-50 text-green-600 border-l-2 border-black"><ArrowUpRight size={14}/></button>
                            </div>
                         </td>
                         <td className="p-4 text-right">
                            <div className="relative inline-block w-24">
                               <span className="absolute left-1 top-2.5 text-[10px] font-mono text-gray-400">$</span>
                               <input 
                                 type="number"
                                 value={item.unitCost}
                                 onChange={e => onUpdateInventory(inventory.map(i => i.id === item.id ? {...i, unitCost: parseFloat(e.target.value) || 0} : i))}
                                 className="w-full p-2 pl-4 text-right font-mono text-sm border-b border-black outline-none"
                               />
                            </div>
                         </td>
                         <td className="p-4 text-right">
                            <p className="font-mono font-black text-sm text-brand-blue">${(item.quantity * item.unitCost).toLocaleString()}</p>
                         </td>
                         <td className="p-4 text-center">
                            <button onClick={() => onUpdateInventory(inventory.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                         </td>
                      </tr>
                    );
                  })}
                  {inventory.length === 0 && (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-black uppercase text-sm italic">Warehouse Empty. No Materials or Equipment tracked.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
         
         <div className="mt-8 flex gap-8 items-center bg-gray-50 border-2 border-black p-4">
            <div className="flex items-center gap-2"><Info size={16} className="text-brand-blue" /><span className="text-[10px] font-black uppercase">Accounting Note</span></div>
            <p className="text-[11px] font-medium leading-relaxed italic text-gray-600">
               "Material Valuation is calculated at cost. Equipment should be listed at current book value or replacement cost for accurate equity tracking."
            </p>
         </div>
      </div>
    );
  }

  if (activeView === 'SCORER') {
    return (
      <div className="bg-white border-4 border-black shadow-swiss p-8 md:p-12 min-h-[600px] flex flex-col">
         <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
            <div className="flex items-center gap-3"><Zap className="text-brand-blue" size={32} /><div><h2 className="text-2xl font-black uppercase tracking-tighter">Strategic Opportunity Scorer</h2><p className="text-[10px] font-bold text-gray-400 uppercase">AI-Driven Value Analysis</p></div></div>
            <button onClick={() => setActiveView('PORTAL')}><X size={24}/></button>
         </div>
         {!oppResult ? (
           <div className="space-y-6 max-w-2xl mx-auto w-full"><label className="text-sm font-black uppercase">Describe the Opportunity</label><textarea value={oppInput} onChange={e => setOppInput(e.target.value)} placeholder="e.g., A new $20k project starting next month requiring 40 hours of work. Thinking of hiring a freelancer to help..." className="w-full p-4 border-2 border-black font-mono text-sm min-h-[150px] outline-none focus:border-brand-blue"/><button onClick={runOpportunityScorer} disabled={isScoring || !oppInput.trim()} className="w-full py-4 bg-black text-white font-black uppercase tracking-widest border-2 border-black shadow-swiss hover:shadow-none transition-all flex items-center justify-center gap-2">{isScoring ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />} Generate AI Score</button></div>
         ) : (
           <div className="space-y-8 animate-in zoom-in-95 duration-500"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="p-8 border-4 border-black flex flex-col items-center justify-center bg-gray-50 text-center"><p className="text-[10px] font-black uppercase text-gray-400 mb-2">Strategy Score</p><span className="text-6xl font-black">{oppResult.score}</span><span className="mt-4 px-3 py-1 bg-black text-white text-[10px] font-black uppercase">{oppResult.riskLevel} RISK</span></div><div className="md:col-span-2 p-8 border-4 border-black bg-white flex flex-col justify-center"><p className="text-xs font-black uppercase text-brand-blue mb-2">AI Verdict</p><p className="text-xl font-bold leading-tight">"{oppResult.verdict}"</p></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-green-600"><ThumbsUp size={14}/> Strategic Pros</h4>{oppResult.pros.map((p, i) => <div key={i} className="p-3 border-2 border-black bg-green-50 text-[11px] font-bold uppercase">{p}</div>)}</div><div className="space-y-4"><h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600"><ThumbsDown size={14}/> Tactical Cons</h4>{oppResult.cons.map((c, i) => <div key={i} className="p-3 border-2 border-black bg-red-50 text-[11px] font-bold uppercase">{c}</div>)}</div></div><button onClick={() => setOppResult(null)} className="w-full py-3 bg-gray-100 border-2 border-black font-black uppercase text-xs">Run Another Analysis</button></div>
         )}
      </div>
    );
  }

  if (activeView === 'LAB') {
    return (
      <div className="bg-brand-blue/5 border-4 border-black shadow-swiss p-8 md:p-12 min-h-[600px] flex flex-col relative overflow-hidden"><div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none"><Microscope size={200} /></div><div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4"><div className="flex items-center gap-3"><Microscope className="text-brand-blue" size={32} /><div><h2 className="text-2xl font-black uppercase tracking-tighter">The Expansion Lab</h2><p className="text-[10px] font-bold text-gray-400 uppercase">Hiring & Growth Simulation</p></div></div><button onClick={() => setActiveView('PORTAL')}><X size={24}/></button></div><div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow"><div className="lg:col-span-7 space-y-8"><div className="flex justify-between items-center"><h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Proposed New Overheads</h3><button onClick={() => setGhostExpenses([...ghostExpenses, { id: crypto.randomUUID(), name: 'New Expense', amount: 0 }])} className="flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-black uppercase"><Plus size={14}/> Add Hire</button></div><div className="space-y-4">{ghostExpenses.map(exp => (<div key={exp.id} className="flex gap-4 items-center animate-in slide-in-from-left-4"><input value={exp.name} onChange={e => setGhostExpenses(ghostExpenses.map(g => g.id === exp.id ? {...g, name: e.target.value} : g))} className="flex-grow p-4 border-2 border-black font-bold uppercase text-xs outline-none bg-white focus:border-brand-blue" /><div className="relative w-40"><span className="absolute left-3 top-4 text-xs font-mono">$</span><input type="number" value={exp.amount || ''} onChange={e => setGhostExpenses(ghostExpenses.map(g => g.id === exp.id ? {...g, amount: parseFloat(e.target.value) || 0} : g))} className="w-full p-4 pl-8 border-2 border-black font-mono font-bold text-xs outline-none bg-white focus:border-brand-blue" /></div><button onClick={() => setGhostExpenses(ghostExpenses.filter(g => g.id !== exp.id))} className="text-red-500"><Trash2 size={20}/></button></div>))}{ghostExpenses.length === 0 && <div className="p-12 text-center border-4 border-dashed border-black/10 rounded-xl text-gray-400 font-black uppercase text-sm">No Ghost Expenses Added</div>}</div></div><div className="lg:col-span-5 space-y-8"><div className="p-8 border-4 border-black bg-white shadow-swiss space-y-6"><h4 className="text-[10px] font-black uppercase tracking-widest text-brand-blue border-b-2 border-brand-blue/10 pb-2">Simulation Impact</h4><div className="space-y-6"><div><p className="text-[10px] font-black uppercase text-gray-400">Monthly Burn Delta</p><p className="text-3xl font-mono font-black text-red-600">+${totalGhostExpense.toLocaleString()}</p></div><div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] font-black uppercase text-gray-400">Safe Draw (New)</p><p className="text-xl font-mono font-black text-green-600">${safeDrawAmount.toLocaleString()}</p></div><div><p className="text-[10px] font-black uppercase text-gray-400">Fortress Reserve</p><p className="text-xl font-mono font-black text-black">${fortressReserves.toLocaleString()}</p></div></div></div><div className="p-4 bg-gray-50 border-2 border-black space-y-2"><div className="flex items-center gap-2"><Info size={14} className="text-brand-blue" /><span className="text-[9px] font-black uppercase">Expansion Readiness</span></div><p className="text-[11px] font-bold uppercase">{safeDrawAmount > (totalGhostExpense * 6) ? "Highly Solvent: You can comfortably absorb this cost." : safeDrawAmount > 0 ? "Feasible: Tightens the draw, but fortress remains intact." : "High Risk: This expansion will eat into your mandatory safety reserves."}</p></div></div></div></div></div>
    );
  }

  if (activeView === 'CONTRACT') {
    return (
      <div className="bg-white border-4 border-black shadow-swiss p-8 md:p-12 min-h-[600px] flex flex-col"><div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4"><div className="flex items-center gap-3"><FileSignature className="text-brand-blue" size={32} /><div><h2 className="text-2xl font-black uppercase tracking-tighter">Contract Analysis</h2><p className="text-[10px] font-bold text-gray-400 uppercase">AI Term Extraction</p></div></div><button onClick={() => setActiveView('PORTAL')}><X size={24}/></button></div>{isProcessingContract ? (<div className="flex-grow flex flex-col items-center justify-center text-center space-y-4"><Loader2 size={48} className="animate-spin text-brand-blue" /><p className="font-mono text-sm font-bold uppercase animate-pulse">Scanning Legal Clauses...</p></div>) : contractResult ? (<div className="space-y-8 animate-in fade-in duration-500"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="p-6 bg-gray-50 border-2 border-black space-y-4"><label className="text-[10px] font-black uppercase text-gray-400">Client Identified</label><p className="text-xl font-black">{contractResult.clientName}</p><label className="text-[10px] font-black uppercase text-gray-400">Total Value</label><p className="text-2xl font-mono font-black text-brand-blue">${contractResult.totalValue.toLocaleString()}</p></div><div className="p-6 bg-white border-2 border-black space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Legal Summary</label><p className="text-xs font-medium leading-relaxed italic">"{contractResult.summary}"</p></div></div><div className="space-y-4"><h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Calendar size={12} /> Detected Milestones</h4><div className="border-2 border-black overflow-hidden divide-y-2 divide-black">{contractResult.milestones.map((m, i) => (<div key={i} className="p-4 bg-white flex justify-between items-center"><div><p className="font-bold text-sm uppercase">{m.description}</p><p className="text-[10px] font-mono text-gray-400">Target Date: {m.dueDate}</p></div><div className="text-right"><p className="font-mono font-bold">${m.amount.toLocaleString()}</p></div></div>))}</div></div><button onClick={() => { contractResult.milestones.forEach(m => onRecordToAR({ id: crypto.randomUUID(), name: `${contractResult.clientName}: ${m.description}`, amount: m.amount, type: 'INCOME', date_occurred: new Date().toISOString() })); alert(`Scheduled ${contractResult.milestones.length} milestones.`); setActiveView('PORTAL'); }} className="w-full py-4 bg-brand-blue text-white font-black uppercase tracking-widest border-2 border-black shadow-swiss hover:shadow-none transition-all">Schedule All Milestones to AR</button></div>) : null}</div>
    );
  }

  if (activeView === 'EDITOR' && doc) {
    return (
      <div className="bg-white border-4 border-black shadow-swiss relative flex flex-col min-h-[700px]"><div className="bg-black text-white p-4 flex justify-between items-center"><div className="flex items-center gap-2"><ProBadge /><span className="text-xs font-black uppercase tracking-widest">{doc.type} #{doc.number}</span></div><div className="flex gap-4"><button onClick={runAudit} disabled={isAuditing} className="flex items-center gap-2 text-xs font-black uppercase hover:text-brand-blue">{isAuditing ? <RefreshCw className="animate-spin" size={14}/> : <ShieldCheck size={14}/>} {isAuditing ? "Auditing..." : "Audit with AI"}</button><button onClick={() => setActiveView('PORTAL')}><X size={20}/></button></div></div><div className="flex-grow flex flex-col lg:flex-row overflow-hidden"><div className="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto"><div className="flex justify-between items-start border-b-2 border-black pb-6"><div><h2 className="text-3xl font-black uppercase tracking-tighter text-brand-blue">{doc.type}</h2></div><div className="text-right text-[10px] font-bold uppercase text-gray-400"><div>Date: <span className="text-black font-mono">{doc.date}</span></div><div>Number: <span className="text-black font-mono">#{doc.number}</span></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><input value={doc.clientName} onChange={e => setDoc({...doc, clientName: e.target.value})} placeholder="Bill To (Client Name)" className="text-xl font-black border-b border-black outline-none w-full"/><textarea value={doc.clientAddress} onChange={e => setDoc({...doc, clientAddress: e.target.value})} placeholder="Client Address" className="w-full text-xs font-mono p-2 border border-gray-100 outline-none h-20"/></div><div className="border-2 border-black overflow-hidden"><table className="w-full text-left"><thead className="bg-black text-white text-[10px] uppercase"><tr><th className="p-2">Item</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Total</th><th className="p-2"></th></tr></thead><tbody className="divide-y border-b border-black">{doc.items.map(item => (<tr key={item.id} className="hover:bg-gray-50 group"><td className="p-2"><input value={item.description} onBlur={() => syncToPricingSheet(item.id, item.description)} onChange={e => setDoc({...doc, items: doc.items.map(i => i.id === item.id ? {...i, description: e.target.value} : i)})} className="w-full font-bold text-sm bg-transparent outline-none"/></td><td className="p-2 text-center w-20"><input type="number" value={item.quantity} onChange={e => setDoc({...doc, items: doc.items.map(i => i.id === item.id ? {...i, quantity: parseFloat(e.target.value) || 0} : i)})} className="w-full text-center font-mono text-sm outline-none"/></td><td className="p-2 text-right w-32"><input type="number" value={item.rate} onChange={e => setDoc({...doc, items: doc.items.map(i => i.id === item.id ? {...i, rate: parseFloat(e.target.value) || 0} : i)})} className="w-full text-right font-mono text-sm outline-none"/></td><td className="p-2 text-right font-mono font-bold text-sm">${(item.quantity * item.rate).toFixed(2)}</td><td className="p-2 text-center"><button onClick={() => setDoc({...doc, items: doc.items.filter(i => i.id !== item.id)})} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button></td></tr>))}</tbody></table><button onClick={() => setDoc({...doc, items: [...doc.items, {id: crypto.randomUUID(), description: '', quantity: 1, rate: 0}]})} className="w-full py-2 bg-gray-50 hover:bg-white text-[9px] font-black uppercase">Add Item</button></div><div className="flex justify-end"><div className="w-64 bg-gray-50 border-2 border-black p-4 flex justify-between items-baseline"><span className="text-xs font-black uppercase tracking-widest">Total Due</span><span className="text-2xl font-mono font-bold text-brand-blue">${totals.total.toFixed(2)}</span></div></div></div>{auditResult && (<div className="w-full lg:w-96 bg-gray-50 border-l-4 border-black p-6 space-y-6 animate-in slide-in-from-right duration-300 overflow-y-auto"><div className="flex items-center justify-between border-b-2 border-black pb-4"><div className="flex items-center gap-2 text-brand-blue"><ShieldCheck /><h4 className="font-black uppercase text-xs">AI Risk Audit</h4></div><div className="text-xl font-black">{auditResult.score}/100</div></div><p className="text-xs font-mono font-medium text-gray-600 leading-relaxed italic">"{auditResult.summary}"</p><div className="space-y-4">{auditResult.issues.map((issue, i) => (<div key={i} className={`p-4 border-2 border-black bg-white shadow-swiss space-y-2`}><div className="flex items-center gap-2">{issue.type === 'CRITICAL' ? <AlertTriangle className="text-red-600" size={16}/> : <Lightbulb className="text-brand-blue" size={16}/>}<span className={`text-[9px] font-black uppercase ${issue.type === 'CRITICAL' ? 'text-red-600' : 'text-brand-blue'}`}>{issue.type}</span></div><p className="text-[11px] font-bold uppercase tracking-tight">{issue.message}</p>{issue.impact && <p className="text-[9px] font-mono text-gray-500">Impact: {issue.impact}</p>}</div>))}</div><button onClick={() => setAuditResult(null)} className="w-full py-2 border border-black text-[9px] font-black uppercase hover:bg-gray-200">Close Audit</button></div>)}</div><div className="p-6 border-t-2 border-black bg-white flex flex-col sm:flex-row gap-4 sticky bottom-0 z-10"><button onClick={async () => { await saveDocument(doc); setActiveView('PORTAL'); }} className="flex-1 py-4 bg-black text-white font-bold uppercase text-sm border-2 border-black shadow-swiss flex items-center justify-center gap-2"><Database size={18}/> Save as Draft</button>{doc.type === 'INVOICE' && <button onClick={() => onRecordToAR({ id: crypto.randomUUID(), name: `Invoice #${doc.number}`, amount: totals.total, type: 'INCOME', date_occurred: new Date().toISOString() })} className="flex-1 py-4 bg-brand-blue text-white font-bold uppercase text-sm border-2 border-black shadow-swiss flex items-center justify-center gap-2"><CheckCircle2 size={18}/> Post to Ledger</button>}</div></div>
    );
  }

  if (activeView === 'TARGETS') return <div className="relative"><button onClick={() => setActiveView('PORTAL')} className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-black shadow-swiss"><X size={20} /></button><BudgetPlanner targets={targets} actuals={actuals} onUpdate={onUpdateTargets} /></div>;
  if (activeView === 'PRICING') return <PricingCalculator items={pricingSheet} onUpdate={onUpdatePricing} onClose={() => setActiveView('PORTAL')} isPro={isPro} onShowPaywall={onShowPaywall} />;
  if (activeView === 'PROFILE') return (
    <div className="bg-white border-4 border-black p-8 shadow-swiss max-w-xl mx-auto"><div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4"><h3 className="text-xl font-black uppercase">Company Profile</h3><button onClick={() => setActiveView('PORTAL')}><X/></button></div><div className="space-y-6"><div><label className="text-[10px] font-black uppercase text-gray-400">Company Name</label><input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-4 border-2 border-black font-bold outline-none"/></div><div><label className="text-[10px] font-black uppercase text-gray-400">Est. Tax Rate (%)</label><input type="number" value={taxRate} onChange={e => onUpdateTaxRate(parseFloat(e.target.value) || 0)} className="w-full p-4 border-2 border-black font-mono font-bold outline-none"/></div><button onClick={async () => { await setSetting('business_profile', JSON.stringify(profile)); setActiveView('PORTAL'); }} className="w-full py-4 bg-black text-white font-black uppercase tracking-widest border-2 border-black">Save & Finish</button></div></div>
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
        <button onClick={() => createNewDoc('ESTIMATE')} className="bg-white border-2 border-black p-4 shadow-swiss hover:bg-gray-50 text-left relative h-32">
          {!isPro && <div className="absolute top-2 right-2"><ProBadge/></div>}<FileText size={20} className="text-brand-blue mb-4" /><h4 className="text-[10px] font-bold uppercase">Estimate</h4>
        </button>
        <button onClick={() => createNewDoc('INVOICE')} className="bg-brand-black text-white border-2 border-black p-4 shadow-swiss hover:bg-gray-900 text-left relative h-32">
          <Receipt size={20} className="text-brand-blue mb-4" /><h4 className="text-[10px] font-bold uppercase">Invoice</h4>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="bg-white border-2 border-black p-4 shadow-swiss hover:bg-gray-50 text-left relative h-32">
          {!isPro && <div className="absolute top-2 right-2"><ProBadge/></div>}<FileSignature size={20} className="text-brand-blue mb-4" /><h4 className="text-[10px] font-bold uppercase">Contract</h4><input type="file" ref={fileInputRef} hidden onChange={handleContractUpload} accept="image/*,application/pdf" />
        </button>
        <button onClick={() => setActiveView('INVENTORY')} className="bg-white border-2 border-black p-4 shadow-swiss hover:bg-gray-50 text-left h-32">
          <Package size={20} className="text-amber-500 mb-4" /><h4 className="text-[10px] font-bold uppercase">Asset Portfolio</h4>
        </button>
        <button onClick={() => setActiveView('PRICING')} className="bg-white border-2 border-black p-4 shadow-swiss hover:bg-gray-50 text-left h-32">
          <Calculator size={20} className="text-brand-blue mb-4" /><h4 className="text-[10px] font-bold uppercase">Pricing</h4>
        </button>
        <button onClick={() => setActiveView('LAB')} className="bg-white border-2 border-black p-4 shadow-swiss hover:bg-gray-50 text-left relative h-32">
          {!isPro && <div className="absolute top-2 right-2"><ProBadge/></div>}<Microscope size={20} className="text-brand-blue mb-4" /><h4 className="text-[10px] font-bold uppercase">Lab</h4>
        </button>
        <button onClick={() => setActiveView('SCORER')} className="bg-white border-2 border-black p-4 shadow-swiss hover:bg-gray-50 text-left relative h-32">
          {!isPro && <div className="absolute top-2 right-2"><ProBadge/></div>}<Zap size={20} className="text-amber-500 mb-4" /><h4 className="text-[10px] font-bold uppercase">Scorer</h4>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white border-4 border-black p-8 shadow-swiss flex flex-col gap-6">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-3">
                  <div className={`p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${safeDrawAmount > 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}><ShieldAlert size={32} /></div>
                  <div><h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Founder's Salary Guard</h3><p className="text-2xl font-black uppercase tracking-tight">Strategy: Prime Reserve</p></div>
               </div>
               <div className="text-right"><span className="text-[10px] font-black uppercase text-brand-blue">Operational Safety</span><div className="text-xl font-mono font-black">${fortressReserves.toLocaleString()} Locked</div></div>
            </div>
            <div className="bg-gray-50 border-2 border-black p-6 space-y-4">
               <div className="flex justify-between items-baseline"><p className="text-xs font-black uppercase">Safe Withdrawal Limit</p><p className="text-4xl font-mono font-black text-green-600">${safeDrawAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p></div>
               <p className="text-[10px] font-medium leading-relaxed text-gray-600 italic">"This calculation protects your business survival by reserving {reserveMonths} months of operating costs ($${(monthlyOverhead || 5000).toLocaleString()}/mo) plus all pending tax liabilities."</p>
            </div>
            <div className="space-y-2"><div className="flex justify-between text-[10px] font-black uppercase text-gray-400"><span>Safety Buffer (Months)</span><span className="text-black">{reserveMonths} Months</span></div><input type="range" min="1" max="12" step="1" value={reserveMonths} onChange={(e) => { triggerHaptic(ImpactStyle.Light); onUpdateReserveMonths(parseInt(e.target.value)); }} className="w-full accent-green-600" /></div>
            <div className="flex gap-4"><button disabled={safeDrawAmount <= 0} className="flex-1 py-4 bg-green-500 text-white font-black uppercase tracking-widest border-2 border-black shadow-swiss hover:shadow-none transition-all disabled:opacity-30 flex items-center justify-center gap-2"><PiggyBank size={18} /> Process Draw</button><button onClick={() => triggerHaptic(ImpactStyle.Medium)} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest border-2 border-black shadow-swiss hover:shadow-none transition-all flex items-center justify-center gap-2"><RefreshCw size={18} /> Re-Calculate</button></div>
         </div>

         <div className="bg-white border-4 border-black p-8 shadow-swiss flex flex-col justify-between">
            <div className="space-y-4">
               <div className="flex justify-between items-center"><h3 className="text-xs font-black uppercase text-gray-400">Asset Velocity</h3><TrendingUp className="text-brand-blue" /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 border-2 border-black">
                    <p className="text-[10px] font-black uppercase text-gray-400">Inventory Liquidity</p>
                    <p className="text-xl font-mono font-black text-amber-600">${inventoryValue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border-2 border-black">
                    <p className="text-[10px] font-black uppercase text-gray-400">Total BNE Assets</p>
                    <p className="text-xl font-mono font-black text-brand-blue">${(calculations.bne + inventoryValue).toLocaleString()}</p>
                  </div>
               </div>
               <p className="text-sm font-medium text-gray-600 mt-4">Your current material valuation adds a strategic safety net. Your "Asset-Backed Solvency" is significantly higher than your liquid cash flow alone.</p>
            </div>
            <div className="mt-8 pt-8 border-t-2 border-black flex items-center justify-between"><div className="text-right"><p className="text-[10px] font-black uppercase text-brand-blue tracking-widest">Growth Efficiency</p><p className="text-2xl font-mono font-black">82%</p></div><div className="flex-grow ml-10"><div className="h-4 bg-gray-100 border-2 border-black relative"><div className="h-full bg-brand-blue w-[82%]"></div></div></div></div>
         </div>
      </div>
    </div>
  );
};

export default BusinessTools;
