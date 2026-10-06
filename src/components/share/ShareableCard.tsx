import * as Sharing from 'expo-sharing';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { palette } from '@/theme/tokens';

import { Logo } from '../brand/Logo';
import { SkylineSilhouette } from '../brand/SkylineSilhouette';
import { Text } from '../ui/Text';

export interface ShareableCardHandle {
  share: () => Promise<void>;
}

interface ShareableCardProps {
  headline: string;
  detail: string;
  footer?: string;
}

/**
 * A branded image card (result, milestone, admission) captured with view-shot and shared to
 * WhatsApp or anywhere else. Every share is a small ad for Skyline.
 */
export const ShareableCard = forwardRef<ShareableCardHandle, ShareableCardProps>(function ShareableCard(
  { headline, detail, footer = 'Practise free with Skyline Academy' },
  ref,
) {
  const viewRef = useRef<View>(null);

  useImperativeHandle(ref, () => ({
    share: async () => {
      const uri = await captureRef(viewRef, { format: 'png', quality: 0.95 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your result' });
      }
    },
  }));

  return (
    <View ref={viewRef} collapsable={false} className="overflow-hidden rounded-card" style={{ backgroundColor: palette.tealDeep }}>
      <View className="gap-2 p-5">
        <Logo onDark />
        <Text variant="title" className="mt-3 text-white">
          {headline}
        </Text>
        <Text variant="body" className="text-brand-soft">
          {detail}
        </Text>
        <Text variant="caption" className="mt-2 text-white/80">
          {footer}
        </Text>
      </View>
      <SkylineSilhouette height={28} color={palette.teal} />
    </View>
  );
});
