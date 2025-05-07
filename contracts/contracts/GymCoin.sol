// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GymCoin is ERC20, Ownable {
    uint256 public buyRate;  // Rate of ETH per GC token for buying
    uint256 public sellRate; // Rate of ETH per GC token for selling

    event TokensBought(address indexed buyer, uint256 amount, uint256 ethAmount);
    event TokensSold(address indexed seller, uint256 amount, uint256 ethAmount);
    event RatesUpdated(uint256 newBuyRate, uint256 newSellRate);

    constructor(uint256 initialSupply, uint256 _buyRate, uint256 _sellRate) 
        ERC20("Gym Coin", "GC") 
        Ownable(msg.sender)
    {
        _mint(msg.sender, initialSupply * 10 ** decimals());
        buyRate = _buyRate;
        sellRate = _sellRate;
    }

    function buy(uint256 gcAmount) public payable {
        require(gcAmount > 0, "Amount must be greater than 0");
        require(msg.value == gcAmount * buyRate, "Incorrect ETH amount");
        require(balanceOf(owner()) >= gcAmount, "Insufficient tokens in contract");

        _transfer(owner(), msg.sender, gcAmount);
        emit TokensBought(msg.sender, gcAmount, msg.value);
    }

    function sell(uint256 gcAmount) public {
        require(gcAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= gcAmount, "Insufficient token balance");

        uint256 ethAmount = gcAmount * sellRate;
        require(address(this).balance >= ethAmount, "Insufficient ETH balance");

        _transfer(msg.sender, owner(), gcAmount);
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit TokensSold(msg.sender, gcAmount, ethAmount);
    }

    function setRates(uint256 _sellRate, uint256 _buyRate) public onlyOwner {
        require(_sellRate > 0 && _buyRate > 0, "Rates must be greater than 0");
        sellRate = _sellRate;
        buyRate = _buyRate;
        emit RatesUpdated(_buyRate, _sellRate);
    }

    // Function to receive ETH
    receive() external payable {}
} 