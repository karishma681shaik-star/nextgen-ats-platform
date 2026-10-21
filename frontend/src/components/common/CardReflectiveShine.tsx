import React from 'react';

export type ShineVariant = 'indigo' | 'cyan' | 'purple' | 'blue' | 'emerald';
export type ShineIntensity = 'hero' | 'standard' | 'compact';

export interface CardReflectiveShineProps {
  variant?: ShineVariant;
  rounded?: string;
  hasHoverSweep?: boolean;
  /** When true, renders the studio-grade top-edge illumination with corner glow and fading sides */
  topIllumination?: boolean;
  /** Controls scale of illumination: hero for large cards, standard for metric cards, compact for small capsules */
  intensity?: ShineIntensity;
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

interface TopIlluminationPalette {
  hairlineCenter: string;
  hairlineFade: string;
  hairlineGlow: string;
  ambientLight: string;
  cornerGlow: string;
  borderTopLeft: string;
  borderTopCenter: string;
  borderTopMid: string;
  borderTopRight: string;
  borderTopFade: string;
  borderSideTop: string;
  borderSideMid: string;
  beamGlow: string;
}

const topIlluminationPalettes: Record<ShineVariant, TopIlluminationPalette> = {
  indigo: {
    hairlineCenter: '#ffffff',
    hairlineFade: 'rgba(216, 180, 254, 0.90)',
    hairlineGlow: '0 0 10px rgba(167, 139, 250, 0.45), 0 1px 4px rgba(56, 189, 248, 0.3)',
    ambientLight: 'radial-gradient(60% 100% at 50% 0%, rgba(147, 112, 250, 0.12) 0%, rgba(56, 189, 248, 0.03) 50%, transparent 100%)',
    cornerGlow: 'rgba(167, 139, 250, 0.10)',
    borderTopLeft: 'rgba(192, 132, 252, 0.45)',
    borderTopCenter: 'rgba(255, 255, 255, 0.95)',
    borderTopMid: 'rgba(168, 85, 247, 0.85)',
    borderTopRight: 'rgba(56, 189, 248, 0.70)',
    borderTopFade: 'rgba(34, 211, 238, 0.25)',
    borderSideTop: 'rgba(192, 132, 252, 0.55)',
    borderSideMid: 'rgba(129, 140, 248, 0.18)',
    beamGlow: 'rgba(192, 132, 252, 0.55)',
  },
  purple: {
    hairlineCenter: '#ffffff',
    hairlineFade: 'rgba(233, 213, 255, 0.90)',
    hairlineGlow: '0 0 10px rgba(192, 132, 252, 0.45), 0 1px 4px rgba(168, 85, 247, 0.3)',
    ambientLight: 'radial-gradient(60% 100% at 50% 0%, rgba(168, 85, 247, 0.12) 0%, rgba(147, 51, 234, 0.04) 50%, transparent 100%)',
    cornerGlow: 'rgba(192, 132, 252, 0.10)',
    borderTopLeft: 'rgba(216, 180, 254, 0.45)',
    borderTopCenter: 'rgba(255, 255, 255, 0.95)',
    borderTopMid: 'rgba(192, 132, 252, 0.85)',
    borderTopRight: 'rgba(147, 112, 250, 0.70)',
    borderTopFade: 'rgba(168, 85, 247, 0.25)',
    borderSideTop: 'rgba(216, 180, 254, 0.55)',
    borderSideMid: 'rgba(168, 85, 247, 0.18)',
    beamGlow: 'rgba(216, 180, 254, 0.55)',
  },
  blue: {
    hairlineCenter: '#ffffff',
    hairlineFade: 'rgba(191, 219, 254, 0.90)',
    hairlineGlow: '0 0 10px rgba(129, 140, 248, 0.45), 0 1px 4px rgba(59, 130, 246, 0.3)',
    ambientLight: 'radial-gradient(60% 100% at 50% 0%, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.04) 50%, transparent 100%)',
    cornerGlow: 'rgba(129, 140, 248, 0.10)',
    borderTopLeft: 'rgba(167, 139, 250, 0.45)',
    borderTopCenter: 'rgba(255, 255, 255, 0.95)',
    borderTopMid: 'rgba(129, 140, 248, 0.85)',
    borderTopRight: 'rgba(56, 189, 248, 0.70)',
    borderTopFade: 'rgba(96, 165, 250, 0.25)',
    borderSideTop: 'rgba(191, 219, 254, 0.55)',
    borderSideMid: 'rgba(96, 165, 250, 0.18)',
    beamGlow: 'rgba(129, 140, 248, 0.55)',
  },
  cyan: {
    hairlineCenter: '#ffffff',
    hairlineFade: 'rgba(165, 243, 252, 0.90)',
    hairlineGlow: '0 0 10px rgba(34, 211, 238, 0.45), 0 1px 4px rgba(6, 182, 212, 0.3)',
    ambientLight: 'radial-gradient(60% 100% at 50% 0%, rgba(34, 211, 238, 0.10) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 100%)',
    cornerGlow: 'rgba(34, 211, 238, 0.09)',
    borderTopLeft: 'rgba(168, 85, 247, 0.45)',
    borderTopCenter: 'rgba(255, 255, 255, 0.95)',
    borderTopMid: 'rgba(34, 211, 238, 0.85)',
    borderTopRight: 'rgba(103, 232, 249, 0.70)',
    borderTopFade: 'rgba(56, 189, 248, 0.25)',
    borderSideTop: 'rgba(165, 243, 252, 0.55)',
    borderSideMid: 'rgba(34, 211, 238, 0.18)',
    beamGlow: 'rgba(34, 211, 238, 0.55)',
  },
  emerald: {
    hairlineCenter: '#ffffff',
    hairlineFade: 'rgba(167, 243, 208, 0.90)',
    hairlineGlow: '0 0 10px rgba(52, 211, 153, 0.45), 0 1px 4px rgba(16, 185, 129, 0.3)',
    ambientLight: 'radial-gradient(60% 100% at 50% 0%, rgba(16, 185, 129, 0.10) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 100%)',
    cornerGlow: 'rgba(52, 211, 153, 0.09)',
    borderTopLeft: 'rgba(167, 139, 250, 0.40)',
    borderTopCenter: 'rgba(255, 255, 255, 0.95)',
    borderTopMid: 'rgba(52, 211, 153, 0.85)',
    borderTopRight: 'rgba(34, 211, 238, 0.65)',
    borderTopFade: 'rgba(16, 185, 129, 0.25)',
    borderSideTop: 'rgba(167, 243, 208, 0.55)',
    borderSideMid: 'rgba(16, 185, 129, 0.18)',
    beamGlow: 'rgba(52, 211, 153, 0.55)',
  },
};

export const CardReflectiveShine: React.FC<CardReflectiveShineProps> = ({
  variant = 'indigo',
  rounded = 'rounded-2xl',
  hasHoverSweep = false,
  topIllumination = false,
  intensity = 'standard',
}) => {
  const g = variantGradients[variant];

  // Standard lightweight ambient shine
  if (!topIllumination) {
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

        {/* ── 3. Optional Subtle Light Sheen on Hover ── */}
        {hasHoverSweep && (
          <div
            className={`absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none z-10 ${rounded}`}
          />
        )}
      </>
    );
  }

  // Ultra-premium top-edge illumination effect
  const p = topIlluminationPalettes[variant] || topIlluminationPalettes.indigo;

  // Responsive hairline inset and ambient height tailored to card scale
  const hairlineInset =
    intensity === 'hero'
      ? 'inset-x-8 sm:inset-x-14'
      : intensity === 'compact'
      ? 'inset-x-2 sm:inset-x-4'
      : 'inset-x-4 sm:inset-x-8';

  const ambientHeight =
    intensity === 'hero' ? 'h-20' : intensity === 'compact' ? 'h-7' : 'h-14';

  const cornerSize =
    intensity === 'hero'
      ? 'w-24 h-24'
      : intensity === 'compact'
      ? 'w-10 h-10'
      : 'w-16 h-16';

  return (
    <>
      {/* ── 1. Precision Gradient Border: luminous top edge, soft corner highlights, gentle side fade ── */}
      <div
        className={`candidate-card-border-glow ${rounded}`}
        style={{
          background: `
            radial-gradient(75% 100% at 50% 0%, ${p.borderTopCenter} 0%, ${p.borderTopMid} 30%, ${p.borderTopRight} 60%, ${p.borderTopFade} 85%, transparent 100%) border-box,
            linear-gradient(90deg, ${p.borderTopLeft} 0%, ${p.borderTopMid} 28%, ${p.borderTopCenter} 50%, ${p.borderTopRight} 75%, ${p.borderTopFade} 100%) border-box,
            linear-gradient(180deg, ${p.borderSideTop} 0%, ${p.borderSideMid} 15%, transparent 45%) border-box
          `,
        }}
      />

      {/* ── 2. Razor-Thin Specular Hairline Rim along the Top Edge ── */}
      <div
        className={`absolute top-0 ${hairlineInset} h-[1px] pointer-events-none z-20`}
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${p.hairlineFade} 25%, ${p.hairlineCenter} 50%, ${p.hairlineFade} 75%, transparent 100%)`,
          boxShadow: p.hairlineGlow,
        }}
      />

      {/* ── 3. Soft Ambient Studio Light Diffusion Spilling Downward ── */}
      <div
        className={`absolute top-0 inset-x-0 ${ambientHeight} pointer-events-none z-10 ${rounded}`}
        style={{
          background: p.ambientLight,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />

      {/* ── 4. Polished Upper Corner Sheen (Upper-Left & Upper-Right) ── */}
      <div
        className={`absolute top-0 left-0 ${cornerSize} pointer-events-none z-10 ${rounded}`}
        style={{
          background: `radial-gradient(circle at 0% 0%, ${p.cornerGlow} 0%, transparent 70%)`,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopRightRadius: 0,
        }}
      />
      <div
        className={`absolute top-0 right-0 ${cornerSize} pointer-events-none z-10 ${rounded}`}
        style={{
          background: `radial-gradient(circle at 100% 0%, ${p.cornerGlow} 0%, transparent 70%)`,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: 0,
        }}
      />

      {/* ── 5. Slow-Moving Elegant Specular Reflection Beam (Respects reduced motion) ── */}
      <div
        className="candidate-card-specular-beam pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 30%, #ffffff 50%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)`,
          filter: `drop-shadow(0 0 6px ${p.beamGlow})`,
        }}
      />

      {/* ── 6. Subtle Ambient Interior Base ── */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 ${rounded} ${g.cornerHighlight} transition-all duration-300`}
      />

      {/* ── 7. Optional Subtle Hover Sweep ── */}
      {hasHoverSweep && (
        <div
          className={`absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none z-10 ${rounded}`}
        />
      )}
    </>
  );
};

