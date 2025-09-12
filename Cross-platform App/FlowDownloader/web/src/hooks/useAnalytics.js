import { useEffect, useCallback } from 'react';

/**
 * Custom hook for Google Analytics 4 integration
 * Handles page views, custom events, and consent management
 */
export const useAnalytics = () => {

  // Check if GA4 is available and not in Electron
  const isAnalyticsAvailable = useCallback(() => {
    const isElectron = navigator.userAgent.toLowerCase().indexOf('electron') > -1;
    return !isElectron && typeof window !== 'undefined' && window.gtag;
  }, []);

  // Track page views automatically on mount
  useEffect(() => {
    if (isAnalyticsAvailable()) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        page_path: window.location.pathname + window.location.search,
        page_title: document.title
      });
    }
  }, [isAnalyticsAvailable]);

  // Send custom events
  const trackEvent = useCallback((eventName, parameters = {}) => {
    if (isAnalyticsAvailable()) {
      window.gtag('event', eventName, {
        event_category: 'engagement',
        event_label: parameters.label || '',
        value: parameters.value || 0,
        ...parameters
      });
    }
  }, [isAnalyticsAvailable]);

  // Specific tracking functions for FlowDownloader events
  const trackDownloadStart = useCallback((url, format) => {
    trackEvent('download_start', {
      event_category: 'downloads',
      video_url: url,
      format: format,
      event_label: `${format} download started`
    });
  }, [trackEvent]);

  const trackDownloadComplete = useCallback((url, format, fileSize) => {
    trackEvent('download_complete', {
      event_category: 'downloads',
      video_url: url,
      format: format,
      file_size: fileSize,
      event_label: `${format} download completed`,
      value: 1
    });
  }, [trackEvent]);

  const trackDownloadError = useCallback((url, format, error) => {
    trackEvent('download_error', {
      event_category: 'errors',
      video_url: url,
      format: format,
      error_message: error,
      event_label: `Download failed: ${error}`
    });
  }, [trackEvent]);

  const trackLicenseActivated = useCallback((licenseType, userId) => {
    trackEvent('license_activated', {
      event_category: 'conversions',
      license_type: licenseType,
      user_id: userId,
      event_label: `${licenseType} license activated`,
      value: 1
    });
  }, [trackEvent]);

  const trackPurchase = useCallback((transactionId, value, currency, licenseType) => {
    if (isAnalyticsAvailable()) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: [{
          item_id: licenseType,
          item_name: `FlowDownloader ${licenseType} License`,
          category: 'software_license',
          quantity: 1,
          price: value
        }]
      });
    }
  }, [isAnalyticsAvailable]);

  const trackSignUp = useCallback((method) => {
    trackEvent('sign_up', {
      event_category: 'engagement',
      method: method,
      event_label: `User signed up via ${method}`
    });
  }, [trackEvent]);

  const trackLogin = useCallback((method) => {
    trackEvent('login', {
      event_category: 'engagement',
      method: method,
      event_label: `User logged in via ${method}`
    });
  }, [trackEvent]);

  // Consent management functions
  const updateConsent = useCallback((consentSettings) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', consentSettings);
    }
  }, []);

  const grantConsent = useCallback(() => {
    updateConsent({
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
  }, [updateConsent]);

  const denyConsent = useCallback(() => {
    updateConsent({
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  }, [updateConsent]);

  return {
    trackEvent,
    trackDownloadStart,
    trackDownloadComplete,
    trackDownloadError,
    trackLicenseActivated,
    trackPurchase,
    trackSignUp,
    trackLogin,
    grantConsent,
    denyConsent,
    updateConsent,
    isAnalyticsAvailable: isAnalyticsAvailable()
  };
};

export default useAnalytics;