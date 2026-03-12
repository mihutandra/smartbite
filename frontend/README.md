# SmartBite Mobile App

This is the frontend for Smartbite React Native mobile application built with Expo, designed for connecting supermarkets with consumers to sell near-expiry products at discounted prices, helping stores reduce waste while making food more affordable.

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: Custom components with Expo Vector Icons
- **Backend Integration**: Connects to a FastAPI backend (located in `../backend/`)
- **Development Tools**: ESLint, TypeScript compiler

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device (iOS/Android)

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npx expo start
   ```

### Running with Expo Go

Expo Go is the easiest way to test your app during development without building native code:

1. After running `npx expo start`, you'll see a QR code in the terminal.
2. Open the **Expo Go** app on your phone.
3. Scan the QR code displayed in the terminal.
   - On iOS: Use the camera app to scan.
   - On Android: Tap "Scan QR Code" in Expo Go.
4. The app will load and run on your device with hot reloading enabled.

**Alternative options**:

- **Emulator/Simulator**: Select options in the terminal to open in Android Studio emulator or iOS Simulator.
- **Web**: Run `npm run web` to test in a browser (limited functionality).
- **Development Build**: For advanced features, create a custom dev client with `npx expo run:android` or `npx expo run:ios`.
- **Running on WSL**: Run `npx expo start --tunnel` so your physical device can reach the dev server

## Project Structure

```
frontend/
├── app/            # Route files only — each file maps to a screen (Expo Router)
│   ├── _layout.tsx     # Root layout, wraps all routes (navigation shell)
│   └── index.tsx       # Entry screen (maps to "/")
├── components/     # Reusable UI components shared across screens
├── hooks/          # Custom React hooks (e.g., useAuth, useFetch)
├── services/       # API calls and data fetching logic (e.g., api.ts, authService.ts)
├── utils/          # Pure helper/utility functions (e.g., formatDate, validators)
├── types/          # Shared TypeScript types and interfaces
├── constants/      # App-wide constants (e.g., colors, config values, API URLs)
├── assets/         # Static files: images, fonts, icons
└── scripts/        # Developer utility scripts (e.g., reset-project.js)
```
