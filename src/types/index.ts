
export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
}

export enum AccountType {
  CHECKING = 'Checking',
  SAVINGS = 'Savings',
  CREDIT = 'Credit'
}

export interface BankAccount extends FinancialItem {
  bankName: string;
  type: AccountType;
}

export interface Transaction extends FinancialItem {
  type: 'INCOME' | 'EXPENSE';
  date_occurred: string;
}

export interface BudgetTargets {
  arTarget: number;
  apTarget: number;
  creditTarget: number;
}

export interface BusinessData {
  transactions: Transaction[];
  accounts: BankAccount[];
}

export interface CalculationResult {
  totalAR: number;
  totalAP: number;
  totalCredit: number;
  totalBank: number;
  bankBreakdown: Record<string, number>;
  netReceivables: number;
  netBank: number;
  bne: number;
  bneFormulaStr: string;
}

export interface Category {
  id: string;
  name: string;
  icon_name?: string;
  budget_limit?: number;
  is_system_default: boolean;
}

export interface HistoryRecord {
  id: string;
  date: string;
  bne: number;
  assets: number;
  liabilities: number;
}
