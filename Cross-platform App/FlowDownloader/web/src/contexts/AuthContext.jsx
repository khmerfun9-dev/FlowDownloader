import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLicense, setUserLicense] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Verify token is still valid
        const response = await fetch('http://localhost:3001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setUserLicense(data.user.currentLicense);
        } else {
          // Token is invalid, clear auth data
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setUserLicense(userData.currentLicense);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUserLicense(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const updateLicense = (license) => {
    setUserLicense(license);
    if (user) {
      const updatedUser = { ...user, currentLicense: license };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://localhost:3001/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    let token = localStorage.getItem('token');
    
    const makeRequest = async (authToken) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${authToken}`
        }
      });
    };

    let response = await makeRequest(token);
    
    // If token expired, try to refresh
    if (response.status === 401) {
      try {
        token = await refreshToken();
        response = await makeRequest(token);
      } catch (error) {
        // Refresh failed, user needs to login again
        logout();
        throw new Error('Authentication required');
      }
    }
    
    return response;
  };

  const checkDownloadPermission = () => {
    if (!user) {
      return {
        allowed: false,
        reason: 'Please login to download',
        maxQuality: '480p'
      };
    }

    if (!userLicense || userLicense.status !== 'active') {
      return {
        allowed: true,
        reason: 'Free tier - limited downloads',
        maxQuality: '720p',
        dailyLimit: 5
      };
    }

    const features = userLicense.features || {};
    return {
      allowed: true,
      reason: `${userLicense.type} license active`,
      maxQuality: features.maxQuality || '1080p',
      dailyLimit: features.maxDownloadsPerDay || 50,
      batchDownloads: features.batchDownloads || false,
      prioritySupport: features.prioritySupport || false
    };
  };

  const value = {
    user,
    userLicense,
    loading,
    login,
    logout,
    updateLicense,
    refreshToken,
    makeAuthenticatedRequest,
    checkDownloadPermission,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;