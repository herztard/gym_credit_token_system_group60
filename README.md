# Gym Credit Token System | Group 60

Imagine you run a network of gyms with multiple locations, and your users have ID cards to access
facilities. You're aiming to offer a "Gym Anywhere" experience, where users can visit any branch and use
their credits. However, due to infrastructure or policy limitations, traditional bank transactions aren't
feasible.

You want to build a centralized credit system that:

- Gives users the freedom to access any gym in the network.
- Ensures transparency and prevents misuse of credits.
- Lets users earn, buy, or transfer gym credits securely.
- Can’t be tampered with—even by gym owners.

With blockchain, you can build a secure, fair, and tamper-proof system for managing gym credits. This
project aims to develop a custom ERC-20 token called "Gym Coin (GC)", a smart contract backend, and
a simple frontend interface for users.

## Team Members

| Name Surname          | Student ID  | Lecture Group | Practice Group |
|-----------------------|-------------|---------------|----------------|
| Adilzhan Slyamgazy    | 220103151   | 01-N          | 03-P           | 
| Alikhan Toleberdyyev  | 220103050   | 01-N          | 03-P           | 
| Almat Zhuban          | 220103067   | 01-N          | 05-P           |
| Ibrahim Serkebay      | 220103069   | 01-N          | 03-P           |

## Instructions

`/contract` - blockchain part (contract code, deployment code, other configurations) 
<br>
`/gym` - frontend part


### Blockchain Part
Contracts have been already deployed, but if you want to deploy it by yourself, follow next instructions

1. Enter the contract directory
    ```bash
    cd contract 
    ```
2. Install npm dependencies
    ```bash
    npm install
    ```
3. Create and set up .env file. <br>
INFURA_SEPOLIA_ENDPOINT may be taken from here https://developer.metamask.io/key/active-endpoints <br>
PRIVATE_key may be taken from Metamask: open extension ---> tap on triple dots ---> Account Details ---> Show Private Key ---> Enter your password ---> Hold to reveal private key ---> copy your private key
    ```bash
    echo "INFURA_SEPOLIA_ENDPOINT=<your-infura-sepolia-endpoint>" > .env
    echo "PRIVATE_KEY=<your-private-key>"  >> .env
    ```

4. Deploy contracts. 
   ```bash
   npx hardhat --network sepolia run scripts/deploy.js   
   ```

5. In output of previous step will be displayed addresses of GymCoin and UserProfile contracts, save them and put them into next file `gym/src/contracts/index.js` by replacing existing ones.
```javascript
export const GYM_COIN_ADDRESS = '<your-gym-coin-address>';
export const USER_PROFILE_ADDRESS = '<your-user-profile-address>';
```

### Frontend Part
Run client to interact with contracts
1. Enter the gym directory
    ```bash
    cd gym 
    ```
2. Install npm dependencies
    ```bash
    npm install
    ```
3. Run client
   ```bash
   npm start 
   ```

