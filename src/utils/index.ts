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
