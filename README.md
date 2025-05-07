# Gym Credit Token System

A blockchain-based credit system for gym networks, built with Ethereum smart contracts and React.

## Overview

The Gym Credit Token System provides a decentralized solution for gym networks to manage memberships and credits. Users can access any gym in the network using their GymCoin (GC) tokens, buy/sell tokens, and transfer tokens to other users.

### Key Features

- **ERC-20 Token**: Custom GymCoin (GC) token
- **User Profiles**: Register and manage user accounts
- **Buy/Sell Mechanism**: Exchange ETH for GC tokens and vice versa
- **Transfer System**: Send GC tokens to other users
- **Secure & Transparent**: Built on blockchain for security and transparency

## Technologies

- Solidity (Smart Contracts)
- Hardhat (Ethereum Development Environment)
- React (Frontend)
- Ethers.js (Blockchain Interaction)
- Tailwind CSS (Styling)
- MetaMask (Wallet Integration)

## Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask browser extension
- Sepolia testnet ETH (for testing)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/gym-credit-token-system.git
cd gym-credit-token-system
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file in the root directory (copy from `env.template`):

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-infura-api-key
PRIVATE_KEY=your-private-key-here
ETHERSCAN_API_KEY=your-etherscan-api-key
```

4. Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

## Smart Contract Deployment

1. Compile smart contracts:

```bash
npx hardhat compile
```

2. Deploy to local network for testing:

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

3. Deploy to Sepolia testnet:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Frontend Development

1. Start the frontend development server:

```bash
cd frontend
npm start
```

2. Open your browser at `http://localhost:3000`

## Usage

1. Connect your MetaMask wallet
2. Register a new user profile
3. Buy GC tokens using ETH
4. Use GC tokens at participating gyms
5. Transfer GC tokens to other users if needed
6. Sell GC tokens to convert back to ETH

## Testing

Run tests for smart contracts:

```bash
npx hardhat test
```

## Security Considerations

- All functions include input validation
- ReentrancyGuard for buy/sell functions
- Access control using Ownable
- Extensive testing for edge cases
- Carefully managed exchange rates

## License

This project is licensed under the MIT License - see the LICENSE file for details.
