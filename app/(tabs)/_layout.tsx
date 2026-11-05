import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bodyFonts, colors } from '../../theme';

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
// Sur Android, l'app s'affiche derrière les boutons système (retour, accueil, applis récentes).
// La barre doit donc réserver cet espace : sa hauteur = 56 + hauteur des boutons système.
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emeraldText,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontFamily: bodyFonts.bold },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name="index" options={tab('Jeûne', 'hourglass-outline')} />
      <Tabs.Screen name="calendrier" options={tab('Calendrier', 'calendar-outline')} />
      <Tabs.Screen name="stats" options={tab('Stats', 'stats-chart-outline')} />
      <Tabs.Screen name="notes" options={tab('Notes', 'document-text-outline')} />
    </Tabs>
  );
}
