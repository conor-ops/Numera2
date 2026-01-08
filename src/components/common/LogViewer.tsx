
import React, { useState } from 'react';
import { Terminal, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useLogger } from '../../services/loggerService';

const LogViewer: React.FC = () => {
  const { logs, clearLogs } = useLogger();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black text-white p-3 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        title="Open Debug Logs"
      >
        <Terminal size={18} className="text-green-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-6 z-[99999] w-[90vw] md:w-[450px] bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col font-mono text-[10px] max-h-[400px] animate-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center p-3 border-b-4 border-black bg-black text-white">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-green-400" />
          <span className="font-black uppercase tracking-wider">System Kernel Logs</span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearLogs} className="hover:text-red-400" title="Clear"><Trash2 size={14}/></button>
          <button onClick={() => setIsOpen(false)} className="hover:text-gray-300" title="Close"><ChevronDown size={14}/></button>
        </div>
      </div>
      <div className="overflow-y-auto p-2 space-y-1 flex-grow bg-white divide-y divide-gray-100">
        {logs.length === 0 && <div className="text-gray-400 italic p-8 text-center uppercase font-bold">No Data in Buffer</div>}
        {logs.map(log => (
          <div key={log.id} className="flex gap-3 items-start p-2 hover:bg-gray-50">
            <span className="text-gray-400 font-bold shrink-0">{log.timestamp.toLocaleTimeString([], { hour12: false })}</span>
            <div className="flex-grow">
              <span className={`font-black uppercase mr-2 ${
                log.level === 'error' ? 'text-red-600' : 
                log.level === 'success' ? 'text-green-600' : 
                log.level === 'warn' ? 'text-amber-600' : 'text-blue-600'
              }`}>[{log.level}]</span>
              <span className="text-black font-bold">{log.message}</span>
              {log.data && (
                <pre className="mt-2 text-[9px] text-gray-500 overflow-x-auto bg-gray-50 p-2 border border-gray-200">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogViewer;
