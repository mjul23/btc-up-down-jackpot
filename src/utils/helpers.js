import { ethers } from 'ethers'

export const Utils = {
  /**
   * Formater une adresse courte
   */
  formatAddress: (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  },

  /**
   * Formater un montant en devise
   */
  formatCurrency: (amount, currency = 'USDC') => {
    if (!amount && amount !== 0) return '0.00'
    
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
    
    return `${formatted} ${currency}`
  },

  /**
   * Formater un prix
   */
  formatPrice: (price) => {
    if (!price) return '0.00'
    
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
    
    return `$${formatted}`
  },

  /**
   * Formater un pourcentage
   */
  formatPercentage: (value) => {
    if (!value && value !== 0) return '0%'
    
    return `${value.toFixed(2)}%`
  },

  /**
   * Formater une date
   */
  formatDate: (date, options = {}) => {
    if (!date) return ''
    
    const dateObj = new Date(date)
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    
    const mergedOptions = { ...defaultOptions, ...options }
    return dateObj.toLocaleDateString('fr-FR', mergedOptions)
  },

  /**
   * Formater une durée
   */
  formatDuration: (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}j ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  },

  /**
   * Valider une adresse Ethereum
   */
  isValidAddress: (address) => {
    if (!address) return false
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  },

  /**
   * Valider un montant
   */
  isValidAmount: (amount) => {
    if (!amount && amount !== 0) return false
    const num = parseFloat(amount)
    return !isNaN(num) && num > 0
  },

  /**
   * Calculer le taux de réussite
   */
  calculateWinRate: (wins, total) => {
    if (total === 0) return 0
    return ((wins / total) * 100).toFixed(2)
  },

  /**
   * Calculer le profit/perte net
   */
  calculateNetProfit: (winnings, bets) => {
    return winnings - bets
  },

  /**
   * Formater un nombre avec séparateurs de milliers
   */
  formatNumber: (number, options = {}) => {
    const defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
    
    const mergedOptions = { ...defaultOptions, ...options }
    return new Intl.NumberFormat('fr-FR', mergedOptions).format(number)
  },

  /**
   * Générer un ID unique
   */
  generateId: () => {
    return Math.random().toString(36).substr(2, 9)
  },

  /**
   * Vérifier si une date est dans le passé
   */
  isPast: (date) => {
    return new Date(date) < new Date()
  },

  /**
   * Vérifier si une date est dans le futur
   */
  isFuture: (date) => {
    return new Date(date) > new Date()
  },

  /**
   * Calculer la différence entre deux dates
   */
  dateDiff: (date1, date2) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return Math.abs(d1 - d2)
  },

  /**
   * Convertir des WEI en ETH
   */
  weiToEth: (wei) => {
    return parseFloat(ethers.utils.formatEther(wei))
  },

  /**
   * Convertir des ETH en WEI
   */
  ethToWei: (eth) => {
    return ethers.utils.parseEther(eth.toString())
  },

  /**
   * Tronquer une chaîne de caractères
   */
  truncate: (str, maxLength = 50) => {
    if (!str) return ''
    if (str.length <= maxLength) return str
    return str.substr(0, maxLength) + '...'
  },

  /**
   * Capitaliser la première lettre
   */
  capitalize: (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  /**
   * Obtenir l'icône correspondant au type de pari
   */
  getBetIcon: (type) => {
    switch (type) {
      case 'UP': return '📈'
      case 'DOWN': return '📉'
      case 'WIN': return '🎉'
      case 'LOSE': return '😔'
      default: return '🎲'
    }
  },

  /**
   * Obtenir la couleur correspondant au type de pari
   */
  getBetColor: (type) => {
    switch (type) {
      case 'UP': return 'text-green-500'
      case 'DOWN': return 'text-red-500'
      case 'WIN': return 'text-green-500'
      case 'LOSE': return 'text-red-500'
      default: return 'text-gray-500'
    }
  },

  /**
   * Obtenir le label correspondant au type de pari
   */
  getBetLabel: (type) => {
    switch (type) {
      case 'UP': return 'Hausse'
      case 'DOWN': return 'Baisse'
      case 'WIN': return 'Gagné'
      case 'LOSE': return 'Perdu'
      default: return type
    }
  },

  /**
   * Valider un email
   */
  isValidEmail: (email) => {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Valider un numéro de téléphone
   */
  isValidPhone: (phone) => {
    if (!phone) return false
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  /**
   * Générer une couleur aléatoire
   */
  randomColor: () => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  },

  /**
   * Mettre en cache une valeur
   */
  setCache: (key, value, ttl = 3600000) => {
    const now = new Date()
    const item = {
      value: value,
      expiry: now.getTime() + ttl
    }
    localStorage.setItem(key, JSON.stringify(item))
  },

  /**
   * Récupérer une valeur du cache
   */
  getCache: (key) => {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null
    
    const item = JSON.parse(itemStr)
    const now = new Date()
    
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    
    return item.value
  },

  /**
   * Supprimer une valeur du cache
   */
  removeCache: (key) => {
    localStorage.removeItem(key)
  },

  /**
   * Vider le cache
   */
  clearCache: () => {
    localStorage.clear()
  }
}