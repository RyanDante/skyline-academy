export function formatCFA(amount: number): string {
  return `${amount.toLocaleString('en-US').replace(/,/g, ' ')} CFA`;
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** "2024" when the range is a single year, otherwise "2015–2024". */
export function formatYearRange([from, to]: [number, number]): string {
  return from === to ? String(from) : `${from}–${to}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
