import { ethers } from 'ethers';

// Version avec MetaMask / Rabby / tout wallet EIP-1193
const coinbaseWallet = {
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  
  async connect() {
    try {
      if (window.ethereum) {
        console.log('MetaMask détecté');
        
        // Demande l'autorisation des comptes
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Crée le provider et signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        this.isConnected = true;
        this.address = address;
        this.provider = provider;
        this.signer = signer;
        
        console.log('Connecté avec MetaMask:', address);
        return { success: true, address };
      } else {
        console.log('MetaMask non trouvé');
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
    console.log('Déconnecté');
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
