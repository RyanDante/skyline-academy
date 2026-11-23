import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { subjectColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Icon and colour key per GCE subject (GCE mockup tiles). Matched on the subject name. */
const SUBJECTS: [RegExp, IconName, keyof typeof subjectColors][] = [
  [/further/i, 'grid', 'further'],
  [/math/i, 'calculator', 'maths'],
  [/physics/i, 'planet', 'physics'],
  [/chemistry/i, 'flask', 'chemistry'],
  [/biology/i, 'leaf', 'biology'],
  [/computer|ict/i, 'laptop', 'ict'],
  [/geograph/i, 'earth', 'default'],
  [/econom/i, 'trending-up', 'default'],
  [/history/i, 'time', 'default'],
  [/english|literature|french/i, 'book', 'default'],
];

function match(name: string) {
  return SUBJECTS.find(([pattern]) => pattern.test(name));
}

export function subjectIcon(name: string): IconName {
  return match(name)?.[1] ?? 'school';
}

export function subjectColor(name: string): { fg: string; bg: string } {
  return subjectColors[match(name)?.[2] ?? 'default']!;
}
