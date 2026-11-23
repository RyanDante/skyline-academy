import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { palette } from '@/theme/tokens';

export type AiPersona = 'tutor' | 'skyler';

/**
 * AI avatars from the Tutor mockup: GCE Tutor is an open book on turquoise; Skyler is a
 * compass on an orange ring. Swap for the illustrated characters when they arrive.
 */
export function AiAvatar({ persona, size = 64 }: { persona: AiPersona; size?: number }) {
  const tutor = persona === 'tutor';
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tutor ? palette.teal : palette.tealDeep,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: tutor ? 0 : Math.max(3, size * 0.08),
        borderColor: tutor ? 'transparent' : palette.orange,
      }}
    >
      <Ionicons name={tutor ? 'book' : 'compass'} size={size * 0.5} color={palette.white} />
    </View>
  );
}
