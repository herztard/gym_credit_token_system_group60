import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  buyGymCoins, 
  sellGymCoins, 
  transferGymCoins, 
  getExchangeRates,
} from '../utils/contractServices';
import { useBalance } from '../utils/BalanceContext';

function TokenOperations({ userData }) {
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rates, setRates] = useState({ buyRate: '50', sellRate: '50' });
  const { gcBalance, refreshBalance } = useBalance();

  useEffect(() => {
    const fetchRates = async () => {
      try {
        if (!userData.address || userData.address === '0x...') return;
        
        const currentRates = await getExchangeRates();
        setRates(currentRates);
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };
    
    fetchRates();
  }, [userData.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!amount || isNaN(amount)) {
        throw new Error('Please enter a valid amount');
      }
      
      console.log(`Processing ${amount} GC tokens`);
      
      switch (activeTab) {
        case 'buy': {
          const tx = await buyGymCoins(amount);
          await tx.wait();
          setSuccess(`Successfully bought ${amount} GC. Transaction hash: ${tx.hash}`);
          break;
        }
        
        case 'sell': {
          if (parseFloat(gcBalance) < parseFloat(amount)) {
            throw new Error('Insufficient GC balance');
          }
          
          const tx = await sellGymCoins(amount);
          await tx.wait();
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
          
          const tx = await transferGymCoins(recipient, amount);
          await tx.wait();
          setSuccess(`Successfully transferred ${amount} GC to ${recipient}. Transaction hash: ${tx.hash}`);
          break;
        }
        
        default:
          throw new Error('Invalid operation');
      }
      
      setTimeout(async () => {
        await refreshBalance();
      }, 2000);
      
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
            />
          </div>

          {activeTab === 'buy' && (
            <div className="text-muted small">
              <div>Cost: {amount ? (parseFloat(amount) * parseFloat(rates.buyRate) / 1e18).toFixed(8) : '0'} ETH</div>
              <div className="mt-1">Current Buy Rate: 1 GC = {parseFloat(rates.buyRate) / 1e18} ETH</div>
              <div className="mt-1">
                <small>You will receive exactly {amount || '0'} GC tokens.</small>
              </div>
            </div>
          )}
          
          {activeTab === 'sell' && (
            <div className="text-muted small">
              <div>You'll receive: {amount ? (parseFloat(amount) * parseFloat(rates.sellRate) / 1e18).toFixed(8) : '0'} ETH</div>
              <div className="mt-1">Current Sell Rate: 1 GC = {parseFloat(rates.sellRate) / 1e18} ETH</div>
              <div className="mt-1">Your GC Balance: {parseFloat(gcBalance)} GC</div>
              <div className="mt-1">
                <small>You will sell exactly {amount || '0'} GC tokens.</small>
              </div>
            </div>
          )}
          
          {activeTab === 'transfer' && (
            <div className="text-muted small">
              <div>Your GC Balance: {parseFloat(gcBalance)} GC</div>
              <div className="mt-1">
                <small>You will transfer exactly {amount || '0'} GC tokens to {recipient || 'recipient'}.</small>
              </div>
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