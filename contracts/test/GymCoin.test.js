const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GymCoin", function () {
  let gymCoin;
  let owner;
  let user1;
  let user2;
  const initialSupply = 1000000;
  const buyRate = ethers.parseEther("0.001");
  const sellRate = ethers.parseEther("0.0009");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const GymCoin = await ethers.getContractFactory("GymCoin");
    gymCoin = await GymCoin.deploy(initialSupply, buyRate, sellRate);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await gymCoin.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await gymCoin.balanceOf(owner.address);
      expect(await gymCoin.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the correct buy and sell rates", async function () {
      expect(await gymCoin.buyRate()).to.equal(buyRate);
      expect(await gymCoin.sellRate()).to.equal(sellRate);
    });
  });

  describe("Transactions", function () {
    it("Should allow users to buy tokens", async function () {
      const amount = 100;
      const ethAmount = amount * buyRate;

      await gymCoin.connect(user1).buy(amount, { value: ethAmount });

      expect(await gymCoin.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should allow users to sell tokens", async function () {
      const amount = 100;
      const ethAmount = amount * buyRate;

      // First buy tokens
      await gymCoin.connect(user1).buy(amount, { value: ethAmount });

      // Then sell them
      await gymCoin.connect(user1).sell(amount);

      expect(await gymCoin.balanceOf(user1.address)).to.equal(0);
    });

    it("Should allow owner to update rates", async function () {
      const newBuyRate = ethers.parseEther("0.002");
      const newSellRate = ethers.parseEther("0.0018");

      await gymCoin.setRates(newSellRate, newBuyRate);

      expect(await gymCoin.buyRate()).to.equal(newBuyRate);
      expect(await gymCoin.sellRate()).to.equal(newSellRate);
    });

    it("Should not allow non-owner to update rates", async function () {
      const newBuyRate = ethers.parseEther("0.002");
      const newSellRate = ethers.parseEther("0.0018");

      await expect(
        gymCoin.connect(user1).setRates(newSellRate, newBuyRate)
      ).to.be.revertedWithCustomError(gymCoin, "OwnableUnauthorizedAccount");
    });
  });
}); 