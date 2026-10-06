import { forwardRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/tokens';

import { Text } from './Text';

interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string | null;
  prefix?: string;
  className?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, hint, error, prefix, className, ...props },
  ref,
) {
  const colors = useThemeColors();
  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="label">{label}</Text>
      <View
        className={cn(
          'h-12 flex-row items-center rounded-control border bg-surface px-3',
          error ? 'border-danger' : 'border-line',
        )}
      >
        {prefix ? (
          <Text variant="body" className="mr-2 text-muted">
            {prefix}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          className="flex-1 font-body text-body text-ink"
          {...props}
        />
      </View>
      {error ? (
        <Text variant="caption" className="text-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
});
