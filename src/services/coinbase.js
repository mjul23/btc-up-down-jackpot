// Version ultra-simple de test
const coinbaseWallet = {
  isConnected: false,
  address: null,
  
  async connect() {
    console.log('Tentative de connexion...');
    
    try {
      // Simule une connexion réussie
      setTimeout(() => {
        this.isConnected = true;
        this.address = '0x1234abcd5678efghijklmnopqrstuvwxyz';
        console.log('Connecté avec succès:', this.address);
      }, 1000);
      
      return { success: true, address: '0x1234abcd5678efghijklmnopqrstuvwxyz' };
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  },
  
  async disconnect() {
    this.isConnected = false;
    this.address = null;
    console.log('Déconnecté');
  },
  
  async getBalance() {
    return 1.234; // Balance de test
  }
};

export default coinbaseWallet;
