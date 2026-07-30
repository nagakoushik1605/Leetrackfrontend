import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { UsernameProvider } from './hooks/useUsernameContext';
import { AuthProvider } from './hooks/useAuthContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UsernameProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UsernameProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
