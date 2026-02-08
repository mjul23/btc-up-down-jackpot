import { supabase } from './supabase'

class CoinbaseWallet {
  constructor() {
    this.provider = null
    this.isConnected = false
    this.address = null
  }

  async connect() {
    try {
      // Import dynamique pour éviter les problèmes côté serveur
      const { CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk')
      
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'BTC Up/Down Jackpot',
        appLogoUrl: 'https://example.com/logo.png',
        darkMode: true
      })

      this.provider = coinbaseWallet.makeWeb3Provider(
        'https://base-mainnet.blockpi.network/v1/rpc/public', // Base RPC
        {
          chainId: '0x2105', // Base chain ID
          rpcUrl: 'https://base-mainnet.blockpi.network/v1/rpc/public'
        }
      )

      // Demander l'autorisation de connexion
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      })

      this.address = accounts[0]
      this.isConnected = true

      // Écouter les changements de compte
      this.provider.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect()
        } else {
          this.address = accounts[0]
        }
      })

      return { success: true, address: this.address }
    } catch (error) {
      console.error('Erreur connexion Coinbase Wallet:', error)
      return { success: false, error: error.message }
    }
  }

  async disconnect() {
    try {
      this.provider = null
      this.isConnected = false
      this.address = null
      return { success: true }
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      return { success: false, error: error.message }
    }
  }

  async getBalance() {
    if (!this.isConnected || !this.address) {
      throw new Error('Wallet non connecté')
    }

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [this.address, 'latest']
      })

      // Convertir de Wei à ETH
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18)
      return balanceInEth
    } catch (error) {
      console.error('Erreur récupération balance:', error)
      throw error
    }
  }

  async signMessage(message) {
    if (!this.isConnected || !this.address) {
      throw new Error('Wallet non connecté')
    }

    try {
      const signature = await this.provider.request({
        method: 'personal_sign',
        params: [message, this.address]
      })

      return signature
    } catch (error) {
      console.error('Erreur signature message:', error)
      throw error
    }
  }

  async sendTransaction(transaction) {
    if (!this.isConnected || !this.address) {
      throw new Error('Wallet non connecté')
    }

    try {
      const result = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      })

      return result
    } catch (error) {
      console.error('Erreur envoi transaction:', error)
      throw error
    }
  }

  // Méthode utilitaire pour formater les adresses
  formatAddress(address) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Vérifier si on est dans Base App
  isInBaseApp() {
    return window.location.hostname === 'app.base.org' || 
           window.location.hostname === 'join.base.org'
  }
}

export const coinbaseWallet = new CoinbaseWallet()
export default coinbaseWallet