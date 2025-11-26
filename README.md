# Custom CAPTCHA - MeldXC

A custom CAPTCHA implementation built with React 19, TypeScript, Vite, and Tailwind CSS. This project implements a multi-step visual CAPTCHA system that uses camera-based verification with shape recognition.

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
- [Anti-Automation Measures](#anti-automation-measures)
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
   cd Custom-captcha-meldxc
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
- Square overlay that randomly changes position
- Prevents automated tools from predicting capture position

✅ **Image Capture**
- Captures current frame when "Continue" button is clicked
- Locks square position at capture time
- Stores image data and square coordinates

✅ **Grid Overlay with Watermarks**
- Divides captured square area into 5x5 grid (25 sectors)
- Randomly assigns watermarks to half of the sectors
- Watermarks include shapes: triangle, square, or circle

✅ **Shape Selection Validation**
- User must select all sectors containing the target shape
- Target shape is randomly chosen from available watermarks
- Validates user selections against expected results

✅ **Validation Result**
- Displays pass/fail status
- Shows attempt count and required accuracy
- Provides retry option for failed attempts

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
- Interaction pattern tracking (mouse movements, click timing)
- Timing validation (prevents rapid automated clicks)
- Browser automation detection
- Random delays in validation process
- Obfuscated sector keys
