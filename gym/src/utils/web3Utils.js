import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

// Supported networks
const SUPPORTED_NETWORKS = {
  
  11155111: 'Sepolia Testnet'
};

export const connectWallet = async () => {
  try {
    const provider = await detectEthereumProvider();

    if (!provider) {
      throw new Error('Please install MetaMask!');
    }

    // Request account access
    await provider.request({ method: 'eth_requestAccounts' });

    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();

    // Check if we're on a supported network
    if (!SUPPORTED_NETWORKS[networkId]) {
      throw new Error(`Please connect to one of these networks: ${Object.values(SUPPORTED_NETWORKS).join(', ')}`);
    }

    return {
      address: accounts[0],
      web3,
      provider,
      network: SUPPORTED_NETWORKS[networkId]
    };
  } catch (error) {
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
    throw error;
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}; 