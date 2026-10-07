import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'gce', title: 'GCE', icon: 'book-outline', iconActive: 'book' },
  { name: 'concours', title: 'Concours', icon: 'school-outline', iconActive: 'school' },
  { name: 'tutor', title: 'Tutor', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { name: 'me', title: 'Me', icon: 'person-outline', iconActive: 'person' },
];

/** Bottom bar height from the design brief (section 4.3), above the system inset. */
const BAR_HEIGHT = 64;

export default function TabsLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Frees the space above the keyboard for text fields.
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.brandDeep,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 0,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 12 },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <View className="items-center">
                {/* 4 dp teal indicator above the active icon. */}
                <View
                  className="mb-1.5 h-1 w-8 rounded-b-full"
                  style={{ backgroundColor: focused ? colors.brandDeep : 'transparent' }}
                />
                <Ionicons name={focused ? tab.iconActive : tab.icon} size={24} color={color} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
