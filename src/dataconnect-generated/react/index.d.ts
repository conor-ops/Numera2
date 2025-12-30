import { CreateFinancialProfileData, CreateFinancialProfileVariables, GetFinancialProfileByUserData, GetFinancialProfileByUserVariables, CreateExpenseData, CreateExpenseVariables, ListExpensesByCategoryData, ListExpensesByCategoryVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateFinancialProfile(options?: useDataConnectMutationOptions<CreateFinancialProfileData, FirebaseError, CreateFinancialProfileVariables>): UseDataConnectMutationResult<CreateFinancialProfileData, CreateFinancialProfileVariables>;
export function useCreateFinancialProfile(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFinancialProfileData, FirebaseError, CreateFinancialProfileVariables>): UseDataConnectMutationResult<CreateFinancialProfileData, CreateFinancialProfileVariables>;

export function useGetFinancialProfileByUser(vars: GetFinancialProfileByUserVariables, options?: useDataConnectQueryOptions<GetFinancialProfileByUserData>): UseDataConnectQueryResult<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;
export function useGetFinancialProfileByUser(dc: DataConnect, vars: GetFinancialProfileByUserVariables, options?: useDataConnectQueryOptions<GetFinancialProfileByUserData>): UseDataConnectQueryResult<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;

export function useCreateExpense(options?: useDataConnectMutationOptions<CreateExpenseData, FirebaseError, CreateExpenseVariables>): UseDataConnectMutationResult<CreateExpenseData, CreateExpenseVariables>;
export function useCreateExpense(dc: DataConnect, options?: useDataConnectMutationOptions<CreateExpenseData, FirebaseError, CreateExpenseVariables>): UseDataConnectMutationResult<CreateExpenseData, CreateExpenseVariables>;

export function useListExpensesByCategory(vars: ListExpensesByCategoryVariables, options?: useDataConnectQueryOptions<ListExpensesByCategoryData>): UseDataConnectQueryResult<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;
export function useListExpensesByCategory(dc: DataConnect, vars: ListExpensesByCategoryVariables, options?: useDataConnectQueryOptions<ListExpensesByCategoryData>): UseDataConnectQueryResult<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;
