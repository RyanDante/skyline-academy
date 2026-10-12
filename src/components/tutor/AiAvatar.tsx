import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { palette } from '@/theme/tokens';

export type AiPersona = 'tutor' | 'skyler';

/**
 * Placeholder avatars until the illustrated characters arrive (design brief, image slot 4):
 * GCE Tutor on teal with a book, Skyler on indigo with a sky motif.
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
        backgroundColor: tutor ? palette.tealDeep : palette.indigo,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: tutor ? palette.cyan : palette.indigoSoft,
      }}
    >
      <Ionicons name={tutor ? 'book' : 'sparkles'} size={size * 0.45} color={palette.white} />
    </View>
  );
}
