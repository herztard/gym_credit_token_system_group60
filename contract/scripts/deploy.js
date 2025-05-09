const hre = require("hardhat");

async function main() {
  const sellRate = 1; 
  const buyRate = 1; 
  const rateDivisor = 10000000;
  
  console.log("Rates configuration:");
  console.log("- Sell rate:", sellRate);
  console.log("- Buy rate:", buyRate);
  console.log("- Rate divisor:", rateDivisor);
  
  const tokenAmount = 1000n * 10n**18n;
  const expectedWei = tokenAmount / 10000000n;
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