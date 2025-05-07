import React, { useState, useEffect } from 'react';
import { mockUserData, mockRates, mockTransactions } from './mockData';
import UserProfile from './components/UserProfile';
import TokenOperations from './components/TokenOperations';
import TransactionHistory from './components/TransactionHistory';
import { connectWallet, disconnectWallet, getBalance, formatAddress, listenForAccountChanges } from './utils/web3Utils';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userData, setUserData] = useState(mockUserData);
  const [rates] = useState(mockRates);
  const [transactions] = useState(mockTransactions);
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [network, setNetwork] = useState('');
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        const { address, web3: web3Instance, network: currentNetwork, provider: ethProvider } = await connectWallet();
        const ethBalance = await getBalance(web3Instance, address);
        
        setUserData(prev => ({
          ...prev,
          address: formatAddress(address),
          ethBalance: parseFloat(ethBalance)
        }));
        
        setWeb3(web3Instance);
        setNetwork(currentNetwork);
        setProvider(ethProvider);
        setIsConnected(true);
      } catch (error) {
        console.log('Wallet not connected');
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    // Set up listener for account changes
    if (window.ethereum) {
      const cleanup = listenForAccountChanges(({ connected, address }) => {
        if (!connected) {
          // Handle disconnection
          setIsConnected(false);
          setWeb3(null);
          setNetwork('');
          setProvider(null);
          setUserData(mockUserData);
          setError('Wallet disconnected by user.');
          
          // Clear the message after 5 seconds
          setTimeout(() => {
            setError('');
          }, 5000);
        } else if (address && isConnected) {
          // Handle account change
          setUserData(prev => ({
            ...prev,
            address: formatAddress(address)
          }));
        }
      });
      
      return cleanup;
    }
  }, [isConnected]);

  const handleConnectWallet = async () => {
    try {
      setError('');
      const { address, web3: web3Instance, network: currentNetwork, provider: ethProvider } = await connectWallet();
      const ethBalance = await getBalance(web3Instance, address);
      
      setUserData(prev => ({
        ...prev,
        address: formatAddress(address),
        ethBalance: parseFloat(ethBalance)
      }));
      
      setWeb3(web3Instance);
      setNetwork(currentNetwork);
      setProvider(ethProvider);
      setIsConnected(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      const success = await disconnectWallet();
      
      if (success) {
        // Reset application state
        setIsConnected(false);
        setWeb3(null);
        setNetwork('');
        setProvider(null);
        setUserData(mockUserData);
        
        // Show disconnection message
        setError('Wallet disconnected. Please reload the page if you want to reconnect.');
      }
    } catch (error) {
      setError('Error disconnecting wallet: ' + error.message);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <div className="d-flex justify-content-between w-100 align-items-center">
            <h1 className="navbar-brand mb-0 h1">Gym Coin (GC)</h1>
            <div className="d-flex align-items-center gap-3">
              {isConnected && (
                <span className="badge bg-primary">
                  {network}
                </span>
              )}
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

      {error && (
        <div className="container mt-3">
          <div className={`alert ${error.includes('disconnected') ? 'alert-info' : 'alert-danger'}`} role="alert">
            {error}
          </div>
        </div>
      )}

      <main className="container py-4">
        {isConnected ? (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="d-flex flex-column gap-4">
                <UserProfile userData={userData} />
                <TokenOperations userData={userData} rates={rates} web3={web3} />
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
            <p className="text-muted mt-3">
              Make sure you have MetaMask installed and are connected to a supported network
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;