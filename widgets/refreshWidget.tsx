import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { ElapsedWidget } from './ElapsedWidget';
import type { FastState } from './fastState';

// Force le widget à se redessiner tout de suite (sinon Android attend ~30 min).
export async function refreshWidget(fast: FastState): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await requestWidgetUpdate({
      widgetName: 'Elapsed',
      renderWidget: () => <ElapsedWidget fast={fast} now={Date.now()} />,
      widgetNotFound: () => {},
    });
  } catch {
    // pas de widget posé : rien à faire
  }
}
