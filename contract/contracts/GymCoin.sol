// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GymCoin is ERC20, Ownable {
    uint256 public blockReward;
    uint256 public sellRate;  
    uint256 public buyRate;  

    constructor(uint256 initialSupply, uint256 initialSellRate, uint256 initialBuyRate) 
        ERC20("Gym Coin", "GC") 
        Ownable(msg.sender)
    {
        _mint(msg.sender, initialSupply * (10 ** decimals()));
        sellRate = initialSellRate;
        buyRate = initialBuyRate;
    }

    function buy(uint256 gcAmount) external payable {
        require(msg.value == gcAmount * sellRate, "Incorrect ETH amount sent");
        require(balanceOf(owner()) >= gcAmount, "Owner does not have enough GC");
        _transfer(owner(), msg.sender, gcAmount);
    }

    function sell(uint256 gcAmount) external {
        require(balanceOf(msg.sender) >= gcAmount, "Insufficient GC balance");
        uint256 ethAmount = gcAmount * buyRate;
        require(address(this).balance >= ethAmount, "Contract has insufficient ETH");
        _transfer(msg.sender, owner(), gcAmount);
        payable(msg.sender).transfer(ethAmount);
    }

    function setRates(uint256 newSellRate, uint256 newBuyRate) external onlyOwner {
        sellRate = newSellRate;
        buyRate = newBuyRate;
    }

    function withdrawEther(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient ETH in contract");
        payable(msg.sender).transfer(amount);
    }

    receive() external payable {}
}
