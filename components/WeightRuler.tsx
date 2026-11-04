import React, { memo, useEffect, useRef, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Line, Text as SvgText } from 'react-native-svg';

import { colors } from '../theme';

// Règle graduée à faire glisser, comme dans Libra : une graduation = 0,1 kg.
// Le repère fixe au centre indique la valeur choisie.

const TICK = 14; // largeur entre deux graduations
const HEIGHT = 84;

const round1 = (n: number) => Math.round(n * 10) / 10;

type Props = {
  value: number;
  min: number; // entier, en kg
  max: number; // entier, en kg
  onChange: (value: number) => void;
};

// Les graduations ne changent jamais : on les dessine une seule fois.
const Ticks = memo(function Ticks({ min, count }: { min: number; count: number }) {
  const items: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    const tenths = min * 10 + i;
    const whole = tenths % 10 === 0;
    const half = tenths % 5 === 0;
    const x = i * TICK + 1;
    const h = whole ? 50 : half ? 34 : 22;
    items.push(
      <Line
        key={`l${i}`}
        x1={x}
        x2={x}
        y1={0}
        y2={h}
        stroke="#3C8F74"
        strokeWidth={whole ? 2.5 : 1.5}
        strokeLinecap="round"
      />,
    );
    if (whole) {
      items.push(
        <SvgText
          key={`t${i}`}
          x={x}
          y={74}
          fontSize={13}
          fontWeight="700"
          fill={colors.emeraldText}
          textAnchor="middle"
        >
          {String(tenths / 10)}
        </SvgText>,
      );
    }
  }
  return (
    <Svg width={(count - 1) * TICK + 2} height={HEIGHT}>
      {items}
    </Svg>
  );
});

export function WeightRuler({ value, min, max, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const lastValue = useRef(value);
  const placed = useRef(false);

  const count = Math.round((max - min) * 10) + 1;
  const offsetOf = (v: number) => Math.round((v - min) * 10) * TICK;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const k = Math.round(e.nativeEvent.contentOffset.x / TICK);
    const v = round1(min + Math.max(0, Math.min(count - 1, k)) / 10);
    if (v !== lastValue.current) {
      lastValue.current = v;
      onChange(v);
    }
  };

  // Quand la valeur change autrement qu'en faisant glisser (boutons − et +), on déplace la règle.
  useEffect(() => {
    if (width > 0 && Math.abs(value - lastValue.current) > 0.001) {
      lastValue.current = value;
      scrollRef.current?.scrollTo({ x: offsetOf(value), animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, width]);

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TICK}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          onContentSizeChange={() => {
            if (!placed.current) {
              placed.current = true;
              scrollRef.current?.scrollTo({ x: offsetOf(value), animated: false });
            }
          }}
          contentContainerStyle={{ paddingHorizontal: width / 2 }}
        >
          <Ticks min={min} count={count} />
        </ScrollView>
      )}
      <View pointerEvents="none" style={styles.marker} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: HEIGHT + 4,
    borderRadius: 20,
    backgroundColor: '#D7EFE3',
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 12,
    left: '50%',
    marginLeft: -2,
    width: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: colors.deep,
  },
});
