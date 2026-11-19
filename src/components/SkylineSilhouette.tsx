import React from 'react';

export const SkylineSilhouette: React.FC<{ className?: string; height?: number }> = ({
  className = '',
  height = 70,
}) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height }}>
      {/* Buildings & Skyline shape */}
      <svg
        viewBox="0 0 800 120"
        preserveAspectRatio="none"
        className="w-full h-full text-brand/20 dark:text-brand/10 fill-current"
      >
        <path d="M0,120 L0,95 L25,95 L25,65 L45,65 L45,95 L70,95 L70,50 L85,35 L100,50 L100,95 L140,95 L140,75 L160,75 L160,55 L190,55 L190,95 L220,95 L220,40 L235,25 L250,40 L250,95 L290,95 L290,70 L320,70 L320,95 L360,95 L360,30 L375,15 L390,30 L390,95 L430,95 L430,60 L455,60 L455,95 L480,95 L480,45 L500,45 L500,95 L540,95 L540,70 L570,70 L570,95 L610,95 L610,35 L625,20 L640,35 L640,95 L680,95 L680,60 L710,60 L710,95 L750,95 L750,50 L770,50 L770,95 L800,95 L800,120 Z" />
      </svg>
      {/* Signature orange horizon line from design brief */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent" />
    </div>
  );
};
