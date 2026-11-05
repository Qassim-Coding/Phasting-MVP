import React from 'react';
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import {
  DEFAULT_PROTOCOL_LABEL,
  type FastState,
  formatClock,
  formatClockWithDay,
  formatHM,
  formatMinutes,
  getPhase,
} from './fastState';
import { DEFAULT_WIDGET_SETTINGS, type WidgetSettings, paletteFor, ringSvg } from './widgetTheme';

type Props = { fast: FastState; now: number; settings?: WidgetSettings };

// Widget 4×2 : anneau, phase, début et fin. Les réglages (couleurs, lignes affichées) viennent de l'écran « Réglages du widget ».
export function ElapsedWidget({ fast, now, settings = DEFAULT_WIDGET_SETTINGS }: Props) {
  const P = paletteFor(settings);
  const running = fast.startedAt !== null;
  const startedAt = fast.startedAt ?? now;
  const elapsed = running ? Math.max(0, now - startedAt) : 0;
  const targetMs = fast.targetHours * 3600000;
  const phase = getPhase(elapsed);
  const label = fast.protocolLabel ?? DEFAULT_PROTOCOL_LABEL;

  const title = running ? phase.name : 'Pas de jeûne en cours';
  const line2 = !running
    ? 'Ouvre Phasting pour démarrer'
    : phase.nextName && phase.minutesToNext !== null
      ? `${phase.nextName} dans ${formatMinutes(phase.minutesToNext)}`
      : 'Objectif dépassé, bravo';
  const line3 = running
    ? `Début ${formatClockWithDay(startedAt, now)} → fin ${formatClockWithDay(startedAt + targetMs, now)}`
    : `Objectif ${fast.targetHours} h`;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: P.bg,
        borderRadius: 28,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <OverlapWidget style={{ height: 112, width: 112 }}>
        <SvgWidget
          svg={ringSvg(running ? elapsed / targetMs : 0, 112, settings.ringThickness, P)}
          style={{ height: 112, width: 112 }}
        />
        <FlexWidget
          style={{
            height: 'match_parent',
            width: 'match_parent',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text={running ? formatHM(elapsed) : '--:--'}
            style={{ fontSize: 24, fontWeight: 'bold', color: P.text }}
          />
          <TextWidget text={`sur ${fast.targetHours} h`} style={{ fontSize: 11, color: P.muted }} />
        </FlexWidget>
      </OverlapWidget>

      <FlexWidget style={{ width: 14, height: 1 }} />

      <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        <TextWidget text={`Phasting · ${label}`} style={{ fontSize: 12, color: P.muted }} />
        {(settings.showPhase || !running) && (
          <TextWidget text={title} style={{ fontSize: 17, fontWeight: 'bold', color: P.accent }} />
        )}
        {(settings.showNext || !running) && <TextWidget text={line2} style={{ fontSize: 13, color: P.text }} />}
        <TextWidget text={line3} style={{ fontSize: 12, color: P.muted }} />
        <TextWidget
          text={`Actualisé ${formatClock(now, settings.showSeconds)}`}
          style={{ fontSize: 10, color: P.muted }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
