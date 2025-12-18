import React, { useState, useEffect } from 'react';
import { RefreshCcw, Plus, Trash2, Pause, Play, Edit2 } from 'lucide-react';
import { RecurringTransaction, RecurringFrequency } from '../../types';
import {
  loadRecurringTransactions,
  addRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringActive,
  getFrequencyLabel,
  formatNextOccurrence
} from '../../services/recurringService';
import { triggerHaptic } from '../../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';

interface RecurringTransactionsProps {
  isPro: boolean;
  onUpgradeClick: () => void;
  onClose: () => void;
}

const FREE_RECURRING_LIMIT = 3;

const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({
  isPro,
  onUpgradeClick,
  onClose
}) => {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    frequency: 'monthly' as RecurringFrequency,
    autoAdd: false,
    isActive: true,
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setRecurring(loadRecurringTransactions());
  }, []);

  const canAddMore = isPro || recurring.length < FREE_RECURRING_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerHaptic(ImpactStyle.Medium);

    if (!canAddMore && !editingId) {
      onUpgradeClick();
      return;
    }

    // Convert date-only string to full ISO timestamp for startDate
    const startDateISO = new Date(formData.startDate + 'T00:00:00').toISOString();
    const dataToSave = {
      ...formData,
      startDate: startDateISO
    };

    if (editingId) {
      updateRecurringTransaction(editingId, dataToSave);
    } else {
      addRecurringTransaction(dataToSave);
    }

    setRecurring(loadRecurringTransactions());
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await triggerHaptic(ImpactStyle.Heavy);
    if (window.confirm('Delete this recurring transaction?')) {
      deleteRecurringTransaction(id);
      setRecurring(loadRecurringTransactions());
    }
  };

  const handleToggleActive = async (id: string) => {
    await triggerHaptic(ImpactStyle.Light);
    toggleRecurringActive(id);
    setRecurring(loadRecurringTransactions());
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      amount: item.amount,
      type: item.type,
      frequency: item.frequency,
      autoAdd: item.autoAdd,
      isActive: item.isActive,
      startDate: item.startDate.split('T')[0]
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      type: 'EXPENSE',
      frequency: 'monthly',
      autoAdd: false,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-swiss max-w-3xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">Recurring Transactions</h2>
            {!isPro && (
              <p className="text-sm text-gray-600 mt-1">
                {recurring.length}/{FREE_RECURRING_LIMIT} free recurring items
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 border-2 border-black p-4 mb-6">
              <h3 className="font-bold uppercase text-sm mb-4">
                {editingId ? 'Edit Recurring Item' : 'New Recurring Item'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1">NAME</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border-2 border-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold mb-1">AMOUNT</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="w-full p-2 border-2 border-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1">TYPE</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'INCOME' | 'EXPENSE'})}
                    className="w-full p-2 border-2 border-black"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">FREQUENCY</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value as RecurringFrequency})}
                    className="w-full p-2 border-2 border-black"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 Weeks</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">START DATE</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-2 border-2 border-black"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">When should this recurring item begin?</p>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.autoAdd}
                    onChange={(e) => setFormData({...formData, autoAdd: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Auto-add to transactions (don't ask)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-blue text-white font-bold uppercase text-sm border-2 border-black hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                  className="px-4 py-2 bg-gray-200 font-bold uppercase text-sm border-2 border-black hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-3">
            {recurring.map((item) => (
              <div
                key={item.id}
                className={`border-2 border-black p-4 ${!item.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${item.amount.toFixed(2)} • {getFrequencyLabel(item.frequency)} • {item.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className="p-2 hover:bg-gray-100"
                      title={item.isActive ? 'Pause' : 'Resume'}
                    >
                      {item.isActive ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-gray-100"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-100 text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    Next: {formatNextOccurrence(item.nextOccurrence)}
                  </span>
                  <span className={`px-2 py-1 rounded ${item.autoAdd ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.autoAdd ? 'Auto-add' : 'Notify'}
                  </span>
                </div>
              </div>
            ))}

            {recurring.length === 0 && !showForm && (
              <div className="text-center py-12 text-gray-400">
                <RefreshCcw size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recurring transactions yet</p>
                <p className="text-sm">Save time by automating recurring items</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!showForm && (
          <div className="p-4 border-t-2 border-black">
            <button
              onClick={() => {
                if (canAddMore) {
                  setShowForm(true);
                } else {
                  onUpgradeClick();
                }
              }}
              className={`w-full py-3 flex items-center justify-center gap-2 font-bold uppercase text-sm border-2 border-black ${
                canAddMore
                  ? 'bg-brand-blue text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              <Plus size={16} />
              {canAddMore ? 'Add Recurring Item' : `Upgrade for Unlimited (Max ${FREE_RECURRING_LIMIT} Free)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringTransactions;
