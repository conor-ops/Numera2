import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateExpenseData {
  expense_insert: Expense_Key;
}

export interface CreateExpenseVariables {
  financialProfileId: UUIDString;
  expenseCategoryId?: UUIDString | null;
  amount: number;
  date: DateString;
  description?: string | null;
  isRecurring?: boolean | null;
  name: string;
}

export interface CreateFinancialProfileData {
  financialProfile_insert: FinancialProfile_Key;
}

export interface CreateFinancialProfileVariables {
  userId: UUIDString;
  name: string;
  description: string;
}

export interface ExpenseCategory_Key {
  id: UUIDString;
  __typename?: 'ExpenseCategory_Key';
}

export interface Expense_Key {
  id: UUIDString;
  __typename?: 'Expense_Key';
}

export interface FinancialProfile_Key {
  id: UUIDString;
  __typename?: 'FinancialProfile_Key';
}

export interface GetFinancialProfileByUserData {
  financialProfiles: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & FinancialProfile_Key)[];
}

export interface GetFinancialProfileByUserVariables {
  userId: UUIDString;
}

export interface Income_Key {
  id: UUIDString;
  __typename?: 'Income_Key';
}

export interface ListExpensesByCategoryData {
  expenses: ({
    id: UUIDString;
    name: string;
    amount: number;
    date: DateString;
    description?: string | null;
  } & Expense_Key)[];
}

export interface ListExpensesByCategoryVariables {
  expenseCategoryId: UUIDString;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateFinancialProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFinancialProfileVariables): MutationRef<CreateFinancialProfileData, CreateFinancialProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFinancialProfileVariables): MutationRef<CreateFinancialProfileData, CreateFinancialProfileVariables>;
  operationName: string;
}
export const createFinancialProfileRef: CreateFinancialProfileRef;

export function createFinancialProfile(vars: CreateFinancialProfileVariables): MutationPromise<CreateFinancialProfileData, CreateFinancialProfileVariables>;
export function createFinancialProfile(dc: DataConnect, vars: CreateFinancialProfileVariables): MutationPromise<CreateFinancialProfileData, CreateFinancialProfileVariables>;

interface GetFinancialProfileByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFinancialProfileByUserVariables): QueryRef<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFinancialProfileByUserVariables): QueryRef<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;
  operationName: string;
}
export const getFinancialProfileByUserRef: GetFinancialProfileByUserRef;

export function getFinancialProfileByUser(vars: GetFinancialProfileByUserVariables): QueryPromise<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;
export function getFinancialProfileByUser(dc: DataConnect, vars: GetFinancialProfileByUserVariables): QueryPromise<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;

interface CreateExpenseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateExpenseVariables): MutationRef<CreateExpenseData, CreateExpenseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateExpenseVariables): MutationRef<CreateExpenseData, CreateExpenseVariables>;
  operationName: string;
}
export const createExpenseRef: CreateExpenseRef;

export function createExpense(vars: CreateExpenseVariables): MutationPromise<CreateExpenseData, CreateExpenseVariables>;
export function createExpense(dc: DataConnect, vars: CreateExpenseVariables): MutationPromise<CreateExpenseData, CreateExpenseVariables>;

interface ListExpensesByCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListExpensesByCategoryVariables): QueryRef<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListExpensesByCategoryVariables): QueryRef<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;
  operationName: string;
}
export const listExpensesByCategoryRef: ListExpensesByCategoryRef;

export function listExpensesByCategory(vars: ListExpensesByCategoryVariables): QueryPromise<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;
export function listExpensesByCategory(dc: DataConnect, vars: ListExpensesByCategoryVariables): QueryPromise<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;

