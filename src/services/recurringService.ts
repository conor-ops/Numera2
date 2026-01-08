import { RecurringTransaction, RecurringFrequency, Transaction } from '../types';

const STORAGE_KEY = 'Solventless_recurring_transactions';

/**
 * Load all recurring transactions from localStorage
 */
export const loadRecurringTransactions = (): RecurringTransaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load recurring transactions:', error);
    return [];
  }
};

/**
 * Save recurring transactions to localStorage
 */
export const saveRecurringTransactions = (items: RecurringTransaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save recurring transactions:', error);
  }
};

/**
 * Calculate the next occurrence date based on frequency
 */
export const calculateNextOccurrence = (
  currentDate: string,
  frequency: RecurringFrequency
): string => {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString();
};

/**
 * Check if a recurring transaction is due today
 */
export const isDueToday = (nextOccurrence: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(nextOccurrence);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate <= today;
};

/**
 * Process all pending recurring transactions
 * Returns array of transactions that should be added
 */
export const processPendingRecurring = (): {
  toAdd: Transaction[];
  toNotify: RecurringTransaction[];
  updated: RecurringTransaction[];
} => {
  const recurring = loadRecurringTransactions();
  const toAdd: Transaction[] = [];
  const toNotify: RecurringTransaction[] = [];
  const updated: RecurringTransaction[] = [];
  
  recurring.forEach(item => {
    if (!item.isActive) return;
    if (!isDueToday(item.nextOccurrence)) return;
    
    // Create the transaction
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      name: `${item.name} (Recurring)`,
      amount: item.amount,
      type: item.type,
      date_occurred: new Date().toISOString()
    };
    
    // Update the recurring item
    const updatedItem: RecurringTransaction = {
      ...item,
      nextOccurrence: calculateNextOccurrence(item.nextOccurrence, item.frequency),
      lastProcessed: new Date().toISOString()
    };
    
    updated.push(updatedItem);
    
    if (item.autoAdd) {
      toAdd.push(transaction);
    } else {
      toNotify.push(item);
    }
  });
  
  // Save updated recurring items
  if (updated.length > 0) {
    const allRecurring = recurring.map(item => {
      const found = updated.find(u => u.id === item.id);
      return found || item;
    });
    saveRecurringTransactions(allRecurring);
  }
  
  return { toAdd, toNotify, updated };
};

/**
 * Add a new recurring transaction
 */
export const addRecurringTransaction = (item: Omit<RecurringTransaction, 'id' | 'nextOccurrence'>): RecurringTransaction => {
  const recurring = loadRecurringTransactions();
  
  const newItem: RecurringTransaction = {
    ...item,
    id: crypto.randomUUID(),
    // First occurrence should be the start date itself, not +1 period
    nextOccurrence: item.startDate
  };
  
  recurring.push(newItem);
  saveRecurringTransactions(recurring);
  
  return newItem;
};

/**
 * Update an existing recurring transaction
 */
export const updateRecurringTransaction = (id: string, updates: Partial<RecurringTransaction>): void => {
  const recurring = loadRecurringTransactions();
  const index = recurring.findIndex(item => item.id === id);
  
  if (index !== -1) {
    recurring[index] = { ...recurring[index], ...updates };
    
    // Recalculate next occurrence if frequency or start date changed
    if (updates.frequency || updates.startDate) {
      recurring[index].nextOccurrence = calculateNextOccurrence(
        recurring[index].startDate,
        recurring[index].frequency
      );
    }
    
    saveRecurringTransactions(recurring);
  }
};

/**
 * Delete a recurring transaction
 */
export const deleteRecurringTransaction = (id: string): void => {
  const recurring = loadRecurringTransactions();
  const filtered = recurring.filter(item => item.id !== id);
  saveRecurringTransactions(filtered);
};

/**
 * Toggle active status (pause/resume)
 */
export const toggleRecurringActive = (id: string): void => {
  const recurring = loadRecurringTransactions();
  const index = recurring.findIndex(item => item.id === id);
  
  if (index !== -1) {
    recurring[index].isActive = !recurring[index].isActive;
    saveRecurringTransactions(recurring);
  }
};

/**
 * Get frequency label for display
 */
export const getFrequencyLabel = (frequency: RecurringFrequency): string => {
  const labels: Record<RecurringFrequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Every 2 Weeks',
    monthly: 'Monthly',
    quarterly: 'Every 3 Months',
    annually: 'Yearly'
  };
  return labels[frequency];
};

/**
 * Format next occurrence for display
 */
export const formatNextOccurrence = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

