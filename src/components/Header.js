const Header = () => {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    setLoading(true)
    try {
      // Simulation de connexion
      setTimeout(() => {
        setWalletConnected(true)
        setWalletAddress('0x1234abcd5678efgh')
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erreur connexion wallet:', error)
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    setWalletConnected(false)
    setWalletAddress('')
  }

  const formatAddress = (address) => {
    if (!address) return ''
    const addr = address.toString()
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // ... reste du code inchangé
}
