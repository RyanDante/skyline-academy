/**
 * Stand-in for react-native-pdf in Expo Go (see metro.config.js), which doesn't include its
 * native code. Shows a short message instead of the viewer.
 */
const React = require('react');
const { Text, View } = require('react-native');

function PdfUnavailable({ style }) {
  return React.createElement(
    View,
    { style: [{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, style] },
    React.createElement(
      Text,
      { style: { textAlign: 'center', fontSize: 15 } },
      'The PDF viewer needs a development build. It is not available in Expo Go.',
    ),
  );
}

module.exports = PdfUnavailable;
module.exports.default = PdfUnavailable;
