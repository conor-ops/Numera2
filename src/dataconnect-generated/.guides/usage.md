# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateFinancialProfile, useGetFinancialProfileByUser, useCreateExpense, useListExpensesByCategory } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateFinancialProfile(createFinancialProfileVars);

const { data, isPending, isSuccess, isError, error } = useGetFinancialProfileByUser(getFinancialProfileByUserVars);

const { data, isPending, isSuccess, isError, error } = useCreateExpense(createExpenseVars);

const { data, isPending, isSuccess, isError, error } = useListExpensesByCategory(listExpensesByCategoryVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createFinancialProfile, getFinancialProfileByUser, createExpense, listExpensesByCategory } from '@dataconnect/generated';


// Operation CreateFinancialProfile:  For variables, look at type CreateFinancialProfileVars in ../index.d.ts
const { data } = await CreateFinancialProfile(dataConnect, createFinancialProfileVars);

// Operation GetFinancialProfileByUser:  For variables, look at type GetFinancialProfileByUserVars in ../index.d.ts
const { data } = await GetFinancialProfileByUser(dataConnect, getFinancialProfileByUserVars);

// Operation CreateExpense:  For variables, look at type CreateExpenseVars in ../index.d.ts
const { data } = await CreateExpense(dataConnect, createExpenseVars);

// Operation ListExpensesByCategory:  For variables, look at type ListExpensesByCategoryVars in ../index.d.ts
const { data } = await ListExpensesByCategory(dataConnect, listExpensesByCategoryVars);


```