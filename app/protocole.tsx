import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '../components/Text';
import { PrimaryButton, Screen } from '../components/ui';
import { useFast } from '../data/FastContext';
import { PROTOCOLS } from '../data/protocols';
import { colors, titleFont } from '../theme';

// Choix du protocole. Un jeûne déjà en cours garde son objectif.
export default function ProtocoleScreen() {
  const router = useRouter();
  const { protocol, chooseProtocol, fast } = useFast();
  const [selectedId, setSelectedId] = useState(protocol.id);
  const selected = PROTOCOLS.find((p) => p.id === selectedId) ?? protocol;

  return (
    <Screen bottom>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <View style={styles.head}>
          <Pressable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Ton protocole</Text>
        </View>

        {PROTOCOLS.map((p) => {
          const on = p.id === selectedId;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setSelectedId(p.id)}
              style={[styles.card, on && styles.cardOn]}
            >
              <View style={[styles.badge, on && { backgroundColor: colors.emerald }]}>
                <Text style={[styles.badgeText, on && { color: '#FFFFFF' }]}>{p.label}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.hours}>
                  {p.fastHours} h de jeûne{p.eatHours > 0 ? ` · ${p.eatHours} h de repas` : ''}
                </Text>
                <Text style={styles.note}>{p.note}</Text>
              </View>
              {on && <Ionicons name="checkmark-circle" size={22} color={colors.emerald} />}
            </Pressable>
          );
        })}

        {fast.startedAt !== null && (
          <Text style={styles.disclaimer}>Ton jeûne en cours garde son objectif actuel.</Text>
        )}

        <PrimaryButton
          label={`Choisir le ${selected.label}`}
          onPress={async () => {
            await chooseProtocol(selected.id);
            router.back();
          }}
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  back: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: titleFont, fontSize: 24, fontWeight: '600', color: colors.text },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.card,
  },
  cardOn: { borderColor: colors.emerald, backgroundColor: '#EAF6EF' },
  badge: {
    minWidth: 56,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.soft,
  },
  badgeText: { fontSize: 15, fontWeight: '800', color: colors.emeraldText },
  name: { fontSize: 15, fontWeight: '800', color: colors.text },
  hours: { fontSize: 12.5, fontWeight: '600', color: colors.muted },
  note: { fontSize: 12.5, color: colors.body },
  disclaimer: { fontSize: 11, lineHeight: 16, color: colors.muted, textAlign: 'center' },
});
