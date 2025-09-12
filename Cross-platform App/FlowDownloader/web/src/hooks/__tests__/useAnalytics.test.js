import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';

// Mock gtag function
const mockGtag = jest.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true
});

// Mock environment variables
const originalEnv = process.env;

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = {
      ...originalEnv,
      REACT_APP_GA_MEASUREMENT_ID: 'G-TEST123456'
    };
    
    // Mock window.navigator.userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize analytics when GA measurement ID is provided', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current).toHaveProperty('trackEvent');
    expect(result.current).toHaveProperty('trackPageView');
    expect(result.current).toHaveProperty('trackDownloadStart');
    expect(result.current).toHaveProperty('trackDownloadComplete');
    expect(result.current).toHaveProperty('trackDownloadError');
  });

  it('should not initialize analytics in Electron environment', () => {
    // Mock Electron environment
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Electron/25.0.0',
      writable: true
    });

    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackEvent('test_event', { test: 'data' });
    });

    expect(mockGtag).not.toHaveBeenCalled();
  });

  it('should not initialize analytics without GA measurement ID', () => {
    process.env.REACT_APP_GA_MEASUREMENT_ID = '';
    
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackEvent('test_event', { test: 'data' });
    });

    expect(mockGtag).not.toHaveBeenCalled();
  });

  it('should track custom events with correct parameters', () => {
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackEvent('download_start', {
        url: 'https://example.com/video',
        format: 'MP4',
        quality: '1080p'
      });
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'download_start', {
      url: 'https://example.com/video',
      format: 'MP4',
      quality: '1080p'
    });
  });

  it('should track page views', () => {
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackPageView('/test-page', 'Test Page');
    });

    expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123456', {
      page_path: '/test-page',
      page_title: 'Test Page'
    });
  });

  it('should track download start events with correct parameters', () => {
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackDownloadStart('https://example.com/video', 'MP4');
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'download_start', {
      event_category: 'downloads',
      event_label: 'https://example.com/video',
      format: 'MP4',
      value: 1
    });
  });

  it('should track download complete events with file size', () => {
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackDownloadComplete('https://example.com/video', 'MP4', '50MB');
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'download_complete', {
      event_category: 'downloads',
      event_label: 'https://example.com/video',
      format: 'MP4',
      file_size: '50MB',
      value: 1
    });
  });

  it('should track download error events', () => {
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackDownloadError('https://example.com/video', 'MP4', 'Network error');
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'download_error', {
      event_category: 'errors',
      event_label: 'https://example.com/video',
      format: 'MP4',
      error_message: 'Network error',
      value: 0
    });
  });

  it('should handle consent updates', () => {
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.updateConsent({
        analytics_storage: 'granted',
        ad_storage: 'granted'
      });
    });

    expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted'
    });
  });

  it('should track sign up events', () => {
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackSignUp('email');
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
      method: 'email'
    });
  });

  it('should track purchase events with transaction details', () => {
    const { result } = renderHook(() => useAnalytics());
    
    act(() => {
      result.current.trackPurchase({
        transaction_id: 'txn_123',
        value: 29.99,
        currency: 'USD',
        items: [{
          item_id: 'pro_license',
          item_name: 'Pro License',
          category: 'software',
          quantity: 1,
          price: 29.99
        }]
      });
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
      transaction_id: 'txn_123',
      value: 29.99,
      currency: 'USD',
      items: [{
        item_id: 'pro_license',
        item_name: 'Pro License',
        category: 'software',
        quantity: 1,
        price: 29.99
      }]
    });
  });
});