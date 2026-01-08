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



export enum AssetCategory {
  MATERIAL = 'Material',
  EQUIPMENT = 'Equipment',
  STOCK = 'Finished Stock',
  OTHER = 'Other'
}

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  unitCost: number;
  category: AssetCategory;
  minThreshold?: number;
}

export interface BusinessData {
  transactions: Transaction[];
  accounts: BankAccount[];
  targets: BudgetTargets;
  monthlyOverhead: FinancialItem[];
  annualOverhead: FinancialItem[];
  inventory: InventoryItem[];
  taxRate?: number; // Estimated tax rate for provisioning (e.g., 25)
  reserveMonths?: number; // How many months of overhead to reserve as "Safety"
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
  provisionedTax?: number;
  postTaxBne?: number;
  inventoryValue: number;
  materialValue: number;
  equipmentValue: number;
}

export interface AuditIssue {
  type: 'WARNING' | 'OPTIMIZATION' | 'CRITICAL';
  message: string;
  impact?: string;
}

export interface Client {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  sentDate?: string;
  lineItems: LineItem[];
  overheadPercent: number;
  profitMargin: number;
  notes?: string;
  total: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  lineItems: LineItem[];
  total: number;
  paidDate?: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
}

export type JobStatus = 'QUOTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'INVOICED' | 'PAID' | 'ARCHIVED';

export interface Job {
  id: string;
  title: string;
  client: Client;
  status: JobStatus;
  createdAt: string;
  quote: Quote;
  invoice?: Invoice;
  expenses?: FinancialItem[];
}

export interface AuditResult {
  score: number; // 0-100
  issues: AuditIssue[];
  summary: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  bne: number;
  assets: number;
  liabilities: number;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export type DocumentStatus = 'DRAFT' | 'SENT' | 'RECORDED';

/**
 * @deprecated The BusinessDocument interface is deprecated and will be removed in a future version.
 * Please use the new Job, Quote, and Invoice interfaces instead.
 */
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
