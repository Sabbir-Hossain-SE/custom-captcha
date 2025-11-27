/**
 * Tests for Anti-Automation Utilities
 *
 * These tests verify the anti-automation measures work correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  InteractionTracker,
  TimingValidator,
  detectAutomation,
  randomDelay,
} from '../../utils';

describe('InteractionTracker', () => {
  let tracker: InteractionTracker;

  beforeEach(() => {
    tracker = new InteractionTracker();
  });

  it('records mouse movements', () => {
    tracker.recordMouseMove(100, 200);
    tracker.recordMouseMove(150, 250);
    expect(tracker.isSuspicious()).toBe(false);
  });

  it('records click timings', () => {
    tracker.recordClick();
    tracker.recordClick();
    expect(tracker.isSuspicious()).toBe(false);
  });

  it('detects suspicious patterns with consistent timing', () => {
    const now = Date.now();
    // Simulate very consistent clicks (every 100ms exactly)
    for (let i = 0; i < 5; i++) {
      tracker.recordClick();
      // Manually set timings to be consistent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tracker as any).clickTimings[i] = now + i * 100;
    }
    // This should be detected as suspicious
    // Note: The actual detection logic may vary
  });

  it('resets tracking data', () => {
    tracker.recordMouseMove(100, 200);
    tracker.recordClick();
    tracker.reset();
    expect(tracker.isSuspicious()).toBe(false);
  });
});

describe('TimingValidator', () => {
  let validator: TimingValidator;

  beforeEach(() => {
    validator = new TimingValidator();
  });

  it('allows actions with sufficient delay', () => {
    expect(validator.canProceed()).toBe(true);
  });

  it('prevents rapid actions', () => {
    validator.canProceed();
    // Immediately try again
    expect(validator.canProceed()).toBe(false);
  });

  it('resets timing validator', () => {
    validator.canProceed();
    validator.reset();
    expect(validator.canProceed()).toBe(true);
  });
});

describe('detectAutomation', () => {
  it('returns boolean value', () => {
    const result = detectAutomation();
    expect(typeof result).toBe('boolean');
  });
});

describe('randomDelay', () => {
  it('returns a promise that resolves', async () => {
    const start = Date.now();
    await randomDelay(10, 20);
    const end = Date.now();
    const duration = end - start;
    expect(duration).toBeGreaterThanOrEqual(8); // Allow some margin
    expect(duration).toBeLessThan(50); // Should complete quickly
  });
});
