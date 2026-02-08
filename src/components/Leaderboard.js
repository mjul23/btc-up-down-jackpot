import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { Utils, COLORS } from '../utils/constants'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [globalStats, setGlobalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [userRank, setUserRank] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
    fetchGlobalStats()
    fetchUserRank()
  }, [selectedPeriod])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError('')

      let query = supabase
        .from('users')
        .select('id, address, total_gagne, total_mise, paris_gagnes, paris_total, created_at')
        .order('total_gagne', { ascending: false })

      // Filtrer par période
      const now = new Date()
      switch (selectedPeriod) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          query = query.gte('created_at', today.toISOString())
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          query = query.gte('created_at', weekAgo.toISOString())
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          query = query.gte('created_at', monthAgo.toISOString())
          break
      }

      query = query.limit(20)

      const { data, error } = await query

      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Erreur récupération classement:', error)
      setError('Impossible de charger le classement')
    } finally {
      setLoading(false)
    }
  }

  const fetchGlobalStats = async () => {
    try {
      const { data, error } = await supabase
        .from('global_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Si la table n'existe pas, on calcule les stats
        calculateGlobalStats()
        return
      }

      setGlobalStats(data)
    } catch (error) {
      console.error('Erreur récupération stats globales:', error)
      calculateGlobalStats()
    }
  }

  const calculateGlobalStats = async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')

      if (usersError) throw usersError

      const totalUsers = users.length
      const totalBets = users.reduce((sum, user) => sum + user.paris_total, 0)
      const totalWinnings = users.reduce((sum, user) => sum + user.total_gagne, 0)

      setGlobalStats({
        total_users: totalUsers,
        total_bets: totalBets,
        total_winnings: totalWinnings,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erreur calcul stats globales:', error)
    }
  }

  const fetchUserRank = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('total_gagne')
        .order('total_gagne', { ascending: false })

      if (error) throw error

      const userStats = await supabase
        .from('users')
        .select('total_gagne')
        .eq('id', user.id)
        .single()

      if (userStats.error) return

      const userTotalGagne = userStats.data.total_gagne
      const rank = data.findIndex(item => item.total_gagne === userTotalGagne) + 1

      setUserRank(rank)
    } catch (error) {
      console.error('Erreur récupération rang utilisateur:', error)
    }
  }

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  }

  const calculateWinRate = (parisGagnes, parisTotal) => {
    if (parisTotal === 0) return 0
    return ((parisGagnes / parisTotal) * 100).toFixed(2)
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-white'
  }

  const getMedalBackground = (rank) => {
    if (rank === 1) return 'from-yellow-900 to-orange-900'
    if (rank === 2) return 'from-gray-900 to-slate-900'
    if (rank === 3) return 'from-orange-900 to-red-900'
    return 'from-gray-800 to-gray-900'
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return "Aujourd'hui"
      case 'week': return 'Cette semaine'
      case 'month': return 'Ce mois'
      default: return 'Tous les temps'
    }
  }

  const getTotalVolume = () => {
    return leaderboard.reduce((sum, user) => sum + user.total_mise, 0)
  }

  return (
    <div className="space-y-8">
      {/* Stats globales */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {globalStats.total_users}
            </div>
            <div className="text-sm text-gray-300">
              Joueurs actifs
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {globalStats.total_bets}
            </div>
            <div className="text-sm text-gray-300">
              Paris totaux
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {Utils.formatCurrency(globalStats.total_winnings)}
            </div>
            <div className="text-sm text-gray-300">
              Total gagné
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {Utils.formatCurrency(getTotalVolume())}
            </div>
            <div className="text-sm text-gray-300">
              Volume total
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white">
            🏆 Classement des joueurs
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

      {/* Classement */}
      <div className="bg-gray-900 rounded-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="loading mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement du classement...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-white mb-4">
              Erreur
            </h2>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-white mb-4">
              Classement vide
            </h2>
            <p className="text-gray-400">
              Aucun joueur n'a encore gagné de paris
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 avec médailles */}
            {leaderboard.slice(0, 3).map((player, index) => (
              <div
                key={player.id}
                className={`bg-gradient-to-r ${getMedalBackground(index + 1)} rounded-lg p-6 border-2 ${
                  index === 0 ? 'border-yellow-500' : 
                  index === 1 ? 'border-gray-400' : 
                  'border-orange-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-4xl ${getRankColor(index + 1)}`}>
                      {getRankIcon(index + 1)}
                    </div>
                    
                    <div>
                      <div className="text-xl font-bold text-white">
                        {formatAddress(player.address)}
                      </div>
                      <div className="text-sm text-gray-300">
                        {calculateWinRate(player.paris_gagnes, player.paris_total)}% de réussite
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {Utils.formatCurrency(player.total_gagne)}
                    </div>
                    <div className="text-sm text-gray-300">
                      Total gagné
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Reste du classement */}
            <div className="space-y-3 mt-6">
              {leaderboard.slice(3).map((player, index) => {
                const rank = index + 4
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${getRankColor(rank)}`}>
                        {getRankIcon(rank)}
                      </div>
                      
                      <div>
                        <div className="text-white font-medium">
                          {formatAddress(player.address)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {calculateWinRate(player.paris_gagnes, player.paris_total)}% • {player.paris_total} paris
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {Utils.formatCurrency(player.total_gagne)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Total gagné
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rang de l'utilisateur */}
      {userRank && (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            🎯 Votre position
          </h3>
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            {getRankIcon(userRank)}
          </div>
          <div className="text-lg text-white">
            Vous êtes classé #{userRank} sur {leaderboard.length} joueurs
          </div>
          <div className="text-sm text-gray-300 mt-2">
            Continuez comme ça pour monter dans le classement !
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          📊 Explication du classement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <div className="font-medium text-white mb-2">Classement par:</div>
            <div>• Total des gains (principal)</div>
            <div>• Taux de réussite</div>
            <div>• Nombre de paris</div>
          </div>
          <div>
            <div className="font-medium text-white mb-2">Mise à jour:</div>
            <div>• En temps réel</div>
            <div>• À chaque pari terminé</div>
            <div>• Histoire complète conservée</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard