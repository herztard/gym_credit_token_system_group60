import React, { useState } from 'react';

function TokenOperations({ userData, rates }) {
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would interact with the smart contract
    console.log(`Operation: ${activeTab}, Amount: ${amount}, Recipient: ${recipient}`);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="btn-group w-100 mb-4" role="group">
          <button
            onClick={() => setActiveTab('buy')}
            className={`btn ${activeTab === 'buy' ? 'btn-primary' : 'btn-outline-primary'}`}
          >
            Buy GC
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`btn ${activeTab === 'sell' ? 'btn-primary' : 'btn-outline-primary'}`}
          >
            Sell GC
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`btn ${activeTab === 'transfer' ? 'btn-primary' : 'btn-outline-primary'}`}
          >
            Transfer GC
          </button>
        </div>

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
          >
            {activeTab === 'buy'
              ? 'Buy GC'
              : activeTab === 'sell'
              ? 'Sell GC'
              : 'Transfer GC'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TokenOperations; 