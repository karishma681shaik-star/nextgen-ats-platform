import React from 'react';

export type ShineVariant = 'indigo' | 'cyan' | 'purple' | 'blue' | 'emerald';

interface CardReflectiveShineProps {
  variant?: ShineVariant;
  intensity?: 'subtle' | 'normal' | 'vibrant';
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
  }
> = {
  indigo: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.09)_0%,transparent_65%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.16)_0%,transparent_65%)]',
    topRimSpecular: 'via-white/15',
    topRimSpecularHover: 'group-hover:via-indigo-200/35',
  },
  blue: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.09)_0%,transparent_65%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.16)_0%,transparent_65%)]',
    topRimSpecular: 'via-white/15',
    topRimSpecularHover: 'group-hover:via-blue-200/35',
  },
  purple: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.09)_0%,transparent_65%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.16)_0%,transparent_65%)]',
    topRimSpecular: 'via-white/15',
    topRimSpecularHover: 'group-hover:via-purple-200/35',
  },
  emerald: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.09)_0%,transparent_65%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.16)_0%,transparent_65%)]',
    topRimSpecular: 'via-white/15',
    topRimSpecularHover: 'group-hover:via-teal-200/35',
  },
  cyan: {
    cornerHighlight: 'bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.09)_0%,transparent_65%)]',
    cornerHighlightHover: 'group-hover:bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.16)_0%,transparent_65%)]',
    topRimSpecular: 'via-white/15',
    topRimSpecularHover: 'group-hover:via-cyan-200/35',
  },
};

export const CardReflectiveShine: React.FC<CardReflectiveShineProps> = ({
  variant = 'indigo',
  rounded = 'rounded-2xl',
  hasHoverSweep = true,
}) => {
  const g = variantGradients[variant];

  return (
    <>
      {/* ── 1. Delicate Specular Top Rim (Fine glass edge reflection) ───────── */}
      <div
        className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${g.topRimSpecular} ${g.topRimSpecularHover} to-transparent pointer-events-none z-20 transition-all duration-300`}
      />

      {/* ── 2. Natural Ambient Corner Highlight (Originates smoothly from corner) ── */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 ${rounded} ${g.cornerHighlight} ${g.cornerHighlightHover} transition-all duration-300`}
      />

      {/* ── 3. Gentle Gliding Shimmer on Hover (Subtle, non-distracting) ───── */}
      {hasHoverSweep && (
        <div
          className={`absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none z-10 ${rounded}`}
        />
      )}
    </>
  );
};
