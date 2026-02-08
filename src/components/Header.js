import React, { useState, useEffect } from 'react'
import coinbaseWallet from '../services/coinbase'
import { supabase } from '../services/supabase'
import { APP_STATES, MESSAGES, COLORS } from '../utils/constants'

const Header = () => {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    checkWalletConnection()
    checkUserSession()
  }, [])

  const checkWalletConnection = async () => {
    try {
      const isConnected = await coinbaseWallet.isConnected
      if (isConnected) {
        setWalletConnected(true)
        setWalletAddress(coinbaseWallet.address)
      }
    } catch (error) {
      console.error('Erreur vérification wallet:', error)
    }
  }

  const checkUserSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    } catch (error) {
      console.error('Erreur session utilisateur:', error)
    }
  }

  const connectWallet = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await coinbaseWallet.connect()
      if (result.success) {
        setWalletConnected(true)
        setWalletAddress(result.address)
        await createUser(result.address)
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
    
    try {
      await coinbaseWallet.disconnect()
      setWalletConnected(false)
      setWalletAddress('')
      setUser(null)
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (address) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          address: address,
          total_gagne: 0,
          total_mise: 0,
          paris_gagnes: 0,
          paris_total: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error && error.code !== '23505') {
        console.error('Erreur création utilisateur:', error)
      }
    } catch (error) {
      console.error('Erreur création utilisateur:', error)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    const addr = address.toString()
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
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
                  className="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  {loading ? <div className="loading" /> : 'Déconnexion'}
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                {loading ? (
                  <div className="loading" />
                ) : (
                  <>
                    <span>Connecter Wallet</span>
                    <span>🔗</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                Accueil
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                Pari
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                Historique
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                Classement
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                À Propos
              </a>
            </li>
          </ul>
        </nav>
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
