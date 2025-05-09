import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getGymCoinBalance, setupBalanceListeners } from './contractServices';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [gcBalance, setGcBalance] = useState('0');
  const [userAddress, setUserAddress] = useState('');
  const pollingCleanupRef = useRef(null);

  const triggerBalanceAnimation = () => {
    const balanceElement = document.getElementById('gc-balance-display');
    if (balanceElement) {
      balanceElement.classList.add('updated');
      
      setTimeout(() => {
        balanceElement.classList.remove('updated');
      }, 2000);
    }
  };

  useEffect(() => {
    const setupListeners = async () => {
      if (!userAddress || userAddress === '0x...') return;
      
      try {
        const balance = await getGymCoinBalance(userAddress);
        setGcBalance(balance);
        
        if (pollingCleanupRef.current) {
          pollingCleanupRef.current(); 
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
  }, [userAddress]);

  const updateUserAddress = (address) => {
    if (address && address !== userAddress) {
      setUserAddress(address);
    }
  };

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

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
}; 