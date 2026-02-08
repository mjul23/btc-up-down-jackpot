import React from 'react'
import Header from './Header'

const App = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 BTC Up/Down Jackpot
          </h1>
          <p className="text-xl text-gray-300">
            Pari sur le Bitcoin avec jackpot progressif
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="card text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Simple & Rapide
            </h3>
            <p className="text-gray-300">
              Un pari par jour, 1 clique pour jouer
            </p>
          </div>

          <div className="card text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Jackpot Progressif
            </h3>
            <p className="text-gray-300">
              Le jackpot grandit à chaque pari
            </p>
          </div>

          <div className="card text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Sécurisé & Transparent
            </h3>
            <p className="text-gray-300">
              Smart contract audité & vérifiable
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-4">
            🎮 Comment jouer ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">1</div>
              <div className="text-white">Connectez votre wallet</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">2</div>
              <div className="text-white">Choisissez UP ou DOWN</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">3</div>
              <div className="text-white">Payez 0.10 USDC</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">4</div>
              <div className="text-white">Attendez le résultat !</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="text-6xl mb-4">🎲</div>
          <p className="text-gray-300 text-lg">
            Le pari commence à 00:00 UTC et se termine à 23:59 UTC
          </p>
          <p className="text-gray-300 text-lg mt-2">
            Si BTC monte : UP gagne 80% du pool
          </p>
          <p className="text-gray-300 text-lg mt-2">
            Si BTC descend : DOWN gagne 80% du pool
          </p>
          <p className="text-gray-300 text-lg mt-2">
            Si BTC reste plat : Jackpot reporté au prochain jour !
          </p>
        </div>
      </main>
    </div>
  )
}

export default App