/**
 * Build-time switches shared by app.config.ts, metro.config.js and react-native.config.js.
 *
 * - Firebase is "configured" when its native config files exist. Without them (demo builds),
 *   Firebase native code is left out of the build and its JS is replaced by src/stubs/firebase.js.
 * - EXPO_GO=1 previews the app in Expo Go, which also lacks react-native-pdf.
 */
const { existsSync } = require('fs');
const path = require('path');

const root = __dirname;
const androidGoogleServices = path.resolve(root, process.env.GOOGLE_SERVICES_JSON || './google-services.json');
const iosGoogleServices = path.resolve(root, process.env.GOOGLE_SERVICES_PLIST || './GoogleService-Info.plist');

const hasAndroidFirebase = existsSync(androidGoogleServices);
const hasIosFirebase = existsSync(iosGoogleServices);

module.exports = {
  androidGoogleServices,
  iosGoogleServices,
  hasAndroidFirebase,
  hasIosFirebase,
  firebaseConfigured: hasAndroidFirebase || hasIosFirebase,
  expoGo: process.env.EXPO_GO === '1',
  firebasePackages: [
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@react-native-firebase/firestore',
    '@react-native-firebase/functions',
    '@react-native-firebase/storage',
  ],
};
