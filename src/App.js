import React, { useEffect, useState } from 'react';
import { sdk } from "@farcaster/miniapp-sdk";
import './App.css';
import Header from './components/Header';
import Pari from './components/Pari';

function App() {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);

        if (inMiniApp) {
          const context = await sdk.context;
          setUser(context.user);
          sdk.ready();
        }
      } catch (error) {
        console.error("Error initializing Mini App SDK:", error);
      }
    };

    initMiniApp();
  }, []);

  return (
    <div className="App">
      <Header user={user} isInMiniApp={isInMiniApp} />
      <Pari />
    </div>
  );
}

export default App;
