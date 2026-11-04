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

export const C = {
  bg: '#0C2E26',
  track: '#1F4A3E',
  mint: '#7FD6AE',
  text: '#EAF5EE',
  muted: '#A8C9BB',
} as const;

export function ringSvg(fraction: number, size: number, stroke: number): string {
  const c = size / 2;
  const r = c - stroke / 2;
  const f = Math.max(0, Math.min(1, fraction));
  const track = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${C.track}" stroke-width="${stroke}"/>`;
  let arc = '';
  if (f >= 0.999) {
    arc = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${C.mint}" stroke-width="${stroke}"/>`;
  } else if (f > 0) {
    const angle = f * 2 * Math.PI;
    const x = (c + r * Math.sin(angle)).toFixed(2);
    const y = (c - r * Math.cos(angle)).toFixed(2);
    const large = f > 0.5 ? 1 : 0;
    arc = `<path d="M ${c} ${c - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}" fill="none" stroke="${C.mint}" stroke-width="${stroke}" stroke-linecap="round"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${track}${arc}</svg>`;
}

type Props = { fast: FastState; now: number };

export function ElapsedWidget({ fast, now }: Props) {
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
        backgroundColor: C.bg,
        borderRadius: 28,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <OverlapWidget style={{ height: 112, width: 112 }}>
        <SvgWidget
          svg={ringSvg(running ? elapsed / targetMs : 0, 112, 10)}
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
            style={{ fontSize: 24, fontWeight: 'bold', color: C.text }}
          />
          <TextWidget
            text={`sur ${fast.targetHours} h`}
            style={{ fontSize: 11, color: C.muted }}
          />
        </FlexWidget>
      </OverlapWidget>

      <FlexWidget style={{ width: 14, height: 1 }} />

      <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        <TextWidget text={`Phasting · ${label}`} style={{ fontSize: 12, color: C.muted }} />
        <TextWidget text={title} style={{ fontSize: 17, fontWeight: 'bold', color: C.mint }} />
        <TextWidget text={line2} style={{ fontSize: 13, color: C.text }} />
        <TextWidget text={line3} style={{ fontSize: 12, color: C.muted }} />
        <TextWidget
          text={`Actualisé ${formatClock(now, true)}`}
          style={{ fontSize: 10, color: C.muted }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
