const hre = require("hardhat");

async function main() {
  const GymCoin = await hre.ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(100000000, 50, 50);
  await gymCoin.waitForDeployment();
  
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();

  const gymCoinAddress = await gymCoin.getAddress();
  const userProfileAddress = await userProfile.getAddress();
  
  console.log("Gym Coin deployed: ", gymCoinAddress);
  console.log("User Profile deployed: ", userProfileAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});