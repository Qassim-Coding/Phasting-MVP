import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { initAds } from '../data/ads';
import { FastProvider } from '../data/FastContext';
import { initReminders } from '../data/reminders';

// L'écran de démarrage reste affiché tant que les polices ne sont pas prêtes.
SplashScreen.preventAutoHideAsync();

// Racine : charge les polices, puis le FastProvider donne à tous les écrans accès au jeûne, au protocole et à l'historique.
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    // En cas d'erreur de chargement, on affiche quand même l'app avec la police du système.
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Prépare les pubs (et le message de consentement RGPD) une fois au démarrage. Sans effet dans Expo Go.
  useEffect(() => {
    initAds();
  }, []);

  // Prépare les notifications de phase (canal Android, affichage quand l'app est ouverte). Sans effet dans Expo Go.
  useEffect(() => {
    initReminders();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <FastProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="protocole" />
        <Stack.Screen name="mon-jeune" />
        <Stack.Screen name="reglages-widget" />
        <Stack.Screen name="rappels" />
        <Stack.Screen name="craquer" options={{ presentation: 'modal' }} />
        <Stack.Screen name="nouvelle-note" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ajouter-poids" options={{ presentation: 'modal' }} />
      </Stack>
    </FastProvider>
  );
}
