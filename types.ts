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
  linkedDocId?: string; // Link to a generated invoice
}

export interface BudgetTargets {
  arTarget: number;
  apTarget: number;
  creditTarget: number;
}

export interface BusinessProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface PricingItem {
  id: string;
  name: string;
  supplierCost: number;
  freightCost: number;
  markupPercent: number;
}

export interface BusinessData {
  transactions: Transaction[];
  accounts: BankAccount[];
  targets: BudgetTargets;
  monthlyOverhead: FinancialItem[];
  annualOverhead: FinancialItem[];
  pricingSheet: PricingItem[];
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

export interface HistoryRecord {
  id: string;
  date: string;
  bne: number;
  assets: number;
  liabilities: number;
}

export interface LineItem {
  id:string;
  description: string;
  quantity: number;
  rate: number;
}

export type DocumentStatus = 'DRAFT' | 'SENT' | 'RECORDED';

export interface BusinessDocument {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  items: LineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  type: 'ESTIMATE' | 'INVOICE';
  status: DocumentStatus;
  companyInfo?: BusinessProfile;
}

export interface Category {
    id: string;
    name: string;
    icon_name?: string;
    budget_limit?: number;
    is_system_default: boolean;
  }