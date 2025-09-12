import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdUnit, { BannerAd, SquareAd, SidebarAd } from '../AdUnit';

// Mock adsbygoogle
const mockAdsByGoogle = {
  push: jest.fn()
};

Object.defineProperty(window, 'adsbygoogle', {
  value: mockAdsByGoogle,
  writable: true
});

// Mock environment variables
const originalEnv = process.env;

describe('AdUnit Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    process.env = {
      ...originalEnv,
      REACT_APP_ADSENSE_PUBLISHER: 'ca-pub-1234567890'
    };
    
    // Mock window.navigator.userAgent (non-Electron)
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true
    });
    
    // Reset adsbygoogle array
    window.adsbygoogle = mockAdsByGoogle;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('AdUnit', () => {
    it('should render ad unit with correct attributes', () => {
      render(
        <AdUnit 
          adSlot="1234567890"
          adFormat="auto"
          fullWidthResponsive={true}
        />
      );

      const adElement = screen.getByTestId('ad-unit');
      expect(adElement).toBeInTheDocument();
      expect(adElement).toHaveClass('adsbygoogle');
      expect(adElement).toHaveAttribute('data-ad-client', 'ca-pub-1234567890');
      expect(adElement).toHaveAttribute('data-ad-slot', '1234567890');
      expect(adElement).toHaveAttribute('data-ad-format', 'auto');
      expect(adElement).toHaveAttribute('data-full-width-responsive', 'true');
    });

    it('should call adsbygoogle.push() on mount', async () => {
      render(<AdUnit adSlot="1234567890" />);

      await waitFor(() => {
        expect(mockAdsByGoogle.push).toHaveBeenCalledWith({});
      });
    });

    it('should not render in Electron environment', () => {
      // Mock Electron environment
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Electron/25.0.0',
        writable: true
      });

      const { container } = render(<AdUnit adSlot="1234567890" />);
      expect(container.firstChild).toBeNull();
      expect(mockAdsByGoogle.push).not.toHaveBeenCalled();
    });

    it('should not render without AdSense publisher ID', () => {
      process.env.REACT_APP_ADSENSE_PUBLISHER = '';
      
      const { container } = render(<AdUnit adSlot="1234567890" />);
      expect(container.firstChild).toBeNull();
      expect(mockAdsByGoogle.push).not.toHaveBeenCalled();
    });

    it('should render fallback content when ads are blocked', () => {
      // Mock ad blocker scenario
      window.adsbygoogle = undefined;
      
      render(
        <AdUnit 
          adSlot="1234567890"
          fallbackContent={<div data-testid="fallback">Ad blocked</div>}
        />
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('should handle custom styles', () => {
      const customStyle = { width: '300px', height: '250px' };
      
      render(
        <AdUnit 
          adSlot="1234567890"
          style={customStyle}
        />
      );

      const adElement = screen.getByTestId('ad-unit');
      expect(adElement).toHaveStyle('width: 300px');
      expect(adElement).toHaveStyle('height: 250px');
    });

    it('should handle error when adsbygoogle.push fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAdsByGoogle.push.mockImplementation(() => {
        throw new Error('AdSense error');
      });

      render(<AdUnit adSlot="1234567890" />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'AdSense Error:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('BannerAd', () => {
    it('should render banner ad with correct dimensions', () => {
      render(<BannerAd adSlot="1234567890" />);

      const adElement = screen.getByTestId('ad-unit');
      expect(adElement).toHaveStyle('width: 728px');
      expect(adElement).toHaveStyle('height: 90px');
      expect(adElement).toHaveAttribute('data-ad-format', 'banner');
    });

    it('should be responsive on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      });

      render(<BannerAd adSlot="1234567890" />);

      const adElement = screen.getByTestId('ad-unit');
      expect(adElement).toHaveStyle('width: 320px');
      expect(adElement).toHaveStyle('height: 50px');
    });
  });

  describe('SquareAd', () => {
    it('should render square ad with correct dimensions', () => {
      render(<SquareAd adSlot="1234567890" />);

      const adElement = screen.getByTestId('ad-unit');
      expect(adElement).toHaveStyle('width: 300px');
      expect(adElement).toHaveStyle('height: 250px');
      expect(adElement).toHaveAttribute('data-ad-format', 'rectangle');
    });
  });

  describe('SidebarAd', () => {
    it('should render sidebar ad with correct dimensions', () => {
      render(<SidebarAd adSlot="1234567890" />);

      const adElement = screen.getByTestId('ad-unit');
      expect(adElement).toHaveStyle('width: 160px');
      expect(adElement).toHaveStyle('height: 600px');
      expect(adElement).toHaveAttribute('data-ad-format', 'vertical');
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple ad units on the same page', async () => {
      render(
        <div>
          <BannerAd adSlot="1111111111" />
          <SquareAd adSlot="2222222222" />
          <SidebarAd adSlot="3333333333" />
        </div>
      );

      await waitFor(() => {
        expect(mockAdsByGoogle.push).toHaveBeenCalledTimes(3);
      });

      const adElements = screen.getAllByTestId('ad-unit');
      expect(adElements).toHaveLength(3);
      
      expect(adElements[0]).toHaveAttribute('data-ad-slot', '1111111111');
      expect(adElements[1]).toHaveAttribute('data-ad-slot', '2222222222');
      expect(adElements[2]).toHaveAttribute('data-ad-slot', '3333333333');
    });

    it('should reinitialize ads when component remounts', async () => {
      const { unmount, rerender } = render(<AdUnit adSlot="1234567890" />);
      
      await waitFor(() => {
        expect(mockAdsByGoogle.push).toHaveBeenCalledTimes(1);
      });

      unmount();
      rerender(<AdUnit adSlot="1234567890" />);

      await waitFor(() => {
        expect(mockAdsByGoogle.push).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle dark mode styling', () => {
      // Mock dark mode
      document.documentElement.classList.add('dark');
      
      render(<AdUnit adSlot="1234567890" />);

      const container = screen.getByTestId('ad-unit').parentElement;
      expect(container).toHaveClass('dark:bg-gray-800');
      
      // Cleanup
      document.documentElement.classList.remove('dark');
    });
  });
});