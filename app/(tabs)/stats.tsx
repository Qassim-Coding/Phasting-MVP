import React from 'react';
import { Text } from 'react-native';

import { Card, Screen } from '../../components/ui';
import { colors, titleFont } from '../../theme';

// Écran à venir : voir la maquette Stats (prochaine étape).
export default function StatsScreen() {
  return (
    <Screen style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontFamily: titleFont, fontSize: 24, fontWeight: '600', color: colors.text }}>Stats</Text>
      <Card>
        <Text style={{ color: colors.muted }}>Bientôt : durée moyenne, taux de réussite, évolution.</Text>
      </Card>
    </Screen>
  );
}
