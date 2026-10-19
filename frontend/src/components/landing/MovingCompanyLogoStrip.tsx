import React, { useState, useEffect } from 'react';

/* ============================================================
   ANIMATED ROLE TEXT (IMAGE 1 SPECIFICATION)
   Continuously rotates through:
   1. Managers
   2. Engineers
   3. Professionals
   4. Recruiters
   5. Candidates
   6. Developers
   with letter-by-letter typing and violet-to-magenta gradient
   ============================================================ */
const ROLES = [
  'Managers',
  'Engineers',
  'Professionals',
  'Recruiters',
  'Candidates',
  'Developers',
];

const AnimatedRoleText: React.FC = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor |
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Respect prefers-reduced-motion accessibility setting
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(ROLES[roleIndex]);
      const timer = setTimeout(() => {
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
      }, 3500);
      return () => clearTimeout(timer);
    }

    const currentWord = ROLES[roleIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase: type letter by letter
      if (displayText.length < currentWord.length) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 110);
      } else {
        // Full word typed: pause comfortably so user can read
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Deleting phase: backspace smoothly
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        }, 60);
      } else {
        // Completely deleted: advance to next role
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
        timer = setTimeout(() => {}, 300);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, prefersReducedMotion]);

  return (
    <span className="inline-flex items-center justify-center min-w-[240px] xs:min-w-[280px] sm:min-w-[380px] md:min-w-[480px] lg:min-w-[540px] text-center">
      <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#EC4899] bg-clip-text text-transparent font-medium">
        {displayText}
      </span>
      <span
        className={`inline-block w-[2.5px] sm:w-[3.5px] md:w-[4px] h-[0.9em] ml-1 bg-purple-400 rounded-xs align-baseline transition-opacity duration-150 ${
          cursorVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
    </span>
  );
};

/* ============================================================
   RECOGNIZABLE TECH BRAND LOGOS FOR HORIZONTAL MARQUEE
   Sized up to match Image 1 (25-32px icons, 23-30px text)
   ============================================================ */
interface Company {
  name: string;
  logo: React.ReactNode;
}

const COMPANIES: Company[] = [
  {
    name: 'Microsoft',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z" />
      </svg>
    ),
  },
  {
    name: 'Google',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
    ),
  },
  {
    name: 'Amazon',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M13.957 10.906c0-1.465-.084-2.695-1.503-2.695-1.391 0-1.78 1.172-1.78 2.695v3.914c0 1.57.447 2.668 1.78 2.668 1.363 0 1.503-1.309 1.503-2.732v-3.85zm-4.743 4.148c0-2.828 1.199-6.301 4.551-6.301 2.371 0 3.32 1.363 3.543 2.453h.055V9.062h3.047v10.742h-2.937v-1.883h-.055c-.754 1.254-2.039 2.129-3.793 2.129-3.137 0-4.41-2.672-4.41-4.996zm14.164 5.371c-3.109 1.418-6.91 2.152-10.793 2.152-5.457 0-10.367-1.777-12.578-4.527-.168-.223-.023-.527.246-.426 3.164 1.145 6.883 1.797 10.684 1.797 3.52 0 7.371-.629 10.742-1.996.387-.16.656.246.246.523l1.453-.523z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  {
    name: 'Adobe',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M13.966 22h10.034l-9.333-22h-6.701l6 22zm-7.932-22h-6.034l9.333 22h6.701l-10-22zm3.966 13.915l2.427 5.745h-4.854l2.427-5.745z" />
      </svg>
    ),
  },
  {
    name: 'Atlassian',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M11.53 2c-.37 0-.72.19-.91.52L5.13 12.18c-.37.66.1 1.48.86 1.48h6.29c.41 0 .75-.34.75-.75V2.75c0-.41-.34-.75-.75-.75h-.75zm.94 8.34v10.91c0 .41.34.75.75.75h.75c.37 0 .72-.19.91-.52l5.49-9.66c.37-.66-.1-1.48-.86-1.48h-6.29c-.41 0-.75.34-.75.75z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    name: 'NVIDIA',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M8.947 7.747c-.208.067-.534.22-.724.341l-.345.22-.055 3.692-.054 3.693.308.232c.394.298 1.05.518 1.637.549 1.15.061 2.274-.32 3.067-1.038.56-.507.904-1.168.995-1.916.036-.301.036-.888 0-1.189-.148-1.218-.946-2.18-2.182-2.628-.686-.248-1.986-.24-2.647.042zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.896 17.525c-1.492 1.054-3.414 1.543-5.323 1.353-1.634-.162-3.15-.916-4.218-2.094l-.328-.363v-8.842l.328-.363c1.068-1.178 2.584-1.932 4.218-2.094 1.909-.19 3.831.299 5.323 1.353.473.334.896.72 1.258 1.147l-.936.936c-.282-.323-.608-.619-.972-.876-1.183-.837-2.709-1.225-4.223-1.074-1.297.129-2.5 1.733-3.348 1.668l-.26.288v6.796l.26.288c.848.935 2.051 1.539 3.348 1.668 1.514.151 3.04-.237 4.223-1.074.364-.257.69-.553.972-.876l.936.936c-.362.427-.785.813-1.258 1.147z" />
      </svg>
    ),
  },
  {
    name: 'Stripe',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.652.703 15.364.3 12.568.3 6.942.3 3.125 3.23 3.125 8.286c0 6.643 9.162 5.568 9.162 8.435 0 .983-.807 1.485-2.227 1.485-2.518 0-5.467-1.127-7.23-2.148l-.946 5.64C3.896 22.84 6.772 23.7 10.024 23.7c5.85 0 9.873-2.88 9.873-8.082 0-7.05-5.92-6.468-5.92-6.468z" />
      </svg>
    ),
  },
  {
    name: 'Outreach',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'airbnb',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 0C8.16 0 5.48 2.5 4.8 5.4c-.66 2.82.26 6.3 2.76 10.43 1.34 2.22 2.97 4.54 4.44 6.64.44.63 1.38.63 1.82 0 1.47-2.1 3.1-4.42 4.44-6.64 2.5-4.13 3.42-7.61 2.76-10.43C20.34 2.5 17.66 0 13.82 0H12zm0 4.2c2.05 0 3.65 1.55 3.65 3.6 0 2.2-1.7 4.8-3.65 7.6-1.95-2.8-3.65-5.4-3.65-7.6 0-2.05 1.6-3.6 3.65-3.6zm0 2.2c-.77 0-1.4.63-1.4 1.4s.63 1.4 1.4 1.4 1.4-.63 1.4-1.4-.63-1.4-1.4-1.4z" />
      </svg>
    ),
  },
  {
    name: 'Amplitude',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 2L2 22h4.5l2.2-4.8h6.6l2.2 4.8H22L12 2zm0 6.5l2.3 5.5H9.7L12 8.5z" />
      </svg>
    ),
  },
  {
    name: 'GUMROAD',
    logo: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm2.2 16.5c-3.1 0-5.2-2.1-5.2-5.1 0-3 2.1-5.1 5.2-5.1 2.1 0 3.7 1 4.5 2.6l-2.2 1.2c-.5-1-1.3-1.5-2.3-1.5-1.7 0-2.8 1.2-2.8 2.8 0 1.6 1.1 2.8 2.8 2.8 1.1 0 2-.6 2.4-1.5h-2.5v-2.2h5v5.8h-2.1v-1.1c-.7 1-1.6 1.3-2.8 1.3z" />
      </svg>
    ),
  },
];

export const MovingCompanyLogoStrip: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 py-20 sm:py-28 md:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#04060E] border-b border-white/[0.04]"
      aria-label="Partner & Hiring Technology Ecosystem Marquee"
    >
      <div className="max-w-5xl mx-auto text-center mb-14 sm:mb-18 md:mb-20">
        {/* 1. HERO HEADLINE (MATCHING IMAGE 1: LIGHTWEIGHT, 3-LINE CENTERED COMPOSITION) */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-normal text-white tracking-tight leading-[1.12] sm:leading-[1.1] font-sans">
          <span className="block font-normal text-white">Built for the world's</span>
          <span className="block font-normal text-white mt-1 sm:mt-1.5">most ambitious</span>
          <span className="block mt-1 sm:mt-1.5 font-normal">
            <AnimatedRoleText />
          </span>
        </h2>

        {/* 2. SUBTITLE (PRESERVING PROJECT MESSAGING WITH IMAGE 1 RHYTHM) */}
        <p className="mt-6 sm:mt-8 text-sm sm:text-base md:text-lg text-slate-300/85 max-w-2xl mx-auto font-normal leading-relaxed">
          Connecting talent, skills, and opportunities through intelligent recruitment.
        </p>
      </div>

      {/* 3. CONTINUOUSLY MOVING HORIZONTAL MARQUEE (SIGNIFICANTLY LARGER LOGOS & TYPOGRAPHY) */}
      <div className="w-full relative overflow-hidden select-none">
        {/* Soft edge gradient fades on left and right edges */}
        <div
          className="relative w-full overflow-hidden py-4"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          }}
        >
          {/* Continuous scrolling marquee track */}
          <div
            className="flex items-center gap-14 sm:gap-18 md:gap-24 w-max logo-strip-track"
            style={{
              willChange: 'transform',
            }}
          >
            {/* Duplicated company list for seamless infinite loop */}
            {[...COMPANIES, ...COMPANIES].map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex items-center gap-3 sm:gap-4 text-slate-400 hover:text-white transition-colors duration-200 shrink-0 cursor-default group"
              >
                <div className="text-slate-400 group-hover:text-white transition-colors">
                  {company.logo}
                </div>
                <span className="text-xl sm:text-2xl md:text-[1.65rem] font-medium tracking-tight font-sans text-slate-300 group-hover:text-white transition-colors">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovingCompanyLogoStrip;
