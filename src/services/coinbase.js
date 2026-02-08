import { ethers } from 'ethers';

// Polyfill pour Buffer
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || require('buffer').Buffer;
  window.process = window.process || { env: {} };
}

const coinbaseWallet = {
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  
  async connect() {
    try {
      if (window.ethereum) {
        // Utilise Web3Provider directement
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        this.isConnected = true;
        this.address = address;
        this.provider = provider;
        this.signer = signer;
        
        console.log('Connecté avec MetaMask:', address);
        return { success: true, address };
      } else {
        console.log('Aucun wallet détecté');
        return { success: false, error: 'MetaMask non installé' };
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: error.message };
    }
  },
  
  async disconnect() {
    this.isConnected = false;
    this.address = null;
    this.provider = null;
    this.signer = null;
  },
  
  async getBalance() {
    if (!this.isConnected || !this.signer) return 0;
    try {
      const balance = await this.signer.getBalance();
      return parseFloat(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Erreur balance:', error);
      return 0;
    }
  }
};

export default coinbaseWallet;
