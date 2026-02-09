import { ethers } from 'ethers';

// Version avec MetaMask / Rabby / tout wallet EIP-1193
const coinbaseWallet = {
  isConnected: false,
  address: null,
  provider: null,

  async connect() {
    try {
      if (!window.ethereum) {
        throw new Error('Wallet non détecté');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.address = accounts[0];
      this.isConnected = true;
      this.provider = new ethers.providers.Web3Provider(window.ethereum);

      console.log('Connecté avec MetaMask:', this.address);
      return { success: true, address: this.address };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: error.message };
    }
  },

  async disconnect() {
    this.isConnected = false;
    this.address = null;
    this.provider = null;
    console.log('Wallet déconnecté');
  },

  async getBalance() {
    try {
      if (!this.provider || !this.address) {
        return 0;
      }

      const balance = await this.provider.getBalance(this.address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Erreur récupération balance:', error);
      return 0;
    }
  },

  async sendTransaction(to, amount) {
    try {
      if (!this.provider || !this.address) {
        throw new Error('Wallet non connecté');
      }

      const signer = this.provider.getSigner();
      const tx = await signer.sendTransaction({
        to: to,
        value: ethers.utils.parseEther(amount.toString()),
      });

      const receipt = await tx.wait();
      return { success: true, hash: receipt.transactionHash };
    } catch (error) {
      console.error('Erreur transaction:', error);
      return { success: false, error: error.message };
    }
  },

  async switchNetwork(chainId) {
    try {
      if (!window.ethereum) {
        throw new Error('Wallet non détecté');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur changement réseau:', error);
      return { success: false, error: error.message };
    }
  },
};

export { coinbaseWallet };
export default coinbaseWallet;
