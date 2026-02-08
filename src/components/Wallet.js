import React, { useState, useEffect } from 'react'
import coinbaseWallet from '../services/coinbase'
import { supabase } from '../services/supabase'
import { Utils, MESSAGES } from '../utils/constants'

const Wallet = () => {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    checkWalletConnection()
    checkUserSession()
  }, [])

  const checkWalletConnection = async () => {
    try {
      const isConnected = await coinbaseWallet.isConnected
      if (isConnected) {
        setWallet(coinbaseWallet)
        await fetchBalance()
        await fetchTransactions()
      }
    } catch (error) {
      console.error('Erreur vérification wallet:', error)
    }
  }

  const checkUserSession = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
    }
  }

  const fetchBalance = async () => {
    try {
      if (wallet && wallet.isConnected) {
        const balance = await wallet.getBalance()
        setBalance(balance)
      }
    } catch (error) {
      console.error('Erreur récupération balance:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      if (user) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10)

        if (error) throw error
        setTransactions(data || [])
      }
    } catch (error) {
      console.error('Erreur récupération transactions:', error)
    }
  }

  const connectWallet = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await coinbaseWallet.connect()
      if (result.success) {
        setWallet(coinbaseWallet)
        await fetchBalance()
        await fetchTransactions()
        setSuccess('Wallet connecté avec succès !')
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Erreur connexion wallet:', error)
      setError(MESSAGES.NETWORK_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await coinbaseWallet.disconnect()
      setWallet(null)
      setBalance(0)
      setTransactions([])
      setSuccess('Wallet déconnecté avec succès !')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      setError('Erreur lors de la déconnexion')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionType = (type) => {
    switch (type) {
      case 'bet': return 'Pari'
      case 'win': return 'Gain'
      case 'deposit': return 'Dépôt'
      case 'withdrawal': return 'Retrait'
      default: return type
    }
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'bet': return '🎯'
      case 'win': return '🎉'
      case 'deposit': return '💰'
      case 'withdrawal': return '📤'
      default: return '📝'
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'win': return 'text-green-500'
      case 'deposit': return 'text-blue-500'
      case 'withdrawal': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-8">
      {/* Section wallet */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            🔗 Votre Wallet
          </h2>
          <p className="text-gray-300">
            Gérez votre connexion Coinbase Wallet
          </p>
        </div>

        {wallet ? (
          <div className="space-y-6">
            {/* Wallet connecté */}
            <div className="bg-black/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xl font-bold text-white">
                    {formatAddress(wallet.address)}
                  </div>
                  <div className="text-sm text-gray-300">
                    Connecté avec succès
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {Utils.formatCurrency(balance)} ETH
                  </div>
                  <div className="text-sm text-gray-300">
                    Solde actuel
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={disconnectWallet}
                  disabled={loading}
                  className="btn bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                >
                  {loading ? <div className="loading" /> : 'Déconnexion'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-white mb-4">
              Wallet non connecté
            </h3>
            <p className="text-gray-300 mb-6">
              Connectez votre Coinbase Wallet pour accéder à toutes les fonctionnalités
            </p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
            >
              {loading ? <div className="loading mx-auto" /> : 'Connecter le Wallet'}
            </button>
          </div>
        )}
      </div>

      {/* Transactions */}
      {wallet && transactions.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-6">
            📊 Historique des transactions
          </h3>
          
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl ${getTransactionColor(tx.type)}`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div>
                    <div className="text-white font-medium">
                      {getTransactionType(tx.type)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTimestamp(tx.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-medium ${
                    tx.type === 'win' || tx.type === 'deposit' 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {tx.type === 'win' || tx.type === 'deposit' ? '+' : '-'}
                    {Utils.formatCurrency(Math.abs(tx.amount))}
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.description || 'Transaction'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-900 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-white mb-6">
          📖 Comment utiliser le wallet
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900/30 rounded-lg p-6">
            <h4 className="text-lg font-bold text-blue-400 mb-3">
              🚀 Pour commencer
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Téléchargez Coinbase Wallet</li>
              <li>• Créez votre wallet</li>
              <li>• Sauvegardez votre phrase de récupération</li>
              <li>• Connectez-le à l'application</li>
            </ul>
          </div>
          
          <div className="bg-green-900/30 rounded-lg p-6">
            <h4 className="text-lg font-bold text-green-400 mb-3">
              💡 Conseils de sécurité
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Ne partagez jamais votre phrase de récupération</li>
              <li>• Vérifiez toujours les adresses</li>
              <li>• Utilisez la 2FA si disponible</li>
              <li>• Gardez votre wallet mis à jour</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-700">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-400 text-2xl">⚠️</div>
            <div>
              <h4 className="text-lg font-bold text-yellow-400 mb-2">
                Important
              </h4>
              <p className="text-sm text-gray-300">
                Votre wallet vous permet de parier et de recevoir vos gains. 
                Les fonds restent sous votre contrôle à tout moment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="text-red-400 font-medium">
            ⚠️ {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <div className="text-green-400 font-medium">
            ✅ {success}
          </div>
        </div>
      )}
    </div>
  )
}

export default Wallet