/**
 * Converts the small LaTeX subset used in GCE question stems into Unicode so it renders in a
 * plain <Text>: fast, offline, and no WebView per formula. Anything it can't handle is left as-is;
 * use <MathBlock> for genuinely complex display maths.
 */

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', x: 'ˣ',
};

const SUBSCRIPT: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', n: 'ₙ',
};

const COMMANDS: Record<string, string> = {
  '\\int': '∫', '\\sum': 'Σ', '\\prod': 'Π', '\\sqrt': '√', '\\times': '×', '\\cdot': '·',
  '\\div': '÷', '\\pm': '±', '\\infty': '∞', '\\leq': '≤', '\\geq': '≥', '\\neq': '≠',
  '\\approx': '≈', '\\to': '→', '\\rightarrow': '→', '\\pi': 'π', '\\theta': 'θ', '\\alpha': 'α',
  '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\Delta': 'Δ', '\\lambda': 'λ', '\\mu': 'μ',
  '\\omega': 'ω', '\\Omega': 'Ω', '\\sigma': 'σ', '\\rho': 'ρ', '\\phi': 'φ', '\\degree': '°',
  '\\circ': '°', '\\left': '', '\\right': '', '\\,': ' ', '\\;': ' ', '\\!': '', '\\quad': '  ',
};

/** Longest first, so "\rightarrow" wins over "\right". */
const COMMAND_KEYS = Object.keys(COMMANDS).sort((a, b) => b.length - a.length);

const mapChars =(text: string, table: Record<string, string>) => {
  const mapped = [...text].map((c) => table[c]);
  return mapped.every(Boolean) ? mapped.join('') : null;
};

/** Reads `{...}` or a single character after position `i`; returns [content, nextIndex]. */
function readGroup(src: string, i: number): [string, number] {
  if (src[i] === '{') {
    let depth = 1;
    let j = i + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') depth--;
      j++;
    }
    return [src.slice(i + 1, j - 1), j];
  }
  return [src[i] ?? '', i + 1];
}

export function latexToUnicode(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;

    if (ch === '\\') {
      if (src.startsWith('\\frac', i)) {
        const [num, a] = readGroup(src, i + 5);
        const [den, b] = readGroup(src, a);
        const n = latexToUnicode(num);
        const d = latexToUnicode(den);
        out += `${n.length > 1 && /[+\-\s]/.test(n) ? `(${n})` : n}/${d.length > 1 && /[+\-\s]/.test(d) ? `(${d})` : d}`;
        i = b;
        continue;
      }
      if (src.startsWith('\\sqrt{', i)) {
        const [inner, next] = readGroup(src, i + 5);
        const body = latexToUnicode(inner);
        out += body.length > 1 ? `√(${body})` : `√${body}`;
        i = next;
        continue;
      }
      const match = COMMAND_KEYS.find(
        (cmd) =>
          src.startsWith(cmd, i) &&
          // "\pi" must not match the start of "\pitchfork"; symbol commands like "\," always match.
          (!/[a-zA-Z]$/.test(cmd) || !/[a-zA-Z]/.test(src[i + cmd.length] ?? '')),
      );
      if (match) {
        out += COMMANDS[match];
        i += match.length;
        continue;
      }
      out += ch;
      i++;
      continue;
    }

    if (ch === '^' || ch === '_') {
      const [group, next] = readGroup(src, i + 1);
      const inner = latexToUnicode(group);
      const mapped = mapChars(inner, ch === '^' ? SUPERSCRIPT : SUBSCRIPT);
      out += mapped ?? (ch === '^' ? `^(${inner})` : `_(${inner})`);
      i = next;
      continue;
    }

    if (ch === '{' || ch === '}') {
      i++;
      continue;
    }

    out += ch;
    i++;
  }
  return out.replace(/\s{2,}/g, ' ');
}

/** Splits text on `$...$` and converts the maths segments. */
export function renderInlineMath(text: string): string {
  return text.replace(/\$([^$]+)\$/g, (_, tex: string) => latexToUnicode(tex));
}
