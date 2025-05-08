// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract UserProfile {
    struct Profile {
        string username;
        string email;
        address wallet;
    }

    mapping(address => Profile) private profiles;
    event UserRegistered(address indexed user, string username, string email);

    function registerUser(string memory username, string memory email) public {
        profiles[msg.sender] = Profile(username, email, msg.sender);
        emit UserRegistered(msg.sender, username, email);
    }

    function getUser(address user) public view returns (string memory, string memory, address) {
        Profile memory p = profiles[user];
        return (p.username, p.email, p.wallet);
    }
}
