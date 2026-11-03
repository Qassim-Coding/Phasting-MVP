import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { ElapsedWidget } from './ElapsedWidget';
import { loadFast } from './fastState';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const fast = await loadFast();
      props.renderWidget(<ElapsedWidget fast={fast} now={Date.now()} />);
      break;
    }
    default:
      break;
  }
}