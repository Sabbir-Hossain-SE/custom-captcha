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
