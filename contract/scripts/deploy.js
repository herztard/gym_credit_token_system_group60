const hre = require("hardhat");

async function main() {
  // Target: 1000 GC = 0.0001 ETH
  // 0.0001 ETH = 1e14 wei
  // We need to use smaller values to avoid overflow
  
  // Using a simpler approach: with rate = 1 and divisor = 10^7
  // For 1000 tokens: (1000 * 10^18 * 1) / 10^7 = 10^14 wei = 0.0001 ETH
  const sellRate = 1; 
  const buyRate = 1; 
  const rateDivisor = 10000000; // 10^7
  
  console.log("Rates configuration:");
  console.log("- Sell rate:", sellRate);
  console.log("- Buy rate:", buyRate);
  console.log("- Rate divisor:", rateDivisor);
  
  // Calculate expected cost for 1000 tokens
  const tokenAmount = 1000n * 10n**18n;
  const expectedWei = tokenAmount / 10000000n; // Simulating (tokenAmount * 1) / 10^7
  console.log("- Expected cost for 1000 tokens:", expectedWei.toString(), "wei");
  console.log("- Expected cost for 1000 tokens in ETH:", Number(expectedWei) / 1e18, "ETH");
  
  const GymCoin = await hre.ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(100000000, sellRate, buyRate, rateDivisor);
  await gymCoin.waitForDeployment();
  
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();

  const gymCoinAddress = await gymCoin.getAddress();
  const userProfileAddress = await userProfile.getAddress();
  
  console.log("Gym Coin deployed: ", gymCoinAddress);
  console.log("User Profile deployed: ", userProfileAddress);
  console.log("Sell rate: ", sellRate);
  console.log("Buy rate: ", buyRate);
  console.log("Rate divisor: ", rateDivisor);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});