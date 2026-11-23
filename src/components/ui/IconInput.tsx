import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState, type ComponentProps } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/tokens';

import { Text } from './Text';

interface IconInputProps extends TextInputProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Used as the accessibility label and placeholder. */
  label: string;
  /** Adds a show/hide toggle (passwords). */
  secret?: boolean;
  error?: string | null;
  className?: string;
}

/** Rounded input with a leading line icon (sign-up and sign-in mockups). */
export const IconInput = forwardRef<TextInput, IconInputProps>(function IconInput(
  { icon, label, secret, error, className, ...props },
  ref,
) {
  const colors = useThemeColors();
  const [hidden, setHidden] = useState(true);
  return (
    <View className={cn('gap-1', className)}>
      <View
        className={cn(
          'h-14 flex-row items-center gap-3 rounded-control border bg-surface px-4',
          error ? 'border-danger' : 'border-line',
        )}
      >
        <Ionicons name={icon} size={22} color={colors.brandDeep} />
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholder={label}
          placeholderTextColor={colors.muted}
          secureTextEntry={secret ? hidden : undefined}
          className="flex-1 font-body text-body text-ink"
          {...props}
        />
        {secret ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" className="text-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
