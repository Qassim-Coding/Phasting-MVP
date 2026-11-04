import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme';

type Props = {
  size: number;
  stroke: number;
  fraction: number; // 0 à 1
  color?: string;
  track?: string;
  children?: React.ReactNode; // contenu centré dans l'anneau
};

export function ProgressRing({
  size,
  stroke,
  fraction,
  color = colors.emerald,
  track = colors.track,
  children,
}: Props) {
  const c = size / 2;
  const r = c - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const f = Math.max(0, Math.min(1, fraction));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {f > 0 && (
          <Circle
            cx={c}
            cy={c}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference * f} ${circumference}`}
            rotation={-90}
            origin={`${c}, ${c}`}
          />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 4 },
});
