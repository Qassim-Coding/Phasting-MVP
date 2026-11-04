import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { DetailWidget } from './DetailWidget';
import { ElapsedWidget } from './ElapsedWidget';
import type { FastState } from './fastState';
import { loadStreak } from './widgetData';

// Force les widgets à se redessiner tout de suite (sinon Android attend ~30 min).
export async function refreshWidget(fast: FastState): Promise<void> {
  if (Platform.OS !== 'android') return;
  const now = Date.now();
  try {
    await requestWidgetUpdate({
      widgetName: 'Elapsed',
      renderWidget: () => <ElapsedWidget fast={fast} now={now} />,
      widgetNotFound: () => {},
    });
  } catch {
    // pas de widget posé : rien à faire
  }
  try {
    const streak = await loadStreak(now);
    await requestWidgetUpdate({
      widgetName: 'Detail',
      renderWidget: () => <DetailWidget fast={fast} now={now} streak={streak} />,
      widgetNotFound: () => {},
    });
  } catch {
    // pas de widget posé : rien à faire
  }
}
