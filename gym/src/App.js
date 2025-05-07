import React, { useState } from 'react';
import { mockUserData, mockRates, mockTransactions } from './mockData';
import UserProfile from './components/UserProfile';
import TokenOperations from './components/TokenOperations';
import TransactionHistory from './components/TransactionHistory';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userData, setUserData] = useState(mockUserData);
  const [rates] = useState(mockRates);
  const [transactions] = useState(mockTransactions);

  const handleConnectWallet = () => {
    setIsConnected(true);
  };

  const handleDisconnectWallet = () => {
    setIsConnected(false);
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <div className="d-flex justify-content-between w-100 align-items-center">
            <h1 className="navbar-brand mb-0 h1">Gym Coin (GC)</h1>
            <div>
              {!isConnected ? (
                <button
                  onClick={handleConnectWallet}
                  className="btn btn-primary"
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  onClick={handleDisconnectWallet}
                  className="btn btn-danger"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        {isConnected ? (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="d-flex flex-column gap-4">
                <UserProfile userData={userData} />
                <TokenOperations userData={userData} rates={rates} />
              </div>
            </div>
            <div className="col-md-6">
              <TransactionHistory transactions={transactions} />
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <h2 className="h3 text-muted">
              Please connect your wallet to continue
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;