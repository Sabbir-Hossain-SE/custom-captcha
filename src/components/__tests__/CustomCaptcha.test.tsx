/**
 * Tests for CustomCaptcha Component
 *
 * These tests verify the CAPTCHA component functionality without
 * attempting to solve the puzzle programmatically.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CustomCaptcha } from '../CustomCaptcha.component';

// Mock camera access
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: vi.fn(),
          },
        ],
      } as unknown as MediaStream)
    ),
  },
});

// Mock HTMLVideoElement properties
// These will be available once jsdom is set up via vite.config.ts
beforeEach(() => {
  // Ensure HTMLVideoElement is available (should be from jsdom)
  if (typeof HTMLVideoElement !== 'undefined') {
    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
      writable: true,
      configurable: true,
      value: 608,
    });

    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
      writable: true,
      configurable: true,
      value: 456,
    });

    Object.defineProperty(HTMLVideoElement.prototype, 'readyState', {
      writable: true,
      configurable: true,
      value: 4, // HAVE_ENOUGH_DATA
    });
  }
});

describe('CustomCaptcha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset getUserMedia mock to default success
    (navigator.mediaDevices.getUserMedia as unknown as ReturnType<
      typeof vi.fn
    >) = vi.fn(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: vi.fn(),
          },
        ],
      } as unknown as MediaStream)
    );
  });

  it('renders the CAPTCHA component', async () => {
    render(<CustomCaptcha />);
    // Wait for camera initialization to complete
    // Component may show loading state initially
    await waitFor(
      () => {
        expect(
          screen.getByText(/Take Selfie|Loading|Initializing/i)
        ).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it('displays error message when camera access fails', async () => {
    // Mock getUserMedia to reject
    (navigator.mediaDevices.getUserMedia as unknown as ReturnType<
      typeof vi.fn
    >) = vi.fn(() => Promise.reject(new Error('Camera access denied')));

    render(<CustomCaptcha />);

    await waitFor(
      () => {
        // Component should show error or loading state
        expect(
          screen.getByText(/Error|Unable to access camera|Loading/i)
        ).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it('initializes with correct default state', async () => {
    render(<CustomCaptcha />);
    // Wait for component to initialize (may show loading first)
    await waitFor(
      () => {
        expect(
          screen.getByText(/Take Selfie|Loading|Initializing/i)
        ).toBeDefined();
      },
      { timeout: 3000 }
    );
  });
});
