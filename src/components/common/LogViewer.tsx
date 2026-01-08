
import React, { useState } from 'react';
import { Terminal, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useLogger } from '../services/loggerService';

const LogViewer: React.FC = () => {
  const { logs, clearLogs } = useLogger();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-black text-white p-2 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform opacity-50 hover:opacity-100"
        title="Open Debug Logs"
      >
        <Terminal size={16} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-[90vw] md:w-[400px] bg-black border-2 border-white shadow-2xl flex flex-col font-mono text-xs max-h-[300px] animate-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center p-2 border-b border-gray-800 bg-gray-900 text-white">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-green-400" />
          <span className="font-bold uppercase tracking-wider">System Logs</span>
        </div>
        <div className="flex gap-2">
          <button onClick={clearLogs} className="hover:text-red-400" title="Clear"><Trash2 size={14}/></button>
          <button onClick={() => setIsOpen(false)} className="hover:text-gray-300" title="Close"><ChevronDown size={14}/></button>
        </div>
      </div>
      <div className="overflow-y-auto p-2 space-y-1 flex-grow bg-black/95">
        {logs.length === 0 && <div className="text-gray-600 italic p-2 text-center">No logs recorded.</div>}
        {logs.map(log => (
          <div key={log.id} className="flex gap-2 items-start border-l-2 pl-2 border-gray-800 hover:bg-gray-900 p-1">
            <span className="text-gray-500 whitespace-nowrap">[{log.timestamp.toLocaleTimeString().split(' ')[0]}]</span>
            <div className="break-all">
              <span className={`font-bold uppercase mr-2 ${
                log.level === 'error' ? 'text-red-500' : 
                log.level === 'success' ? 'text-green-500' : 
                log.level === 'warn' ? 'text-yellow-500' : 'text-blue-400'
              }`}>{log.level}</span>
              <span className="text-gray-300">{log.message}</span>
              {log.data && (
                <pre className="mt-1 text-[10px] text-gray-500 overflow-x-auto bg-gray-900 p-1 rounded">
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
