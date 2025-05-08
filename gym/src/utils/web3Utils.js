import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { CHAIN_ID, NETWORK_NAME } from '../contracts';
import { initializeContracts } from './contractServices';

export const connectWallet = async () => {
  try {
    console.log("Attempting to connect wallet...");
    const provider = await detectEthereumProvider();

    if (!provider) {
      console.error("MetaMask not detected");
      throw new Error('Please install MetaMask!');
    }

    console.log("Provider detected, requesting accounts...");
    try {
      await provider.request({ method: 'eth_requestAccounts' });
    } catch (requestError) {
      console.error("Account request error:", requestError);
      throw new Error('Failed to connect: ' + requestError.message);
    }

    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    
    if (!accounts || accounts.length === 0) {
      console.error("No accounts found");
      throw new Error('No accounts found. Please unlock MetaMask and try again.');
    }
    
    console.log("Connected to account:", accounts[0]);
    
    // Check network
    try {
      const networkId = await web3.eth.net.getId();
      console.log("Current network ID:", networkId, "Expected:", CHAIN_ID);
      
      // Convert both to strings before comparison to handle BigInt values
      if (networkId.toString() !== CHAIN_ID.toString()) {
        throw new Error(`Please connect to ${NETWORK_NAME}`);
      }
    } catch (networkError) {
      console.error("Network check error:", networkError);
      throw new Error('Network error: ' + networkError.message);
    }

    // Initialize contract instances
    try {
      console.log("Initializing contracts...");
      await initializeContracts();
      console.log("Contracts initialized");
    } catch (contractError) {
      console.error("Contract initialization error:", contractError);
      throw new Error('Error initializing contracts: ' + contractError.message);
    }

    return {
      address: accounts[0],
      web3,
      provider,
      network: NETWORK_NAME
    };
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  try {
    const provider = await detectEthereumProvider();
    
    if (provider) {
      // Although MetaMask doesn't have a true "disconnect" method in their public API,
      // we can properly handle this by:
      
      // 1. For users on newer MetaMask versions that support wallet_revokePermissions:
      try {
        await provider.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }]
        });
        console.log("Successfully revoked permissions");
        return true;
      } catch (revokeError) {
        console.log("Revoke permissions not supported, trying alternative", revokeError);
      }
      
      // 2. Force a reload of the page on disconnect which is a common pattern
      window.location.reload();
    }
    
    return true;
  } catch (error) {
    console.error('Error during disconnect:', error);
    return false;
  }
};

export const listenForAccountChanges = (callback) => {
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      callback({ connected: false, address: null });
    } else {
      // User switched accounts
      callback({ connected: true, address: accounts[0] });
    }
  };

  // Set up event listener
  window.ethereum && window.ethereum.on('accountsChanged', handleAccountsChanged);
  
  // Return cleanup function
  return () => {
    window.ethereum && window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  };
};

export const getBalance = async (web3, address) => {
  try {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}; 