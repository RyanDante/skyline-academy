const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const { expoGo, firebaseConfigured } = require('./build-flags');

const config = getDefaultConfig(__dirname);

/**
 * Packages whose native code isn't in the binary are swapped for stand-ins in src/stubs:
 * - Firebase when there are no Firebase config files (demo builds) or in Expo Go.
 * - react-native-pdf in Expo Go only.
 * Both cases run in demo mode (EXPO_PUBLIC_USE_MOCKS=true), which never calls Firebase.
 */
const stubFirebase = expoGo || !firebaseConfigured;
const stubPdf = expoGo;

if (stubFirebase || stubPdf) {
  const firebaseStub = path.resolve(__dirname, 'src/stubs/firebase.js');
  const pdfStub = path.resolve(__dirname, 'src/stubs/pdf.js');
  const upstream = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (stubFirebase && moduleName.startsWith('@react-native-firebase/')) {
      return { type: 'sourceFile', filePath: firebaseStub };
    }
    if (stubPdf && moduleName === 'react-native-pdf') {
      return { type: 'sourceFile', filePath: pdfStub };
    }
    return upstream
      ? upstream(context, moduleName, platform)
      : context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = withNativeWind(config, { input: './global.css' });
