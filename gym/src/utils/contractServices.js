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
    console.log("===== INITIALIZING CONTRACTS =====");
    
    if (typeof window.ethereum === 'undefined') {
      console.error("MetaMask not available");
      throw new Error('Please install MetaMask!');
    }
    
    // Check if we already have initialized contracts
    if (provider && signer && gymCoinContract && userProfileContract) {
      console.log("Contracts already initialized, checking connection...");
      
      try {
        // Quick check to make sure we're still connected
        const address = await signer.getAddress();
        console.log("Current signer address:", address);
        return { provider, signer, gymCoinContract, userProfileContract };
      } catch (connectionError) {
        console.log("Connection check failed, reinitializing contracts:", connectionError);
        // Fall through to reinitialize
      }
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
    
    console.log("Checking contract addresses...");
    console.log("GYM_COIN_ADDRESS:", GYM_COIN_ADDRESS);
    console.log("USER_PROFILE_ADDRESS:", USER_PROFILE_ADDRESS);
    
    if (!GYM_COIN_ADDRESS || !ethers.isAddress(GYM_COIN_ADDRESS)) {
      console.error("Invalid GymCoin address:", GYM_COIN_ADDRESS);
      throw new Error("GymCoin address is not valid");
    }
    
    if (!USER_PROFILE_ADDRESS || !ethers.isAddress(USER_PROFILE_ADDRESS)) {
      console.error("Invalid UserProfile address:", USER_PROFILE_ADDRESS);
      throw new Error("UserProfile address is not valid");
    }
    
    console.log("Creating provider...");
    provider = new ethers.BrowserProvider(window.ethereum);
    
    console.log("Getting signer...");
    try {
      signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log("Signer obtained:", signerAddress);
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
        
        // Try to get the owner's balance
        const signerAddress = await signer.getAddress();
        const balance = await gymCoinContract.balanceOf(signerAddress);
        console.log(`Current user balance: ${ethers.formatUnits(balance, 18)} ${symbol}`);
        
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
    
    console.log("===== CONTRACTS INITIALIZED SUCCESSFULLY =====");
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
    console.log("getGymCoinBalance called with address:", address);
    
    if (!address) {
      console.error("No address provided to getGymCoinBalance");
      return "0";
    }
    
    if (!gymCoinContract) {
      console.log("Initializing contracts for balance check...");
      await initializeContracts();
    }
    
    if (!gymCoinContract) {
      console.error("Failed to initialize gymCoinContract");
      return "0";
    }
    
    console.log("Getting balance for address:", address);
    
    try {
      const balance = await gymCoinContract.balanceOf(address);
      console.log("Raw balance retrieved:", balance.toString());
      
      // Convert to a more readable format (considering decimals)
      const formattedBalance = ethers.formatUnits(balance, 18);
      console.log("Formatted balance:", formattedBalance);
      
      return formattedBalance;
    } catch (balanceError) {
      console.error("Error calling balanceOf:", balanceError);
      return "0";
    }
  } catch (error) {
    console.error("Error getting token balance:", error);
    return "0"; // Return 0 instead of throwing to prevent UI breaks
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
    
    // Validate the amount is a reasonable number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Invalid amount. Please enter a positive number.");
    }
    
    // Ensure the amount is a string for proper parsing
    const amountStr = parsedAmount.toString();
    
    // Get the sell rate and rate divisor from the contract
    const sellRate = await gymCoinContract.sellRate();
    const rateDivisor = await gymCoinContract.rateDivisor();
    
    console.log("Buy operation - Token amount requested:", amountStr);
    console.log("Sell rate:", sellRate.toString(), "Rate divisor:", rateDivisor.toString());
    
    // Make sure we're working with a string amount and parse it as a token amount with 18 decimals
    // This converts a user-friendly value like "1000" into the proper base units
    console.log("Converting amount to buy:", amountStr);
    const tokenAmountInBaseUnits = ethers.parseUnits(amountStr, 18);
    
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
    try {
      // First estimate gas to check if transaction would succeed
      const gasEstimate = await gymCoinContract.buy.estimateGas(tokenAmountInBaseUnits, {
        value: ethAmount
      });
      console.log("Gas estimate for buy:", gasEstimate.toString());
      
      // Execute the transaction with a gas limit
      const tx = await gymCoinContract.buy(tokenAmountInBaseUnits, {
        value: ethAmount,
        gasLimit: Math.ceil(Number(gasEstimate) * 1.2) // Add 20% buffer
      });
      
      console.log("Transaction submitted:", tx.hash);
      console.log("Waiting for transaction confirmation...");
      await tx.wait();
      console.log("Transaction confirmed");
      
      return tx;
    } catch (buyError) {
      console.error("Buy execution error:", buyError);
      
      // Check for specific errors
      if (buyError.message.includes("insufficient funds")) {
        throw new Error("You don't have enough ETH for this purchase.");
      } else if (buyError.message.includes("gas required exceeds allowance")) {
        throw new Error("Transaction would fail. You may not have enough ETH for gas or the contract rejected the purchase.");
      } else if (buyError.message.includes("Owner does not have enough GC")) {
        throw new Error("The contract owner doesn't have enough tokens to sell to you.");
      } else {
        throw new Error(`Purchase failed: ${buyError.message}`);
      }
    }
  } catch (error) {
    console.error("Error buying tokens:", error);
    throw error;
  }
};

// Sell tokens
export const sellGymCoins = async (amount) => {
  try {
    if (!gymCoinContract) await initializeContracts();
    
    // Validate the amount is a reasonable number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Invalid amount. Please enter a positive number.");
    }
    
    // Ensure the amount is a string for proper parsing
    const amountStr = parsedAmount.toString();
    
    // Get the buy rate and rate divisor from the contract
    const buyRate = await gymCoinContract.buyRate();
    const rateDivisor = await gymCoinContract.rateDivisor();
    
    console.log("Sell operation - Token amount requested:", amountStr);
    console.log("Buy rate:", buyRate.toString(), "Rate divisor:", rateDivisor.toString());
    
    // Get user's current balance to check if they have enough tokens
    const senderAddress = await signer.getAddress();
    const currentBalance = await gymCoinContract.balanceOf(senderAddress);
    const formattedBalance = ethers.formatUnits(currentBalance, 18);
    console.log("Current balance before sell:", formattedBalance);
    
    // Convert user-friendly token amount to token base units with 18 decimals
    console.log("Converting amount to sell:", amountStr);
    const tokenAmountInBaseUnits = ethers.parseUnits(amountStr, 18);
    
    // Check if user has enough tokens
    if (tokenAmountInBaseUnits > currentBalance) {
      throw new Error(`Insufficient token balance. You have ${formattedBalance} GC but are trying to sell ${amountStr} GC.`);
    }
    
    // The contract will calculate ETH returned as: (gcAmount * buyRate) / rateDivisor
    const expectedEthReturn = (tokenAmountInBaseUnits * buyRate) / rateDivisor;
    console.log("Expected ETH return (wei):", expectedEthReturn.toString());
    console.log("Expected ETH return (ETH):", ethers.formatEther(expectedEthReturn));
    
    console.log("Executing sell transaction - Token amount to sell (base units):", tokenAmountInBaseUnits.toString());
    
    try {
      // First estimate gas to check if transaction would succeed
      const gasEstimate = await gymCoinContract.sell.estimateGas(tokenAmountInBaseUnits);
      console.log("Gas estimate for sell:", gasEstimate.toString());
      
      // Execute the transaction with a gas limit
      const tx = await gymCoinContract.sell(tokenAmountInBaseUnits, {
        gasLimit: Math.ceil(Number(gasEstimate) * 1.2) // Add 20% buffer
      });
      
      console.log("Transaction submitted:", tx.hash);
      console.log("Waiting for transaction confirmation...");
      await tx.wait();
      console.log("Transaction confirmed");
      
      return tx;
    } catch (sellError) {
      console.error("Sell execution error:", sellError);
      
      // Check for specific errors
      if (sellError.message.includes("insufficient funds")) {
        throw new Error("You don't have enough tokens for this sale.");
      } else if (sellError.message.includes("gas required exceeds allowance")) {
        throw new Error("Transaction would fail. You may not have enough ETH for gas or the contract rejected the sale.");
      } else if (sellError.message.includes("Contract has insufficient ETH")) {
        throw new Error("The contract doesn't have enough ETH to pay you. Try selling a smaller amount.");
      } else {
        throw new Error(`Sale failed: ${sellError.message}`);
      }
    }
  } catch (error) {
    console.error("Error selling tokens:", error);
    throw error;
  }
};

export const transferGymCoins = async (toAddress, amount) => {
  try {
    if (!gymCoinContract) await initializeContracts();
    
    // Validate the amount is a reasonable number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Invalid amount. Please enter a positive number.");
    }
    
    // Ensure the amount is a string for proper parsing
    const amountStr = parsedAmount.toString();
    
    // Get user's current balance to check if they have enough tokens
    const senderAddress = await signer.getAddress();
    const currentBalance = await gymCoinContract.balanceOf(senderAddress);
    const formattedBalance = ethers.formatUnits(currentBalance, 18);
    console.log("Current balance before transfer:", formattedBalance);
    
    // Convert user-friendly token amount to token base units with 18 decimals
    console.log("Converting amount to transfer:", amountStr);
    const tokenAmountInBaseUnits = ethers.parseUnits(amountStr, 18);
    
    // Check if user has enough tokens
    if (tokenAmountInBaseUnits > currentBalance) {
      throw new Error(`Insufficient token balance. You have ${formattedBalance} GC but are trying to transfer ${amountStr} GC.`);
    }
    
    console.log("Executing transfer transaction - To:", toAddress, "Amount in Tokens (base units):", tokenAmountInBaseUnits.toString());

    try {
      // First estimate gas to check if transaction would succeed
      const gasEstimate = await gymCoinContract.transfer.estimateGas(toAddress, tokenAmountInBaseUnits);
      console.log("Gas estimate for transfer:", gasEstimate.toString());
      
      // Execute the transaction with a gas limit
      const tx = await gymCoinContract.transfer(toAddress, tokenAmountInBaseUnits, {
        gasLimit: Math.ceil(Number(gasEstimate) * 1.2) // Add 20% buffer
      });
      
      console.log("Transaction submitted:", tx.hash);
      console.log("Waiting for transaction confirmation...");
      await tx.wait();
      console.log("Transaction confirmed");
      
      return tx;
    } catch (transferError) {
      console.error("Transfer execution error:", transferError);
      
      // Check for specific errors
      if (transferError.message.includes("insufficient funds")) {
        throw new Error("You don't have enough tokens for this transfer.");
      } else if (transferError.message.includes("gas required exceeds allowance")) {
        throw new Error("Transaction would fail. You may not have enough ETH for gas or the contract rejected the transfer.");
      } else {
        throw new Error(`Transfer failed: ${transferError.message}`);
      }
    }
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