import React, { useState } from 'react'
import coinbaseWallet from '../services/coinbase'

const Header = () => {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const connectWallet = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Début connexion...')
      const result = await coinbaseWallet.connect()
      console.log('Résultat connexion:', result)
      
      if (result.success) {
        setWalletConnected(true)
        setWalletAddress(result.address)
        console.log('Wallet connecté:', result.address)
      } else {
        setError(result.error)
        console.error('Erreur connexion:', result.error)
      }
    } catch (error) {
      console.error('Erreur générale:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    setLoading(true)
    try {
      await coinbaseWallet.disconnect()
      setWalletConnected(false)
      setWalletAddress('')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
return (
    <header className="bg-gradient-to-r from-blue-900 to-purple-900 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-white">
              🚀 BTC Up/Down Jackpot
            </div>
            <div className="text-sm text-gray-300">
              Pari sur Bitcoin | Jackpot Progressif
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {walletConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {formatAddress(walletAddress)}
                  </div>
                  <div className="text-xs text-gray-300">
                    Connecté
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? '...' : 'Déconnexion'}
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Connecter Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Affiche les erreurs */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 m-4">
          <div className="text-red-400 font-medium">
            ⚠️ {error}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
