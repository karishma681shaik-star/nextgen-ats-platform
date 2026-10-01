import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface ContainedGridBackgroundProps {
  role?: 'candidate' | 'recruiter' | 'admin' | 'public';
  interactive?: boolean;
  showHudLabels?: boolean;
  gridSize?: number;
  className?: string;
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface CircuitPulse {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  color: string;
  speed: number;
  turnsLeft: number;
  life: number;
  maxLife: number;
}

interface SynapseNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulsePhase: number;
  color: string;
}

interface QuantumReticle {
  gridX: number;
  gridY: number;
  radius: number;
  angle: number;
  speed: number;
  color: string;
  subRings: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const ContainedGridBackground: React.FC<ContainedGridBackgroundProps> = ({
  role = 'recruiter',
  interactive = true,
  showHudLabels = false,
  gridSize = 64,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hudCoordinates, setHudCoordinates] = useState({ x: '52.4', y: '34.8' });

  // ─── PALETTES BY ROLE ───────────────────────────────────────────────────────
  const getTheme = useCallback(() => {
    switch (role) {
      case 'recruiter':
        return {
          primaryHex: '#a855f7', // Vivid Purple
          secondaryHex: '#06b6d4', // Neon Cyan
          accentHex: '#ec4899', // Pink
          tertiaryHex: '#6366f1', // Indigo
          gridLine: 'rgba(168, 85, 247, 0.20)',
          gridLineActive: 'rgba(216, 180, 254, 0.65)',
          crosshair: 'rgba(216, 180, 254, 0.45)',
          crosshairActive: 'rgba(236, 72, 153, 1)',
          subGridDot: 'rgba(255, 255, 255, 0.05)',
          horizonGrid: 'rgba(6, 182, 212, 0.22)',
          spotlightColor1: 'rgba(168, 85, 247, 0.38)',
          spotlightColor2: 'rgba(6, 182, 212, 0.20)',
          aurora: [
            { hue: 275, sat: 88, light: 55, alpha: 0.18, cx: 0.22, cy: 0.22, r: 540, speed: 0.22 },
            { hue: 192, sat: 92, light: 52, alpha: 0.16, cx: 0.82, cy: 0.18, r: 480, speed: 0.26 },
            { hue: 330, sat: 85, light: 55, alpha: 0.12, cx: 0.48, cy: 0.82, r: 540, speed: 0.19 },
            { hue: 245, sat: 92, light: 62, alpha: 0.15, cx: 0.78, cy: 0.72, r: 500, speed: 0.23 },
            { hue: 210, sat: 95, light: 58, alpha: 0.11, cx: 0.15, cy: 0.70, r: 460, speed: 0.21 },
          ],
        };
      case 'candidate':
        return {
          primaryHex: '#6366f1', // Indigo
          secondaryHex: '#06b6d4', // Cyan
          accentHex: '#10b981', // Emerald
          tertiaryHex: '#8b5cf6', // Violet
          gridLine: 'rgba(99, 102, 241, 0.20)',
          gridLineActive: 'rgba(56, 189, 248, 0.65)',
          crosshair: 'rgba(129, 140, 248, 0.45)',
          crosshairActive: 'rgba(56, 189, 248, 1)',
          subGridDot: 'rgba(255, 255, 255, 0.05)',
          horizonGrid: 'rgba(99, 102, 241, 0.24)',
          spotlightColor1: 'rgba(99, 102, 241, 0.38)',
          spotlightColor2: 'rgba(6, 182, 212, 0.20)',
          aurora: [
            { hue: 235, sat: 92, light: 56, alpha: 0.18, cx: 0.25, cy: 0.2, r: 500, speed: 0.22 },
            { hue: 190, sat: 94, light: 50, alpha: 0.16, cx: 0.8, cy: 0.28, r: 470, speed: 0.25 },
            { hue: 160, sat: 88, light: 45, alpha: 0.12, cx: 0.5, cy: 0.8, r: 530, speed: 0.19 },
            { hue: 260, sat: 88, light: 58, alpha: 0.14, cx: 0.7, cy: 0.75, r: 470, speed: 0.21 },
            { hue: 215, sat: 90, light: 54, alpha: 0.12, cx: 0.18, cy: 0.65, r: 450, speed: 0.24 },
          ],
        };
      case 'admin':
        return {
          primaryHex: '#10b981', // Emerald
          secondaryHex: '#06b6d4', // Cyan
          accentHex: '#3b82f6', // Blue
          tertiaryHex: '#14b8a6', // Teal
          gridLine: 'rgba(16, 185, 129, 0.20)',
          gridLineActive: 'rgba(52, 211, 153, 0.65)',
          crosshair: 'rgba(52, 211, 153, 0.45)',
          crosshairActive: 'rgba(6, 182, 212, 1)',
          subGridDot: 'rgba(255, 255, 255, 0.05)',
          horizonGrid: 'rgba(16, 185, 129, 0.24)',
          spotlightColor1: 'rgba(16, 185, 129, 0.35)',
          spotlightColor2: 'rgba(59, 130, 246, 0.20)',
          aurora: [
            { hue: 160, sat: 88, light: 50, alpha: 0.18, cx: 0.22, cy: 0.2, r: 500, speed: 0.21 },
            { hue: 195, sat: 92, light: 52, alpha: 0.16, cx: 0.78, cy: 0.28, r: 460, speed: 0.24 },
            { hue: 220, sat: 90, light: 55, alpha: 0.14, cx: 0.5, cy: 0.8, r: 520, speed: 0.19 },
            { hue: 175, sat: 82, light: 46, alpha: 0.12, cx: 0.7, cy: 0.7, r: 460, speed: 0.22 },
            { hue: 140, sat: 85, light: 48, alpha: 0.10, cx: 0.15, cy: 0.68, r: 440, speed: 0.23 },
          ],
        };
      case 'public':
      default:
        return {
          primaryHex: '#6366f1',
          secondaryHex: '#a855f7',
          accentHex: '#38bdf8',
          tertiaryHex: '#ec4899',
          gridLine: 'rgba(99, 102, 241, 0.20)',
          gridLineActive: 'rgba(168, 85, 247, 0.65)',
          crosshair: 'rgba(168, 85, 247, 0.45)',
          crosshairActive: 'rgba(56, 189, 248, 1)',
          subGridDot: 'rgba(255, 255, 255, 0.05)',
          horizonGrid: 'rgba(99, 102, 241, 0.22)',
          spotlightColor1: 'rgba(99, 102, 241, 0.36)',
          spotlightColor2: 'rgba(168, 85, 247, 0.20)',
          aurora: [
            { hue: 245, sat: 92, light: 56, alpha: 0.18, cx: 0.25, cy: 0.2, r: 500, speed: 0.22 },
            { hue: 280, sat: 88, light: 56, alpha: 0.16, cx: 0.8, cy: 0.25, r: 460, speed: 0.23 },
            { hue: 195, sat: 94, light: 50, alpha: 0.14, cx: 0.5, cy: 0.78, r: 520, speed: 0.18 },
            { hue: 260, sat: 92, light: 60, alpha: 0.15, cx: 0.75, cy: 0.72, r: 480, speed: 0.21 },
            { hue: 320, sat: 86, light: 54, alpha: 0.11, cx: 0.18, cy: 0.62, r: 440, speed: 0.24 },
          ],
        };
    }
  }, [role]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const theme = getTheme();

    const mouse = {
      x: (window.innerWidth * 0.55) * dpr,
      y: (window.innerHeight * 0.35) * dpr,
      targetX: (window.innerWidth * 0.55) * dpr,
      targetY: (window.innerHeight * 0.35) * dpr,
      active: true,
    };

    const ripples: Ripple[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX * dpr;
      mouse.targetY = e.clientY * dpr;
      mouse.active = true;

      const normX = ((e.clientX / window.innerWidth) * 100).toFixed(1);
      const normY = ((e.clientY / window.innerHeight) * 100).toFixed(1);
      setHudCoordinates({ x: normX, y: normY });
    };

    const handleMouseLeave = () => {
      mouse.targetX = (window.innerWidth * 0.55) * dpr;
      mouse.targetY = (window.innerHeight * 0.35) * dpr;
    };

    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX * dpr,
        y: e.clientY * dpr,
        radius: 10,
        maxRadius: 360 * dpr,
        alpha: 0.95,
      });
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('click', handleClick);
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener('resize', handleResize);

    const effectiveGrid = gridSize * dpr;
    const subGrid = effectiveGrid / 4;

    // ─── 1. CIRCUITS WITH 90-DEGREE INTELLIGENT TURNING ───────────────────────
    const circuitPulses: CircuitPulse[] = [];
    const spawnCircuit = (): CircuitPulse => {
      const isH = Math.random() > 0.5;
      const numX = Math.floor(width / effectiveGrid);
      const numY = Math.floor(height / effectiveGrid);
      const lineX = Math.floor(Math.random() * numX) * effectiveGrid;
      const lineY = Math.floor(Math.random() * numY) * effectiveGrid;
      const speed = (2.2 + Math.random() * 2.8) * dpr;

      return {
        x: lineX,
        y: lineY,
        vx: isH ? (Math.random() > 0.5 ? speed : -speed) : 0,
        vy: !isH ? (Math.random() > 0.5 ? speed : -speed) : 0,
        length: (90 + Math.random() * 120) * dpr,
        color: Math.random() > 0.4 ? theme.primaryHex : theme.secondaryHex,
        speed,
        turnsLeft: 2 + Math.floor(Math.random() * 4),
        life: 0,
        maxLife: 260 + Math.floor(Math.random() * 220),
      };
    };

    for (let i = 0; i < 14; i++) {
      circuitPulses.push(spawnCircuit());
    }

    // ─── 2. NEURAL SYNAPSE CONSTELLATION NODES ────────────────────────────────
    const synapseCount = 38;
    const synapses: SynapseNode[] = Array.from({ length: synapseCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45 * dpr,
      vy: (Math.random() - 0.5) * 0.45 * dpr,
      radius: (1.5 + Math.random() * 2.2) * dpr,
      alpha: 0.35 + Math.random() * 0.55,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? theme.secondaryHex : theme.primaryHex,
    }));

    // ─── 3. STRATEGIC QUANTUM RADAR RETICLES ──────────────────────────────────
    const reticles: QuantumReticle[] = [
      { gridX: 3, gridY: 2, radius: 28 * dpr, angle: 0, speed: 0.012, color: theme.secondaryHex, subRings: 3 },
      { gridX: 14, gridY: 4, radius: 36 * dpr, angle: Math.PI * 0.4, speed: -0.009, color: theme.primaryHex, subRings: 3 },
      { gridX: 8, gridY: 8, radius: 32 * dpr, angle: Math.PI * 0.8, speed: 0.015, color: theme.accentHex, subRings: 2 },
    ];

    let t = 0;

    // ─── RENDER LOOP (60FPS HARDWARE ACCELERATED) ──────────────────────────────
    const render = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Mouse smooth spring interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // ─── LAYER 1: Deep Luxury Obsidian Spatial Void ───────────────────────────
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#02040b');
      bgGrad.addColorStop(0.3, '#050a18');
      bgGrad.addColorStop(0.65, '#070c20');
      bgGrad.addColorStop(1, '#02040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ─── LAYER 2: Organic Chromatic Bioluminescent Auroras ────────────────────
      theme.aurora.forEach((blob, idx) => {
        const driftX = Math.sin(t * blob.speed + idx) * (80 * dpr);
        const driftY = Math.cos(t * blob.speed * 0.8 + idx) * (60 * dpr);
        const ox = blob.cx * width + driftX;
        const oy = blob.cy * height + driftY;
        const radius = blob.r * dpr;

        const radGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        radGrad.addColorStop(0, `hsla(${blob.hue}, ${blob.sat}%, ${blob.light}%, ${blob.alpha})`);
        radGrad.addColorStop(0.45, `hsla(${blob.hue}, ${blob.sat}%, ${blob.light}%, ${blob.alpha * 0.42})`);
        radGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── LAYER 3: 3D CYBER HORIZON PERSPECTIVE WAVE MATRIX ────────────────────
      // Undulating wireframe terrain flowing at the bottom third of the viewport
      const horizonY = height * 0.78;
      const numLinesHorizon = 14;
      const waveCols = 32;

      ctx.save();
      for (let i = 0; i < numLinesHorizon; i++) {
        const rowProgress = i / numLinesHorizon;
        const py = horizonY + Math.pow(rowProgress, 1.8) * (height - horizonY);
        const rowAlpha = Math.sin(rowProgress * Math.PI) * 0.28;

        ctx.beginPath();
        for (let j = 0; j <= waveCols; j++) {
          const colProgress = j / waveCols;
          const px = colProgress * width;

          // Harmonic wave displacement
          const waveZ =
            Math.sin(colProgress * 8 + t * 2 + i * 0.5) * (14 * dpr) +
            Math.cos(colProgress * 4 - t * 1.5) * (10 * dpr);

          const yWithWave = py + waveZ * (1 - rowProgress * 0.4);

          if (j === 0) ctx.moveTo(px, yWithWave);
          else ctx.lineTo(px, yWithWave);
        }

        ctx.strokeStyle = `rgba(6, 182, 212, ${rowAlpha})`;
        ctx.lineWidth = (0.8 + rowProgress * 0.8) * dpr;
        ctx.stroke();
      }

      // Vertical perspective vanishing lines
      for (let j = 0; j <= waveCols; j += 2) {
        const colProgress = j / waveCols;
        ctx.beginPath();
        for (let i = 0; i < numLinesHorizon; i++) {
          const rowProgress = i / numLinesHorizon;
          const py = horizonY + Math.pow(rowProgress, 1.8) * (height - horizonY);
          const px = colProgress * width;
          const waveZ =
            Math.sin(colProgress * 8 + t * 2 + i * 0.5) * (14 * dpr) +
            Math.cos(colProgress * 4 - t * 1.5) * (10 * dpr);
          const yWithWave = py + waveZ * (1 - rowProgress * 0.4);

          if (i === 0) ctx.moveTo(px, yWithWave);
          else ctx.lineTo(px, yWithWave);
        }
        ctx.strokeStyle = `rgba(168, 85, 247, 0.12)`;
        ctx.lineWidth = 0.8 * dpr;
        ctx.stroke();
      }
      ctx.restore();

      // ─── LAYER 4: Interactive Specular Cursor Halo ───────────────────────────
      const spotRadius = 380 * dpr;
      const spotGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, spotRadius);
      spotGrad.addColorStop(0, theme.spotlightColor1);
      spotGrad.addColorStop(0.35, theme.spotlightColor2);
      spotGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, spotRadius, 0, Math.PI * 2);
      ctx.fill();

      // ─── LAYER 5: Sub-Grid Micro Matrix (Dense Silicon Texture) ──────────────
      ctx.fillStyle = theme.subGridDot;
      const dotR = 0.9 * dpr;
      for (let x = subGrid; x < width; x += subGrid) {
        if (x % effectiveGrid === 0) continue;
        for (let y = subGrid; y < height; y += subGrid) {
          if (y % effectiveGrid === 0) continue;
          ctx.beginPath();
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ─── LAYER 6: Contained Primary Matrix Grid Lines ─────────────────────────
      const centerX = width * 0.55;
      const centerY = height * 0.45;
      ctx.lineWidth = 1 * dpr;

      // Vertical lines
      for (let x = 0; x <= width; x += effectiveGrid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);

        const distToMouse = Math.abs(x - mouse.x);
        const mouseBoost = distToMouse < 260 * dpr ? (1 - distToMouse / (260 * dpr)) * 0.65 : 0;
        const distToCenter = Math.abs(x - centerX);
        const centerRatio = Math.max(0.25, 1 - Math.pow(distToCenter / (width * 0.65), 2));

        const alpha = Math.max(0.08, (0.20 + mouseBoost) * centerRatio);
        ctx.strokeStyle = mouseBoost > 0.14 ? theme.gridLineActive : `rgba(168, 85, 247, ${alpha})`;
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += effectiveGrid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);

        const distToMouse = Math.abs(y - mouse.y);
        const mouseBoost = distToMouse < 260 * dpr ? (1 - distToMouse / (260 * dpr)) * 0.65 : 0;
        const distToCenter = Math.abs(y - centerY);
        const centerRatio = Math.max(0.25, 1 - Math.pow(distToCenter / (height * 0.65), 2));

        const alpha = Math.max(0.08, (0.20 + mouseBoost) * centerRatio);
        ctx.strokeStyle = mouseBoost > 0.14 ? theme.gridLineActive : `rgba(168, 85, 247, ${alpha})`;
        ctx.stroke();
      }

      // ─── LAYER 7: Precision Intersection Crosshairs with Starburst Flares ────
      const crossSize = 5.5 * dpr;
      for (let x = 0; x <= width; x += effectiveGrid) {
        for (let y = 0; y <= height; y += effectiveGrid) {
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          const isNearMouse = distToMouse < 280 * dpr;
          const mouseGlow = isNearMouse ? 1 - distToMouse / (280 * dpr) : 0;

          const distToCenter = Math.hypot(x - centerX, y - centerY);
          const centerAlpha = Math.max(0.12, 1 - distToCenter / (width * 0.72));
          const totalAlpha = Math.min(1, centerAlpha * 0.5 + mouseGlow * 0.85);

          if (totalAlpha > 0.08) {
            ctx.save();
            ctx.strokeStyle = mouseGlow > 0.12 ? theme.crosshairActive : theme.crosshair;
            ctx.lineWidth = (1 + mouseGlow * 1.3) * dpr;

            // Horizontal & Vertical crossarms
            ctx.beginPath();
            ctx.moveTo(x - crossSize, y);
            ctx.lineTo(x + crossSize, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y - crossSize);
            ctx.lineTo(x, y + crossSize);
            ctx.stroke();

            // Radiant 4-point starburst flare when near cursor
            if (mouseGlow > 0.25) {
              const flareLen = (8 + mouseGlow * 12) * dpr;
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.lineWidth = 1.2 * dpr;

              ctx.beginPath();
              ctx.moveTo(x - flareLen, y);
              ctx.lineTo(x + flareLen, y);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(x, y - flareLen);
              ctx.lineTo(x, y + flareLen);
              ctx.stroke();

              // Center incandescent bead
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(x, y, 1.8 * dpr, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
          }
        }
      }

      // ─── LAYER 8: Rotating Holographic Radar Reticles ─────────────────────────
      reticles.forEach((r, idx) => {
        r.angle += r.speed;
        const rx = (r.gridX * effectiveGrid) % width;
        const ry = (r.gridY * effectiveGrid) % height;

        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(r.angle);

        // Outer segmented ring
        ctx.strokeStyle = `rgba(6, 182, 212, 0.4)`;
        ctx.lineWidth = 1 * dpr;
        ctx.setLineDash([8 * dpr, 6 * dpr]);
        ctx.beginPath();
        ctx.arc(0, 0, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Inner solid ring
        ctx.strokeStyle = `rgba(168, 85, 247, 0.35)`;
        ctx.beginPath();
        ctx.arc(0, 0, r.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // 4 cardinal degree marks
        ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (r.radius - 4 * dpr), Math.sin(a) * (r.radius - 4 * dpr));
          ctx.lineTo(Math.cos(a) * (r.radius + 4 * dpr), Math.sin(a) * (r.radius + 4 * dpr));
          ctx.stroke();
        }

        // Sweeping radar wedge
        const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r.radius);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
        sweepGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r.radius, 0, Math.PI * 0.35);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // ─── LAYER 9: Neural Constellation Synapses & Tendril Connections ────────
      // Update synapses
      synapses.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;
      });

      // Draw quantum filaments between nearby nodes
      const maxConnDist = 125 * dpr;
      for (let i = 0; i < synapses.length; i++) {
        const s1 = synapses[i];
        for (let j = i + 1; j < synapses.length; j++) {
          const s2 = synapses[j];
          const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
          if (dist < maxConnDist) {
            const lineAlpha = (1 - dist / maxConnDist) * 0.35;
            ctx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`;
            ctx.lineWidth = 0.8 * dpr;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }

        // Synaptic tendril to cursor
        const distCursor = Math.hypot(s1.x - mouse.x, s1.y - mouse.y);
        if (distCursor < 200 * dpr) {
          const cursorAlpha = (1 - distCursor / (200 * dpr)) * 0.65;
          ctx.strokeStyle = `rgba(6, 182, 212, ${cursorAlpha})`;
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Draw node bead
        const pulse = 1 + Math.sin(t * 3 + s1.pulsePhase) * 0.25;
        ctx.fillStyle = s1.color;
        ctx.globalAlpha = s1.alpha;
        ctx.beginPath();
        ctx.arc(s1.x, s1.y, s1.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // ─── LAYER 10: Multi-Axis Circuit Pulses with 90° Junction Routing ────────
      circuitPulses.forEach((pulse, idx) => {
        pulse.x += pulse.vx;
        pulse.y += pulse.vy;
        pulse.life++;

        // At grid intersection, randomly make a 90-degree turn
        const atGridX = Math.abs(pulse.x % effectiveGrid) < Math.abs(pulse.speed) * 1.2;
        const atGridY = Math.abs(pulse.y % effectiveGrid) < Math.abs(pulse.speed) * 1.2;

        if (atGridX && atGridY && pulse.turnsLeft > 0 && Math.random() < 0.22) {
          pulse.turnsLeft--;
          if (pulse.vx !== 0) {
            pulse.vy = (Math.random() > 0.5 ? 1 : -1) * pulse.speed;
            pulse.vx = 0;
          } else {
            pulse.vx = (Math.random() > 0.5 ? 1 : -1) * pulse.speed;
            pulse.vy = 0;
          }
        }

        // Respawn if expired or out of bounds
        if (
          pulse.life > pulse.maxLife ||
          pulse.x < -100 ||
          pulse.x > width + 100 ||
          pulse.y < -100 ||
          pulse.y > height + 100
        ) {
          circuitPulses[idx] = spawnCircuit();
          return;
        }

        // Draw laser comet with trail
        const isH = pulse.vx !== 0;
        const startX = pulse.x;
        const startY = pulse.y;
        const endX = isH ? pulse.x - Math.sign(pulse.vx) * pulse.length : pulse.x;
        const endY = !isH ? pulse.y - Math.sign(pulse.vy) * pulse.length : pulse.y;

        const grad = ctx.createLinearGradient(startX, startY, endX, endY);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, pulse.color);
        grad.addColorStop(1, 'transparent');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.6 * dpr;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Glowing head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(startX, startY, 2.8 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── LAYER 11: Interactive Click Ripples ─────────────────────────────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 5.5 * dpr;
        rip.alpha *= 0.94;

        if (rip.alpha < 0.02 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${rip.alpha})`;
        ctx.lineWidth = 2.4 * dpr;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('click', handleClick);
      }
    };
  }, [role, interactive, gridSize, getTheme]);

  const hasSidebar = role !== 'public';

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* ── High Performance Hardware Accelerated Canvas ─────────────────── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* ── Top Horizon Laser Light Bar with Dynamic Neon Dispersion ─────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 via-purple-500 via-indigo-400 to-transparent shadow-[0_0_30px_rgba(6,182,212,0.9)]" />
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-indigo-500/[0.18] via-purple-500/[0.08] via-cyan-500/[0.04] to-transparent pointer-events-none" />

      {/* ── Contained Precision Workspace Framing with Vignette Mask ──────── */}
      <div
        className={`absolute inset-4 sm:inset-6 ${
          hasSidebar ? 'lg:left-[19rem] lg:right-6 lg:inset-y-6' : 'lg:inset-8'
        } rounded-[28px] border border-indigo-500/25 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] pointer-events-none transition-all duration-300`}
        style={{
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(168,85,247,0.15), inset 0 0 80px rgba(4,7,17,0.75)',
        }}
      >
        {/* Luminous Perimeter Corner Reticles */}
        <div className="absolute -top-1 -left-1 w-7 h-7 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-[0_0_16px_rgba(6,182,212,1)]" />
        <div className="absolute -top-1 -right-1 w-7 h-7 border-t-2 border-r-2 border-purple-400 rounded-tr-lg shadow-[0_0_16px_rgba(168,85,247,1)]" />
        <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-2 border-l-2 border-violet-400 rounded-bl-lg shadow-[0_0_16px_rgba(139,92,246,1)]" />
        <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-[0_0_16px_rgba(6,182,212,1)]" />

        {/* ── HUD Telemetry Chips & Precision Labels ─────────────────────── */}
        {showHudLabels && (
          <>
            {/* Top Left HUD Label */}
            <div className="absolute top-3 left-4 hidden xl:flex items-center gap-2 text-[10px] font-mono tracking-widest text-cyan-300/80 uppercase">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]" />
              <span>QUANTUM.GRID // MATRIX-01 [ONLINE]</span>
              <span className="text-white/25">|</span>
              <span className="text-purple-300/90 font-bold">SYNAPSE_MESH::60FPS</span>
            </div>

            {/* Top Right HUD Coordinates */}
            <div className="absolute top-3 right-4 hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-300/70">
              <span className="text-cyan-400/80">SYSTEM::ACTIVE</span>
              <span className="text-white/25">|</span>
              <span>COORD: [{hudCoordinates.x}° , {hudCoordinates.y}°]</span>
              <span className="text-white/25">|</span>
              <span className="text-emerald-400 font-extrabold">LOW-LATENCY</span>
            </div>

            {/* Bottom Left HUD Spec */}
            <div className="absolute bottom-3 left-4 hidden xl:flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400/70">
              <span>NEURAL ATS PROTOCOL v3.4</span>
              <span className="text-white/25">/</span>
              <span className="text-cyan-400/70">BIO-LUMINESCENT SPATIAL ENGINE</span>
            </div>

            {/* Bottom Right Contained Grid Tag */}
            <div className="absolute bottom-3 right-4 hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-300/70">
              <span className="w-1.5 h-1.5 rounded-sm bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,1)]" />
              <span>ULTRA-PREMIUM SPATIAL CANVAS</span>
            </div>
          </>
        )}
      </div>

      {/* ── Smooth Radial Vignette Gradient ─────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 92% 88% at 55% 45%, transparent 45%, rgba(4,7,17,0.45) 75%, #040711 98%)',
        }}
      />
    </div>
  );
};
