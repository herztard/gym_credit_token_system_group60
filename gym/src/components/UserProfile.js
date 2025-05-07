import React from 'react';

function UserProfile({ userData }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="card-title h4 mb-4">User Profile</h2>
        <div className="d-flex flex-column gap-3">
          <div className="d-flex justify-content-between">
            <span className="text-muted">Username:</span>
            <span className="fw-medium">{userData.username}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Email:</span>
            <span className="fw-medium">{userData.email}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Wallet Address:</span>
            <span className="fw-medium">{userData.address}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">GC Balance:</span>
            <span className="fw-medium text-success">{userData.balance} GC</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">ETH Balance:</span>
            <span className="fw-medium text-primary">{userData.ethBalance} ETH</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 