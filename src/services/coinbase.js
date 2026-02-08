// Dans src/services/coinbase.js
import Web3 from 'web3';

const coinbaseWallet = {
  isConnected: false,
  address: null,
  
  async connect() {
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        
        this.isConnected = true;
        this.address = accounts[0];
        
        return { success: true, address: accounts[0] };
      } else {
        return { success: false, error: 'MetaMask non installé' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  async disconnect() {
    this.isConnected = false;
    this.address = null;
  },
  
  async getBalance() {
    if (!this.isConnected || !window.ethereum) return 0;
    try {
      const web3 = new Web3(window.ethereum);
      const balance = await web3.eth.getBalance(this.address);
      return parseFloat(web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      return 0;
    }
  }
