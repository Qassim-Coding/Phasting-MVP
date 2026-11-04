import React from 'react';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { colors } from '../theme';

type Props = {
  values: number[]; // du plus ancien au plus récent
  width: number;
  height: number;
  color?: string;
};

// Petite courbe sans axes. Rien n'est dessiné avec moins de 2 valeurs.
export function Sparkline({ values, width, height, color = colors.emerald }: Props) {
  if (values.length < 2) return null;

  const pad = 5;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => ({
    x: pad + i * stepX,
    y: pad + (1 - (v - min) / span) * (height - pad * 2),
  }));
  const last = pts[pts.length - 1];

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={last.x} cy={last.y} r={4} fill={color} />
    </Svg>
  );
}
