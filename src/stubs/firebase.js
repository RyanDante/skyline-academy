/**
 * Stand-in for every @react-native-firebase/* package when the app runs in Expo Go
 * (see metro.config.js). Expo Go doesn't contain Firebase's native code, so the real packages
 * can't load there. Demo mode never calls Firebase; if something does, it fails clearly.
 */
const unavailable = (name) => () => {
  throw new Error(`Firebase (${String(name)}) is not available in Expo Go. Use a development build.`);
};

module.exports = new Proxy(
  {},
  {
    get(_target, key) {
      if (key === '__esModule') return true;
      return unavailable(key);
    },
  },
);
