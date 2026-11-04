import React from 'react';
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { PHASES, TIPS } from '../data/phases';
import { C, ringSvg } from './ElapsedWidget';
import {
  DEFAULT_PROTOCOL_LABEL,
  type FastState,
  formatClock,
  formatClockWithDay,
  formatHM,
  formatMinutes,
  getPhase,
} from './fastState';

const BODY = '#CFE3D8';
const SOS = '#C9431F';

type Props = { fast: FastState; now: number; streak: number };

// Widget 4×4 : anneau, phase, ce que fait le corps, progression des 5 phases, accès direct à « J'ai envie de craquer ».
export function DetailWidget({ fast, now, streak }: Props) {
  const running = fast.startedAt !== null;
  const startedAt = fast.startedAt ?? now;
  const elapsed = running ? Math.max(0, now - startedAt) : 0;
  const targetMs = fast.targetHours * 3600000;
  const phase = getPhase(elapsed);
  const info = PHASES[phase.index];
  const label = fast.protocolLabel ?? DEFAULT_PROTOCOL_LABEL;
  // Une astuce différente toutes les 30 minutes (au rythme du rafraîchissement).
  const tip = TIPS[Math.floor(now / 1800000) % TIPS.length];

  const next =
    !running
      ? `Objectif ${fast.targetHours} h`
      : phase.nextName && phase.minutesToNext !== null
        ? `${phase.nextName} dans ${formatMinutes(phase.minutesToNext)}`
        : 'Objectif dépassé, bravo';

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: C.bg,
        borderRadius: 28,
        padding: 16,
        flexDirection: 'column',
      }}
    >
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextWidget text={`Phasting · ${label}`} style={{ fontSize: 12, color: C.muted }} />
        <TextWidget
          text={streak > 0 ? `Série ${streak} ${streak > 1 ? 'jours' : 'jour'}` : 'Lance ta série'}
          style={{ fontSize: 12, fontWeight: 'bold', color: C.mint }}
        />
      </FlexWidget>

      <FlexWidget style={{ height: 10, width: 1 }} />

      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center' }}>
        <OverlapWidget style={{ height: 96, width: 96 }}>
          <SvgWidget svg={ringSvg(running ? elapsed / targetMs : 0, 96, 9)} style={{ height: 96, width: 96 }} />
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
              style={{ fontSize: 21, fontWeight: 'bold', color: C.text }}
            />
            <TextWidget text={`sur ${fast.targetHours} h`} style={{ fontSize: 10, color: C.muted }} />
          </FlexWidget>
        </OverlapWidget>

        <FlexWidget style={{ width: 14, height: 1 }} />

        <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <TextWidget
            text={running ? `Phase ${phase.index + 1} sur ${PHASES.length}` : 'Prêt à commencer'}
            style={{ fontSize: 12, fontWeight: 'bold', color: C.mint }}
          />
          <TextWidget
            text={running ? info.name : 'Pas de jeûne en cours'}
            maxLines={2}
            style={{ fontSize: 17, fontWeight: 'bold', color: C.text }}
          />
          <TextWidget text={next} maxLines={1} style={{ fontSize: 12, color: C.muted }} />
        </FlexWidget>
      </FlexWidget>

      <FlexWidget style={{ height: 10, width: 1 }} />
      <FlexWidget style={{ height: 1, width: 'match_parent', backgroundColor: C.track }} />
      <FlexWidget style={{ height: 10, width: 1 }} />

      {running ? (
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
          <TextWidget text={`Ton corps · ${info.body}`} maxLines={3} style={{ fontSize: 12, color: BODY }} />
          <FlexWidget style={{ height: 6, width: 1 }} />
          <TextWidget text={`Tu gagnes · ${info.benefits[0]}`} maxLines={2} style={{ fontSize: 12, color: BODY }} />
          <FlexWidget style={{ height: 6, width: 1 }} />
          <TextWidget text={`Pour tenir · ${tip.title}. ${tip.text}`} maxLines={3} style={{ fontSize: 12, color: BODY }} />
        </FlexWidget>
      ) : (
        <TextWidget
          text="Ouvre Phasting et lance ton jeûne : ici, tu verras ta phase, ce que fait ton corps et de quoi tenir."
          maxLines={4}
          style={{ fontSize: 12, color: BODY }}
        />
      )}

      <FlexWidget style={{ flex: 1, width: 1 }} />

      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row' }}>
        {PHASES.map((p, i) => {
          const done = running && i < phase.index;
          const current = running && i === phase.index;
          const filled = Math.max(1, Math.round(phase.progress * 100));
          return (
            <FlexWidget
              key={p.name}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                marginHorizontal: 2,
                backgroundColor: done ? C.mint : C.track,
                flexDirection: 'row',
              }}
            >
              {current && (
                <FlexWidget style={{ flex: filled, height: 5, borderRadius: 3, backgroundColor: C.mint }} />
              )}
              {current && <FlexWidget style={{ flex: Math.max(1, 100 - filled), height: 5 }} />}
            </FlexWidget>
          );
        })}
      </FlexWidget>

      <FlexWidget style={{ height: 6, width: 1 }} />

      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextWidget
          text={running ? `Début ${formatClockWithDay(startedAt, now)}` : `Objectif ${fast.targetHours} h`}
          maxLines={1}
          style={{ fontSize: 11, color: C.muted }}
        />
        {running && (
          <TextWidget
            text={`Fin ${formatClockWithDay(startedAt + targetMs, now)}`}
            maxLines={1}
            style={{ fontSize: 11, color: C.muted }}
          />
        )}
        <TextWidget text={`Actualisé ${formatClock(now)}`} maxLines={1} style={{ fontSize: 11, color: C.muted }} />
      </FlexWidget>

      <FlexWidget style={{ height: 10, width: 1 }} />

      {running ? (
        <FlexWidget
          clickAction="OPEN_URI"
          clickActionData={{ uri: 'phasting://craquer' }}
          style={{
            width: 'match_parent',
            height: 42,
            borderRadius: 21,
            backgroundColor: SOS,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextWidget text="J’ai envie de craquer" style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }} />
        </FlexWidget>
      ) : (
        <FlexWidget
          clickAction="OPEN_APP"
          style={{
            width: 'match_parent',
            height: 42,
            borderRadius: 21,
            backgroundColor: '#0E7C5B',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextWidget text="Ouvrir Phasting" style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }} />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
