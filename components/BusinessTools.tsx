
import React, { useState, useMemo, useEffect } from 'react';
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
  // ListTodo, // COMMENTED OUT
  // DollarSign, // COMMENTED OUT
  // TrendingUp // COMMENTED OUT
} from 'lucide-react';
import { Decimal } from 'decimal.js';
import { LineItem, BusinessDocument, Transaction, BusinessProfile, BudgetTargets, PricingItem } from '../types';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { saveDocument, getDocuments, deleteDocument, getSetting, setSetting } from '../services/databaseService';
import BudgetPlanner from './BudgetPlanner';
import PricingCalculator from './PricingCalculator';
import TodoList from './TodoList'; // UN-COMMENTED
import PricingSheet from './PricingSheet'; // UN-COMMENTED
import HourlyRateCalculator from './HourlyRateCalculator'; // UN-COMMENTED
import RunwayPredictor from './RunwayPredictor'; // New import

interface BusinessToolsProps {
  onRecordToAR: (tx: Transaction) => void;
  isPro: boolean;
  onShowPaywall: () => void;
  targets: BudgetTargets;
  actuals: {
    ar: number;
    ap: number;
    credit: number;
  };
  onUpdateTargets: (targets: BudgetTargets) => void;
  pricingSheet: PricingItem[];
  onUpdatePricing: (items: PricingItem[]) => void;
  monthlyBurn: number; // New prop for RunwayPredictor
  bne: number; // New prop for RunwayPredictor
}

const INITIAL_PROFILE: BusinessProfile = {
  name: 'Your Business Name',
  address: '123 Business Way, City, ST 12345',
  email: 'billing@yourbusiness.com',
  phone: '(555) 000-0000'
};

const ProBadge = () => (
  <span className="flex items-center gap-1 bg-brand-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
    <Crown size={10} /> Pro
  </span>
);

const BusinessTools: React.FC<BusinessToolsProps> = ({ 
  onRecordToAR, 
  isPro, 
  onShowPaywall,
  targets,
  actuals,
  onUpdateTargets,
  pricingSheet,
  onUpdatePricing,
  monthlyBurn,
  bne
}) => {
  const [activeView, setActiveView] = useState<'PORTAL' | 'EDITOR' | 'PROFILE' | 'TARGETS' | 'PRICING' | 'TODO' | 'OLD_PRICING_SHEET' | 'HOURLY_RATE' | 'RUNWAY'>('PORTAL'); // Updated activeView
  const [savedDocs, setSavedDocs] = useState<BusinessDocument[]>([]);
  const [doc, setDoc] = useState<BusinessDocument | null>(null);
  const [profile, setProfile] = useState<BusinessProfile>(INITIAL_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSaveProfile = async (newProfile: BusinessProfile) => {
    if (!isPro) {
      onShowPaywall();
      return;
    }
    setProfile(newProfile);
    await setSetting('business_profile', JSON.stringify(newProfile));
    triggerHaptic(ImpactStyle.Heavy);
    setActiveView('PORTAL');
  };

  const createNewDoc = (type: 'ESTIMATE' | 'INVOICE') => {
    triggerHaptic(ImpactStyle.Medium);
    const newDoc: BusinessDocument = {
      id: crypto.randomUUID(),
      number: (1000 + savedDocs.length).toString(),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      clientName: '',
      clientAddress: '',
      items: [{ id: '1', description: '', quantity: 1, rate: 0 }],
      taxRate: 0,
      discount: 0,
      notes: 'Thank you for your business.',
      type,
      status: 'DRAFT',
      companyInfo: profile
    };
    setDoc(newDoc);
    setActiveView('EDITOR');
  };

  const handleEditDoc = (existing: BusinessDocument) => {
    triggerHaptic(ImpactStyle.Light);
    setDoc({ ...existing, companyInfo: profile }); // Refresh company info to latest
    setActiveView('EDITOR');
  };

  const handleSaveDoc = async () => {
    if (!isPro) {
      onShowPaywall();
      return;
    }
    if (!doc) return;
    await saveDocument(doc);
    const docs = await getDocuments();
    setSavedDocs(docs);
    triggerHaptic(ImpactStyle.Medium);
    setActiveView('PORTAL');
  };

  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPro) {
      onShowPaywall();
      return;
    }
    if (!window.confirm("Delete this document?")) return;
    await deleteDocument(id);
    setSavedDocs(prev => prev.filter(d => d.id !== id));
    triggerHaptic(ImpactStyle.Medium);
  };

  const addItem = () => {
    if (!doc) return;
    triggerHaptic(ImpactStyle.Light);
    setDoc({ ...doc, items: [...doc.items, { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }] });
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    if (!doc) return;
    setDoc({
      ...doc,
      items: doc.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  /**
   * Auto-populates the Pricing Sheet based on Invoice/Estimate entries
   */
  const syncToPricingSheet = (description: string) => {
    const trimmed = description.trim();
    if (!trimmed || trimmed.length < 2) return;

    const exists = pricingSheet.some(i => i.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const newItem: PricingItem = {
        id: crypto.randomUUID(),
        name: trimmed,
        supplierCost: 0,
        freightCost: 0,
        markupPercent: 30
      };
      onUpdatePricing([...pricingSheet, newItem]);
      console.log(`[Precision Engine] Auto-populated pricing sheet with: ${trimmed}`);
    }
  };

  const removeItem = (id: string) => {
    if (!doc) return;
    triggerHaptic(ImpactStyle.Light);
    setDoc({ ...doc, items: doc.items.filter(item => item.id !== id) });
  };

  const totals = useMemo(() => {
    if (!doc) return { subtotal: 0, discount: 0, tax: 0, total: 0 };
    const subtotal = doc.items.reduce((acc, item) => 
      acc.plus(new Decimal(item.quantity || 0).times(item.rate || 0)), new Decimal(0));
    const discountVal = subtotal.times(new Decimal(doc.discount || 0).div(100));
    const afterDiscount = subtotal.minus(discountVal);
    const taxVal = afterDiscount.times(new Decimal(doc.taxRate || 0).div(100));
    const total = afterDiscount.plus(taxVal);
    return { 
      subtotal: subtotal.toNumber(), 
      discount: discountVal.toNumber(), 
      tax: taxVal.toNumber(), 
      total: total.toNumber() 
    };
  }, [doc?.items, doc?.taxRate, doc?.discount]);

  const handleRecordToAR = async () => {
    if (!doc || doc.type !== 'INVOICE') return;
    triggerHaptic(ImpactStyle.Heavy);
    if (!isPro) {
      onShowPaywall();
      return;
    }
    const tx: Transaction = {
      id: crypto.randomUUID(),
      name: `Invoice #${doc.number}: ${doc.clientName || 'Client'}`,
      amount: totals.total,
      type: 'INCOME',
      date_occurred: new Date().toISOString(),
      linkedDocId: doc.id
    };
    onRecordToAR(tx);
    const updatedDoc: BusinessDocument = { ...doc, status: 'RECORDED' };
    await saveDocument(updatedDoc);
    setSavedDocs(prev => prev.map(d => d.id === doc.id ? updatedDoc : d));
    setActiveView('PORTAL');
    alert("Transaction posted to Ledger.");
  };

  const handleConvertToInvoice = () => {
    if (!isPro) {
      onShowPaywall();
      return;
    }
    triggerHaptic(ImpactStyle.Medium);
    setDoc({ ...doc!, type: 'INVOICE' });
  };

  if (isLoading) return <div className="h-48 flex items-center justify-center font-mono animate-pulse">BOOTING TOOLS...</div>;

  // Render cases for tools
  if (activeView === 'TODO') {
    return (
      <TodoList 
        isPro={isPro} 
        onUpgradeClick={onShowPaywall} 
        onClose={() => setActiveView('PORTAL')} 
      />
    );
  }

  if (activeView === 'OLD_PRICING_SHEET') {
    return (
      <PricingSheet 
        isPro={isPro} 
        onUpgradeClick={onShowPaywall} 
        onClose={() => setActiveView('PORTAL')} 
      />
    );
  }

  if (activeView === 'HOURLY_RATE') {
    return (
      <HourlyRateCalculator 
        isPro={isPro} 
        onUpgradeClick={onShowPaywall} 
        onClose={() => setActiveView('PORTAL')} 
      />
    );
  }

  if (activeView === 'RUNWAY') {
    return (
      <RunwayPredictor 
        bne={bne}
        monthlyBurn={monthlyBurn}
        pendingAr={actuals.ar}
        isPro={isPro}
        onShowPaywall={onShowPaywall}
      />
    );
  }

  if (activeView === 'PROFILE') {
    return (
      <div className="bg-white border-2 border-black p-6 shadow-swiss">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold uppercase flex items-center gap-2"><Building /> Company Profile</h3>
           <button onClick={() => setActiveView('PORTAL')}><X /></button>
        </div>
        <div className="space-y-4">
           {!isPro && (
             <div className="p-4 bg-brand-blue/10 border-2 border-brand-blue mb-4 flex items-center gap-3">
               <Lock className="text-brand-blue" size={20} />
               <p className="text-xs font-bold text-brand-blue uppercase">Pro Subscription Required to save profile details.</p>
             </div>
           )}
           <div>
              <label className="text-xs font-bold uppercase text-gray-400">Company Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-3 border-2 border-black font-bold outline-none"/>
           </div>
           <div>
              <label className="text-xs font-bold uppercase text-gray-400">Address</label>
              <textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full p-3 border-2 border-black font-bold outline-none" rows={2}/>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Email</label>
                <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full p-3 border-2 border-black font-bold outline-none"/>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Phone</label>
                <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-3 border-2 border-black font-bold outline-none"/>
              </div>
           </div>
           <button onClick={() => handleSaveProfile(profile)} className="w-full py-4 bg-black text-white font-bold uppercase hover:bg-brand-blue transition-colors border-2 border-black flex items-center justify-center gap-2">
             {!isPro && <Lock size={16} />} Save Profile
           </button>
        </div>
      </div>
    );
  }

  if (activeView === 'TARGETS') {
    return (
      <div className="relative">
        <button 
          onClick={() => setActiveView('PORTAL')}
          className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
        >
          <X size={20} />
        </button>
        <BudgetPlanner 
          targets={targets} 
          actuals={actuals} 
          onUpdate={onUpdateTargets} 
        />
      </div>
    );
  }

  if (activeView === 'PRICING') {
    return (
      <PricingCalculator 
        items={pricingSheet}
        onUpdate={onUpdatePricing}
        onClose={() => setActiveView('PORTAL')}
        isPro={isPro}
        onShowPaywall={onShowPaywall}
      />
    );
  }

  if (activeView === 'PORTAL') {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <button onClick={() => createNewDoc('ESTIMATE')} className="bg-white border-2 border-black p-6 shadow-swiss hover:bg-gray-50 text-left transition-all relative">
            {!isPro && <div className="absolute top-4 right-4"><ProBadge /></div>}
            <FileText size={24} className="text-brand-blue mb-4" />
            <h4 className="font-bold uppercase">New Estimate</h4>
            <p className="text-[10px] text-gray-400">Draft a service quote</p>
          </button>
          
          <button onClick={() => createNewDoc('INVOICE')} className="bg-brand-black text-white border-2 border-black p-6 shadow-swiss hover:bg-gray-900 text-left transition-all relative">
            {!isPro && <div className="absolute top-4 right-4"><ProBadge /></div>}
            <Receipt size={24} className="text-brand-blue mb-4" />
            <h4 className="font-bold uppercase">New Invoice</h4>
            <p className="text-[10px] text-gray-400">Bill a client now</p>
          </button>

          <button onClick={() => setActiveView('PRICING')} className="bg-white border-2 border-black p-6 shadow-swiss hover:bg-gray-50 text-left transition-all relative">
            {!isPro && <div className="absolute top-4 right-4"><ProBadge /></div>}
            <Calculator size={24} className="text-brand-blue mb-4" />
            <h4 className="font-bold uppercase">COGS & Pricing</h4>
            <p className="text-[10px] text-gray-400">Markup & Margin Sheet</p>
          </button>

          <button onClick={() => setActiveView('TARGETS')} className="bg-white border-2 border-black p-6 shadow-swiss hover:bg-gray-50 text-left transition-all relative">
            <Target size={24} className="text-brand-blue mb-4" />
            <h4 className="font-bold uppercase">Budget Targets</h4>
            <p className="text-[10px] text-gray-400">Set monthly goals</p>
          </button>

          <button onClick={() => setActiveView('PROFILE')} className="bg-white border-2 border-black p-6 shadow-swiss hover:bg-gray-50 text-left transition-all relative">
            {!isPro && <div className="absolute top-4 right-4"><ProBadge /></div>}
            <Settings size={24} className="text-gray-400 mb-4" />
            <h4 className="font-bold uppercase">My Profile</h4>
            <p className="text-[10px] text-gray-400">Set company info</p>
          </button>

          {/* Integrated Tools */}
          <button onClick={() => setActiveView('TODO')} className="bg-white border-2 border-black p-6 shadow-swiss hover:bg-gray-50 text-left transition-all relative">
            {!isPro && <div className="absolute top-4 right-4"><ProBadge /></div>}
            <ListTodo size={24} className="text-brand-blue mb-4" />
            <h4 className="font-bold uppercase">Todo List</h4>
            <p className="text-[10px] text-gray-400">Organize your tasks</p>
          </button>

          <button onClick={() => setActiveView('RUNWAY')} className="bg-white border-2 border-black p-6 shadow-swiss hover:bg-gray-50 text-left transition-all relative">
            {!isPro && <div className="absolute top-4 right-4"><ProBadge /></div>}
            <TrendingUp size={24} className="text-brand-blue mb-4" />
            <h4 className="font-bold uppercase">Runway Predictor</h4>
            <p className="text-[10px] text-gray-400">AI Stress Test</p>
          </button>

          <button onClick={() => setActiveView('OLD_PRICING_SHEET')} className="bg-white border-2 border-black p-6 shadow-swiss hover:bg-gray-50 text-left transition-all relative">
            {!isPro && <div className="absolute top-4 right-4"><ProBadge /></div>}
            <DollarSign size={24} className="text-brand-blue mb-4" />
            <h4 className="font-bold uppercase">Pricing Sheet (Old)</h4>
            <p className="text-[10px] text-gray-400">Create quotes & estimates</p>
          </button>

          <button onClick={() => setActiveView('HOURLY_RATE')} className="bg-white border-2 border-black p-6 shadow-swiss hover:bg-gray-50 text-left transition-all relative">
            {!isPro && <div className="absolute top-4 right-4"><ProBadge /></div>}
            <TrendingUp size={24} className="text-brand-blue mb-4" />
            <h4 className="font-bold uppercase">Hourly Rate Calc.</h4>
            <p className="text-[10px] text-gray-400">Determine your rate</p>
          </button>
        </div>

        <div className="bg-white border-2 border-black shadow-swiss">
           <div className="p-4 border-b-2 border-black bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} />
                <h3 className="font-bold uppercase text-sm">Recent Documents</h3>
              </div>
              {!isPro && savedDocs.length > 0 && <ProBadge />}
           </div>
           <div className="divide-y-2 divide-black">
              {savedDocs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm italic">No saved documents yet.</div>
              ) : (
                savedDocs.map(d => (
                  <div key={d.id} onClick={() => handleEditDoc(d)} className="p-4 flex items-center justify-between hover:bg-blue-50 cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 border-2 border-black ${d.type === 'ESTIMATE' ? 'bg-white' : 'bg-black text-white'}`}>
                        {d.type === 'ESTIMATE' ? <FileText size={16}/> : <Receipt size={16}/>}
                      </div>
                      <div>
                        <div className="font-bold text-sm uppercase">{d.type} #{d.number} - {d.clientName || 'Unnamed Client'}</div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                           <span>{d.date}</span>
                           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                           <span className={`uppercase font-bold ${d.status === 'RECORDED' ? 'text-green-600' : 'text-orange-500'}`}>{d.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="font-mono font-bold">${d.items.reduce((acc, i) => acc + (i.quantity * i.rate), 0).toFixed(2)}</span>
                       <button onClick={(e) => handleDeleteDoc(d.id, e)} className="p-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                          {isPro ? <Trash2 size={16}/> : <Lock size={16} />}
                       </button>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-3 border-black shadow-swiss relative overflow-hidden flex flex-col min-h-[600px]">
      {/* Editor Header */}
      <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-20">
         <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-brand-blue text-[10px] font-bold uppercase rounded-sm">
               {doc?.type} Editor
            </span>
            <h3 className="font-bold uppercase text-xs tracking-wider">Doc #{doc?.number}</h3>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={handleSaveDoc} className="text-xs font-bold uppercase hover:text-brand-blue transition-colors flex items-center gap-2">
               {!isPro && <Lock size={12}/>} <Database size={14}/> Save Draft
            </button>
            <button onClick={() => setActiveView('PORTAL')} className="hover:text-red-500"><X size={20}/></button>
         </div>
      </div>

      {!isPro && (
        <div className="bg-brand-blue text-white p-2 text-[10px] font-black uppercase text-center tracking-widest border-b-2 border-black flex items-center justify-center gap-2">
          <Crown size={12} /> Viewing Template Mode (Pro required for full features) <Crown size={12} />
        </div>
      )}

      <div className="p-4 md:p-10 space-y-10 flex-grow">
        {/* Paper Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 border-b-2 border-black pb-8">
           <div className="space-y-2 max-w-sm">
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{profile.name}</h2>
              <div className="text-[10px] font-mono text-gray-500 whitespace-pre-wrap">{profile.address}</div>
              <div className="text-[10px] font-mono text-gray-500">{profile.email} • {profile.phone}</div>
           </div>
           <div className="text-right flex flex-col items-end gap-2">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-brand-blue">
                {doc?.type === 'ESTIMATE' ? 'Estimate' : 'Invoice'}
              </h1>
              <div className="grid grid-cols-2 gap-x-4 text-[10px] font-bold uppercase text-gray-400">
                 <span>Number:</span> <span className="text-black font-mono">#{doc?.number}</span>
                 <span>Date:</span> <span className="text-black font-mono">{doc?.date}</span>
                 <span>Due Date:</span> <span className="text-black font-mono">{doc?.dueDate}</span>
              </div>
           </div>
        </div>

        {/* Bill To & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase text-gray-400 block border-b border-gray-200 pb-1">Bill To:</label>
              <input 
                type="text" 
                placeholder="Client/Business Name"
                value={doc?.clientName}
                onChange={e => setDoc({...doc!, clientName: e.target.value})}
                className="w-full text-lg font-bold bg-transparent outline-none focus:text-brand-blue"
              />
              <textarea 
                placeholder="Client Address & Details"
                value={doc?.clientAddress}
                onChange={e => setDoc({...doc!, clientAddress: e.target.value})}
                className="w-full text-xs font-mono bg-transparent outline-none h-20 resize-none"
              />
           </div>
           <div className="bg-gray-50 p-4 border-2 border-black flex flex-col justify-between">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Status Tracking</label>
                <div className="flex items-center gap-2">
                   {doc?.status === 'RECORDED' ? <CheckCircle2 className="text-green-600" size={16}/> : <Clock className="text-orange-500" size={16}/>}
                   <span className="text-xs font-bold uppercase">{doc?.status}</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">This document is stored locally on your device.</p>
           </div>
        </div>

        {/* Line Items Table */}
        <div className="border-2 border-black overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black text-white text-[10px] font-bold uppercase">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 w-20 text-center">Qty</th>
                <th className="p-3 w-32 text-right">Rate</th>
                <th className="p-3 w-32 text-right">Amount</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y border-b border-black">
              {doc?.items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 group/row">
                  <td className="p-2 relative">
                    <input 
                      type="text" 
                      placeholder="Service/Item Name"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      onBlur={() => syncToPricingSheet(item.description)}
                      className="w-full p-2 text-sm font-bold bg-transparent outline-none"
                    />
                    <div className="absolute left-2 -bottom-1 opacity-0 group-focus-within/row:opacity-100 transition-opacity">
                       <span className="text-[8px] font-bold text-brand-blue uppercase flex items-center gap-1">
                          <RefreshCw size={8} /> Auto-Syncs to Pricing
                       </span>
                    </div>
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                      className="w-full p-2 text-sm font-mono font-bold bg-transparent outline-none text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={item.rate}
                      onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value))}
                      className="w-full p-2 text-sm font-mono font-bold bg-transparent outline-none text-right"
                    />
                  </td>
                  <td className="p-2 text-right text-sm font-mono font-bold">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItem} className="w-full py-3 bg-white hover:bg-gray-50 text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-colors">
             <Plus size={14}/> Add Item
          </button>
        </div>

        {/* Footer Totals */}
        <div className="flex flex-col md:flex-row justify-between gap-10">
           <div className="flex-grow space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Notes & Payment Instructions</label>
                <textarea 
                  value={doc?.notes}
                  onChange={e => setDoc({...doc!, notes: e.target.value})}
                  className="w-full p-3 border border-gray-200 text-xs font-mono h-24 outline-none focus:border-black"
                />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Tax Rate %</label>
                    <input type="number" value={doc?.taxRate} onChange={e => setDoc({...doc!, taxRate: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-200 font-mono text-sm outline-none focus:border-black"/>
                 </div>
                 <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Discount %</label>
                    <input type="number" value={doc?.discount} onChange={e => setDoc({...doc!, discount: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-200 font-mono text-sm outline-none focus:border-black"/>
                 </div>
              </div>
           </div>

           <div className="w-full md:w-80 space-y-4 bg-gray-50 border-2 border-black p-6">
              <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono text-black">${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase text-red-600">
                  <span>Discount</span>
                  <span className="font-mono">-${totals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                <span>Tax ({doc?.taxRate}%)</span>
                <span className="font-mono text-black">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="h-0.5 bg-black"></div>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-black uppercase">Total Due</span>
                <span className="text-3xl font-mono font-bold text-brand-blue">${totals.total.toFixed(2)}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Editor Actions Footer */}
      <div className="p-6 border-t-2 border-black bg-white flex flex-col sm:flex-row gap-4">
        {doc?.type === 'ESTIMATE' ? (
          <button 
            onClick={handleConvertToInvoice}
            className="flex-1 py-4 border-2 border-black font-bold uppercase text-sm shadow-swiss hover:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {!isPro && <Lock size={16}/>} <ArrowRight size={18}/> Convert to Invoice
          </button>
        ) : (
          <button 
            onClick={handleRecordToAR}
            disabled={doc?.status === 'RECORDED'}
            className={`flex-1 py-4 border-2 border-black font-bold uppercase text-sm shadow-swiss hover:shadow-none transition-all flex items-center justify-center gap-2 ${doc?.status === 'RECORDED' ? 'bg-gray-100 opacity-50' : 'bg-brand-blue text-white'}`}
          >
            {!isPro && <Lock size={16}/>} <Database size={18}/> {doc?.status === 'RECORDED' ? 'Already Recorded' : 'Record to Ledger'}
          </button>
        )}
        <button 
          onClick={() => {
            triggerHaptic(ImpactStyle.Light);
            if (!isPro) onShowPaywall();
            else alert("PDF Engine Initialized...");
          }}
          className="flex-1 py-4 bg-black text-white font-bold uppercase text-sm border-2 border-black shadow-swiss hover:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {!isPro && <Lock size={16}/>} <Download size={18}/> Export PDF
        </button>
      </div>
    </div>
  );
};

export default BusinessTools;
