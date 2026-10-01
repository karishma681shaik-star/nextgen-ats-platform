import React, { useState, useRef, useEffect } from 'react';

interface MouseGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  glowSize?: number;
  glowOpacity?: number;
}

export const MouseGlow: React.FC<MouseGlowProps> = ({
  glowColor = 'rgba(139, 92, 246, 0.15)',
  glowSize = 400,
  glowOpacity = 0.8,
  className = '',
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [disableGlow, setDisableGlow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      setDisableGlow(isTouch);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || disableGlow) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {!disableGlow && isHovered && (
        <div
          className="pointer-events-none absolute rounded-full blur-[80px] transition-opacity duration-300"
          style={{
            width: `${glowSize}px`,
            height: `${glowSize}px`,
            left: `${mousePos.x - glowSize / 2}px`,
            top: `${mousePos.y - glowSize / 2}px`,
            backgroundColor: glowColor,
            opacity: glowOpacity,
            mixBlendMode: 'screen',
            zIndex: 0,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
export default MouseGlow;
