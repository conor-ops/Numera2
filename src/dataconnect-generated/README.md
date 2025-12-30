# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetFinancialProfileByUser*](#getfinancialprofilebyuser)
  - [*ListExpensesByCategory*](#listexpensesbycategory)
- [**Mutations**](#mutations)
  - [*CreateFinancialProfile*](#createfinancialprofile)
  - [*CreateExpense*](#createexpense)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetFinancialProfileByUser
You can execute the `GetFinancialProfileByUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getFinancialProfileByUser(vars: GetFinancialProfileByUserVariables): QueryPromise<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;

interface GetFinancialProfileByUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFinancialProfileByUserVariables): QueryRef<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;
}
export const getFinancialProfileByUserRef: GetFinancialProfileByUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFinancialProfileByUser(dc: DataConnect, vars: GetFinancialProfileByUserVariables): QueryPromise<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;

interface GetFinancialProfileByUserRef {
  ...
  (dc: DataConnect, vars: GetFinancialProfileByUserVariables): QueryRef<GetFinancialProfileByUserData, GetFinancialProfileByUserVariables>;
}
export const getFinancialProfileByUserRef: GetFinancialProfileByUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFinancialProfileByUserRef:
```typescript
const name = getFinancialProfileByUserRef.operationName;
console.log(name);
```

### Variables
The `GetFinancialProfileByUser` query requires an argument of type `GetFinancialProfileByUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFinancialProfileByUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetFinancialProfileByUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFinancialProfileByUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFinancialProfileByUserData {
  financialProfiles: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & FinancialProfile_Key)[];
}
```
### Using `GetFinancialProfileByUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFinancialProfileByUser, GetFinancialProfileByUserVariables } from '@dataconnect/generated';

// The `GetFinancialProfileByUser` query requires an argument of type `GetFinancialProfileByUserVariables`:
const getFinancialProfileByUserVars: GetFinancialProfileByUserVariables = {
  userId: ..., 
};

// Call the `getFinancialProfileByUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFinancialProfileByUser(getFinancialProfileByUserVars);
// Variables can be defined inline as well.
const { data } = await getFinancialProfileByUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFinancialProfileByUser(dataConnect, getFinancialProfileByUserVars);

console.log(data.financialProfiles);

// Or, you can use the `Promise` API.
getFinancialProfileByUser(getFinancialProfileByUserVars).then((response) => {
  const data = response.data;
  console.log(data.financialProfiles);
});
```

### Using `GetFinancialProfileByUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFinancialProfileByUserRef, GetFinancialProfileByUserVariables } from '@dataconnect/generated';

// The `GetFinancialProfileByUser` query requires an argument of type `GetFinancialProfileByUserVariables`:
const getFinancialProfileByUserVars: GetFinancialProfileByUserVariables = {
  userId: ..., 
};

// Call the `getFinancialProfileByUserRef()` function to get a reference to the query.
const ref = getFinancialProfileByUserRef(getFinancialProfileByUserVars);
// Variables can be defined inline as well.
const ref = getFinancialProfileByUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFinancialProfileByUserRef(dataConnect, getFinancialProfileByUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.financialProfiles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.financialProfiles);
});
```

## ListExpensesByCategory
You can execute the `ListExpensesByCategory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listExpensesByCategory(vars: ListExpensesByCategoryVariables): QueryPromise<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;

interface ListExpensesByCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListExpensesByCategoryVariables): QueryRef<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;
}
export const listExpensesByCategoryRef: ListExpensesByCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listExpensesByCategory(dc: DataConnect, vars: ListExpensesByCategoryVariables): QueryPromise<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;

interface ListExpensesByCategoryRef {
  ...
  (dc: DataConnect, vars: ListExpensesByCategoryVariables): QueryRef<ListExpensesByCategoryData, ListExpensesByCategoryVariables>;
}
export const listExpensesByCategoryRef: ListExpensesByCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listExpensesByCategoryRef:
```typescript
const name = listExpensesByCategoryRef.operationName;
console.log(name);
```

### Variables
The `ListExpensesByCategory` query requires an argument of type `ListExpensesByCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListExpensesByCategoryVariables {
  expenseCategoryId: UUIDString;
}
```
### Return Type
Recall that executing the `ListExpensesByCategory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListExpensesByCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListExpensesByCategoryData {
  expenses: ({
    id: UUIDString;
    name: string;
    amount: number;
    date: DateString;
    description?: string | null;
  } & Expense_Key)[];
}
```
### Using `ListExpensesByCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listExpensesByCategory, ListExpensesByCategoryVariables } from '@dataconnect/generated';

// The `ListExpensesByCategory` query requires an argument of type `ListExpensesByCategoryVariables`:
const listExpensesByCategoryVars: ListExpensesByCategoryVariables = {
  expenseCategoryId: ..., 
};

// Call the `listExpensesByCategory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listExpensesByCategory(listExpensesByCategoryVars);
// Variables can be defined inline as well.
const { data } = await listExpensesByCategory({ expenseCategoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listExpensesByCategory(dataConnect, listExpensesByCategoryVars);

console.log(data.expenses);

// Or, you can use the `Promise` API.
listExpensesByCategory(listExpensesByCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.expenses);
});
```

### Using `ListExpensesByCategory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listExpensesByCategoryRef, ListExpensesByCategoryVariables } from '@dataconnect/generated';

// The `ListExpensesByCategory` query requires an argument of type `ListExpensesByCategoryVariables`:
const listExpensesByCategoryVars: ListExpensesByCategoryVariables = {
  expenseCategoryId: ..., 
};

// Call the `listExpensesByCategoryRef()` function to get a reference to the query.
const ref = listExpensesByCategoryRef(listExpensesByCategoryVars);
// Variables can be defined inline as well.
const ref = listExpensesByCategoryRef({ expenseCategoryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listExpensesByCategoryRef(dataConnect, listExpensesByCategoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.expenses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.expenses);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateFinancialProfile
You can execute the `CreateFinancialProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createFinancialProfile(vars: CreateFinancialProfileVariables): MutationPromise<CreateFinancialProfileData, CreateFinancialProfileVariables>;

interface CreateFinancialProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFinancialProfileVariables): MutationRef<CreateFinancialProfileData, CreateFinancialProfileVariables>;
}
export const createFinancialProfileRef: CreateFinancialProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFinancialProfile(dc: DataConnect, vars: CreateFinancialProfileVariables): MutationPromise<CreateFinancialProfileData, CreateFinancialProfileVariables>;

interface CreateFinancialProfileRef {
  ...
  (dc: DataConnect, vars: CreateFinancialProfileVariables): MutationRef<CreateFinancialProfileData, CreateFinancialProfileVariables>;
}
export const createFinancialProfileRef: CreateFinancialProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFinancialProfileRef:
```typescript
const name = createFinancialProfileRef.operationName;
console.log(name);
```

### Variables
The `CreateFinancialProfile` mutation requires an argument of type `CreateFinancialProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateFinancialProfileVariables {
  userId: UUIDString;
  name: string;
  description: string;
}
```
### Return Type
Recall that executing the `CreateFinancialProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFinancialProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFinancialProfileData {
  financialProfile_insert: FinancialProfile_Key;
}
```
### Using `CreateFinancialProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFinancialProfile, CreateFinancialProfileVariables } from '@dataconnect/generated';

// The `CreateFinancialProfile` mutation requires an argument of type `CreateFinancialProfileVariables`:
const createFinancialProfileVars: CreateFinancialProfileVariables = {
  userId: ..., 
  name: ..., 
  description: ..., 
};

// Call the `createFinancialProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFinancialProfile(createFinancialProfileVars);
// Variables can be defined inline as well.
const { data } = await createFinancialProfile({ userId: ..., name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFinancialProfile(dataConnect, createFinancialProfileVars);

console.log(data.financialProfile_insert);

// Or, you can use the `Promise` API.
createFinancialProfile(createFinancialProfileVars).then((response) => {
  const data = response.data;
  console.log(data.financialProfile_insert);
});
```

### Using `CreateFinancialProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFinancialProfileRef, CreateFinancialProfileVariables } from '@dataconnect/generated';

// The `CreateFinancialProfile` mutation requires an argument of type `CreateFinancialProfileVariables`:
const createFinancialProfileVars: CreateFinancialProfileVariables = {
  userId: ..., 
  name: ..., 
  description: ..., 
};

// Call the `createFinancialProfileRef()` function to get a reference to the mutation.
const ref = createFinancialProfileRef(createFinancialProfileVars);
// Variables can be defined inline as well.
const ref = createFinancialProfileRef({ userId: ..., name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFinancialProfileRef(dataConnect, createFinancialProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.financialProfile_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.financialProfile_insert);
});
```

## CreateExpense
You can execute the `CreateExpense` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createExpense(vars: CreateExpenseVariables): MutationPromise<CreateExpenseData, CreateExpenseVariables>;

interface CreateExpenseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateExpenseVariables): MutationRef<CreateExpenseData, CreateExpenseVariables>;
}
export const createExpenseRef: CreateExpenseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createExpense(dc: DataConnect, vars: CreateExpenseVariables): MutationPromise<CreateExpenseData, CreateExpenseVariables>;

interface CreateExpenseRef {
  ...
  (dc: DataConnect, vars: CreateExpenseVariables): MutationRef<CreateExpenseData, CreateExpenseVariables>;
}
export const createExpenseRef: CreateExpenseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createExpenseRef:
```typescript
const name = createExpenseRef.operationName;
console.log(name);
```

### Variables
The `CreateExpense` mutation requires an argument of type `CreateExpenseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateExpenseVariables {
  financialProfileId: UUIDString;
  expenseCategoryId?: UUIDString | null;
  amount: number;
  date: DateString;
  description?: string | null;
  isRecurring?: boolean | null;
  name: string;
}
```
### Return Type
Recall that executing the `CreateExpense` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateExpenseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateExpenseData {
  expense_insert: Expense_Key;
}
```
### Using `CreateExpense`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createExpense, CreateExpenseVariables } from '@dataconnect/generated';

// The `CreateExpense` mutation requires an argument of type `CreateExpenseVariables`:
const createExpenseVars: CreateExpenseVariables = {
  financialProfileId: ..., 
  expenseCategoryId: ..., // optional
  amount: ..., 
  date: ..., 
  description: ..., // optional
  isRecurring: ..., // optional
  name: ..., 
};

// Call the `createExpense()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createExpense(createExpenseVars);
// Variables can be defined inline as well.
const { data } = await createExpense({ financialProfileId: ..., expenseCategoryId: ..., amount: ..., date: ..., description: ..., isRecurring: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createExpense(dataConnect, createExpenseVars);

console.log(data.expense_insert);

// Or, you can use the `Promise` API.
createExpense(createExpenseVars).then((response) => {
  const data = response.data;
  console.log(data.expense_insert);
});
```

### Using `CreateExpense`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createExpenseRef, CreateExpenseVariables } from '@dataconnect/generated';

// The `CreateExpense` mutation requires an argument of type `CreateExpenseVariables`:
const createExpenseVars: CreateExpenseVariables = {
  financialProfileId: ..., 
  expenseCategoryId: ..., // optional
  amount: ..., 
  date: ..., 
  description: ..., // optional
  isRecurring: ..., // optional
  name: ..., 
};

// Call the `createExpenseRef()` function to get a reference to the mutation.
const ref = createExpenseRef(createExpenseVars);
// Variables can be defined inline as well.
const ref = createExpenseRef({ financialProfileId: ..., expenseCategoryId: ..., amount: ..., date: ..., description: ..., isRecurring: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createExpenseRef(dataConnect, createExpenseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.expense_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.expense_insert);
});
```

