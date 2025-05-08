import React, { useState } from 'react';
import { registerUser } from '../utils/contractServices';

function UserRegistration({ userAddress, onSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!username.trim() || !email.trim()) {
        throw new Error('Username and email are required');
      }
      
      const tx = await registerUser(username, email);
      setSuccess(`Registration successful! Transaction hash: ${tx.hash}`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setUsername('');
      setEmail('');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card shadow-sm" id="registration-form">
      <div className="card-body">
        <h5 className="card-title mb-3">Register Profile</h5>
        
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
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Wallet Address</label>
            <input
              type="text"
              className="form-control"
              value={userAddress || 'Not connected'}
              disabled
            />
            <small className="text-muted">
              This is the address that will be associated with your profile
            </small>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading || !userAddress}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserRegistration; 