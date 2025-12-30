import { Decimal } from 'decimal.js';
import { BusinessData } from '@/types';

export const parseAmount = (value: string): Decimal => {
  if (!value || value.trim() === '') return new Decimal(0);
  const cleaned = value.replace(/[^\d.-]/g, '');
  try {
    const parsed = new Decimal(cleaned);
    return parsed.isNegative() ? new Decimal(0) : parsed;
  } catch {
    return new Decimal(0);
  }
};

export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text.trim().replace(/<[^>]*>/g, '').slice(0, 200);
};

export const validateFinancialData = (data: BusinessData): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.transactions)) return false;
  if (!Array.isArray(data.banks)) return false;
  return true;
};

export const formatCurrency = (amount: number | Decimal, symbol: string = '$'): string => {
  const value = typeof amount === 'number' ? amount : amount.toNumber();
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
