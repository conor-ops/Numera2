import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, Save, Download } from 'lucide-react';
import { PricingItem } from '../types';

interface PricingSheetProps {
  onClose: () => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

export default function PricingSheet({ onClose, isPro, onUpgradeClick }: PricingSheetProps) {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<PricingItem[]>([
    { id: '1', name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PricingItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0; // Can be made editable
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const exportToPDF = () => {
    const content = `
PRICING SHEET
${clientName ? `Client: ${clientName}` : ''}
${projectName ? `Project: ${projectName}` : ''}
Date: ${new Date().toLocaleDateString()}

Items:
${items.map(item => 
  `${item.name} - Qty: ${item.quantity} × $${item.unitPrice.toFixed(2)} = $${(item.quantity * item.unitPrice).toFixed(2)}`
).join('\n')}

Subtotal: $${subtotal.toFixed(2)}
Tax (10%): $${tax.toFixed(2)}
TOTAL: $${total.toFixed(2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-${projectName || 'sheet'}.txt`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold mb-2">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded-lg font-mono"
              placeholder="Website Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded-lg font-mono"
              placeholder="Acme Corp"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-2 text-sm font-bold uppercase mb-2">
            <div className="col-span-3">Item</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Total</div>
          </div>

          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                className="col-span-3 px-3 py-2 border-2 border-black rounded-lg font-mono text-sm"
                placeholder="Service name"
              />
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                className="col-span-3 px-3 py-2 border-2 border-black rounded-lg font-mono text-sm"
                placeholder="Details"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="col-span-2 px-3 py-2 border-2 border-black rounded-lg font-mono text-sm"
                min="0"
              />
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="col-span-2 px-3 py-2 border-2 border-black rounded-lg font-mono text-sm"
                min="0"
                step="0.01"
              />
              <div className="col-span-1 font-bold font-mono">${(item.quantity * item.unitPrice).toFixed(2)}</div>
              <button
                onClick={() => removeItem(item.id)}
                className="col-span-1 p-2 hover:bg-red-100 rounded-lg transition-colors"
                disabled={items.length === 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors border-2 border-black"
        >
          <Plus size={16} />
          Add Item
        </button>

        <div className="mt-8 border-t-4 border-black pt-6">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal:</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black border-t-4 border-black pt-2">
                <span>TOTAL:</span>
                <span className="font-mono text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-4 border-black p-6 bg-gray-50 flex gap-3">
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors border-2 border-black flex-1"
        >
          <Download size={18} />
          Export
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 text-black font-bold rounded-lg hover:bg-gray-300 transition-colors border-2 border-black"
        >
          Close
        </button>
      </div>
    </div>
