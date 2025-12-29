import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< HEAD
<<<<<<<< HEAD:src/main.tsx
import '@/styles/index.css';
import App from '@/App';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
========
import App from './App';
>>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a:index.tsx
=======
import '@/styles/index.css';
import App from '@/App';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
<<<<<<< HEAD
    <App />
=======
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
  </React.StrictMode>
);