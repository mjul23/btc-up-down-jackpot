// Modifie temporairement pour le test
const coinbaseWallet = {
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  
  async connect() {
    try {
      // Version de test - simulation
      console.log('Mode test activé');
      
      // Simule une connexion réussie
      setTimeout(() => {
        this.isConnected = true;
        this.address = '0x1234abcd5678efghijklmnopqrstuvwxyz';
        console.log('Connecté (test):', this.address);
      }, 1000);
      
      return { success: true, address: '0x1234abcd5678efghijklmnopqrstuvwxyz' };
    } catch (error) {
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
    return 1.234; // Balance de test
  }
};
