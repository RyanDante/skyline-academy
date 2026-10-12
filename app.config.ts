import type { ConfigContext, ExpoConfig } from 'expo/config';

import buildFlags from './build-flags.js';

/**
 * Firebase native config files are not committed. Download them from the Firebase console
 * (see README). Without them, Firebase is left out of the build and the app runs in demo mode.
 */
const { hasAndroidFirebase, hasIosFirebase, firebaseConfigured, androidGoogleServices, iosGoogleServices } =
  buildFlags;

if (process.env.EXPO_PUBLIC_USE_MOCKS === 'false' && !firebaseConfigured) {
  throw new Error(
    'Live builds require Firebase native config. Add GOOGLE_SERVICES_JSON and GOOGLE_SERVICES_PLIST to the EAS production environment, or enable demo mode with EXPO_PUBLIC_USE_MOCKS=true.',
  );
}

/** From `eas init`: https://expo.dev/accounts/ryandantedaemon/projects/skyline-academy */
const EAS_PROJECT_ID = '3fbbf9ac-0a4f-4c95-bb73-00b9e324acde';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Skyline Academy',
  slug: 'skyline-academy',
  scheme: 'skyline',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.skylineacademy.app',
    supportsTablet: false,
    googleServicesFile: hasIosFirebase ? iosGoogleServices : undefined,
    infoPlist: {
      NSCameraUsageDescription: 'Skyline uses the camera so you can snap a question for the Tutor.',
      NSPhotoLibraryUsageDescription: 'Skyline lets you pick a photo of a question for the Tutor.',
    },
  },
  android: {
    package: 'com.skylineacademy.app',
    googleServicesFile: hasAndroidFirebase ? androidGoogleServices : undefined,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0A7375',
    },
    permissions: ['CAMERA'],
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-font',
    'expo-sharing',
    [
      'expo-splash-screen',
      { image: './assets/images/splash.png', backgroundColor: '#0A7375', imageWidth: 180 },
    ],
    [
      'expo-image-picker',
      { photosPermission: 'Skyline lets you pick a photo of a question for the Tutor.' },
    ],
    ...(firebaseConfigured ? ['@react-native-firebase/app', '@react-native-firebase/auth'] : []),
    [
      'expo-build-properties',
      {
        ios: { useFrameworks: 'static' },
        android: { minSdkVersion: 24 },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  owner: 'ryandantedaemon',
  extra: { eas: { projectId: EAS_PROJECT_ID } },
});
