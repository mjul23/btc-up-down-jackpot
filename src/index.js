import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import App from './components/App';
import './polyfill'; // Import le polyfill

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
