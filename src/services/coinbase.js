// Utilise cette version de test tout de suite
const coinbaseWallet = {
  isConnected: false,
  address: null,
  
  async connect() {
    // Simulation de connexion
    setTimeout(() => {
      this.isConnected = true;
      this.address = '0x1234abcd5678efghijklmnopqrstuvwxyz';
      console.log('Connecté (mode test):', this.address);
    }, 1000);
    
    return { success: true, address: '0x1234abcd5678efghijklmnopqrstuvwxyz' };
  },
  
  async disconnect() {
    this.isConnected = false;
    this.address = null;
  },
  
  async getBalance() {
    return 1.234; // Balance de test
  }
};
