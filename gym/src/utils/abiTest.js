import { ethers } from 'ethers';
import GymCoinArtifact from '../contracts/GymCoin.json';
import UserProfileArtifact from '../contracts/UserProfile.json';

// Directly extract the ABI
const GYM_COIN_ABI = GymCoinArtifact.abi;
const USER_PROFILE_ABI = UserProfileArtifact.abi;

// Log ABI information
console.log("GymCoin ABI type:", typeof GYM_COIN_ABI);
console.log("GymCoin ABI is array:", Array.isArray(GYM_COIN_ABI));
if (GYM_COIN_ABI) {
  console.log("GymCoin ABI length:", GYM_COIN_ABI.length);
}

console.log("UserProfile ABI type:", typeof USER_PROFILE_ABI);
console.log("UserProfile ABI is array:", Array.isArray(USER_PROFILE_ABI));
if (USER_PROFILE_ABI) {
  console.log("UserProfile ABI length:", USER_PROFILE_ABI.length);
}

// Test function to create contract instances
export const testContractCreation = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      console.log("Not in browser or MetaMask not available");
      return { success: false, error: "MetaMask not available" };
    }
    
    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Try creating contract instances
    try {
      const gymCoinContract = new ethers.Contract(
        '0x58A63D7B9430f7688aeB6a0775cE5AAC7aEc9D8F',
        GYM_COIN_ABI,
        signer
      );
      
      const userProfileContract = new ethers.Contract(
        '0xfbe2B82F84d2b00b78bDfDbacF61d3bE9FEAd9B7',
        USER_PROFILE_ABI,
        signer
      );
      
      return { 
        success: true, 
        gymCoinContract, 
        userProfileContract,
        message: "Contracts created successfully"
      };
    } catch (error) {
      console.error("Error creating contracts:", error);
      return { 
        success: false, 
        error: error.message
      };
    }
  } catch (error) {
    console.error("Test failed:", error);
    return { 
      success: false, 
      error: error.message
    };
  }
};

// Export for browser console testing
export const gymCoinAbi = GYM_COIN_ABI;
export const userProfileAbi = USER_PROFILE_ABI;