import React, { useState } from 'react';
import { X, Plus, Trash2, DollarSign, Save, Download } from 'lucide-react';

interface PricingItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PricingSheetProps {
  onClose: () => void;
}

export default function PricingSheet({ onClose }: PricingSheetProps) {
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
Project: ${projectName}
Client: ${clientName}
Date: ${new Date().toLocaleDateString()}

Items:
${items.map(item => `${item.name} - $${item.unitPrice} x ${item.quantity} = $${item.total.toFixed(2)}`).join('\n')}

Subtotal: $${subtotal.toFixed(2)}
Total: $${total.toFixed(2)}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-${projectName || 'sheet'}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="text-white" size={32} />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Pricing Sheet</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="text-white" size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
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
                <div className="col-span-1 font-bold font-mono">${item.total.toFixed(2)}</div>
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
    </div>
  );
}
