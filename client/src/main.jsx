import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/context/AuthContext';
import { CartProvider } from './components/context/CartContext';
import './styles.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><AuthProvider><CartProvider><App/></CartProvider></AuthProvider></React.StrictMode>);
