import { CaptchaStepOne } from './CaptchaStepOne.component';
import { CaptchaStepTwo } from './CaptchaStepTwo.component';
import { CaptchaResult } from './CaptchaResult.component';

import { useCustomCaptcha } from '../hooks/useCustomCaptcha.hook';

export const CustomCaptcha: React.FC = () => {
  const { captchaState, handleImageCapture } = useCustomCaptcha();
  // Render appropriate step component
  if (captchaState.step === 1) {
    return <CaptchaStepOne onCapture={handleImageCapture} />;
  }

  if (captchaState.step === 2) {
    return <CaptchaStepTwo />;
  }

  if (captchaState.step === 3) {
    return <CaptchaResult />;
  }

  return null;
};
