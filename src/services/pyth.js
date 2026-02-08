import { coinbaseWallet } from './coinbase'

class PythService {
  constructor() {
    this.pyth = null
    this.btcPriceFeedId = '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'
    this.price = null
    this.lastUpdate = null
  }

  async initialize() {
    try {
      // Pour l'instant, on utilise une simulation
      // En production, intégrer Pyth Network SDK
      console.log('Pyth Service initialisé')
      return true
    } catch (error) {
      console.error('Erreur initialisation Pyth:', error)
      return false
    }
  }

  async getBtcPrice() {
    try {
      // Simulation - en production utiliser Pyth Network
      const mockPrice = await this.getMockBtcPrice()
      this.price = mockPrice
      this.lastUpdate = new Date()
      return mockPrice
    } catch (error) {
      console.error('Erreur récupération prix BTC:', error)
      throw error
    }
  }

  async getMockBtcPrice() {
    // Simuler un prix BTC avec de la volatilité
    const basePrice = 69242
    const volatility = 0.02 // 2% de volatilité
    const randomChange = (Math.random() - 0.5) * volatility
    const newPrice = basePrice * (1 + randomChange)
    
    return Math.round(newPrice * 100) / 100
  }

  async comparePrices(initialPrice, currentPrice) {
    const threshold = 0.01 // 1% de seuil
    
    const change = ((currentPrice - initialPrice) / initialPrice) * 100
    
    if (Math.abs(change) < threshold) {
      return 'flat'
    } else if (change > 0) {
      return 'up'
    } else {
      return 'down'
    }
  }

  async getHistoricalPrices(hours = 24) {
    // Simuler des prix historiques
    const prices = []
    const now = Date.now()
    const interval = hours * 60 * 60 * 1000 / 24 // 24 intervalles
    
    for (let i = 0; i < 24; i++) {
      const timestamp = now - (23 - i) * interval
      const mockPrice = await this.getMockBtcPrice()
      prices.push({
        timestamp: new Date(timestamp),
        price: mockPrice
      })
    }
    
    return prices
  }

  // Méthode pour vérifier les prix avec Pyth Network (en production)
  async getPythBtcPrice() {
    try {
      if (!coinbaseWallet.isConnected) {
        throw new Error('Wallet non connecté')
      }

      // Ici intégrer le vrai Pyth Network SDK
      // Pour l'instant, on retourne le mock price
      return await this.getMockBtcPrice()
    } catch (error) {
      console.error('Erreur Pyth price:', error)
      throw error
    }
  }

  // Formater le prix pour l'affichage
  formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  // Calculer le changement en pourcentage
  calculateChange(initialPrice, currentPrice) {
    const change = ((currentPrice - initialPrice) / initialPrice) * 100
    return change.toFixed(2)
  }
}

export const pythService = new PythService()
export default pythService