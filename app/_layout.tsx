import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { FastProvider } from '../data/FastContext';

// Racine : le FastProvider donne à tous les écrans accès au jeûne, au protocole et à l'historique.
export default function RootLayout() {
  return (
    <FastProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="protocole" />
        <Stack.Screen name="mon-jeune" />
        <Stack.Screen name="craquer" options={{ presentation: 'modal' }} />
      </Stack>
    </FastProvider>
  );
}
