// Polyfill Buffer for Coinbase Wallet SDK
window.Buffer = window.Buffer || require('buffer').Buffer;
window.process = window.process || { env: {} };
