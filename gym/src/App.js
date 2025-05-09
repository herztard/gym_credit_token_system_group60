import React, { useState, useEffect } from 'react';
import UserProfile from './components/UserProfile';
import TokenOperations from './components/TokenOperations';
import UserRegistration from './components/UserRegistration';
import TransactionHistory from './components/TransactionHistory';
import { connectWallet, disconnectWallet, getBalance, formatAddress, listenForAccountChanges } from './utils/web3Utils';
import { getUserProfile } from './utils/contractServices';
import { NETWORK_NAME, GYM_COIN_ADDRESS } from './contracts';
import { BalanceProvider } from './utils/BalanceContext';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userData, setUserData] = useState({ address: '', ethBalance: '0' });
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh ETH balance
  const refreshEthBalance = async () => {
    if (!web3 || !userData.fullAddress) return;
    try {
      const ethBalance = await getBalance(web3, userData.fullAddress);
      setUserData(prev => ({
        ...prev,
        ethBalance
      }));
    } catch (error) {
      console.error('Error refreshing ETH balance:', error);
    }
  };

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const { address, web3: web3Instance } = await connectWallet();
        const ethBalance = await getBalance(web3Instance, address);
        
        setUserData({
          address: formatAddress(address),
          fullAddress: address,
          ethBalance
        });
        
        setWeb3(web3Instance);
        setIsConnected(true);
        
        // Check if user is registered
        try {
          const profile = await getUserProfile(address);
          setIsUserRegistered(!!profile.username);
        } catch (profileError) {
          console.log('User not registered yet');
          setIsUserRegistered(false);
        }
      } catch (error) {
        console.log('Wallet not connected');
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Set up listener for account changes
  useEffect(() => {
    if (window.ethereum) {
      const cleanup = listenForAccountChanges(async ({ connected, address }) => {
        if (!connected) {
          // Handle disconnection
          setIsConnected(false);
          setWeb3(null);
          setUserData({ address: '', ethBalance: '0' });
          setIsUserRegistered(false);
          setError('Wallet disconnected by user.');
          
          // Clear the message after 5 seconds
          setTimeout(() => {
            setError('');
          }, 5000);
        } else if (address && isConnected) {
          // Handle account change
          try {
            const ethBalance = await getBalance(web3, address);
            
            setUserData({
              address: formatAddress(address),
              fullAddress: address,
              ethBalance
            });
            
            // Check if new address is registered
            try {
              const profile = await getUserProfile(address);
              setIsUserRegistered(!!profile.username);
            } catch (profileError) {
              console.log('New account not registered yet');
              setIsUserRegistered(false);
            }
          } catch (error) {
            console.error('Error updating account data:', error);
          }
        }
      });
      
      return cleanup;
    }
  }, [isConnected, web3]);

  const handleConnectWallet = async () => {
    try {
      setError('');
      setIsLoading(true);
      console.log("App: Attempting to connect wallet...");
      
      try {
        const { address, web3: web3Instance } = await connectWallet();
        console.log("App: Wallet connected successfully, getting balance...");
        
        const ethBalance = await getBalance(web3Instance, address);
        console.log("App: ETH balance retrieved:", ethBalance);
        
        setUserData({
          address: formatAddress(address),
          fullAddress: address,
          ethBalance
        });
        
        setWeb3(web3Instance);
        setIsConnected(true);
        
        // Check if user is registered
        try {
          console.log("App: Checking if user is registered...");
          const profile = await getUserProfile(address);
          console.log("App: User profile retrieved:", profile);
          setIsUserRegistered(!!profile.username);
        } catch (profileError) {
          console.error("App: Error checking user registration:", profileError);
          setIsUserRegistered(false);
        }
      } catch (connectionError) {
        console.error("App: Connection error details:", connectionError);
        throw connectionError;
      }
    } catch (error) {
      console.error("App: Connect wallet error:", error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      const success = await disconnectWallet();
      
      if (success) {
        // Reset application state
        setIsConnected(false);
        setWeb3(null);
        setUserData({ address: '', ethBalance: '0' });
        setIsUserRegistered(false);
        
        // Show disconnection message
        setError('Wallet disconnected. Please reload the page if you want to reconnect.');
      }
    } catch (error) {
      setError('Error disconnecting wallet: ' + error.message);
    }
  };

  const handleRegistrationSuccess = () => {
    setIsUserRegistered(true);
  };

  return (
    <BalanceProvider>
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
          <div className="container">
            <div className="d-flex justify-content-between w-100 align-items-center">
              <h1 className="navbar-brand mb-0 h1">Gym Coin (GC)</h1>
              <div className="d-flex align-items-center gap-3">
                {isConnected && (
                  <span className="badge bg-primary">
                    {NETWORK_NAME}
                  </span>
                )}
                {!isConnected ? (
                  <button
                    onClick={handleConnectWallet}
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Connecting...
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
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
              {/* User Profile and Token Operations */}
              <div className="col-lg-6">
                <div className="d-flex flex-column gap-4">
                  <UserProfile userData={userData} />
                  <TokenOperations userData={userData} refreshEthBalance={refreshEthBalance} />
                </div>
              </div>
              
              {/* Registration Form or Transaction History */}
              <div className="col-lg-6">
                {!isUserRegistered ? (
                  <UserRegistration 
                    userAddress={userData.fullAddress} 
                    onSuccess={handleRegistrationSuccess} 
                  />
                ) : (
                  <TransactionHistory />
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <h2 className="h3 text-muted">
                Please connect your wallet to continue
              </h2>
              <p className="text-muted mt-3">
                Make sure you have MetaMask installed and are connected to {NETWORK_NAME}
              </p>
            </div>
          )}
        </main>
        
        <footer className="bg-white py-4 mt-auto">
          <div className="container">
            <div className="text-center text-muted">
              <p className="mb-0">
                Gym Coin - ERC-20 Token for Gym Credit System
              </p>
              <small>
                Contract Address: {GYM_COIN_ADDRESS}
              </small>
            </div>
          </div>
        </footer>
      </div>
    </BalanceProvider>
  );
}

export default App;