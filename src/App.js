import React, { useEffect, useState } from 'react';
import { sdk } from "@farcaster/miniapp-sdk";
import './App.css';
import Header from './components/Header';
import Pari from './components/Pari';

function App() {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    initMiniApp();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="loading"></div></div>;
  }

  return (
    <div className="App min-h-screen">
      <Header user={user} isInMiniApp={isInMiniApp} />
      <main className="flex-1">
        <Pari />
      </main>
    </div>
  );
}

export default App;
