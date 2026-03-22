import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { heIL } from '@clerk/localizations';
import { QueryClientProvider } from '@tanstack/react-query';
import './i18n/index';
import './index.css';
import { App } from './App';
import { queryClient } from './lib/queryClient';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

if (!DEMO_MODE && !PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set');
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '';

// createBrowserRouter (data router) is required for useBlocker to work.
// App.tsx's internal <Routes> still handles all route matching.
const router = createBrowserRouter([{ path: '*', element: <App /> }], { basename });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || 'demo'} localization={heIL}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);
