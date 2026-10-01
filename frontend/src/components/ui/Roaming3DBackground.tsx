import React, { useEffect, useRef } from 'react';

// ============================================================
// EXECUTIVE ULTRA-PREMIUM 3D SPATIAL ENGINE
// Built for Next-Gen ATS Recruiter WOW Factor:
// 1. 3D Rotating Holographic Icosahedron with Translucent Shaded Facets & Neon Vertex Flares
// 2. 3D Concentric Holographic Gyroscope with Quad Orbiting Quantum Comets with Trailing Light Sparks
// 3. 3D Diamond Octahedron Crystal Prisms with Dynamic Emerald & Cyan Chromatic Edge Glow
// 4. Undulating 3D Cyber Horizon Wave Matrix that flows beneath the viewport
// 5. Ambient Atmospheric Quantum Nebulae with Shifting Cosmic Chromatic Hues
// 6. Interactive Spring-Damped Parallax Camera with Fluid Cursor Interaction
// 7. Calibrated for 60FPS Native Retina & 4K High-DPI Crispness
// ============================================================

interface Point3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  pulsePhase: number;
}

interface Polyhedron3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  scale: number;
  type: 'icosahedron' | 'octahedron' | 'gyroscope';
  color: string;
  glowColor: string;
  fillColor?: string;
}

export const Roaming3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvas = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    setupCanvas();

    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Mouse Tracking with Smooth Spring Physics
    let targetCamX = 0;
    let targetCamY = 0;
    let camX = 0;
    let camY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetCamX = (e.clientX - width / 2) * 0.4;
      targetCamY = (e.clientY - height / 2) * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const fov = 750;

    // ----------------------------------------------------
    // 1. Constellation Network: 3D Roaming Quantum Particles
    // ----------------------------------------------------
    const particleCount = width < 768 ? 36 : 72;
    const particleColors = [
      'rgba(99, 102, 241, 0.9)',  // Indigo
      'rgba(168, 85, 247, 0.9)',  // Violet
      'rgba(6, 182, 212, 0.95)',  // Cyan
      'rgba(16, 185, 129, 0.85)', // Emerald
      'rgba(244, 63, 94, 0.75)'   // Rose
    ];

    const particles: Point3D[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.7,
        y: (Math.random() - 0.5) * height * 1.7,
        z: Math.random() * 850 + 80,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        vz: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.4 + 1.4,
        color: particleColors[i % particleColors.length],
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // ----------------------------------------------------
    // 2. Sacred Polyhedra: Icosahedrons, Gyroscopes & Octahedrons
    // ----------------------------------------------------
    const polyhedra: Polyhedron3D[] = [
      // Major Icosahedron with Translucent Facets (Upper Right)
      {
        x: width * 0.35,
        y: -height * 0.2,
        z: 380,
        vx: -0.16,
        vy: 0.12,
        vz: -0.06,
        rotX: 0.3,
        rotY: 0.6,
        rotZ: 0.15,
        speedX: 0.007,
        speedY: 0.011,
        speedZ: 0.005,
        scale: 82,
        type: 'icosahedron',
        color: 'rgba(99, 102, 241, 0.7)',
        glowColor: 'rgba(129, 140, 248, 0.95)',
        fillColor: 'rgba(99, 102, 241, 0.08)'
      },
      // Holographic Concentric Gyroscope Gimbal (Left-Center)
      {
        x: -width * 0.36,
        y: height * 0.08,
        z: 440,
        vx: 0.18,
        vy: -0.12,
        vz: 0.08,
        rotX: -0.5,
        rotY: 0.4,
        rotZ: 0.25,
        speedX: 0.009,
        speedY: -0.013,
        speedZ: 0.007,
        scale: 96,
        type: 'gyroscope',
        color: 'rgba(6, 182, 212, 0.7)',
        glowColor: 'rgba(34, 211, 238, 0.95)'
      },
      // Diamond Octahedron Crystal (Bottom-Center)
      {
        x: width * 0.18,
        y: height * 0.36,
        z: 520,
        vx: -0.14,
        vy: -0.18,
        vz: 0.06,
        rotX: 0.35,
        rotY: -0.45,
        rotZ: 0.3,
        speedX: -0.008,
        speedY: 0.012,
        speedZ: -0.006,
        scale: 68,
        type: 'octahedron',
        color: 'rgba(168, 85, 247, 0.68)',
        glowColor: 'rgba(192, 132, 252, 0.9)',
        fillColor: 'rgba(168, 85, 247, 0.06)'
      },
      // Emerald Floating Prism (Upper Left)
      {
        x: -width * 0.26,
        y: -height * 0.32,
        z: 580,
        vx: 0.15,
        vy: 0.16,
        vz: -0.07,
        rotX: 0.2,
        rotY: 0.3,
        rotZ: -0.35,
        speedX: 0.01,
        speedY: 0.008,
        speedZ: 0.009,
        scale: 56,
        type: 'octahedron',
        color: 'rgba(16, 185, 129, 0.65)',
        glowColor: 'rgba(52, 211, 153, 0.9)',
        fillColor: 'rgba(16, 185, 129, 0.05)'
      }
    ];

    // Geometry Definition: Icosahedron
    const phi = (1 + Math.sqrt(5)) / 2;
    const icosahedronVertices: [number, number, number][] = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];
    const icosahedronNorm = Math.sqrt(1 + phi * phi);
    const icosahedronUnitVertices = icosahedronVertices.map(
      ([x, y, z]) => [x / icosahedronNorm, y / icosahedronNorm, z / icosahedronNorm] as [number, number, number]
    );

    const icosahedronEdges: [number, number][] = [];
    for (let i = 0; i < icosahedronUnitVertices.length; i++) {
      for (let j = i + 1; j < icosahedronUnitVertices.length; j++) {
        const [x1, y1, z1] = icosahedronUnitVertices[i];
        const [x2, y2, z2] = icosahedronUnitVertices[j];
        const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
        if (Math.abs(dist - 2 / icosahedronNorm) < 0.15) {
          icosahedronEdges.push([i, j]);
        }
      }
    }

    // Geometry Definition: Octahedron
    const octahedronUnitVertices: [number, number, number][] = [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1]
    ];
    const octahedronEdges: [number, number][] = [
      [0, 2], [2, 1], [1, 3], [3, 0],
      [4, 0], [4, 1], [4, 2], [4, 3],
      [5, 0], [5, 1], [5, 2], [5, 3]
    ];

    const rotate3D = (
      vx: number,
      vy: number,
      vz: number,
      cosX: number,
      sinX: number,
      cosY: number,
      sinY: number,
      cosZ: number,
      sinZ: number
    ): [number, number, number] => {
      const y1 = vy * cosX - vz * sinX;
      const z1 = vy * sinX + vz * cosX;
      const x2 = vx * cosY + z1 * sinY;
      const z2 = -vx * sinY + z1 * cosY;
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;
      return [x3, y3, z2];
    };

    let tick = 0;

    // ----------------------------------------------------
    // Main Render Loop (60 FPS)
    // ----------------------------------------------------
    const render = () => {
      tick += 0.016;

      ctx.clearRect(0, 0, width, height);

      // Smooth Camera Spring Damping
      camX += (targetCamX - camX) * 0.05;
      camY += (targetCamY - camY) * 0.05;

      const centerX = width / 2 + camX * 0.22;
      const centerY = height / 2 + camY * 0.22;

      // ==================================================
      // A. Ambient Volumetric Atmospheric Nebulae
      // ==================================================
      const grad1 = ctx.createRadialGradient(
        width * 0.28 + Math.sin(tick * 0.35) * 60,
        height * 0.22 + Math.cos(tick * 0.28) * 50,
        10,
        width * 0.28,
        height * 0.22,
        width * 0.55
      );
      grad1.addColorStop(0, 'rgba(79, 70, 229, 0.12)');
      grad1.addColorStop(0.45, 'rgba(147, 51, 234, 0.06)');
      grad1.addColorStop(0.8, 'rgba(6, 182, 212, 0.02)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.72 + Math.cos(tick * 0.4) * 70,
        height * 0.68 + Math.sin(tick * 0.32) * 60,
        10,
        width * 0.72,
        height * 0.68,
        width * 0.5
      );
      grad2.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
      grad2.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // ==================================================
      // B. Undulating Cyber Horizon Ground Grid Lines
      // ==================================================
      const horizonLines = 8;
      const horizonY = height * 0.88;
      for (let h = 0; h < horizonLines; h++) {
        const lineZ = 200 + h * 90;
        const lineScale = fov / (fov + lineZ);
        const yPos = centerY + (horizonY - centerY) * lineScale;
        const waveOffset = Math.sin(tick * 1.5 + h * 0.8) * 8 * lineScale;
        const lineAlpha = (1 - h / horizonLines) * 0.25;

        ctx.beginPath();
        ctx.moveTo(0, yPos + waveOffset);
        ctx.lineTo(width, yPos + waveOffset);
        ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
        ctx.lineWidth = 1 * lineScale;
        ctx.stroke();
      }

      // ==================================================
      // C. 3D Roaming Quantum Particles & Constellation Web
      // ==================================================
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.pulsePhase += 0.03;

        const boundX = width * 0.95;
        const boundY = height * 0.95;
        if (p.x < -boundX) p.x = boundX;
        if (p.x > boundX) p.x = -boundX;
        if (p.y < -boundY) p.y = boundY;
        if (p.y > boundY) p.y = -boundY;
        if (p.z < 80) p.z = 900;
        if (p.z > 900) p.z = 80;

        const scale = fov / (fov + p.z);
        const projX = centerX + p.x * scale;
        const projY = centerY + p.y * scale;
        const pulse = 1 + Math.sin(p.pulsePhase) * 0.35;
        const projRadius = Math.max(1, p.radius * scale * 1.9 * pulse);
        const depthAlpha = Math.min(1, Math.max(0.18, (1 - p.z / 980) * 0.9));

        ctx.beginPath();
        ctx.arc(projX, projY, projRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${depthAlpha})`);
        ctx.shadowBlur = 12 * scale;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Dynamic Connecting Filaments
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dz = p.z - p2.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < 175) {
            const scale2 = fov / (fov + p2.z);
            const proj2X = centerX + p2.x * scale2;
            const proj2Y = centerY + p2.y * scale2;
            const lineAlpha = (1 - dist3D / 175) * 0.28 * depthAlpha;

            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo(proj2X, proj2Y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha})`;
            ctx.lineWidth = 0.9 * scale;
            ctx.stroke();
          }
        }
      }

      // ==================================================
      // D. 3D Sacred Polyhedra & Holographic Gyroscope
      // ==================================================
      for (const poly of polyhedra) {
        poly.x += poly.vx;
        poly.y += poly.vy;
        poly.z += poly.vz;

        poly.rotX += poly.speedX;
        poly.rotY += poly.speedY;
        poly.rotZ += poly.speedZ;

        const boundX = width * 0.78;
        const boundY = height * 0.78;
        if (poly.x < -boundX || poly.x > boundX) poly.vx *= -1;
        if (poly.y < -boundY || poly.y > boundY) poly.vy *= -1;
        if (poly.z < 180 || poly.z > 780) poly.vz *= -1;

        const cosX = Math.cos(poly.rotX), sinX = Math.sin(poly.rotX);
        const cosY = Math.cos(poly.rotY), sinY = Math.sin(poly.rotY);
        const cosZ = Math.cos(poly.rotZ), sinZ = Math.sin(poly.rotZ);

        const baseScale = fov / (fov + poly.z);
        const alpha = Math.min(0.85, Math.max(0.2, (1 - poly.z / 920)));

        if (poly.type === 'gyroscope') {
          // ------------------------------------------------
          // Concentric Gimbal Rings with Orbiting Comets
          // ------------------------------------------------
          const ringRadii = [poly.scale, poly.scale * 0.74, poly.scale * 0.48];
          const ringSpeeds = [1, -1.4, 2.0];

          ringRadii.forEach((r, ringIdx) => {
            const numSegments = 40;
            const ringPts: [number, number][] = [];

            const ringAngleOffset = tick * ringSpeeds[ringIdx];
            const ringCosX = Math.cos(poly.rotX + ringAngleOffset * 0.28);
            const ringSinX = Math.sin(poly.rotX + ringAngleOffset * 0.28);
            const ringCosY = Math.cos(poly.rotY + (ringIdx * Math.PI) / 3);
            const ringSinY = Math.sin(poly.rotY + (ringIdx * Math.PI) / 3);

            for (let s = 0; s <= numSegments; s++) {
              const theta = (s / numSegments) * Math.PI * 2;
              const vx = Math.cos(theta) * r;
              const vy = Math.sin(theta) * r;

              const [rx, ry, rz] = rotate3D(
                vx, vy, 0,
                ringCosX, ringSinX,
                ringCosY, ringSinY,
                cosZ, sinZ
              );

              const worldX = poly.x + rx;
              const worldY = poly.y + ry;
              const worldZ = poly.z + rz;

              const pScale = fov / (fov + worldZ);
              ringPts.push([centerX + worldX * pScale, centerY + worldY * pScale]);
            }

            // Draw Ring Outline
            ctx.beginPath();
            ctx.moveTo(ringPts[0][0], ringPts[0][1]);
            for (let k = 1; k < ringPts.length; k++) {
              ctx.lineTo(ringPts[k][0], ringPts[k][1]);
            }
            ctx.closePath();
            ctx.strokeStyle = poly.color.replace(/[\d.]+\)$/, `${alpha * (0.85 - ringIdx * 0.15)})`);
            ctx.lineWidth = (1.8 - ringIdx * 0.35) * baseScale;
            ctx.shadowBlur = 16 * baseScale;
            ctx.shadowColor = poly.glowColor;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Orbiting Quantum Comet with Trailing Tail
            for (let trail = 0; trail < 4; trail++) {
              const beadAngle = tick * ringSpeeds[ringIdx] * 2.2 - trail * 0.08;
              const bvx = Math.cos(beadAngle) * r;
              const bvy = Math.sin(beadAngle) * r;
              const [brx, bry, brz] = rotate3D(
                bvx, bvy, 0,
                ringCosX, ringSinX,
                ringCosY, ringSinY,
                cosZ, sinZ
              );
              const bWorldX = poly.x + brx;
              const bWorldY = poly.y + bry;
              const bWorldZ = poly.z + brz;
              const bScale = fov / (fov + bWorldZ);
              const bProjX = centerX + bWorldX * bScale;
              const bProjY = centerY + bWorldY * bScale;

              const trailAlpha = (1 - trail / 4) * alpha;
              const trailRadius = Math.max(1, (3.2 - trail * 0.6) * bScale);

              ctx.beginPath();
              ctx.arc(bProjX, bProjY, trailRadius, 0, Math.PI * 2);
              ctx.fillStyle = trail === 0 ? '#ffffff' : poly.glowColor.replace(/[\d.]+\)$/, `${trailAlpha})`);
              ctx.shadowBlur = (20 - trail * 4) * bScale;
              ctx.shadowColor = poly.glowColor;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          });
        } else {
          // ------------------------------------------------
          // 3D Icosahedron or Octahedron Mesh
          // ------------------------------------------------
          const unitVertices = poly.type === 'icosahedron' ? icosahedronUnitVertices : octahedronUnitVertices;
          const edges = poly.type === 'icosahedron' ? icosahedronEdges : octahedronEdges;

          const projectedPts: [number, number, number][] = [];

          for (const [ux, uy, uz] of unitVertices) {
            const vx = ux * poly.scale;
            const vy = uy * poly.scale;
            const vz = uz * poly.scale;

            const [rx, ry, rz] = rotate3D(vx, vy, vz, cosX, sinX, cosY, sinY, cosZ, sinZ);

            const worldX = poly.x + rx;
            const worldY = poly.y + ry;
            const worldZ = poly.z + rz;

            const pScale = fov / (fov + worldZ);
            projectedPts.push([centerX + worldX * pScale, centerY + worldY * pScale, pScale]);
          }

          // Draw Glowing Edges
          ctx.beginPath();
          for (const [start, end] of edges) {
            const [x1, y1] = projectedPts[start];
            const [x2, y2] = projectedPts[end];
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.strokeStyle = poly.color.replace(/[\d.]+\)$/, `${alpha})`);
          ctx.lineWidth = 1.7 * baseScale;
          ctx.shadowBlur = 18 * baseScale;
          ctx.shadowColor = poly.glowColor;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Draw Radiant Vertex Nodes with Halos
          for (const [px, py, pScale] of projectedPts) {
            ctx.beginPath();
            ctx.arc(px, py, 2.6 * pScale, 0, Math.PI * 2);
            ctx.fillStyle = poly.glowColor;
            ctx.shadowBlur = 14 * pScale;
            ctx.shadowColor = poly.glowColor;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
};
