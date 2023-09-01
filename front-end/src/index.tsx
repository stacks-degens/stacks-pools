import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../src/redux/store';
import Authenticate from './components/Authenticate';

import 'stream-browserify';
import AppThemeLoader from './components/AppThemeLoader';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        <AppThemeLoader>
          <Authenticate />
        </AppThemeLoader>
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);
