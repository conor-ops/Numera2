
import { create } from 'zustand';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

interface LoggerStore {
  logs: LogEntry[];
  addLog: (level: LogEntry['level'], message: string, data?: any) => void;
  clearLogs: () => void;
}

export const useLogger = create<LoggerStore>((set) => ({
  logs: [],
  addLog: (level, message, data) => set((state) => ({
    logs: [{
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      data
    }, ...state.logs].slice(0, 100) // Keep last 100 logs
  })),
  clearLogs: () => set({ logs: [] })
}));

export const logInfo = (msg: string, data?: any) => useLogger.getState().addLog('info', msg, data);
export const logWarn = (msg: string, data?: any) => useLogger.getState().addLog('warn', msg, data);
export const logError = (msg: string, data?: any) => useLogger.getState().addLog('error', msg, data);
export const logSuccess = (msg: string, data?: any) => useLogger.getState().addLog('success', msg, data);
