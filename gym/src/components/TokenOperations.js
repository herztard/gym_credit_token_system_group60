import React, { useState } from 'react';

function TokenOperations({ userData, rates, web3 }) {
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!web3) {
        throw new Error('Web3 is not initialized');
      }

      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];

      switch (activeTab) {
        case 'buy':
          // In a real implementation, this would call the smart contract's buy function
          console.log(`Buying ${amount} GC for ${amount * rates.buyRate} ETH`);
          break;

        case 'sell':
          // In a real implementation, this would call the smart contract's sell function
          console.log(`Selling ${amount} GC for ${amount * rates.sellRate} ETH`);
          break;

        case 'transfer':
          if (!web3.utils.isAddress(recipient)) {
            throw new Error('Invalid recipient address');
          }
          // In a real implementation, this would call the smart contract's transfer function
          console.log(`Transferring ${amount} GC to ${recipient}`);
          break;

        default:
          throw new Error('Invalid operation');
      }

      // Clear form after successful transaction
      setAmount('');
      setRecipient('');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
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
              Cost: {(amount * rates.buyRate).toFixed(4)} ETH
            </div>
          )}
          {activeTab === 'sell' && (
            <div className="text-muted small">
              You'll receive: {(amount * rates.sellRate).toFixed(4)} ETH
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