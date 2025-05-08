import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  buyGymCoins, 
  sellGymCoins, 
  transferGymCoins, 
  getExchangeRates,
  getGymCoinBalance
} from '../utils/contractServices';

function TokenOperations({ userData }) {
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rates, setRates] = useState({ buyRate: '50', sellRate: '50' });
  const [gcBalance, setGcBalance] = useState('0');

  useEffect(() => {
    const fetchRatesAndBalance = async () => {
      try {
        if (!userData.address || userData.address === '0x...') return;
        
        const actualAddress = userData.address.includes('...') 
          ? window.ethereum.selectedAddress 
          : userData.address;
          
        const currentRates = await getExchangeRates();
        setRates(currentRates);
        
        const balance = await getGymCoinBalance(actualAddress);
        setGcBalance(balance);
      } catch (error) {
        console.error('Error fetching rates or balance:', error);
      }
    };
    
    fetchRatesAndBalance();
  }, [userData.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      const amountInWei = ethers.parseUnits(amount, 18);
      
      switch (activeTab) {
        case 'buy': {
          const tx = await buyGymCoins(amountInWei);
          setSuccess(`Successfully bought ${amount} GC. Transaction hash: ${tx.hash}`);
          break;
        }
        
        case 'sell': {
          if (parseFloat(gcBalance) < parseFloat(amount)) {
            throw new Error('Insufficient GC balance');
          }
          
          const tx = await sellGymCoins(amountInWei);
          setSuccess(`Successfully sold ${amount} GC. Transaction hash: ${tx.hash}`);
          break;
        }
        
        case 'transfer': {
          if (!ethers.isAddress(recipient)) {
            throw new Error('Invalid recipient address');
          }
          
          if (parseFloat(gcBalance) < parseFloat(amount)) {
            throw new Error('Insufficient GC balance');
          }
          
          const tx = await transferGymCoins(recipient, amountInWei);
          setSuccess(`Successfully transferred ${amount} GC to ${recipient}. Transaction hash: ${tx.hash}`);
          break;
        }
        
        default:
          throw new Error('Invalid operation');
      }
      
      const actualAddress = userData.address.includes('...') 
        ? window.ethereum.selectedAddress 
        : userData.address;
      const updatedBalance = await getGymCoinBalance(actualAddress);
      setGcBalance(updatedBalance);
      
      setAmount('');
      setRecipient('');
      
    } catch (error) {
      console.error('Transaction error:', error);
      setError(error.message || 'Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">Token Operations</h5>
        
        <div className="btn-group w-100 mb-4" role="group">
          <button
            onClick={() => setActiveTab('buy')}
            className={`btn ${activeTab === 'buy' ? 'btn-primary' : 'btn-outline-primary'}`}
            disabled={isLoading}
          >
            Buy GC
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`btn ${activeTab === 'sell' ? 'btn-primary' : 'btn-outline-primary'}`}
            disabled={isLoading}
          >
            Sell GC
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`btn ${activeTab === 'transfer' ? 'btn-primary' : 'btn-outline-primary'}`}
            disabled={isLoading}
          >
            Transfer GC
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {activeTab === 'transfer' && (
            <div className="mb-3">
              <label className="form-label">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="form-control"
                placeholder="0x..."
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">
              Amount {activeTab === 'buy' ? 'of GC to buy' : 'of GC to ' + activeTab}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-control"
              placeholder="Enter amount"
              required
              disabled={isLoading}
              min="0"
              step="0.01"
            />
          </div>

          {activeTab === 'buy' && (
            <div className="text-muted small">
              Cost: {amount ? (parseFloat(amount) * parseFloat(rates.buyRate) / 1e18).toFixed(8) : '0'} ETH
              <div className="mt-1">Current Buy Rate: 1 GC = {rates.buyRate} Wei</div>
            </div>
          )}
          
          {activeTab === 'sell' && (
            <div className="text-muted small">
              You'll receive: {amount ? (parseFloat(amount) * parseFloat(rates.sellRate) / 1e18).toFixed(8) : '0'} ETH
              <div className="mt-1">Current Sell Rate: 1 GC = {rates.sellRate} Wei</div>
              <div className="mt-1">Your GC Balance: {parseFloat(gcBalance).toFixed(4)} GC</div>
            </div>
          )}
          
          {activeTab === 'transfer' && (
            <div className="text-muted small">
              <div>Your GC Balance: {parseFloat(gcBalance).toFixed(4)} GC</div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              activeTab === 'buy'
                ? 'Buy GC'
                : activeTab === 'sell'
                ? 'Sell GC'
                : 'Transfer GC'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TokenOperations; 