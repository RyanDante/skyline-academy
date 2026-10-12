import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Line icon per GCE subject (design brief, image slot 9). Matched on the subject name. */
const ICONS: [RegExp, IconName][] = [
  [/math/i, 'calculator-outline'],
  [/physics/i, 'magnet-outline'],
  [/chemistry/i, 'flask-outline'],
  [/biology/i, 'leaf-outline'],
  [/computer|ict/i, 'laptop-outline'],
  [/geograph/i, 'earth-outline'],
  [/econom/i, 'trending-up-outline'],
  [/history/i, 'time-outline'],
  [/english|literature|french/i, 'book-outline'],
];

export function subjectIcon(name: string): IconName {
  return ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? 'school-outline';
}
