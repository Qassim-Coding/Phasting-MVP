import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { colors } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tab(title: string, icon: IconName) {
  return {
    title,
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <Ionicons name={icon} size={size} color={color} />
    ),
  };
}

// Barre du bas : Jeûne · Calendrier · Stats · Notes
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emeraldText,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: 64, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen name="index" options={tab('Jeûne', 'hourglass-outline')} />
      <Tabs.Screen name="calendrier" options={tab('Calendrier', 'calendar-outline')} />
      <Tabs.Screen name="stats" options={tab('Stats', 'stats-chart-outline')} />
      <Tabs.Screen name="notes" options={tab('Notes', 'document-text-outline')} />
    </Tabs>
  );
}
