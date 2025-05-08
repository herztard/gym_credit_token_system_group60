// Simple test script to check if the ABI is correctly formatted
import GymCoinArtifact from './GymCoin.json';
import UserProfileArtifact from './UserProfile.json';

console.log("GymCoin artifact type:", typeof GymCoinArtifact);
console.log("GymCoin artifact keys:", Object.keys(GymCoinArtifact));

console.log("GymCoin ABI type:", typeof GymCoinArtifact.abi);
console.log("GymCoin ABI is array:", Array.isArray(GymCoinArtifact.abi));
if (Array.isArray(GymCoinArtifact.abi)) {
  console.log("GymCoin ABI length:", GymCoinArtifact.abi.length);
  console.log("First item:", GymCoinArtifact.abi[0]);
}

console.log("\nUserProfile artifact type:", typeof UserProfileArtifact);
console.log("UserProfile artifact keys:", Object.keys(UserProfileArtifact));

console.log("UserProfile ABI type:", typeof UserProfileArtifact.abi);
console.log("UserProfile ABI is array:", Array.isArray(UserProfileArtifact.abi));
if (Array.isArray(UserProfileArtifact.abi)) {
  console.log("UserProfile ABI length:", UserProfileArtifact.abi.length);
  console.log("First item:", UserProfileArtifact.abi[0]);
}

// Export for use in browser console
export const gymCoinAbi = GymCoinArtifact.abi;
export const userProfileAbi = UserProfileArtifact.abi;