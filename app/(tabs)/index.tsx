import React from 'react';
import { ScrollView } from 'react-native';

import { HomeFasting } from '../../components/HomeFasting';
import { HomeMeal } from '../../components/HomeMeal';
import { HomeReady } from '../../components/HomeReady';
import { TopBar } from '../../components/TopBar';
import { Screen } from '../../components/ui';
import { useFast } from '../../data/FastContext';

// Accueil : choisit l'un des trois états selon la situation.
//  1. un jeûne est en cours            -> HomeFasting
//  2. le dernier jeûne est fini et la fenêtre de repas est encore ouverte -> HomeMeal
//  3. sinon                            -> HomeReady
export default function HomeScreen() {
  const { ready, fast, lastRecord, protocol, now } = useFast();

  if (!ready) return <Screen />;

  const inMealWindow =
    lastRecord !== null &&
    protocol.eatHours > 0 &&
    now - lastRecord.endedAt < protocol.eatHours * 3600000;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <TopBar />
        {fast.startedAt !== null ? (
          <HomeFasting />
        ) : inMealWindow && lastRecord ? (
          <HomeMeal record={lastRecord} />
        ) : (
          <HomeReady />
        )}
      </ScrollView>
    </Screen>
  );
}
