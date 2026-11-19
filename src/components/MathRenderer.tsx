import React from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

export function formatMathString(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\int_([0-9a-zA-Z]+)\^([0-9a-zA-Z]+)/g, '∫_{$1}^{$2}')
    .replace(/\\int/g, '∫')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\times/g, ' × ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt/g, '√')
    .replace(/\\,/g, ' ')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^([0-9]+)/g, '⁽$1⁾')
    .replace(/_([0-9]+)/g, '₍$1₎')
    .replace(/\$/g, '');
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by $...$ to style math segments distinctly
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const inner = part.slice(1, -1);
          return (
            <span
              key={index}
              className="inline-block font-mono bg-cyan/15 text-brand-deep px-1.5 py-0.5 rounded text-[0.95em] mx-0.5 border border-cyan/30 font-medium"
            >
              {formatMathString(inner)}
            </span>
          );
        }
        return <span key={index}>{formatMathString(part)}</span>;
      })}
    </span>
  );
};
