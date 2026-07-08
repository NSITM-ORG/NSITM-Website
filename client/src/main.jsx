/**
 * Application Entry Point
 *
 * Mounts the React tree to #root. Wraps the app in:
 *   1. StrictMode — surfaces potential React 19 issues early in dev
 *   2. Redux <Provider> — makes the store available to useManageState()
 *      everywhere in the tree (store built in Batch F2)
 *
 * The Router itself is NOT set up here — it lives in App.jsx so that
 * App.jsx remains the single place that composes Provider + Router +
 * global overlays (ToastContainer, LogoutModal, Preloader), keeping
 * main.jsx a pure bootstrap file with no business logic.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { store } from './store/store';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Provider store={store}> */}
      <App />
    {/* </Provider> */}
  </StrictMode>
);