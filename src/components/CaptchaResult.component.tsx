interface CaptchaResultProps {
  passed: boolean;
  attempts: number;
  maxAttempts: number;
  tolerance: number;
  onRetry: () => void;
  onReset: () => void;
  canRetry: boolean;
}

export const CaptchaResult: React.FC<CaptchaResultProps> = ({
  passed,
  attempts,
  maxAttempts,
  tolerance,
  onRetry,
  onReset,
  canRetry,
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Result icon and message */}
        <div className="text-center mb-6">
          {passed ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                Verification Successful
              </h2>
              <p className="text-gray-700">
                You have successfully completed the CAPTCHA verification.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-3xl font-bold text-red-600 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-700 mb-2">
                Your selections did not match the required criteria.
              </p>
              {!canRetry && (
                <p className="text-red-600 font-semibold">
                  Maximum attempts reached. Please try again later.
                </p>
              )}
            </>
          )}
        </div>

        {/* Attempts info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Attempts:</span>
            <span className="font-semibold">
              {attempts} / {maxAttempts}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Required Accuracy:</span>
            <span className="font-semibold">
              {Math.round(tolerance * 100)}%
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {passed ? (
            <button
              onClick={onReset}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start New Verification
            </button>
          ) : (
            <>
              {canRetry ? (
                <button
                  onClick={onRetry}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              ) : (
                <button
                  onClick={onReset}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Start Over
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
