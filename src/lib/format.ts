export function formatCFA(amount: number): string {
  return `${amount.toLocaleString('en-US').replace(/,/g, ' ')} CFA`;
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
