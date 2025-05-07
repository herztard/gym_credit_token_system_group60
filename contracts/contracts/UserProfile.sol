// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract UserProfile {
    struct User {
        string username;
        string email;
        bool isRegistered;
    }

    mapping(address => User) public users;
    mapping(string => bool) private usedUsernames;
    mapping(string => bool) private usedEmails;

    event UserRegistered(address indexed userAddress, string username, string email);
    event UserUpdated(address indexed userAddress, string username, string email);

    function register(string memory _username, string memory _email) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(!usedUsernames[_username], "Username already taken");
        require(!usedEmails[_email], "Email already registered");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");

        users[msg.sender] = User({
            username: _username,
            email: _email,
            isRegistered: true
        });

        usedUsernames[_username] = true;
        usedEmails[_email] = true;

        emit UserRegistered(msg.sender, _username, _email);
    }

    function updateProfile(string memory _username, string memory _email) public {
        require(users[msg.sender].isRegistered, "User not registered");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");

        if (keccak256(bytes(users[msg.sender].username)) != keccak256(bytes(_username))) {
            require(!usedUsernames[_username], "Username already taken");
            usedUsernames[users[msg.sender].username] = false;
            usedUsernames[_username] = true;
        }

        if (keccak256(bytes(users[msg.sender].email)) != keccak256(bytes(_email))) {
            require(!usedEmails[_email], "Email already registered");
            usedEmails[users[msg.sender].email] = false;
            usedEmails[_email] = true;
        }

        users[msg.sender].username = _username;
        users[msg.sender].email = _email;

        emit UserUpdated(msg.sender, _username, _email);
    }

    function getUserInfo(address _userAddress) public view returns (
        string memory username,
        string memory email,
        bool isRegistered
    ) {
        User memory user = users[_userAddress];
        return (user.username, user.email, user.isRegistered);
    }
} 