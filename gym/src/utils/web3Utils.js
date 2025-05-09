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
    
    try {
      const networkId = await web3.eth.net.getId();
      console.log("Current network ID:", networkId, "Expected:", CHAIN_ID);
      
      if (networkId.toString() !== CHAIN_ID.toString()) {
        console.error(`Wrong network. Connected to ${networkId}, need ${CHAIN_ID}`);
        
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${parseInt(CHAIN_ID).toString(16)}` }],
          });
          console.log("Successfully switched network");
        } catch (switchError) {
          console.error("Failed to switch network:", switchError);
          throw new Error(`Please connect to ${NETWORK_NAME} (ID: ${CHAIN_ID})`);
        }
      }
    } catch (networkError) {
      console.error("Network check error:", networkError);
      throw new Error('Network error: ' + networkError.message);
    }

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
      callback({ connected: false, address: null });
    } else {
      callback({ connected: true, address: accounts[0] });
    }
  };

  window.ethereum && window.ethereum.on('accountsChanged', handleAccountsChanged);
  
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