const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'Solventless2',
  location: 'europe-west9'
};
exports.connectorConfig = connectorConfig;

const createFinancialProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFinancialProfile', inputVars);
}
createFinancialProfileRef.operationName = 'CreateFinancialProfile';
exports.createFinancialProfileRef = createFinancialProfileRef;

exports.createFinancialProfile = function createFinancialProfile(dcOrVars, vars) {
  return executeMutation(createFinancialProfileRef(dcOrVars, vars));
};

const getFinancialProfileByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFinancialProfileByUser', inputVars);
}
getFinancialProfileByUserRef.operationName = 'GetFinancialProfileByUser';
exports.getFinancialProfileByUserRef = getFinancialProfileByUserRef;

exports.getFinancialProfileByUser = function getFinancialProfileByUser(dcOrVars, vars) {
  return executeQuery(getFinancialProfileByUserRef(dcOrVars, vars));
};

const createExpenseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateExpense', inputVars);
}
createExpenseRef.operationName = 'CreateExpense';
exports.createExpenseRef = createExpenseRef;

exports.createExpense = function createExpense(dcOrVars, vars) {
  return executeMutation(createExpenseRef(dcOrVars, vars));
};

const listExpensesByCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListExpensesByCategory', inputVars);
}
listExpensesByCategoryRef.operationName = 'ListExpensesByCategory';
exports.listExpensesByCategoryRef = listExpensesByCategoryRef;

exports.listExpensesByCategory = function listExpensesByCategory(dcOrVars, vars) {
  return executeQuery(listExpensesByCategoryRef(dcOrVars, vars));
};

