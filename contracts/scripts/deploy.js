const hre = require("hardhat");

async function main() {
  // Deploy UserProfile contract
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  console.log("UserProfile deployed to:", await userProfile.getAddress());

  // Deploy GymCoin contract
  const initialSupply = 1000000; // 1 million tokens
  const buyRate = hre.ethers.parseEther("0.001"); // 0.001 ETH per token
  const sellRate = hre.ethers.parseEther("0.0009"); // 0.0009 ETH per token

  const GymCoin = await hre.ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(initialSupply, buyRate, sellRate);
  await gymCoin.waitForDeployment();
  console.log("GymCoin deployed to:", await gymCoin.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 