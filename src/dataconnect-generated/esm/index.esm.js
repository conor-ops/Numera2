import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'numera2',
  location: 'europe-west9'
};

export const createFinancialProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFinancialProfile', inputVars);
}
createFinancialProfileRef.operationName = 'CreateFinancialProfile';

export function createFinancialProfile(dcOrVars, vars) {
  return executeMutation(createFinancialProfileRef(dcOrVars, vars));
}

export const getFinancialProfileByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFinancialProfileByUser', inputVars);
}
getFinancialProfileByUserRef.operationName = 'GetFinancialProfileByUser';

export function getFinancialProfileByUser(dcOrVars, vars) {
  return executeQuery(getFinancialProfileByUserRef(dcOrVars, vars));
}

export const createExpenseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateExpense', inputVars);
}
createExpenseRef.operationName = 'CreateExpense';

export function createExpense(dcOrVars, vars) {
  return executeMutation(createExpenseRef(dcOrVars, vars));
}

export const listExpensesByCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListExpensesByCategory', inputVars);
}
listExpensesByCategoryRef.operationName = 'ListExpensesByCategory';

export function listExpensesByCategory(dcOrVars, vars) {
  return executeQuery(listExpensesByCategoryRef(dcOrVars, vars));
}

