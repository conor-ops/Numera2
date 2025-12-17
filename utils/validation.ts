/**
 * Input validation utilities for Numera
 * Ensures data integrity and prevents common input issues
 */

/**
 * Validates and sanitizes monetary amounts
 * @param value - Raw input value (string or number)
 * @returns Valid number between 0 and 999,999,999 with max 2 decimal places
 */
export const parseAmount = (value: string | number): number => {
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid numbers
  if (isNaN(parsed) || !isFinite(parsed)) {
    return 0;
  }
  
  // Prevent negative amounts
  if (parsed < 0) {
    return 0;
  }
  
  // Cap at 1 billion to prevent overflow issues
  const MAX_AMOUNT = 999999999.99;
  if (parsed > MAX_AMOUNT) {
    return MAX_AMOUNT;
  }
  
  // Round to 2 decimal places for currency precision
  return Math.round(parsed * 100) / 100;
};

/**
 * Validates and sanitizes text inputs
 * @param value - Raw input value
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Sanitized string
 */
export const sanitizeText = (value: string, maxLength: number = 100): string => {
  if (typeof value !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let sanitized = value.trim();
  
  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove control characters (except newlines/tabs if needed)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  return sanitized;
};

/**
 * Validates that a value is a valid UUID
 * @param value - String to validate
 * @returns True if valid UUID format
 */
export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validates ISO date string
 * @param value - String to validate
 * @returns True if valid ISO date
 */
export const isValidISODate = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
};

/**
 * Validates financial data structure loaded from storage
 * Ensures data integrity and prevents crashes from malformed data
 */
export const validateFinancialData = (data: any): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check for required arrays
  if (!Array.isArray(data.transactions) || !Array.isArray(data.accounts)) {
    return false;
  }
  
  // Validate transactions
  for (const tx of data.transactions) {
    if (!tx.id || typeof tx.id !== 'string') return false;
    if (typeof tx.amount !== 'number' || !isFinite(tx.amount)) return false;
    if (!['INCOME', 'EXPENSE'].includes(tx.type)) return false;
    if (tx.name && typeof tx.name !== 'string') return false;
  }
  
  // Validate accounts
  for (const acc of data.accounts) {
    if (!acc.id || typeof acc.id !== 'string') return false;
    if (typeof acc.amount !== 'number' || !isFinite(acc.amount)) return false;
    if (!acc.type || typeof acc.type !== 'string') return false;
    if (acc.bankName && typeof acc.bankName !== 'string') return false;
  }
  
  return true;
};
