import React, { useState, useEffect } from 'react';
import { getUserProfile, getGymCoinBalance } from '../utils/contractServices';
import { useBalance } from '../utils/BalanceContext';

function UserProfile({ userData }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { gcBalance, updateUserAddress } = useBalance();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!userData.address || userData.address === '0x...') {
          setLoading(false);
          return;
        }

        const actualAddress = userData.address.includes('...') 
          ? window.ethereum.selectedAddress 
          : userData.address;

        updateUserAddress(actualAddress);

        const userProfile = await getUserProfile(actualAddress);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userData.address, updateUserAddress]);

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
              <span>{parseFloat(userData.ethBalance)} ETH</span>
            </div>
            
            <div className="d-flex justify-content-between">
              <span className="text-muted">GC Balance:</span>
              <span id="gc-balance-display" className="balance-value">{parseFloat(gcBalance)} GC</span>
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