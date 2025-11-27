/**
 * Test setup file for Vitest
 * This file runs before all tests to configure the test environment
 */

import '@testing-library/jest-dom';

// Ensure DOM globals are available
if (typeof globalThis.HTMLVideoElement === 'undefined') {
  // jsdom should provide this, but if not, we can add a minimal mock
  globalThis.HTMLVideoElement = class HTMLVideoElement extends HTMLElement {
    videoWidth = 0;
    videoHeight = 0;
    readyState = 0;
  } as unknown as typeof HTMLVideoElement;
}
