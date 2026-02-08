import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { Utils, MESSAGES } from '../utils/constants'

const Historique = ({ userId, refreshData }) => {
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  useEffect(() => {
    if (userId) {
      fetchHistorique()
      fetchStats()
    }
  }, [userId, selectedPeriod])

  const fetchHistorique = async () => {
    try {
      setLoading(true)
      setError('')

      let query = supabase
        .from('paris')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      // Filtrer par période
      const now = new Date()
      switch (selectedPeriod) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          query = query.gte('timestamp', today.toISOString())
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          query = query.gte('timestamp', weekAgo.toISOString())
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          query = query.gte('timestamp', monthAgo.toISOString())
          break
      }

      const { data, error } = await query

      if (error) throw error
      setHistorique(data || [])
    } catch (error) {
      console.error('Erreur récupération historique:', error)
      setError('Impossible de charger l\'historique')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Erreur récupération stats:', error)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  }

  const calculateWinRate = () => {
    if (!stats || stats.paris_total === 0) return 0
    return ((stats.paris_gagnes / stats.paris_total) * 100).toFixed(2)
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return "Aujourd'hui"
      case 'week': return 'Cette semaine'
      case 'month': return 'Ce mois'
      default: return 'Tous les temps'
    }
  }

  const getBetResult = (pari) => {
    return pari.gagne ? 'gagné' : 'perdu'
  }

  const getBetIcon = (pari) => {
    return pari.choix ? '📈' : '📉'
  }

  const getBetColor = (pari) => {
    return pari.gagne ? 'text-green-500' : 'text-red-500'
  }

  const totalMise = historique.reduce((sum, pari) => sum + pari.mise, 0)
  const totalGagne = historique.reduce((sum, pari) => pari.gagne ? sum + pari.mise * 0.8 : sum, 0)
  const netProfit = totalGagne - totalMise

  if (!userId) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Connectez-vous pour voir votre historique
        </h2>
        <p className="text-gray-400">
          Vous devez être connecté avec votre wallet pour accéder à votre historique de paris
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Statistiques globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {stats.paris_total}
            </div>
            <div className="text-sm text-gray-300">
              Paris totaux
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {stats.paris_gagnes}
            </div>
            <div className="text-sm text-gray-300">
              Paris gagnés
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {calculateWinRate()}%
            </div>
            <div className="text-sm text-gray-300">
              Taux de réussite
            </div>
          </div>
          
          <div className={`bg-gradient-to-br ${
            netProfit >= 0 
              ? 'from-green-900 to-emerald-900' 
              : 'from-red-900 to-pink-900'
          } rounded-lg p-6 text-center`}>
            <div className={`text-3xl font-bold mb-2 ${
              netProfit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {Utils.formatCurrency(netProfit)}
            </div>
            <div className="text-sm text-gray-300">
              Profit net
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white">
            📊 Historique des paris
          </h3>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Période:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input bg-gray-800 text-white"
            >
              <option value="all">Tous les temps</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Affichage: {getPeriodLabel()}
        </div>
      </div>

      {/* Liste des paris */}
      <div className="bg-gray-900 rounded-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="loading mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de l'historique...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-white mb-4">
              Erreur
            </h2>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : historique.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-white mb-4">
              Aucun pari trouvé
            </h2>
            <p className="text-gray-400">
              Vous n'avez pas encore effectué de pari
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historique.map((pari, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl ${pari.gagne ? 'text-green-500' : 'text-red-500'}`}>
                    {getBetIcon(pari)}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${pari.choix ? 'text-green-400' : 'text-red-400'}`}>
                        {pari.choix ? 'UP' : 'DOWN'}
                      </span>
                      <span className={`text-sm ${pari.gagne ? 'text-green-400' : 'text-red-400'}`}>
                        ({getBetResult(pari)})
                      </span>
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
                  <div className={`text-sm ${
                    pari.gagne 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {pari.gagne 
                      ? `+${Utils.formatCurrency(pari.mise * 0.8)}` 
                      : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Résumé financier */}
      {historique.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            📈 Résumé financier
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-2">
                {Utils.formatCurrency(totalMise)}
              </div>
              <div className="text-sm text-gray-300">
                Total misé
              </div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {Utils.formatCurrency(totalGagne)}
              </div>
              <div className="text-sm text-gray-300">
                Total gagné
              </div>
            </div>
            
            <div className={`bg-black/30 rounded-lg p-4 ${
              netProfit >= 0 ? '' : 'bg-red-900/30'
            }`}>
              <div className={`text-2xl font-bold mb-2 ${
                netProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {Utils.formatCurrency(netProfit)}
              </div>
              <div className="text-sm text-gray-300">
                Profit net
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Historique