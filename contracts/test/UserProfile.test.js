const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserProfile", function () {
  let userProfile;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const UserProfile = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfile.deploy();
  });

  describe("Registration", function () {
    it("Should allow users to register", async function () {
      const username = "testuser";
      const email = "test@example.com";

      await userProfile.connect(user1).register(username, email);

      const userInfo = await userProfile.getUserInfo(user1.address);
      expect(userInfo.username).to.equal(username);
      expect(userInfo.email).to.equal(email);
      expect(userInfo.isRegistered).to.be.true;
    });

    it("Should not allow duplicate usernames", async function () {
      const username = "testuser";
      const email1 = "test1@example.com";
      const email2 = "test2@example.com";

      await userProfile.connect(user1).register(username, email1);

      await expect(
        userProfile.connect(user2).register(username, email2)
      ).to.be.revertedWith("Username already taken");
    });

    it("Should not allow duplicate emails", async function () {
      const username1 = "testuser1";
      const username2 = "testuser2";
      const email = "test@example.com";

      await userProfile.connect(user1).register(username1, email);

      await expect(
        userProfile.connect(user2).register(username2, email)
      ).to.be.revertedWith("Email already registered");
    });

    it("Should not allow empty username or email", async function () {
      await expect(
        userProfile.connect(user1).register("", "test@example.com")
      ).to.be.revertedWith("Username cannot be empty");

      await expect(
        userProfile.connect(user1).register("testuser", "")
      ).to.be.revertedWith("Email cannot be empty");
    });
  });

  describe("Profile Updates", function () {
    beforeEach(async function () {
      await userProfile.connect(user1).register("testuser", "test@example.com");
    });

    it("Should allow users to update their profile", async function () {
      const newUsername = "newuser";
      const newEmail = "new@example.com";

      await userProfile.connect(user1).updateProfile(newUsername, newEmail);

      const userInfo = await userProfile.getUserInfo(user1.address);
      expect(userInfo.username).to.equal(newUsername);
      expect(userInfo.email).to.equal(newEmail);
    });

    it("Should not allow users to update to taken usernames", async function () {
      await userProfile.connect(user2).register("otheruser", "other@example.com");

      await expect(
        userProfile.connect(user1).updateProfile("otheruser", "test@example.com")
      ).to.be.revertedWith("Username already taken");
    });

    it("Should not allow users to update to taken emails", async function () {
      await userProfile.connect(user2).register("otheruser", "other@example.com");

      await expect(
        userProfile.connect(user1).updateProfile("testuser", "other@example.com")
      ).to.be.revertedWith("Email already registered");
    });

    it("Should not allow unregistered users to update profile", async function () {
      await expect(
        userProfile.connect(user2).updateProfile("newuser", "new@example.com")
      ).to.be.revertedWith("User not registered");
    });
  });
}); 