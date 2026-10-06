const { firebaseConfigured, firebasePackages } = require('./build-flags');

/**
 * Without Firebase config files, Firebase's native modules are excluded from autolinking so a
 * demo build doesn't try to initialise Firebase on launch. Their JS is stubbed by metro.config.js.
 */
module.exports = {
  dependencies: firebaseConfigured
    ? {}
    : Object.fromEntries(firebasePackages.map((name) => [name, { platforms: { android: null, ios: null } }])),
};
