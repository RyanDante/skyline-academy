const STOP_WORDS = new Set(
  'a an the of and or to in on at is are was were be by for with what which how find calculate show that this its it'.split(
    ' ',
  ),
);

/** Same tokeniser as the app (src/domain/search.ts). Stored as `keywords` on every question. */
export function keywords(text: string): string[] {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
    ),
  ];
}
