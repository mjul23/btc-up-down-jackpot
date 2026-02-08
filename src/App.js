import React, { useEffect, useState } from 'react';
import { sdk } from "@farcaster/miniapp-sdk";
import './App.css';
import Header from './components/Header';
import Game from './components/Game';
import ConnectWallet from './components/ConnectWallet';

function App() {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Initialize Mini App SDK
  useEffect(() => {
    const initMiniApp = async () => {
      try {
        // Check if we're in a Mini App
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);

        if (inMiniApp) {
          // Get context and user info
          const context = await sdk.context;
          setUser(context.user);
          
          // Tell SDK we're ready
          sdk.ready();
        }
      } catch (error) {
        console.error("Error initializing Mini App SDK:", error);
      }
    };

    initMiniApp();
  }, []);

  const handleWalletConnect = (connected) => {
    setWalletConnected(connected);
  };

  return (
    <div className="App">
      <Header user={user} isInMiniApp={isInMiniApp} />
      
      {!walletConnected ? (
        <ConnectWallet onConnect={handleWalletConnect} />
      ) : (
        <Game />
      )}
    </div>
  );
}


export default App;
