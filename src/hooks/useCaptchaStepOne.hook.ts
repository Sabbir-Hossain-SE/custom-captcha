import { useCallback, useEffect, useRef, useState } from 'react';
import { getRandomPosition } from '../utils';
import type { CapturedImage } from '../interfaces';

export const useCaptchaStepOne = (
  onCapture: (capturedImage: CapturedImage) => void
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializingRef = useRef(true);
  const isInitializedRef = useRef(false);
  const squarePositionRef = useRef({ x: 0, y: 0, size: 200 });
  const [squarePosition, setSquarePosition] = useState<{
    x: number;
    y: number;
    size: number;
  }>({
    x: 0,
    y: 0,
    size: 200,
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Memoize onCapture to prevent unnecessary re-renders
  const onCaptureRef = useRef(onCapture);
  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  /**
   * Initialize camera stream
   */
  useEffect(() => {
    let timeoutId: number | null = null;
    let pollInterval: number | null = null;
    let safetyTimeoutId: number | null = null;
    let cleanupCalled = false;

    const cleanup = () => {
      if (cleanupCalled) return;
      cleanupCalled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (safetyTimeoutId) {
        clearTimeout(safetyTimeoutId);
        safetyTimeoutId = null;
      }
    };

    const initializeVideo = (forceFallback = false) => {
      if (isInitializedRef.current) return;

      const video = videoRef.current;
      if (!video && !forceFallback) return;

      let videoWidth = 608;
      let videoHeight = 456;
      if (video && !forceFallback) {
        const actualWidth = video.videoWidth;
        const actualHeight = video.videoHeight;

        if (actualWidth > 0 && actualHeight > 0) {
          videoWidth = actualWidth;
          videoHeight = actualHeight;
        }
      }

      const size = Math.min(200, Math.min(videoWidth, videoHeight) * 0.4);
      const initialPos = getRandomPosition(videoWidth, videoHeight, size);

      const newPosition = {
        ...initialPos,
        size,
      };

      // Batch state updates
      squarePositionRef.current = newPosition;
      setSquarePosition(newPosition);
      setIsInitializing(false);
      isInitializingRef.current = false;
      isInitializedRef.current = true;

      cleanup();
    };

    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 608 },
            height: { ideal: 456 },
          },
        });

        const video = videoRef.current;
        if (!video) {
          initializeVideo(true);
          return;
        }

        video.srcObject = stream;
        streamRef.current = stream;

        // Single handler for all video events
        const handleVideoReady = () => {
          if (!isInitializedRef.current) {
            initializeVideo();
          }
        };

        video.onloadedmetadata = handleVideoReady;
        video.oncanplay = handleVideoReady;
        video.onloadeddata = handleVideoReady;
        video.onplaying = handleVideoReady;

        video.play().catch((err) => {
          console.warn('Video play error:', err);
        });

        // Polling mechanism - check every 100ms
        pollInterval = window.setInterval(() => {
          if (video && !isInitializedRef.current) {
            const width = video.videoWidth;
            const height = video.videoHeight;
            if (width > 0 && height > 0) {
              initializeVideo();
            }
          }
        }, 100);

        // Quick timeout - proceed after 800ms
        timeoutId = window.setTimeout(() => {
          if (!isInitializedRef.current) {
            initializeVideo(true);
          }
        }, 800);
      } catch (err) {
        console.error('Error accessing camera:', err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Unable to access camera. Please ensure camera permissions are granted.';

        let userMessage = 'Unable to access camera. ';
        if (
          errorMessage.includes('NotAllowedError') ||
          errorMessage.includes('Permission denied')
        ) {
          userMessage += 'Please allow camera access in your browser settings.';
        } else if (
          errorMessage.includes('NotFoundError') ||
          errorMessage.includes('No camera')
        ) {
          userMessage +=
            'No camera found. Please connect a camera and try again.';
        } else if (
          errorMessage.includes('NotReadableError') ||
          errorMessage.includes('in use')
        ) {
          userMessage +=
            'Camera is in use by another application. Please close it and try again.';
        } else {
          userMessage += 'Please check your camera permissions and try again.';
        }

        setError(userMessage);
        setIsInitializing(false);
        isInitializedRef.current = true;
        cleanup();
      }
    };

    // GUARANTEED safety timeout - always ends loading after 2 seconds
    safetyTimeoutId = window.setTimeout(() => {
      if (isInitializingRef.current && !isInitializedRef.current) {
        initializeVideo(true);
      }
    }, 2000);

    initializeCamera();

    // Cleanup on unmount
    return () => {
      cleanup();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  /**
   * Animate square position with random movement
   * This makes it harder for automated tools to predict the position
   */
  useEffect(() => {
    if (!videoRef.current || isCapturing || isInitializing) return;

    let lastUpdateTime = Date.now();
    let updateInterval = 500 + Math.random() * 500; // Random interval between 500-1000ms
    let animationId: number | null = null;

    const updatePosition = () => {
      if (isCapturing || !videoRef.current) {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        return;
      }

      const now = Date.now();
      const video = videoRef.current;
      if (!video) return;

      if (now - lastUpdateTime >= updateInterval) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const currentSize = squarePositionRef.current.size;

        const newPos = getRandomPosition(videoWidth, videoHeight, currentSize);
        const newPosition = {
          ...squarePositionRef.current,
          ...newPos,
        };

        // Only update state if position actually changed
        if (
          newPosition.x !== squarePositionRef.current.x ||
          newPosition.y !== squarePositionRef.current.y
        ) {
          squarePositionRef.current = newPosition;
          setSquarePosition(newPosition);
        }

        lastUpdateTime = now;
        updateInterval = 500 + Math.random() * 500; // New random interval
      }

      animationId = requestAnimationFrame(updatePosition);
      animationFrameRef.current = animationId;
    };

    animationId = requestAnimationFrame(updatePosition);
    animationFrameRef.current = animationId;

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (animationFrameRef.current === animationId) {
        animationFrameRef.current = null;
      }
    };
  }, [isCapturing, isInitializing]);

  /**
   * Capture current frame and square position
   */
  const handleContinue = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || isCapturing) return;

    setIsCapturing(true);

    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) {
      setError('Failed to get canvas context');
      setIsCapturing(false);
      return;
    }

    // Set canvas size to match video
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/png');

    // Use ref value to avoid stale closure
    const currentPosition = squarePositionRef.current;

    // Create captured image object
    const capturedImage: CapturedImage = {
      imageData,
      squarePosition: {
        x: currentPosition.x,
        y: currentPosition.y,
        size: currentPosition.size,
      },
      timestamp: Date.now(),
    };

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Pass to parent component using ref to avoid dependency
    onCaptureRef.current(capturedImage);
  }, [isCapturing]);

  return {
    videoRef,
    canvasRef,
    squarePosition,
    isCapturing,
    error,
    isInitializing,
    handleContinue,
  };
};
