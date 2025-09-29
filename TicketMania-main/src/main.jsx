import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';

import { AuthProvider } from './context/AuthContext.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found! Check your index.html file.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* ✅ AuthProvider wraps the entire app so all components can access useAuth() */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
