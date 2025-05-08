// Mock data for simulating blockchain functionality
export const mockUserData = {
  username: "JohnDoe",
  email: "john@example.com",
  address: "0x1234...5678",
  balance: 1000, 
  ethBalance: 2.5, 
};

export const mockRates = {
  buyRate: 0.001, 
  sellRate: 0.0009,
};

export const mockTransactions = [
  {
    id: 1,
    type: "BUY",
    amount: 500,
    timestamp: "2024-03-20T10:00:00Z",
    status: "completed",
  },
  {
    id: 2,
    type: "TRANSFER",
    amount: 200,
    to: "0x8765...4321",
    timestamp: "2024-03-19T15:30:00Z",
    status: "completed",
  },
  {
    id: 3,
    type: "SELL",
    amount: 300,
    timestamp: "2024-03-18T09:15:00Z",
    status: "completed",
  },
]; 