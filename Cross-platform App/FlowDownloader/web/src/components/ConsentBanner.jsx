import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

/**
 * GDPR Consent Banner Component
 * Implements Google Consent Mode v2 for analytics and advertising
 */
const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isEUUser, setIsEUUser] = useState(false);
  const { grantConsent, denyConsent } = useAnalytics();

  // EU/EEA/UK/Swiss country codes that require consent
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH', 'IS',
    'LI', 'NO'
  ];

  useEffect(() => {
    // Check if consent has already been given
    const consentGiven = localStorage.getItem('gdpr-consent');
    if (consentGiven) {
      if (consentGiven === 'granted') {
        grantConsent();
      } else {
        denyConsent();
      }
      return;
    }

    // Detect user location (simplified - in production use a proper geolocation service)
    const detectUserLocation = async () => {
      try {
        // Try to get timezone-based location detection
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const isLikelyEU = timezone.includes('Europe') || 
                          timezone.includes('London') || 
                          timezone.includes('Zurich');
        
        // For better accuracy, you could use a geolocation API service
        // const response = await fetch('https://ipapi.co/json/');
        // const data = await response.json();
        // const isEU = euCountries.includes(data.country_code);
        
        setIsEUUser(isLikelyEU);
        setShowBanner(isLikelyEU);
      } catch (error) {
        console.error('Error detecting user location:', error);
        // Default to showing banner for safety
        setIsEUUser(true);
        setShowBanner(true);
      }
    };

    detectUserLocation();
  }, [grantConsent, denyConsent]);

  const handleAccept = () => {
    localStorage.setItem('gdpr-consent', 'granted');
    grantConsent();
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('gdpr-consent', 'denied');
    denyConsent();
    setShowBanner(false);
  };

  const handleCustomize = () => {
    // In a real implementation, this would open a detailed consent modal
    // For now, we'll just show an alert
    alert('Customize consent preferences (feature coming soon)');
  };

  if (!showBanner || !isEUUser) {
    return null;
  }

  return (
    <div className="consent-banner" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      zIndex: 10000,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      borderTop: '3px solid #3498db'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🍪 We value your privacy
            </h3>
            <p style={{
              margin: '0',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#ecf0f1'
            }}>
              We use cookies and similar technologies to enhance your experience, 
              analyze site traffic, and personalize content. By clicking "Accept All", 
              you consent to our use of cookies for analytics and advertising.
            </p>
            <p style={{
              margin: '10px 0 0 0',
              fontSize: '12px',
              color: '#bdc3c7'
            }}>
              You can customize your preferences or learn more in our{' '}
              <a href="/privacy" style={{ color: '#3498db', textDecoration: 'underline' }}>
                Privacy Policy
              </a>.
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button
              onClick={handleDecline}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#ecf0f1',
                border: '1px solid #7f8c8d',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#7f8c8d';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#ecf0f1';
              }}
            >
              Decline
            </button>
            
            <button
              onClick={handleCustomize}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#3498db',
                border: '1px solid #3498db',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#3498db';
              }}
            >
              Customize
            </button>
            
            <button
              onClick={handleAccept}
              style={{
                padding: '10px 25px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#229954';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#27ae60';
              }}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;