import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { coinbaseWallet } from '../services/coinbase'
import { pythService } from '../services/pyth'
import { Utils, COLORS, MESSAGES, BET_TYPES } from '../utils/constants'

const Pari = ({ btcPrice, jackpot, timeRemaining, refreshData }) => {
  const [selectedBet, setSelectedBet] = useState(null)
  const [betAmount, setBetAmount] = useState(0.1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)
  const [userBalance, setUserBalance] = useState(0)

  useEffect(() => {
    checkUser()
    checkBalance()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Erreur vérification utilisateur:', error)
    }
  }

  const checkBalance = async () => {
    try {
      if (coinbaseWallet.isConnected) {
        const balance = await coinbaseWallet.getBalance()
        setUserBalance(balance)
      }
    } catch (error) {
      console.error('Erreur récupération balance:', error)
    }
  }

  const handleBet = async (betType) => {
    if (!user) {
      setError('Veuillez vous connecter pour parier')
      return
    }

    if (timeRemaining.expired) {
      setError('Le temps pour parier est écoulé')
      return
    }

    if (betAmount < 0.1) {
      setError('Mise minimum: 0.10 USDC')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Récupérer le prix actuel comme prix de référence
      const currentPrice = await pythService.getBtcPrice()
      
      // Créer le pari
      const { data, error } = await supabase
        .from('paris')
        .insert([{
          user_id: user.id,
          choix: betType === BET_TYPES.UP,
          mise: betAmount,
          prix_reference: currentPrice,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Mettre à jour le jackpot
      const { data: jackpotData } = await supabase
        .from('jackpot')
        .select('amount')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const newJackpot = (jackpotData?.amount || 0) + betAmount
      
      await supabase
        .from('jackpot')
        .insert([{
          amount: newJackpot,
          timestamp: new Date().toISOString()
        }])

      // Mettre à jour les stats utilisateur
      await supabase
        .from('users')
        .update({
          total_mise: supabase.raw(`total_mise + ${betAmount}`),
          paris_total: supabase.raw('paris_total + 1')
        })
        .eq('id', user.id)

      setSuccess(`Pari ${betType === BET_TYPES.UP ? 'UP' : 'DOWN'} placé avec succès !`)
      setSelectedBet(null)
      refreshData()
      
      // Notification
      alert(`🎉 Pari ${betType === BET_TYPES.UP ? 'UP' : 'DOWN'} placé !\nMise: ${Utils.formatCurrency(betAmount)}\nJackpot: ${Utils.formatCurrency(newJackpot)}`)

    } catch (error) {
      console.error('Erreur pari:', error)
      setError(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  }

  const getBetColor = (betType) => {
    return betType === BET_TYPES.UP ? 'text-green-500' : 'text-red-500'
  }

  const getBetIcon = (betType) => {
    return betType === BET_TYPES.UP ? '📈' : '📉'
  }

  return (
    <div className="space-y-8">
      {/* Section de pari principal */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            🎯 Faites votre pari BTC
          </h2>
          <div className="text-xl text-gray-300 mb-2">
            Prix actuel: {Utils.formatCurrency(btcPrice)}
          </div>
          <div className="text-lg text-gray-400">
            {timeRemaining.expired ? 'Temps écoulé !' : 
             `Prochain pari dans ${timeRemaining.hours || 0}h ${timeRemaining.minutes || 0}m`}
          </div>
        </div>

        {/* Choix du pari */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => handleBet(BET_TYPES.UP)}
            disabled={loading || timeRemaining.expired}
            className={`p-8 rounded-lg border-2 transition-all ${
              selectedBet === BET_TYPES.UP
                ? 'border-green-500 bg-green-900/20'
                : 'border-gray-600 hover:border-green-500 hover:bg-green-900/10'
            } ${loading || timeRemaining.expired ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📈</div>
              <div className="text-2xl font-bold text-green-500 mb-2">
                BTC HAUSS (UP)
              </div>
              <div className="text-gray-300">
                Si BTC > prix actuel à 20h UTC
              </div>
            </div>
          </button>

          <button
            onClick={() => handleBet(BET_TYPES.DOWN)}
            disabled={loading || timeRemaining.expired}
            className={`p-8 rounded-lg border-2 transition-all ${
              selectedBet === BET_TYPES.DOWN
                ? 'border-red-500 bg-red-900/20'
                : 'border-gray-600 hover:border-red-500 hover:bg-red-900/10'
            } ${loading || timeRemaining.expired ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📉</div>
              <div className="text-2xl font-bold text-red-500 mb-2">
                BTC BAISSE (DOWN)
              </div>
              <div className="text-gray-300">
                Si BTC < prix actuel à 20h UTC
              </div>
            </div>
          </button>
        </div>

        {/* Montant du pari */}
        <div className="bg-black/30 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">
            💰 Montant du pari
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">
                Mise (USDC):
              </label>
              <input
                type="number"
                min="0.1"
                step="0.01"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0.1)}
                className="input flex-1"
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[0.1, 0.5, 1, 5, 10, 25].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className="btn bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded"
                  disabled={loading}
                >
                  {Utils.formatCurrency(amount)}
                </button>
              ))}
            </div>

            {/* Balance */}
            {user && (
              <div className="text-sm text-gray-300">
                Votre balance: {Utils.formatCurrency(userBalance)} ETH
              </div>
            )}
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-900/50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-yellow-400 mb-2">
              💎 Jackpot Progressif
            </h4>
            <div className="text-2xl font-bold text-white mb-2">
              {Utils.formatCurrency(jackpot)}
            </div>
            <div className="text-sm text-gray-300">
              En cas de flat, le jackpot est reporté !
            </div>
          </div>

          <div className="bg-green-900/50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-green-400 mb-2">
              🎯 Règles du jeu
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>• Mise minimale: 0.10 USDC</div>
              <div>• 1 pari par jour</div>
              <div>• 80% du pot aux gagnants</div>
              <div>• 20% de commission</div>
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

      {/* Connexion wallet */}
      {!user && (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            🔗 Connectez votre wallet
          </h3>
          <p className="text-gray-300 mb-6">
            Pour pouvoir parier, vous devez connecter votre Coinbase Wallet
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Connecter le wallet
          </button>
        </div>
      )}

      {/* Paris bloqués */}
      {timeRemaining.expired && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            ⏰ Temps écoulé
          </h3>
          <p className="text-gray-300 mb-4">
            Le prochain pari sera disponible à 20h00 UTC
          </p>
          <div className="text-4xl font-bold text-yellow-400">
            {timeRemaining.days || 0}j {timeRemaining.hours || 0}h
          </div>
        </div>
      )}
    </div>
  )
}

export default Pari