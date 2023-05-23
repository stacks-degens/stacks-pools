import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, persistor } from '../src/redux/store';
import Authenticate from './components/Authenticate';
import { PersistGate } from 'redux-persist/integration/react';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Provider store={store}>
    {/* PersistGate is a component you want to inject in between your
    Redux Provider and your main component (App) */}
    <BrowserRouter>
      <React.StrictMode>
        <PersistGate persistor={persistor}>
          <Authenticate />
        </PersistGate>
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);
