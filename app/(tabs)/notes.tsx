import React from 'react';
import { Text } from 'react-native';

import { Card, Screen } from '../../components/ui';
import { colors, titleFont } from '../../theme';

// Écran à venir : voir la maquette Notes (prochaine étape).
export default function NotesScreen() {
  return (
    <Screen style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontFamily: titleFont, fontSize: 24, fontWeight: '600', color: colors.text }}>Notes</Text>
      <Card>
        <Text style={{ color: colors.muted }}>
          Bientôt : poids, avancées, doutes, victoires et « mon pourquoi ».
        </Text>
      </Card>
    </Screen>
  );
}
