/** Collision-resistant client id (time-ordered prefix + random suffix). Good enough for attempt ids. */
export function createId(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${time}${rand}`;
}
