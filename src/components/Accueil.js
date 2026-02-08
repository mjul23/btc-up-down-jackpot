import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { pythService } from '../services/pyth'
import { Utils, COLORS, MESSAGES } from '../utils/constants'

const Accueil = ({ btcPrice, jackpot, timeRemaining, userStats }) => {
  const [historicalPrices, setHistoricalPrices] = useState([])
  const [trend, setTrend] = useState('')
  const [loading, setLoading] = useState(true)
  const [recentParis, setRecentParis] = useState([])

  useEffect(() => {
    fetchHistoricalData()
    fetchRecentParis()
  }, [])

  const fetchHistoricalData = async () => {
    try {
      const prices = await pythService.getHistoricalPrices(24)
      setHistoricalPrices(prices)
      
      // Analyser la tendance
      const lastPrice = prices[prices.length - 1]?.price || btcPrice
      const firstPrice = prices[0]?.price || btcPrice
      const change = ((lastPrice - firstPrice) / firstPrice) * 100
      
      if (Math.abs(change) < 0.5) {
        setTrend('stable')
      } else if (change > 0) {
        setTrend('up')
      } else {
        setTrend('down')
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Erreur données historiques:', error)
      setLoading(false)
    }
  }

  const fetchRecentParis = async () => {
    try {
      const { data, error } = await supabase
        .from('paris')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentParis(data)
    } catch (error) {
      console.error('Erreur récupération paris:', error)
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'stable': return '➡️'
      default: return '❓'
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500'
      case 'down': return 'text-red-500'
      case 'stable': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      {/* Section principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Carte de prix et pari */}
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Prix du Bitcoin
            </h2>
            <div className="text-5xl font-bold mb-4">
              {Utils.formatCurrency(btcPrice)}
            </div>
            <div className={`text-xl font-semibold ${getTrendColor()}`}>
              {getTrendIcon()} {trend === 'stable' ? 'Stable' : trend === 'up' ? 'Haussier' : 'Baissier'}
            </div>
          </div>

          {/* Graphique simple */}
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="h-32 flex items-end justify-between space-x-1">
              {historicalPrices.slice(-12).map((price, index) => {
                const maxPrice = Math.max(...historicalPrices.map(p => p.price))
                const minPrice = Math.min(...historicalPrices.map(p => p.price))
                const height = ((price.price - minPrice) / (maxPrice - minPrice)) * 100
                
                return (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className="text-lg text-gray-300 mb-2">
              Prochain pari dans
            </div>
            <div className="text-2xl font-bold text-white">
              {timeRemaining.expired ? 'Temps écoulé !' : 
               `${timeRemaining.hours || 0}h ${timeRemaining.minutes || 0}m`}
            </div>
          </div>
        </div>

        {/* Carte du jackpot */}
        <div className="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-lg p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              💰 Jackpot Progressif
            </h2>
            <div className="text-5xl font-bold text-yellow-400 mb-4">
              {Utils.formatCurrency(jackpot)}
            </div>
            <div className="text-lg text-gray-300">
              Jackpot cumulé
            </div>
          </div>

          {/* Progression du jackpot */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Progression</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            {/* Conditions de gain */}
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <h3 className="text-white font-semibold mb-2">
                Comment gagner le jackpot ?
              </h3>
              <p className="text-gray-300 text-sm">
                Si le prix BTC reste stable (flat) à 20h UTC, 
                le jackpot est reporté au lendemain et grossit !
              </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">1,234</div>
                <div className="text-xs text-gray-300">Joueurs aujourd'hui</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">85%</div>
                <div className="text-xs text-gray-300">Taux d'engagement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats utilisateur */}
      {userStats && (
        <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            🎯 Vos Statistiques
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {userStats.paris_total}
              </div>
              <div className="text-sm text-gray-300">Paris totaux</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {userStats.paris_gagnes}
              </div>
              <div className="text-sm text-gray-300">Paris gagnés</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {Utils.calculateWinRate(userStats.paris_gagnes, userStats.paris_total)}%
              </div>
              <div className="text-sm text-gray-300">Taux de réussite</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Utils.formatCurrency(userStats.total_gagne)}
              </div>
              <div className="text-sm text-gray-300">Total gagné</div>
            </div>
          </div>
        </div>
      )}

      {/* Derniers paris */}
      <div className="bg-gray-900 rounded-lg p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6">
          📊 Derniers Paris
        </h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="loading mx-auto mb-4"></div>
            <p className="text-gray-300">Chargement des paris...</p>
          </div>
        ) : recentParis.length > 0 ? (
          <div className="space-y-3">
            {recentParis.map((pari, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl ${pari.choix ? 'text-green-500' : 'text-red-500'}`}>
                    {pari.choix ? '📈' : '📉'}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {pari.choix ? 'UP' : 'DOWN'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTimestamp(pari.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {Utils.formatCurrency(pari.mise)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {pari.gagne ? '✅ Gagné' : '❌ Perdu'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Aucun pari récent
          </div>
        )}
      </div>
    </div>
  )
}

export default Accueil