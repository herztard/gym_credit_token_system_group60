import React from 'react';
import { GYM_COIN_ADDRESS } from '../contracts';

function TransactionHistory() {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">Transaction History</h5>
        
        <div className="alert alert-info">
          <p className="mb-2">
            You can view all transactions related to the Gym Coin contract on Etherscan:
          </p>
          <a 
            href={`https://sepolia.etherscan.io/address/${GYM_COIN_ADDRESS}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="d-block text-truncate mb-2"
          >
            {GYM_COIN_ADDRESS}
          </a>
          <p className="small text-muted mb-0">
            Etherscan provides a comprehensive view of all token transfers, purchases, and sales
            directly from the blockchain.
          </p>
        </div>
        
        <div className="mt-4">
          <h6 className="mb-3">What you can view on Etherscan:</h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <i className="bi bi-arrow-right"></i> All token transfers in and out of your address
            </li>
            <li className="mb-2">
              <i className="bi bi-arrow-right"></i> All buy and sell transactions
            </li>
            <li className="mb-2">
              <i className="bi bi-arrow-right"></i> Contract interactions and events
            </li>
            <li className="mb-2">
              <i className="bi bi-arrow-right"></i> Transaction timestamps and gas fees
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory; 