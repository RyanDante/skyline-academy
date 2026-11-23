/**
 * Key GCE dates shown on Home (from the web version's exam calendar). Placeholders until
 * Skyline confirms them against the GCE Board timetable for the session.
 */
export interface KeyDate {
  id: string;
  title: string;
  date: string; // ISO
  kind: 'gce' | 'concours';
}

export const GCE_KEY_DATES: KeyDate[] = [
  { id: 'gce-registration', title: 'GCE registration closes', date: '2027-01-15', kind: 'gce' },
  { id: 'gce-practicals', title: 'GCE science practicals', date: '2027-04-19', kind: 'gce' },
  { id: 'gce-written', title: 'GCE written papers start', date: '2027-05-10', kind: 'gce' },
  { id: 'gce-results', title: 'GCE results published', date: '2027-07-28', kind: 'gce' },
];
