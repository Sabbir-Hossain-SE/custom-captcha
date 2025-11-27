# Custom CAPTCHA

A modern, secure CAPTCHA implementation built with React 19, TypeScript, Vite, and Tailwind CSS. This project implements a multi-step visual CAPTCHA system that uses camera-based verification with shape and color recognition, featuring advanced anti-automation measures.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Requirements](#requirements)
- [Installation](#installation)
- [Development](#development)
- [Features](#features)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Task Implementation Details](#task-implementation-details)
- [Enhancement Plan](#enhancement-plan)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 9.0.0 or higher) or **yarn** (version 1.22.0 or higher)
- **Modern web browser** with camera access support (Chrome, Firefox, Safari, Edge)
- **Camera/Webcam** for CAPTCHA verification

### System Requirements

- Operating System: macOS, Windows, or Linux
- RAM: Minimum 4GB (8GB recommended)
- Disk Space: At least 500MB free space

## Requirements

### Technology Stack

- **React**: v19.2.0
- **TypeScript**: ~5.9.3
- **Vite**: ^7.2.4 (Build tool and dev server)
- **Tailwind CSS**: ^4.1.17 (Styling)
- **ESLint**: ^9.39.1 (Code linting)
- **Prettier**: ^3.6.2 (Code formatting)
- **Vitest**: Testing framework
- **@testing-library/react**: React testing utilities

### Browser Requirements

- Chrome/Edge: Version 90+
- Firefox: Version 88+
- Safari: Version 14+
- Opera: Version 76+

**Note**: Camera access requires HTTPS in production (or localhost for development).

## Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd custom-captcha
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm run dev
   ```
   The application should start on `http://localhost:5173`

## Development

### Start Development Server

```bash
npm run dev
```

The development server will start on `http://localhost:5173` with hot module replacement (HMR) enabled.

### Code Formatting

Format code using Prettier:

```bash
npm run format
```

### Linting

Check code for linting errors:

```bash
npm run lint
```

### Running Tests

Run the test suite:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test -- --watch
```

Run tests with UI:

```bash
npm run test:ui
```

## Features

### Task 1: Custom CAPTCHA Component (Required)

✅ **Video Stream with Moving Square**

- Displays live video feed from user's front-facing camera
- Square overlay that randomly changes position every 500-1000ms
- Prevents automated tools from predicting capture position
- Optimized initialization with loading states
- Smooth video playback with minimal black screen time

✅ **Image Capture**

- Captures current frame when "Continue" button is clicked
- Locks square position at capture time
- Stores image data and square coordinates
- Uses Canvas API for high-quality image capture

✅ **Grid Overlay with Watermarks**

- Divides captured square area into 5x5 grid (25 sectors)
- Randomly assigns watermarks to half of the sectors (12-13 sectors)
- Watermarks include shapes: triangle, square, or circle
- SVG-based grid overlay for precise alignment
- Interactive sector selection with visual feedback

✅ **Shape Selection Validation**

- User must select all sectors containing the target shape
- Target shape is randomly chosen from available watermarks
- Validates user selections against expected results
- Accounts for both correct selections and false positives
- Real-time selection count display

✅ **Validation Result**

- Displays pass/fail status with clear visual feedback
- Shows attempt count and required accuracy
- Provides retry option for failed attempts
- Progressive difficulty with decreasing tolerance

### Task 2: Color Tints (Optional - Implemented)

✅ **Color Tints on Watermarks**

- Watermarks can have one of three color tints: red, green, or blue
- Color assignment is randomized
- Validation requires matching both shape AND color

### Task 3: Error Workflow (Optional - Implemented)

✅ **Retry Mechanism**

- Users can retry failed CAPTCHA attempts
- Maximum of 3 attempts allowed
- Decreasing tolerance with each attempt:
  - Attempt 1: 90% accuracy required
  - Attempt 2: 80% accuracy required
  - Attempt 3: 70% accuracy required
  - Minimum: 50% accuracy required

✅ **Progressive Difficulty**

- Tolerance decreases with each failed attempt
- Blocks further attempts after maximum reached
- Provides clear feedback on attempt status

### Anti-Automation Protection

✅ **Multiple Protection Layers**

- **Interaction Pattern Tracking**: Monitors mouse movements and click patterns to detect bot-like behavior
- **Timing Validation**: Prevents rapid automated clicks with minimum delay requirements
- **Browser Automation Detection**: Detects common automation tools (Selenium, Puppeteer, etc.)
- **Random Delays**: Adds unpredictable delays to validation process
- **Obfuscated Sector Keys**: Uses encrypted/hashed keys instead of predictable patterns (e.g., `"0-0"` → `"456789-123456-7890"`)
- **Session-Based Obfuscation**: Each CAPTCHA session uses unique seed for key generation
- **Suspicious Pattern Detection**: Flags consistent timing patterns and linear mouse movements

## Project Structure

```
custom-captcha/
├── public/                        # Static assets
│   └── vite.svg
├── src/
│   ├── components/                # React components
│   │   ├── CustomCaptcha.component.tsx      # Main CAPTCHA orchestrator
│   │   ├── CaptchaStepOne.component.tsx      # Step 1: Take Selfie
│   │   ├── CaptchaStepTwo.component.tsx     # Step 2: Select Shapes
│   │   ├── CaptchaResult.component.tsx      # Step 3: Validation Result
│   │   ├── ShapeGenerator.component.tsx     # Shape rendering component
│   │   └── __tests__/                       # Component tests
│   ├── hooks/                     # Custom React hooks
│   │   ├── useCustomCaptcha.hook.ts         # Main CAPTCHA state management
│   │   ├── useCaptchaStepOne.hook.ts        # Camera & capture logic
│   │   └── useCaptchaStepTwo.hook.ts        # Grid & selection logic
│   ├── utils/                     # Utility functions
│   │   └── index.ts                        # Anti-automation & helpers
│   ├── interfaces/                 # TypeScript interfaces
│   │   ├── index.ts                        # Type definitions
│   │   └── __tests__/                      # Interface tests
│   ├── types/                      # Type definitions
│   │   └── index.ts                        # Shape & color types
│   ├── constants/                  # Constants
│   │   └── index.ts                        # Tolerance & config values
│   ├── test/                       # Test setup
│   │   └── setup.ts                        # Vitest configuration
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles (Tailwind)
├── eslint.config.js                # ESLint configuration
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── vite.config.ts                   # Vite & Vitest configuration
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json                # App-specific TS config
├── tsconfig.node.json               # Node-specific TS config
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

## Architecture

### Component Hierarchy

```
App
└── CustomCaptcha (orchestrator)
    ├── CaptchaStepOne (camera & capture)
    │   └── useCaptchaStepOne (camera logic, video stream, capture)
    ├── CaptchaStepTwo (grid & selection)
    │   └── useCaptchaStepTwo (grid rendering, selection handling)
    └── CaptchaResult (validation display)
        └── useCustomCaptcha (state management, validation logic)
```

### Hook Responsibilities

**useCustomCaptcha:**

- Manages overall CAPTCHA state (step, watermarks, selections, attempts)
- Handles image capture callback
- Implements validation logic with tolerance calculation
- Manages obfuscated key mapping
- Provides retry and reset functionality

**useCaptchaStepOne:**

- Handles camera stream initialization
- Manages video element and stream lifecycle
- Implements moving square animation
- Captures image and square position
- Optimized for both StrictMode and non-StrictMode

**useCaptchaStepTwo:**

- Calculates grid dimensions based on captured image
- Manages sector selection with obfuscated keys
- Handles anti-automation checks (timing, interaction tracking)
- Renders grid overlay and watermarks
- Memoizes expensive computations

## Usage

### Basic Usage

1. **Start the application:**

   ```bash
   npm run dev
   ```

2. **Grant camera permissions** when prompted by your browser

3. **Follow the CAPTCHA steps:**
   - **Step 1**: Wait for the square to move, then click "Continue" to capture your selfie
   - **Step 2**: Select all sectors containing the target shape (and color if applicable)
   - **Step 3**: View validation result

### Integration Example

```tsx
import { CustomCaptcha } from './components/CustomCaptcha.component';

function App() {
  return <CustomCaptcha />;
}
```

### Component API

The `CustomCaptcha` component manages the entire CAPTCHA flow internally:

- **Step 1**: Camera initialization and image capture
- **Step 2**: Shape/color selection with grid overlay
- **Step 3**: Validation result display

No props required - the component is self-contained.

## Testing

### Test Coverage

The project includes automated tests for:

- Component rendering and basic functionality
- Anti-automation utilities
- Interaction tracking
- Timing validation

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

**Note**: Tests do not attempt to solve the CAPTCHA programmatically, as per requirements.

## Building for Production

### Build Command

```bash
npm run build
```

This will:

1. Type-check the TypeScript code
2. Build the application for production
3. Output files to the `dist/` directory

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Task Implementation Details

### Task 1: Core CAPTCHA Functionality

**Video Stream Implementation:**

- Uses `navigator.mediaDevices.getUserMedia()` API
- Requests front-facing camera (`facingMode: 'user'`)
- Displays video stream in real-time
- Optimized for both StrictMode and non-StrictMode environments
- Handles video element mounting timing issues
- Loading overlay prevents black screen during initialization

**Moving Square Algorithm:**

- Random position generation using time-based and random factors
- Updates every 500-1000ms with random intervals
- Position calculated to stay within video bounds
- Uses `requestAnimationFrame` for smooth animation
- Only updates state when position actually changes (performance optimization)

**Grid Overlay:**

- 5x5 grid (25 sectors total)
- 12-13 sectors randomly selected for watermarks
- Grid lines drawn using SVG overlay
- Scales correctly based on captured image dimensions
- Interactive sectors with hover effects

**Validation Logic:**

- Calculates accuracy: `(correct selections - false positives) / total expected`
- Compares against tolerance threshold
- Accounts for both correct selections and false positives
- Uses obfuscated keys for sector tracking
- Reverse mapping for validation

### Task 2: Color Tints

**Implementation:**

- Each watermark can have: `red`, `green`, or `blue` tint
- Color randomly assigned during watermark initialization
- Validation requires matching both shape and color
- Color tints applied via SVG filters and overlays
- ShapeGenerator component handles shape and color rendering

### Task 3: Error Workflow

**Tolerance Calculation:**

```typescript
const INITIAL_TOLERANCE = 0.9; // 90%
const TOLERANCE_DECREASE = 0.1; // -10% per attempt
const MIN_TOLERANCE = 0.5; // 50% minimum
```

**Attempt Tracking:**

- Maximum 3 attempts allowed
- Tolerance decreases: 90% → 80% → 70% → 50% (minimum)
- User blocked after maximum attempts reached

## Performance Optimizations

✅ **Implemented Optimizations:**

- **React.memo**: Components wrapped to prevent unnecessary re-renders
- **useCallback**: Event handlers memoized with stable dependencies
- **useMemo**: Expensive computations (grid rendering, watermark mapping) cached
- **Refs for Non-Render Values**: Uses refs for values that don't need to trigger re-renders
- **Optimized Animation Loop**: Only updates state when position actually changes
- **Lazy Initialization**: Refs initialized lazily to avoid creating instances on every render
- **Batched State Updates**: Multiple state updates batched together
- **Obfuscated Key Mapping**: Uses Map for O(1) lookups instead of O(n) array searches

## Code Quality

✅ **Best Practices:**

- TypeScript for type safety
- ESLint for code quality
- Prettier for consistent formatting
- Comprehensive test coverage
- Proper error handling
- Clean component architecture
- Separation of concerns (hooks, components, utils)

## Enhancement Plan

- Use open-source tools and libraries (OpenCV, Dlib & Face Recognition Libraries) for detecting whether a video feed is a live, real-time recording or a spoofing attempt (like a pre-recorded video or a photo)
- Server-side validation for production use
- Rate limiting implementation
- Additional accessibility features
- Mobile device optimization
- Progressive Web App (PWA) support

## Troubleshooting

### Camera Access Issues

**Problem**: Camera permission denied

**Solutions:**

- Check browser permissions settings
- Ensure you're using HTTPS (or localhost)
- Try a different browser
- Check if another application is using the camera

### Grid Overlay Not Aligned

**Problem**: Grid lines don't align with sectors

**Solution:**

- Refresh the page and try again
- Ensure browser window is not zoomed
- Check browser console for errors

### Tests Failing

**Problem**: Tests fail with camera-related errors

**Solution:**

- Tests mock camera access - ensure mocks are properly configured
- Run tests with `--no-coverage` flag if coverage is causing issues

### Build Errors

**Problem**: TypeScript errors during build

**Solutions:**

- Run `npm run lint` to identify issues
- Ensure all dependencies are installed: `npm install`
- Check TypeScript version compatibility

### Styling Issues

**Problem**: Tailwind classes not applying

**Solutions:**

- Ensure Tailwind is properly configured in `tailwind.config.js`
- Check that `index.css` includes Tailwind directives
- Restart the dev server after configuration changes

## Browser Compatibility

| Browser | Version | Status             |
| ------- | ------- | ------------------ |
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |
| Opera   | 76+     | ✅ Fully Supported |

## Security Considerations

1. **HTTPS Required**: Camera access requires HTTPS in production (or localhost for development)
2. **No Image Storage**: Captured images are not stored on the server - only processed client-side
3. **Client-Side Validation**: All validation happens client-side (consider server-side validation for production)
4. **Obfuscated Keys**: Sector keys are obfuscated to prevent pattern recognition by automation tools
5. **Anti-Automation Measures**: Multiple layers of protection against bots and automation
6. **Rate Limiting**: Consider implementing server-side rate limiting for production use
7. **Session-Based Security**: Each CAPTCHA session uses unique obfuscation seed

## Anti-Automation Features Explained

### Obfuscated Sector Keys

Instead of using predictable keys like `"0-0"`, `"0-1"`, the system uses obfuscated keys:

- **Simple Key**: `"0-0"` (row-col format)
- **Obfuscated Key**: `"456789-123456-7890"` (hash-based, session-specific)

This prevents automation tools from:

- Predicting sector patterns
- Programmatically selecting sectors
- Replaying the same pattern across sessions

### Interaction Tracking

- **Mouse Movement Analysis**: Tracks mouse paths to detect linear/robotic movements
- **Click Timing Analysis**: Detects consistent timing patterns (robots often have perfect timing)
- **Suspicious Pattern Detection**: Flags interactions that suggest automation

### Timing Validation

- Minimum delay between actions (100ms)
- Random delays in validation process
- Prevents rapid automated submissions

## License

This project is created for demonstration purposes.

## Contributing

This is a test project. For production use, consider:

- Server-side validation
- Rate limiting
- Additional security measures
- Accessibility improvements
- Mobile optimization

## Support

For issues or questions:

1. Check the Troubleshooting section
2. Review browser console for errors
3. Ensure all prerequisites are met
4. Verify camera permissions are granted

---

## Development Notes

### StrictMode Compatibility

The application is optimized to work both with and without React StrictMode:

- Handles video element mounting timing
- Proper ref initialization and cleanup
- State management that works in both environments

### Performance Considerations

- Animation uses `requestAnimationFrame` for smooth 60fps updates
- Grid rendering is memoized to prevent unnecessary recalculations
- Watermark lookups use Map for O(1) performance
- State updates are batched to minimize re-renders

### Browser Compatibility Notes

- **Safari**: Requires special handling for video initialization
- **Chrome/Firefox**: Full feature support
- **Mobile**: Responsive design with touch support

---

**--Statement of Confession: This documentation write using AI--**
