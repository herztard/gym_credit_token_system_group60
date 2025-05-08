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

// Initialize the provider, signer, and contracts
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

// GymCoin Contract Functions

// Get token balance
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

// Get exchange rates
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

// Buy tokens
export const buyGymCoins = async (amount) => {
  try {
    if (!gymCoinContract) await initializeContracts();
    
    // Get the sell rate which is in wei per token
    const sellRate = await gymCoinContract.sellRate();
    console.log("Buy operation - Token amount (in wei):", amount.toString(), "Sell rate (wei per token):", sellRate.toString());
    
    // Since we're passing a large wei amount but contract expects a token amount, 
    // we need to adjust by dividing by 10^18 for the contract call
    const amountBigInt = ethers.toBigInt(amount.toString());
    const sellRateBigInt = ethers.toBigInt(sellRate.toString());
    const amountInTokens = amountBigInt; 
    const tokenAmount = amountInTokens > ethers.toBigInt("0") ? amountInTokens : ethers.toBigInt("1"); // ensure minimum of 1
    
    // But for the ETH value, we use the normal calculations from the contract
    // (token amount * sell rate)
    const ethAmount = tokenAmount * sellRateBigInt;
    
    console.log("Token amount for contract:", tokenAmount.toString());
    console.log("ETH amount to send (wei):", ethAmount.toString());
    console.log("ETH amount to send (ETH):", ethers.formatEther(ethAmount));
    
    // Check if the amount makes sense (sanity check)
    const senderAddress = await signer.getAddress();
    const senderBalance = await provider.getBalance(senderAddress);
    console.log("Sender ETH balance (wei):", senderBalance.toString());
    console.log("Sender ETH balance (ETH):", ethers.formatEther(senderBalance));
    
    if (ethAmount > ethers.toBigInt(senderBalance.toString())) {
      throw new Error(`Insufficient funds. You need ${ethers.formatEther(ethAmount)} ETH but only have ${ethers.formatEther(senderBalance)} ETH.`);
    }

    // Execute the transaction
    console.log("Executing buy transaction...");
    const tx = await gymCoinContract.buy(tokenAmount, {
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

// Sell tokens
export const sellGymCoins = async (amount) => {
  try {
    if (!gymCoinContract) await initializeContracts();
    
    // Convert the wei amount to tokens for the contract call
    const amountBigInt = ethers.toBigInt(amount.toString());
    const amountInTokens = amountBigInt;
    const tokenAmount = amountInTokens > ethers.toBigInt("0") ? amountInTokens : ethers.toBigInt("1"); // ensure minimum of 1
    
    console.log("Executing sell transaction - Token amount:", tokenAmount.toString());
    const tx = await gymCoinContract.sell(tokenAmount);
    
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
    
    const amountBigInt = ethers.toBigInt(amount.toString());
    const amountInTokens = amountBigInt;
    const tokenAmount = amountInTokens > ethers.toBigInt("0") ? amountInTokens : ethers.toBigInt("1"); 
    console.log("Token amount for contract:", tokenAmount.toString());
    console.log("amountBigInt:", amountBigInt.toString());
    console.log("amountInTokens:", amountInTokens.toString());

    console.log("Executing transfer transaction - To:", toAddress, "Amount in Tokens:", tokenAmount.toString());

    const tx = await gymCoinContract.transfer(toAddress, tokenAmount);
    
    console.log("Transaction submitted:", tx.hash);
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Transaction confirmed");
    
    return tx;
  } catch (error) {
    console.error("Error transferring tokens:", error);
    throw error;
  }
};


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