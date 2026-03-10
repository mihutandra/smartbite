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

## Project Structure

- `app/` - Screens and routes (file-based routing with Expo Router)
- `components/` - Reusable UI components
- `assets/` - Images, fonts, and other static assets
- `constants/` - App constants and configuration
- `hooks/` - Custom React hooks
- `scripts/` - Utility scripts (e.g., project reset)

## Development

- Edit screens in the `app/` directory.
- Add components to `components/`.
- For backend API calls, update endpoints in `constants/` or relevant files.
- Run `npm run lint` to check code quality.

## Building for Production

When ready to release:

1. Install EAS CLI: `npm install -g @expo/eas-cli`
2. Build for platforms:
   - Android: `eas build --platform android`
   - iOS: `eas build --platform ios`
3. Submit to app stores using `eas submit`.

## Troubleshooting

- If Expo Go doesn't connect, ensure your device and computer are on the same Wi-Fi network.
- Clear Expo cache: `npx expo start --clear`
- Reset project for a clean start: `npm run reset-project`

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
