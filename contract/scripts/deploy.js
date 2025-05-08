const hre = require("hardhat");

async function main() {
  const GymCoin = await hre.ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(100000000, 50, 50);

  await gymCoin.waitForDeployment();

  console.log("Gym Coin deployed: ", await gymCoin.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});