import React from 'react';

function TransactionHistory({ transactions }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'failed':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="card-title h4 mb-4">Transaction History</h2>
        <div className="d-flex flex-column gap-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="card border-0 bg-light"
            >
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="fw-medium">{tx.type}</span>
                    <p className="text-muted small mb-0">{formatDate(tx.timestamp)}</p>
                  </div>
                  <div className="text-end">
                    <span className="fw-medium">{tx.amount} GC</span>
                    <p className={`small mb-0 ${getStatusColor(tx.status)}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </p>
                  </div>
                </div>
                {tx.to && (
                  <p className="text-muted small mb-0 mt-2">
                    To: {tx.to}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory; 