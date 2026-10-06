import { useEffect, useState } from 'react';

/** Milliseconds remaining until `endsAt`, ticking every second. Null when there is no deadline. */
export function useCountdown(endsAt: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return endsAt === null ? null : Math.max(0, endsAt - now);
}
