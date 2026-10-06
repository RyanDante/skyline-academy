import type { ConfigContext, ExpoConfig } from 'expo/config';

import buildFlags from './build-flags';

/**
 * Firebase native config files are not committed. Download them from the Firebase console
 * (see README). Without them, Firebase is left out of the build and the app runs in demo mode.
 */
const { hasAndroidFirebase, hasIosFirebase, firebaseConfigured, androidGoogleServices, iosGoogleServices } =
  buildFlags;

/** Set after `eas init` (README, "Build with EAS"). */
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID;

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
  extra: EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {},
});
