import type { CapturedImage } from '../interfaces';
import { useCaptchaStepOne } from '../hooks/useCaptchaStepOne.hook';

interface CaptchaStepOneProps {
  onCapture: (capturedImage: CapturedImage) => void;
}

export const CaptchaStepOne: React.FC<CaptchaStepOneProps> = ({
  onCapture,
}) => {
  const {
    videoRef,
    canvasRef,
    squarePosition,
    isCapturing,
    error,
    isInitializing,
    handleContinue,
    onLoadedMetadataHandler,
    onCanPlayHandler,
  } = useCaptchaStepOne(onCapture);
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Loading...</h2>
          <p className="text-gray-700">Initializing camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        {/* Title */}
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Take Selfie
        </h2>

        {/* Video container with overlay */}
        <div className="relative mb-6 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
            style={{ display: 'block' }}
            onLoadedMetadata={onLoadedMetadataHandler}
            onCanPlay={onCanPlayHandler}
          />

          {/* Moving square overlay */}
          <div
            className="absolute border-2 border-white pointer-events-none"
            style={{
              left: `${squarePosition.x}px`,
              top: `${squarePosition.y}px`,
              width: `${squarePosition.size}px`,
              height: `${squarePosition.size}px`,
              boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={isCapturing || isInitializing}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors uppercase"
        >
          {isCapturing ? 'Capturing...' : 'Continue'}
        </button>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
