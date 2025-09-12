import React, { useEffect, useRef, useState } from 'react';

/**
 * AdUnit component for Google AdSense integration
 * Automatically detects Electron environment and prevents ad loading
 * Handles ad blocker scenarios gracefully
 */
const AdUnit = ({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = {},
  className = '',
  fallbackContent = null
}) => {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [isElectron] = useState(() => {
    return navigator.userAgent.toLowerCase().indexOf('electron') > -1;
  });

  useEffect(() => {
    // Don't load ads in Electron or if no ad slot provided
    if (isElectron || !adSlot) {
      return;
    }

    // Check if AdSense is available
    if (typeof window === 'undefined' || !window.adsbygoogle) {
      setAdError(true);
      return;
    }

    // Check if publisher ID is configured
    const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER;
    if (!publisherId || publisherId === '%VITE_ADSENSE_PUBLISHER%') {
      console.warn('AdSense publisher ID not configured');
      setAdError(true);
      return;
    }

    try {
      // Push ad to AdSense queue
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setAdLoaded(true);
    } catch (error) {
      console.error('AdSense error:', error);
      setAdError(true);
    }
  }, [adSlot, isElectron]);

  // Don't render anything in Electron
  if (isElectron) {
    return null;
  }

  // Don't render if no ad slot provided
  if (!adSlot) {
    console.warn('AdUnit: adSlot prop is required');
    return fallbackContent;
  }

  // Render fallback content if ad failed to load
  if (adError && fallbackContent) {
    return fallbackContent;
  }

  // Default styles for ad container
  const defaultStyle = {
    display: 'block',
    minHeight: '90px',
    textAlign: 'center',
    ...style
  };

  return (
    <div className={`ad-container ${className}`} style={defaultStyle}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
      
      {/* Loading indicator */}
      {!adLoaded && !adError && (
        <div className="ad-loading" style={{
          padding: '20px',
          color: '#666',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          Loading advertisement...
        </div>
      )}
      
      {/* Error fallback */}
      {adError && !fallbackContent && (
        <div className="ad-error" style={{
          padding: '20px',
          color: '#999',
          fontSize: '12px',
          border: '1px dashed #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          Advertisement space
        </div>
      )}
    </div>
  );
};

/**
 * Responsive Banner Ad Component
 */
export const BannerAd = ({ adSlot, className = '', style = {} }) => {
  return (
    <AdUnit
      adSlot={adSlot}
      adFormat="auto"
      fullWidthResponsive={true}
      className={`banner-ad ${className}`}
      style={{
        width: '100%',
        minHeight: '90px',
        ...style
      }}
      fallbackContent={
        <div style={{
          width: '100%',
          height: '90px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          Advertisement
        </div>
      }
    />
  );
};

/**
 * Square Ad Component
 */
export const SquareAd = ({ adSlot, className = '', style = {} }) => {
  return (
    <AdUnit
      adSlot={adSlot}
      adFormat="rectangle"
      fullWidthResponsive={false}
      className={`square-ad ${className}`}
      style={{
        width: '300px',
        height: '250px',
        ...style
      }}
      fallbackContent={
        <div style={{
          width: '300px',
          height: '250px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          Advertisement
        </div>
      }
    />
  );
};

/**
 * Sidebar Ad Component
 */
export const SidebarAd = ({ adSlot, className = '', style = {} }) => {
  return (
    <AdUnit
      adSlot={adSlot}
      adFormat="vertical"
      fullWidthResponsive={false}
      className={`sidebar-ad ${className}`}
      style={{
        width: '160px',
        height: '600px',
        ...style
      }}
      fallbackContent={
        <div style={{
          width: '160px',
          height: '600px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Advertisement
        </div>
      }
    />
  );
};

export default AdUnit;