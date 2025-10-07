import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store/index.jsx';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './queryClient.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
