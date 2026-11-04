import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { DetailWidget } from './DetailWidget';
import { ElapsedWidget } from './ElapsedWidget';
import { loadFast } from './fastState';
import { loadStreak } from './widgetData';

// Android appelle cette fonction quand un widget est posé, mis à jour ou redimensionné.
// Elle lit l'état du jeûne et dessine le bon widget d'après son nom (celui d'app.json).
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const now = Date.now();
      const fast = await loadFast();
      if (props.widgetInfo.widgetName === 'Detail') {
        const streak = await loadStreak(now);
        props.renderWidget(<DetailWidget fast={fast} now={now} streak={streak} />);
      } else {
        props.renderWidget(<ElapsedWidget fast={fast} now={now} />);
      }
      break;
    }
    default:
      break;
  }
}

export default widgetTaskHandler;
