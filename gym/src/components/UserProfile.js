import React, { useState, useEffect } from 'react';
import { getUserProfile, getGymCoinBalance } from '../utils/contractServices';

function UserProfile({ userData }) {
  const [profile, setProfile] = useState(null);
  const [gcBalance, setGcBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        // Check if we have a valid address
        if (!userData.address || userData.address === '0x...') {
          setLoading(false);
          return;
        }

        // Get the actual address (not the formatted one)
        const actualAddress = userData.address.includes('...') 
          ? window.ethereum.selectedAddress 
          : userData.address;

        // Fetch user profile from the blockchain
        const userProfile = await getUserProfile(actualAddress);
        
        // Fetch GC balance
        const balance = await getGymCoinBalance(actualAddress);
        
        setProfile(userProfile);
        setGcBalance(balance);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userData.address]);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">User Profile</h5>
        
        {loading ? (
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mt-3">
            <div className="d-flex justify-content-between">
              <span className="text-muted">Username:</span>
              <span className="fw-bold">{profile?.username || 'Not registered'}</span>
            </div>
            
            <div className="d-flex justify-content-between">
              <span className="text-muted">Email:</span>
              <span>{profile?.email || 'Not registered'}</span>
            </div>
            
            <div className="d-flex justify-content-between">
              <span className="text-muted">Address:</span>
              <span className="text-break">{userData.address}</span>
            </div>
            
            <div className="d-flex justify-content-between">
              <span className="text-muted">ETH Balance:</span>
              <span>{parseFloat(userData.ethBalance).toFixed(4)} ETH</span>
            </div>
            
            <div className="d-flex justify-content-between">
              <span className="text-muted">GC Balance:</span>
              <span>{parseFloat(gcBalance).toFixed(2)} GC</span>
            </div>
          </div>
        )}
        
        {(!profile || !profile.username) && !loading && !error && (
          <div className="mt-3">
            <button 
              className="btn btn-outline-primary btn-sm w-100"
              onClick={() => window.scrollTo({
                top: document.getElementById('registration-form')?.offsetTop,
                behavior: 'smooth'
              })}
            >
              Register Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile; 