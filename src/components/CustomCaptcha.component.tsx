import { CaptchaStepOne } from './CaptchaStepOne.component';
import { CaptchaStepTwo } from './CaptchaStepTwo.component';
import { CaptchaResult } from './CaptchaResult.component';

import { useCustomCaptcha } from '../hooks/useCustomCaptcha.hook';

export const CustomCaptcha: React.FC = () => {
  const {
    captchaState,
    handleImageCapture,
    handleSectorToggle,
    handleValidation,
    handleReset,
    handleRetry,
  } = useCustomCaptcha();

  // Render appropriate step component
  if (captchaState.step === 1) {
    return <CaptchaStepOne onCapture={handleImageCapture} />;
  }

  if (captchaState.step === 2) {
    return (
      <CaptchaStepTwo
        capturedImage={captchaState.capturedImage!}
        watermarks={captchaState.watermarks}
        targetShape={captchaState.targetShape}
        targetColor={captchaState.targetColor}
        selectedSectors={captchaState.selectedSectors}
        onSectorToggle={handleSectorToggle}
        onValidate={handleValidation}
        gridSize={captchaState.gridSize}
        sectorKeyMapping={captchaState.sectorKeyMapping}
      />
    );
  }

  if (captchaState.step === 3) {
    return (
      <CaptchaResult
        passed={captchaState.passed!}
        attempts={captchaState.attempts}
        maxAttempts={captchaState.maxAttempts}
        tolerance={captchaState.tolerance}
        onRetry={handleRetry}
        onReset={handleReset}
        canRetry={captchaState.attempts < captchaState.maxAttempts}
      />
    );
  }

  return null;
};
