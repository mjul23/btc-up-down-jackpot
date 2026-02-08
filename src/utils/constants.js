export const APP_STATES = {
  LOADING: 'loading',
  CONNECTING: 'connecting',
  READY: 'ready',
  BETTING: 'betting',
  RESULT: 'result',
  ERROR: 'error'
}

export const BET_TYPES = {
  UP: 'UP',
  DOWN: 'DOWN'
}

export const BET_STATES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  WON: 'won',
  LOST: 'lost'
}

export const COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#06b6d4',
  DARK: '#0f172a',
  LIGHT: '#f1f5f9'
}

export const MESSAGES = {
  NETWORK_ERROR: 'Erreur réseau. Veuillez réessayer.',
  WALLET_ERROR: 'Erreur de connexion wallet.',
  BET_SUCCESS: 'Pari placé avec succès !',
  BET_ERROR: 'Erreur lors du placement du pari.',
  RESULT_SUCCESS: 'Résultat traité avec succès !',
  RESULT_ERROR: 'Erreur lors du traitement du résultat.',
  DISCONNECT_SUCCESS: 'Wallet déconnecté.',
  CONNECT_SUCCESS: 'Wallet connecté.',
  INSUFFICIENT_FUNDS: 'Fonds insuffisants.',
  INVALID_ADDRESS: 'Adresse invalide.',
  ALREADY_BET: 'Vous avez déjà parié aujourd\'hui.',
  BETTING_CLOSED: 'La période de pari est fermée.',
  BETTING_OPEN: 'Paris ouverts !',
  JACKPOT_ROLLOVER: 'Jackpot reporté au prochain jour !',
  PRICE_UPDATE: 'Prix BTC mis à jour.',
  USER_CREATED: 'Utilisateur créé.',
  USER_UPDATED: 'Utilisateur mis à jour.',
  USER_NOT_FOUND: 'Utilisateur non trouvé.',
  BET_NOT_FOUND: 'Pari non trouvé.',
  TRANSACTION_SUCCESS: 'Transaction réussie.',
  TRANSACTION_ERROR: 'Erreur de transaction.',
  CONTRACT_ERROR: 'Erreur de contrat.',
  GAS_ERROR: 'Erreur de gaz.',
  UNKNOWN_ERROR: 'Erreur inconnue.',
  LOADING: 'Chargement...',
  SUCCESS: 'Succès !',
  ERROR: 'Erreur !',
  WARNING: 'Attention !',
  INFO: 'Information.'
}

export const API_ENDPOINTS = {
  SUPABASE: {
    URL: process.env.REACT_APP_SUPABASE_URL,
    ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY
  },
  BASESCAN: {
    BASE: 'https://basescan.org',
    SEPOLIA: 'https://sepolia.basescan.org'
  },
  COINBASE: {
    CONNECT: 'https://www.coinbase.com/connect-wallet',
    DISCONNECT: 'https://www.coinbase.com/disconnect'
  }
}

export const BET_AMOUNT = 0.1 // 0.10 USDC
export const COMMISSION_RATE = 0.2 // 20%
export const WINNER_SHARE = 0.8 // 80%
export const BETTING_INTERVAL = 24 * 60 * 60 * 1000 // 24h en ms
export const BLOCKING_TIME = 1 * 60 * 60 * 1000 // 1h avant fin
export const FLAT_THRESHOLD = 0.01 // 1%

export const PRICE_PROVIDERS = {
  PYTH: 'pyth',
  COINBASE: 'coinbase',
  BINANCE: 'binance'
}

export const WALLET_PROVIDERS = {
  COINBASE: 'coinbase',
  METAMASK: 'metamask',
  WALLETCONNECT: 'walletconnect'
}