import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useNetwork } from '@/hooks/useNetwork';
import { useThemeColors } from '@/theme/tokens';

import { Text, type TextProps } from '../ui/Text';
import { latexToUnicode, renderInlineMath } from './latex';

/** Body text with inline `$...$` maths rendered as Unicode. */
export function MathText({ children, ...props }: Omit<TextProps, 'children'> & { children: string }) {
  const rendered = useMemo(() => renderInlineMath(children), [children]);
  return <Text {...props}>{rendered}</Text>;
}

const KATEX_VERSION = '0.16.22';

/**
 * Display maths typeset with KaTeX in a WebView. Falls back to the Unicode rendering offline
 * or while loading. Use sparingly: one WebView per block.
 */
export function MathBlock({ tex }: { tex: string }) {
  const { isOffline } = useNetwork();
  const colors = useThemeColors();
  const [height, setHeight] = useState(44);
  const [failed, setFailed] = useState(false);

  const html = useMemo(
    () => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js"></script>
<style>html,body{margin:0;padding:0;background:transparent;color:${colors.ink};font-size:17px}</style></head>
<body><div id="m"></div><script>
try{katex.render(${JSON.stringify(tex)},document.getElementById('m'),{displayMode:true,throwOnError:false});}
catch(e){document.getElementById('m').textContent=${JSON.stringify(tex)};}
window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
</script></body></html>`,
    [tex, colors.ink],
  );

  if (isOffline || failed) {
    return (
      <Text variant="lead" className="font-body-medium">
        {latexToUnicode(tex)}
      </Text>
    );
  }

  return (
    <View style={{ height }} accessibilityLabel={latexToUnicode(tex)}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        scrollEnabled={false}
        style={{ backgroundColor: 'transparent' }}
        onMessage={(e) => setHeight(Math.max(32, Number(e.nativeEvent.data) || 44))}
        onError={() => setFailed(true)}
      />
    </View>
  );
}
