import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import { MYRoutes } from './router';
import './index.scss';
import './reset.scss';
import { store, selectGlobal } from './store';
import { Provider } from 'react-redux';
import ModalsWrapper from './layouts/ModalsWrapper';

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);
import { QueryClient, QueryClientProvider } from 'react-query';
import ContextProvider from './store/context';
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <ContextProvider >
          <QueryClientProvider client={queryClient}>
            <ModalsWrapper>
              <MYRoutes />
            </ModalsWrapper>
          </QueryClientProvider>
        </ContextProvider>
      </HashRouter>
    </Provider>
  </React.StrictMode>,
);
