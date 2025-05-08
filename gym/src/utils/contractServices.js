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
    
    // Debug ABI
    console.log("Checking ABIs...");
    if (!GYM_COIN_ABI || !Array.isArray(GYM_COIN_ABI)) {
      console.error("Invalid GymCoin ABI:", GYM_COIN_ABI);
      throw new Error("GymCoin ABI is not valid. Expected an array but got: " + typeof GYM_COIN_ABI);
    }
    
    if (!USER_PROFILE_ABI || !Array.isArray(USER_PROFILE_ABI)) {
      console.error("Invalid UserProfile ABI:", USER_PROFILE_ABI);
      throw new Error("UserProfile ABI is not valid. Expected an array but got: " + typeof USER_PROFILE_ABI);
    }
    
    console.log("ABIs look valid");
    console.log("GymCoin ABI length:", GYM_COIN_ABI.length);
    console.log("UserProfile ABI length:", USER_PROFILE_ABI.length);
    
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
    console.log("Using address:", GYM_COIN_ADDRESS);
    try {
      gymCoinContract = new ethers.Contract(
        GYM_COIN_ADDRESS,
        GYM_COIN_ABI,
        signer
      );
      console.log("GymCoin contract created");
      
      // Test if we can access the contract functions
      try {
        const name = await gymCoinContract.name();
        const symbol = await gymCoinContract.symbol();
        console.log(`Contract verified: ${name} (${symbol})`);
      } catch (verifyError) {
        console.error("Error verifying contract:", verifyError);
        throw new Error(`Contract verification failed: ${verifyError.message}`);
      }
    } catch (contractError) {
      console.error("Failed to create GymCoin contract:", contractError);
      throw new Error(`Failed to initialize GymCoin contract: ${contractError.message}`);
    }
    
    console.log("Creating UserProfile contract instance...");
    console.log("Using address:", USER_PROFILE_ADDRESS);
    try {
      userProfileContract = new ethers.Contract(
        USER_PROFILE_ADDRESS,
        USER_PROFILE_ABI,
        signer
      );
      console.log("UserProfile contract created");
    } catch (contractError) {
      console.error("Failed to create UserProfile contract:", contractError);
      throw new Error(`Failed to initialize UserProfile contract: ${contractError.message}`);
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
    // Now we can get rateDivisor directly from the contract
    const rateDivisor = await gymCoinContract.rateDivisor();
    
    console.log("Rates retrieved - Sell:", sellRate.toString(), "Buy:", buyRate.toString(), "Divisor:", rateDivisor.toString());
    
    // Calculate the effective rates per token by considering the divisor
    // For 1 full token (1e18 base units)
    const effectiveSellRate = (ethers.toBigInt(10**18) * sellRate) / rateDivisor;
    const effectiveBuyRate = (ethers.toBigInt(10**18) * buyRate) / rateDivisor;
    
    // Calculate the price for 1000 tokens
    const costFor1000Tokens = (ethers.toBigInt(1000) * ethers.toBigInt(10**18) * sellRate) / rateDivisor;
    
    console.log("Effective sell rate (wei per token):", effectiveSellRate.toString());
    console.log("Effective buy rate (wei per token):", effectiveBuyRate.toString());
    console.log("Cost for 1000 tokens (wei):", costFor1000Tokens.toString());
    console.log("Cost for 1000 tokens (ETH):", ethers.formatEther(costFor1000Tokens));
    
    return {
      sellRate: ethers.formatUnits(sellRate, 0),
      buyRate: ethers.formatUnits(buyRate, 0),
      rateDivisor: ethers.formatUnits(rateDivisor, 0),
      // Return user-friendly rates per whole token
      effectiveSellRateEth: ethers.formatEther(effectiveSellRate),
      effectiveBuyRateEth: ethers.formatEther(effectiveBuyRate),
      // Add the cost for 1000 tokens
      costFor1000TokensEth: ethers.formatEther(costFor1000Tokens),
      costFor1000TokensWei: costFor1000Tokens.toString()
    };
  } catch (error) {
    console.error("Error getting exchange rates:", error);
    throw error;
  }
};

// Buy tokens
export const buyGymCoins = async (amount = "1000") => {
  try {
    if (!gymCoinContract) await initializeContracts();
    
    console.log("GYM_COIN_ABI is array:", Array.isArray(GYM_COIN_ABI));
    
    // Get the sell rate and rate divisor from the contract
    const sellRate = await gymCoinContract.sellRate();
    const rateDivisor = await gymCoinContract.rateDivisor();
    
    console.log("Buy operation - Token amount requested:", amount.toString());
    console.log("Sell rate:", sellRate.toString(), "Rate divisor:", rateDivisor.toString());
    
    // Make sure we're working with a string amount and parse it as a token amount with 18 decimals
    // This converts a user-friendly value like "1000" into the proper base units
    const tokenAmountInBaseUnits = ethers.parseUnits(amount.toString(), 18);
    
    // Calculate the ETH amount needed using the contract's formula: (gcAmount * sellRate) / rateDivisor
    let ethAmount = (tokenAmountInBaseUnits * sellRate) / rateDivisor;
    
    console.log("Token amount to purchase (base units):", tokenAmountInBaseUnits.toString());
    console.log("ETH amount to send (wei):", ethAmount.toString());
    console.log("ETH amount to send (ETH):", ethers.formatEther(ethAmount));
    
    // Check if the user has enough ETH
    const senderAddress = await signer.getAddress();
    const senderBalance = await provider.getBalance(senderAddress);
    console.log("Sender ETH balance (wei):", senderBalance.toString());
    console.log("Sender ETH balance (ETH):", ethers.formatEther(senderBalance));
    
    if (ethAmount > ethers.toBigInt(senderBalance.toString())) {
      throw new Error(`Insufficient funds. You need ${ethers.formatEther(ethAmount)} ETH but only have ${ethers.formatEther(senderBalance)} ETH.`);
    }

    // Execute the transaction
    console.log("Executing buy transaction...");
    const tx = await gymCoinContract.buy(tokenAmountInBaseUnits, {
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
    
    // Get the buy rate and rate divisor from the contract
    const buyRate = await gymCoinContract.buyRate();
    const rateDivisor = await gymCoinContract.rateDivisor();
    
    console.log("Sell operation - Token amount requested:", amount.toString());
    console.log("Buy rate:", buyRate.toString(), "Rate divisor:", rateDivisor.toString());
    
    // Convert user-friendly token amount to token base units with 18 decimals
    const tokenAmountInBaseUnits = ethers.parseUnits(amount.toString(), 18);
    
    // The contract will calculate ETH returned as: (gcAmount * buyRate) / rateDivisor
    const expectedEthReturn = (tokenAmountInBaseUnits * buyRate) / rateDivisor;
    console.log("Expected ETH return (wei):", expectedEthReturn.toString());
    console.log("Expected ETH return (ETH):", ethers.formatEther(expectedEthReturn));
    
    console.log("Executing sell transaction - Token amount to sell (base units):", tokenAmountInBaseUnits.toString());
    const tx = await gymCoinContract.sell(tokenAmountInBaseUnits);
    
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
    
    // Convert user-friendly token amount to token base units with 18 decimals
    const tokenAmountInBaseUnits = ethers.parseUnits(amount.toString(), 18);
    
    console.log("Executing transfer transaction - To:", toAddress, "Amount in Tokens (base units):", tokenAmountInBaseUnits.toString());

    const tx = await gymCoinContract.transfer(toAddress, tokenAmountInBaseUnits);
    
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