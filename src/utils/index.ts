/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Add random delays to make automation harder
 */
export function randomDelay(
  min: number = 50,
  max: number = 200
): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Generate random position for the square overlay
 * Uses a combination of time-based and random values to make it harder to predict
 */
export const getRandomPosition = (
  videoWidth: number,
  videoHeight: number,
  squareSize: number
): { x: number; y: number } => {
  const maxX = videoWidth - squareSize;
  const maxY = videoHeight - squareSize;

  // Use multiple random factors to make prediction harder
  const timeFactor = Date.now() % 1000;
  const random1 = Math.random();
  const random2 = Math.random();

  const x = Math.floor((timeFactor * random1 + random2 * 1000) % maxX);
  const y = Math.floor((timeFactor * random2 + random1 * 1000) % maxY);

  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY)),
  };
};

/**
 * Validate timing between actions to prevent rapid automation
 */
export class TimingValidator {
  private lastActionTime: number = 0;
  private minDelay: number = 100; // Minimum 100ms between actions

  /**
   * Check if enough time has passed since last action
   */
  canProceed(): boolean {
    const now = Date.now();
    if (now - this.lastActionTime < this.minDelay) {
      return false;
    }
    this.lastActionTime = now;
    return true;
  }

  /**
   * Reset timing validator
   */
  reset(): void {
    this.lastActionTime = 0;
  }
}

/**
 * Anti-Automation Utilities
 * This module contains various measures to protect the CAPTCHA from
 * being solved by automated tools and bots.
 */

/**
 * Track user interaction patterns to detect automation
 */
export class InteractionTracker {
  private mouseMovements: Array<{ x: number; y: number; timestamp: number }> =
    [];
  private clickTimings: number[] = [];

  /**
   * Record mouse movement
   */
  recordMouseMove(x: number, y: number): void {
    this.mouseMovements.push({ x, y, timestamp: Date.now() });
    // Keep only last 100 movements
    if (this.mouseMovements.length > 100) {
      this.mouseMovements.shift();
    }
  }

  /**
   * Record click timing
   */
  recordClick(): void {
    this.clickTimings.push(Date.now());
    // Keep only last 50 clicks
    if (this.clickTimings.length > 50) {
      this.clickTimings.shift();
    }
  }

  /**
   * Check if interaction patterns suggest automation
   */
  isSuspicious(): boolean {
    // Check for too-perfect timing (robots often have consistent timing)
    if (this.clickTimings.length >= 3) {
      const intervals = [];
      for (let i = 1; i < this.clickTimings.length; i++) {
        intervals.push(this.clickTimings[i] - this.clickTimings[i - 1]);
      }

      // Check if intervals are too consistent (variance < 50ms)
      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance =
        intervals.reduce(
          (sum, interval) => sum + Math.pow(interval - avgInterval, 2),
          0
        ) / intervals.length;

      if (variance < 2500) {
        // Very consistent timing suggests automation
        return true;
      }
    }

    // Check for linear mouse movements (robots often move in straight lines)
    if (this.mouseMovements.length >= 10) {
      let linearCount = 0;
      for (let i = 2; i < this.mouseMovements.length; i++) {
        const p1 = this.mouseMovements[i - 2];
        const p2 = this.mouseMovements[i - 1];
        const p3 = this.mouseMovements[i];

        // Check if three points are approximately collinear
        const area =
          Math.abs(
            (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)
          ) / 2;

        if (area < 5) {
          // Points are very close to a line
          linearCount++;
        }
      }

      if (linearCount / this.mouseMovements.length > 0.7) {
        // More than 70% linear movements suggests automation
        return true;
      }
    }

    return false;
  }

  /**
   * Reset tracking data
   */
  reset(): void {
    this.mouseMovements = [];
    this.clickTimings = [];
  }
}

/**
 * Generate obfuscated sector keys to prevent pattern recognition
 * Uses a seed to make it deterministic for the same row/col combination
 */
export function obfuscateSectorKey(
  row: number,
  col: number,
  seed?: number
): string {
  // Use provided seed or generate one based on session
  const sessionSeed = seed || Math.floor(Math.random() * 1000000);
  // Create a hash-like value that's hard to reverse
  const hash1 = ((row * 7919 + col * 3571) * sessionSeed) % 1000000;
  const hash2 = ((row * 3571 + col * 7919) * (sessionSeed + 1)) % 1000000;
  // Add timestamp component for additional obfuscation
  const timeComponent = Date.now() % 10000;
  return `${hash1}-${hash2}-${timeComponent}`;
}

/**
 * Create a deterministic obfuscated key for a sector
 * This version uses a consistent seed so the same row/col always maps to the same obfuscated key
 * within a session
 */
export function createSectorKeyMapping(
  gridSize: number,
  seed: number
): Map<string, string> {
  const mapping = new Map<string, string>();
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const simpleKey = `${row}-${col}`;
      const obfuscatedKey = obfuscateSectorKey(row, col, seed);
      mapping.set(simpleKey, obfuscatedKey);
    }
  }
  return mapping;
}

/**
 * Detect if browser automation tools are present
 */
export function detectAutomation(): boolean {
  // Check for common automation indicators
  if (typeof window === 'undefined') return false;

  // Check for webdriver property
  if ((navigator as any).webdriver) {
    return true;
  }

  // Check for headless Chrome indicators
  if (
    (navigator as any).plugins.length === 0 &&
    (navigator as any).languages.length === 0
  ) {
    return true;
  }

  return false;
}
