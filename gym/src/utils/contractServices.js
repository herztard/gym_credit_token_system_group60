import { ethers } from 'ethers';
import { 
  GYM_COIN_ADDRESS, 
  USER_PROFILE_ADDRESS, 
  GYM_COIN_ABI, 
  USER_PROFILE_ABI 
} from '../contracts';

let provider;
let signer;
let gymCoinContract;
let userProfileContract;

export const initializeContracts = async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      console.error("MetaMask not available");
      throw new Error('Please install MetaMask!');
    }
    
    console.log("Creating provider...");
    provider = new ethers.BrowserProvider(window.ethereum);
    
    console.log("Getting signer...");
    try {
      signer = await provider.getSigner();
      console.log("Signer obtained:", await signer.getAddress());
    } catch (signerError) {
      console.error("Failed to get signer:", signerError);
      throw new Error("Failed to get wallet signer. Please ensure MetaMask is connected and unlocked.");
    }
    
    console.log("Creating GymCoin contract instance...");
    try {
      gymCoinContract = new ethers.Contract(
        GYM_COIN_ADDRESS,
        GYM_COIN_ABI,
        signer
      );
      console.log("GymCoin contract created");
    } catch (contractError) {
      console.error("Failed to create GymCoin contract:", contractError);
      throw new Error("Failed to initialize GymCoin contract");
    }
    
    console.log("Creating UserProfile contract instance...");
    try {
      userProfileContract = new ethers.Contract(
        USER_PROFILE_ADDRESS,
        USER_PROFILE_ABI,
        signer
      );
      console.log("UserProfile contract created");
    } catch (contractError) {
      console.error("Failed to create UserProfile contract:", contractError);
      throw new Error("Failed to initialize UserProfile contract");
    }
    
    return { provider, signer, gymCoinContract, userProfileContract };
  } catch (error) {
    console.error("Contract initialization error:", error);
    throw error;
  }
};


export const getGymCoinBalance = async (address) => {
  try {
    if (!gymCoinContract) {
      console.log("Initializing contracts for balance check...");
      await initializeContracts();
    }
    console.log("Getting balance for address:", address);
    const balance = await gymCoinContract.balanceOf(address);
    console.log("Balance retrieved:", balance.toString());
    // Convert to a more readable format (considering decimals)
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
};

export const getExchangeRates = async () => {
  try {
    if (!gymCoinContract) await initializeContracts();
    const sellRate = await gymCoinContract.sellRate();
    const buyRate = await gymCoinContract.buyRate();
    
    console.log("Rates retrieved - Sell:", sellRate.toString(), "Buy:", buyRate.toString());
    
    return {
      sellRate: ethers.formatUnits(sellRate, 0),
      buyRate: ethers.formatUnits(buyRate, 0)
    };
  } catch (error) {
    console.error("Error getting exchange rates:", error);
    throw error;
  }
};

export const buyGymCoins = async (amount) => {
  try {
    if (!gymCoinContract) await initializeContracts();
    
    const sellRate = await gymCoinContract.sellRate();
    console.log("Buy operation - Amount:", amount.toString(), "Sell rate:", sellRate.toString());
    
    const ethAmount = amount * sellRate;
    console.log("ETH amount to send:", ethAmount.toString());

    console.log("Executing buy transaction...");
    const tx = await gymCoinContract.buy(amount, {
      value: ethAmount
    });
    
    console.log("Transaction submitted:", tx.hash);
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Transaction confirmed");
    
    return tx;
  } catch (error) {
    console.error("Error buying tokens:", error);
    throw error;
  }
};


export const sellGymCoins = async (amount) => {
  try {
    if (!gymCoinContract) await initializeContracts();
    
    console.log("Executing sell transaction for amount:", amount.toString());
    const tx = await gymCoinContract.sell(amount);
    
    console.log("Transaction submitted:", tx.hash);
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Transaction confirmed");
    
    return tx;
  } catch (error) {
    console.error("Error selling tokens:", error);
    throw error;
  }
};

export const transferGymCoins = async (toAddress, amount) => {
  try {
    if (!gymCoinContract) await initializeContracts();
    
    console.log("Executing transfer transaction - To:", toAddress, "Amount:", amount.toString());
    // Execute the transaction
    const tx = await gymCoinContract.transfer(toAddress, amount);
    
    console.log("Transaction submitted:", tx.hash);
    // Wait for the transaction to be mined
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Transaction confirmed");
    
    return tx;
  } catch (error) {
    console.error("Error transferring tokens:", error);
    throw error;
  }
};

// UserProfile Contract Functions

// Register user
export const registerUser = async (username, email) => {
  try {
    if (!userProfileContract) await initializeContracts();
    
    console.log("Registering user - Username:", username, "Email:", email);
    const tx = await userProfileContract.registerUser(username, email);
    
    console.log("Registration transaction submitted:", tx.hash);
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Registration confirmed");
    
    return tx;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (address) => {
  try {
    if (!userProfileContract) await initializeContracts();
    
    console.log("Getting user profile for address:", address);
    const [username, email, wallet] = await userProfileContract.getUser(address);
    console.log("Profile retrieved - Username:", username, "Email:", email);
    return { username, email, wallet };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { username: '', email: '', wallet: address };
  }
};