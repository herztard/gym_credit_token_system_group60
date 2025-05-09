import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getGymCoinBalance, setupBalanceListeners } from './contractServices';

// Create the context
const BalanceContext = createContext();

// Provider component
export const BalanceProvider = ({ children }) => {
  const [gcBalance, setGcBalance] = useState('0');
  const [userAddress, setUserAddress] = useState('');
  const pollingCleanupRef = useRef(null);

  // Function to trigger animation when balance updates
  const triggerBalanceAnimation = () => {
    const balanceElement = document.getElementById('gc-balance-display');
    if (balanceElement) {
      // Add the 'updated' class to trigger animation
      balanceElement.classList.add('updated');
      
      // Remove the class after animation completes
      setTimeout(() => {
        balanceElement.classList.remove('updated');
      }, 2000);
    }
  };

  // Setup listeners when the user address changes
  useEffect(() => {
    const setupListeners = async () => {
      if (!userAddress || userAddress === '0x...') return;
      
      // Get initial balance
      try {
        const balance = await getGymCoinBalance(userAddress);
        setGcBalance(balance);
        
        // Setup polling for balance updates
        if (pollingCleanupRef.current) {
          pollingCleanupRef.current(); // Clean up previous polling
        }
        
        const cleanup = await setupBalanceListeners(userAddress, (newBalance) => {
          console.log('Balance updated via polling:', newBalance);
          
          if (newBalance !== gcBalance) {
            setGcBalance(newBalance);
            triggerBalanceAnimation();
          }
        });
        
        pollingCleanupRef.current = cleanup;
        
        return () => {
          if (pollingCleanupRef.current) {
            pollingCleanupRef.current();
          }
        };
      } catch (error) {
        console.error('Error setting up balance polling:', error);
      }
    };
    
    setupListeners();
    // Remove gcBalance from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

  // Update user address
  const updateUserAddress = (address) => {
    if (address && address !== userAddress) {
      setUserAddress(address);
    }
  };

  // Manually refresh balance
  const refreshBalance = async () => {
    if (!userAddress || userAddress === '0x...') return;
    
    try {
      const balance = await getGymCoinBalance(userAddress);
      if (balance !== gcBalance) {
        setGcBalance(balance);
        triggerBalanceAnimation();
      }
      return balance;
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };
  
  return (
    <BalanceContext.Provider 
      value={{ 
        gcBalance, 
        updateUserAddress, 
        refreshBalance 
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

// Custom hook to use the balance context
export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
}; 