import React from 'react';

export type ShineVariant = 'indigo' | 'cyan' | 'purple' | 'blue' | 'emerald';

interface CardReflectiveShineProps {
  variant?: ShineVariant;
  rounded?: string;
  hasHoverSweep?: boolean;
}

const variantGradients: Record<
  ShineVariant,
  {
    cornerHighlight: string;
    cornerHighlightHover: string;
    topRimSpecular: string;
    topRimSpecularHover: string;
    borderAccent: string;
  }
> = {
  indigo: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.035)_0%,transparent_60%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(129,140,248,0.07)_0%,transparent_60%)]',
    topRimSpecular: 'via-white/12',
    topRimSpecularHover: 'group-hover:via-white/25',
    borderAccent: 'border-white/[0.07] group-hover:border-indigo-400/20',
  },
  blue: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.035)_0%,transparent_60%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(96,165,250,0.07)_0%,transparent_60%)]',
    topRimSpecular: 'via-white/12',
    topRimSpecularHover: 'group-hover:via-white/25',
    borderAccent: 'border-white/[0.07] group-hover:border-blue-400/20',
  },
  purple: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.035)_0%,transparent_60%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(192,132,252,0.07)_0%,transparent_60%)]',
    topRimSpecular: 'via-white/12',
    topRimSpecularHover: 'group-hover:via-white/25',
    borderAccent: 'border-white/[0.07] group-hover:border-purple-400/20',
  },
  emerald: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.035)_0%,transparent_60%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(45,212,191,0.07)_0%,transparent_60%)]',
    topRimSpecular: 'via-white/12',
    topRimSpecularHover: 'group-hover:via-white/25',
    borderAccent: 'border-white/[0.07] group-hover:border-teal-400/20',
  },
  cyan: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.035)_0%,transparent_60%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.07)_0%,transparent_60%)]',
    topRimSpecular: 'via-white/12',
    topRimSpecularHover: 'group-hover:via-white/25',
    borderAccent: 'border-white/[0.07] group-hover:border-cyan-400/20',
  },
};

export const CardReflectiveShine: React.FC<CardReflectiveShineProps> = ({
  variant = 'indigo',
  rounded = 'rounded-2xl',
  hasHoverSweep = false,
}) => {
  const g = variantGradients[variant];

  return (
    <>
      {/* ── 1. Natural Specular Top Rim (Subtle micro glass reflection) ───────── */}
      <div
        className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${g.topRimSpecular} ${g.topRimSpecularHover} to-transparent pointer-events-none z-20 transition-all duration-300`}
      />

      {/* ── 2. Interior Subtle Ambient Reflection ── */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 ${rounded} ${g.cornerHighlight} ${g.cornerHighlightHover} transition-all duration-300`}
      />

      {/* ── 3. Optional Subtle Light Sheen on Hover (Off by default for natural look) ─ */}
      {hasHoverSweep && (
        <div
          className={`absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none z-10 ${rounded}`}
        />
      )}
    </>
  );
};
