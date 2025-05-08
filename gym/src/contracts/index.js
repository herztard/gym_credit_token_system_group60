import GymCoinArtifact from './GymCoin.json';
import UserProfileArtifact from './UserProfile.json';

export const GYM_COIN_ADDRESS = '0xe7219E4a860936a93F076d01FFb5D1541C750585';
export const USER_PROFILE_ADDRESS = '0xc8846ba37665211B17686EFecDA92e66058ef90B';

// Extract the ABI from the artifact
export const GYM_COIN_ABI = GymCoinArtifact.abi;
export const USER_PROFILE_ABI = UserProfileArtifact.abi;

export const CHAIN_ID = 11155111;
export const NETWORK_NAME = 'Sepolia Testnet';