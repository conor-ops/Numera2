import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const PricingSheet: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, rate: 0 });

  const addLineItem = () => {
    if (!newItem.description.trim()) return;
    
    const item: LineItem = {
      id: Date.now().toString(),
      ...newItem,
    };
    
    setLineItems([...lineItems, item]);
    setNewItem({ description: '', quantity: 1, rate: 0 });
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const tax = subtotal * 0.1; // 10% tax example
  const total = subtotal + tax;

  const exportToPDF = () => {
    const content = `
PRICING SHEET
${clientName ? `Client: ${clientName}` : ''}
${projectName ? `Project: ${projectName}` : ''}
Date: ${new Date().toLocaleDateString()}

LINE ITEMS:
${lineItems.map(item => 
  `${item.description} - Qty: ${item.quantity} × $${item.rate.toFixed(2)} = $${(item.quantity * item.rate).toFixed(2)}`
).join('\n')}

Subtotal: $${subtotal.toFixed(2)}
Tax (10%): $${tax.toFixed(2)}
TOTAL: $${total.toFixed(2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-sheet-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Client Name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter client name"
            className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono"
          />
        </div>
      </div>

      <div className="border-2 border-black p-4 space-y-3">
        <h3 className="font-bold uppercase text-sm mb-3">Add Line Item</h3>
        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Description"
            className="col-span-6 px-3 py-2 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-sm"
          />
          <input
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
            placeholder="Qty"
            min="1"
            className="col-span-2 px-3 py-2 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-sm"
          />
          <input
            type="number"
            value={newItem.rate}
            onChange={(e) => setNewItem({ ...newItem, rate: Number(e.target.value) })}
            placeholder="Rate"
            min="0"
            step="0.01"
            className="col-span-3 px-3 py-2 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono text-sm"
          />
          <button
            onClick={addLineItem}
            className="col-span-1 px-3 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {lineItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300">
            <p className="text-sm font-bold uppercase">No line items yet</p>
          </div>
        ) : (
          lineItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border-2 border-black bg-gray-50">
              <div className="flex-1 font-mono text-sm">
                <span className="font-bold">{item.description}</span>
                <span className="text-gray-600 ml-2">
                  {item.quantity} × ${item.rate.toFixed(2)}
                </span>
              </div>
              <div className="font-bold font-mono">${(item.quantity * item.rate).toFixed(2)}</div>
              <button
                onClick={() => removeLineItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>

      {lineItems.length > 0 && (
        <div className="border-t-2 border-black pt-4 space-y-2">
          <div className="flex justify-between font-mono">
            <span>Subtotal:</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-mono text-sm text-gray-600">
            <span>Tax (10%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-mono text-xl font-bold pt-2 border-t-2 border-black">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <button
            onClick={exportToPDF}
            className="w-full mt-4 px-6 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={20} strokeWidth={2.5} />
            Export Quote
          </button>
        </div>
      )}
    </div>
  );
};

export default PricingSheet;
