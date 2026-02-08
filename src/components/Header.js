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
