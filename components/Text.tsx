import React from 'react';
import { Text as RNText, StyleSheet, type TextProps } from 'react-native';

import { bodyFontFor } from '../theme';

// Remplace le Text de React Native : applique Manrope partout, sauf là où une police est donnée (titres en Fraunces).
// Avec une police personnalisée, Android ne sait pas « grossir » le texte tout seul :
// on choisit donc le bon fichier (400, 600, 700, 800) d'après le fontWeight, puis on annule le fontWeight.
export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const fontFamily = flat.fontFamily ?? bodyFontFor(flat.fontWeight);
  return <RNText {...props} style={[style, { fontFamily, fontWeight: 'normal' }]} />;
}
