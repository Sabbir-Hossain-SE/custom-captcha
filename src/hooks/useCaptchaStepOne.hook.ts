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

  /**
   * Initialize camera stream
   */
  useEffect(() => {
    let timeoutId: number | null = null;
    let pollInterval: number | null = null;
    let safetyTimeoutId: number | null = null;
    let isInitialized = false;
    let safetyTriggered = false;

    // GUARANTEED safety timeout - always ends loading after 2 seconds
    safetyTimeoutId = window.setTimeout(() => {
      if (isInitializingRef.current && !safetyTriggered) {
        safetyTriggered = true;
        console.warn('Safety timeout: Forcing initialization to complete');
        setIsInitializing(false);
        isInitializingRef.current = false;
        isInitialized = true;

        // Initialize with fallback dimensions
        const initialPos = getRandomPosition(640, 480, squarePosition.size);
        setSquarePosition({
          ...initialPos,
          size: Math.min(200, Math.min(640, 480) * 0.4),
        });
      }
    }, 2000);

    const initializeCamera = async () => {
      setIsInitializing(true);
      isInitializingRef.current = true;
      try {
        // Request front-facing camera (selfie camera)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Function to initialize video dimensions
          const initializeVideo = (forceFallback = false) => {
            if (isInitialized) return;

            if (!videoRef.current) {
              // No video element, use fallback
              const initialPos = getRandomPosition(
                640,
                480,
                squarePosition.size
              );
              setSquarePosition({
                ...initialPos,
                size: Math.min(200, Math.min(640, 480) * 0.4),
              });
              setIsInitializing(false);
              isInitialized = true;
              return;
            }

            // Safari sometimes needs the video to play first
            if (videoRef.current.paused) {
              videoRef.current.play().catch((err) => {
                console.warn('Video play error:', err);
              });
            }

            let videoWidth = videoRef.current.videoWidth;
            let videoHeight = videoRef.current.videoHeight;

            // Use fallback dimensions if needed or forced
            if (forceFallback || videoWidth === 0 || videoHeight === 0) {
              console.warn(
                'Using fallback dimensions. Actual:',
                videoWidth,
                'x',
                videoHeight
              );
              videoWidth = 640;
              videoHeight = 480;
            }

            // Always proceed with initialization
            const initialPos = getRandomPosition(
              videoWidth,
              videoHeight,
              squarePosition.size
            );
            setSquarePosition({
              ...initialPos,
              size: Math.min(200, Math.min(videoWidth, videoHeight) * 0.4),
            });

            setIsInitializing(false);
            isInitializingRef.current = false;
            isInitialized = true;

            // Clean up timers
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

          // Safari-specific: Use multiple event listeners
          videoRef.current.onloadedmetadata = () => {
            console.log('onloadedmetadata fired');
            initializeVideo();
          };
          videoRef.current.oncanplay = () => {
            console.log('oncanplay fired');
            initializeVideo();
          };
          videoRef.current.onloadeddata = () => {
            console.log('onloadeddata fired');
            initializeVideo();
          };
          videoRef.current.onplaying = () => {
            console.log('onplaying fired');
            initializeVideo();
          };

          // Force play for Safari
          videoRef.current.play().catch((err) => {
            console.warn('Initial video play error:', err);
          });

          // Polling mechanism - check every 100ms
          pollInterval = window.setInterval(() => {
            if (videoRef.current && !isInitialized) {
              const width = videoRef.current.videoWidth;
              const height = videoRef.current.videoHeight;
              console.log('Polling check:', width, 'x', height);
              if (width > 0 && height > 0) {
                initializeVideo();
              } else if (!isInitialized) {
                // After 1 second of polling, just proceed with fallback
                initializeVideo(true);
              }
            }
          }, 100);

          // Quick timeout - proceed after 800ms
          timeoutId = window.setTimeout(() => {
            if (!isInitialized) {
              console.warn('Quick timeout - proceeding with fallback');
              initializeVideo(true);
            }
          }, 800);
        } else {
          // No video ref, proceed immediately with fallback
          setIsInitializing(false);
          isInitialized = true;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Unable to access camera. Please ensure camera permissions are granted.';

        // Safari-specific error messages
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
        isInitialized = true;
      }
    };

    initializeCamera();

    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (safetyTimeoutId) {
        clearTimeout(safetyTimeoutId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Animate square position with random movement
   * This makes it harder for automated tools to predict the position
   */
  useEffect(() => {
    if (!videoRef.current || isCapturing) return;

    let lastUpdateTime = Date.now();
    const updateInterval = 500 + Math.random() * 500; // Random interval between 500-1000ms

    const updatePosition = () => {
      const now = Date.now();
      const video = videoRef.current;
      if (!video) return;

      if (now - lastUpdateTime >= updateInterval) {
        const videoWidth = video.videoWidth || 640;
        const videoHeight = video.videoHeight || 480;

        setSquarePosition((prev) => {
          const newPos = getRandomPosition(videoWidth, videoHeight, prev.size);
          return {
            ...prev,
            ...newPos,
          };
        });

        lastUpdateTime = now;
      }

      if (!isCapturing) {
        animationFrameRef.current = requestAnimationFrame(updatePosition);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCapturing]);

  /**
   * Capture current frame and square position
   */
  const handleContinue = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Failed to get canvas context');
      setIsCapturing(false);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/png');

    // Create captured image object
    const capturedImage: CapturedImage = {
      imageData,
      squarePosition: {
        x: squarePosition.x,
        y: squarePosition.y,
        size: squarePosition.size,
      },
      timestamp: Date.now(),
    };

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Pass to parent component
    onCapture(capturedImage);
  }, [videoRef, canvasRef, squarePosition, isCapturing, onCapture]);

  const onLoadedMetadataHandler = () => {
    // Ensure initialization completes (Safari fallback)
    if (isInitializing && videoRef.current) {
      const videoWidth = videoRef.current.videoWidth || 640;
      const videoHeight = videoRef.current.videoHeight || 480;
      if (videoWidth > 0 && videoHeight > 0) {
        const initialPos = getRandomPosition(
          videoWidth,
          videoHeight,
          squarePosition.size
        );
        setSquarePosition({
          ...initialPos,
          size: Math.min(200, Math.min(videoWidth, videoHeight) * 0.4),
        });
        setIsInitializing(false);
      }
    }
  };

  const onCanPlayHandler = () => {
    // Safari sometimes fires this instead of onLoadedMetadata
    if (isInitializing && videoRef.current) {
      const videoWidth = videoRef.current.videoWidth || 640;
      const videoHeight = videoRef.current.videoHeight || 480;
      if (videoWidth > 0 && videoHeight > 0) {
        setIsInitializing(false);
      }
    }
  };

  return {
    videoRef,
    canvasRef,
    streamRef,
    animationFrameRef,
    isInitializingRef,
    squarePosition,
    isCapturing,
    error,
    isInitializing,
    handleContinue,
    setSquarePosition,
    setIsCapturing,
    setError,
    setIsInitializing,
    onLoadedMetadataHandler,
    onCanPlayHandler,
  };
};
