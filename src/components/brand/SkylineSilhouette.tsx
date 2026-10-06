import Svg, { Line, Path } from 'react-native-svg';

import { palette, useThemeColors } from '@/theme/tokens';

/** Building tops as [x, y] steps across a 360×48 box; lower y = taller building. */
const TOPS: [number, number][] = [
  [0, 34], [22, 34], [22, 22], [36, 22], [36, 28], [58, 28], [58, 10], [70, 10], [70, 24],
  [96, 24], [96, 16], [116, 16], [116, 30], [140, 30], [140, 6], [152, 6], [152, 20],
  [178, 20], [178, 14], [200, 14], [200, 32], [226, 32], [226, 18], [246, 18], [246, 26],
  [270, 26], [270, 8], [282, 8], [282, 22], [306, 22], [306, 30], [330, 30], [330, 20],
  [348, 20], [348, 34], [360, 34],
];

const PATH = `M0 48 L${TOPS.map(([x, y]) => `${x} ${y}`).join(' L')} L360 48 Z`;

interface Props {
  height?: number;
  /** Silhouette fill; defaults to the hero silhouette colour. */
  color?: string;
  /** Draw the orange horizon line along the base. */
  horizon?: boolean;
}

/** The Skyline motif: a city line with an orange horizon, used on Home and the splash. */
export function SkylineSilhouette({ height = 40, color, horizon = true }: Props) {
  const colors = useThemeColors();
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 360 48"
      preserveAspectRatio="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path d={PATH} fill={color ?? colors.heroSilhouette} />
      {horizon ? <Line x1="0" y1="47" x2="360" y2="47" stroke={palette.orange} strokeWidth={2.5} /> : null}
    </Svg>
  );
}
