import * as THREE from 'three';
import { BackgroundMode, BackgroundTheme } from './types';
import { isMobileDevice, getDevicePerformanceTier } from './WebGLDetector';

/**
 * OBSIDIAN AURA PALETTE & THEMES
 * Luxury enterprise AI: Deep Obsidian (#030712), Midnight Navy (#07111F),
 * Controlled Electric Cyan (#55DDF5), Restrained Violet (#8B5CF6).
 * 85–95% dark across the entire viewport with maximum text readability.
 */
export const THEMES: Record<BackgroundMode, BackgroundTheme> = {
  hero: {
    primaryColor: '#55DDF5',      // Cyan accent
    secondaryColor: '#8FCFFF',    // Soft ice blue
    accentColor: '#8B5CF6',       // Restrained violet
    ambientColor: '#030712',      // Deep obsidian
    fogColor: '#030712',          // Deep obsidian fog
    fogDensity: 0.015,

    fabricNodeCount: 52,          // Minimal, elegant, uncluttered
    fabricLayers: 2,
    fabricScale: 1.0,
    fabricCurvature: 1.8,

    signalCount: 8,               // Only a few gentle signal pulses
    signalSpeed: 0.45,
    signalBrightness: 0.65,

    connectionDensity: 0.4,
    connectionOpacity: 0.16,      // Thin, low-opacity connections

    structuralSpeed: 0.18,        // Slow, restrained, premium motion
    depthParallax: 0.75,

    lightPulseSpeed: 0.3,
    lightPulseIntensity: 0.5,

    particleCount: 30,
    particleOpacity: 0.35,

    intensity: 0.8,
  },
  public: {
    primaryColor: '#55DDF5',
    secondaryColor: '#8FCFFF',
    accentColor: '#8B5CF6',
    ambientColor: '#030712',
    fogColor: '#030712',
    fogDensity: 0.015,

    fabricNodeCount: 52,
    fabricLayers: 2,
    fabricScale: 1.0,
    fabricCurvature: 1.8,

    signalCount: 8,
    signalSpeed: 0.45,
    signalBrightness: 0.65,

    connectionDensity: 0.4,
    connectionOpacity: 0.16,

    structuralSpeed: 0.18,
    depthParallax: 0.75,

    lightPulseSpeed: 0.3,
    lightPulseIntensity: 0.5,

    particleCount: 30,
    particleOpacity: 0.35,

    intensity: 0.8,
  },
  auth: {
    primaryColor: '#55DDF5',
    secondaryColor: '#8FCFFF',
    accentColor: '#8B5CF6',
    ambientColor: '#030712',
    fogColor: '#030712',
    fogDensity: 0.02,

    fabricNodeCount: 32,
    fabricLayers: 2,
    fabricScale: 0.85,
    fabricCurvature: 1.5,

    signalCount: 5,
    signalSpeed: 0.35,
    signalBrightness: 0.5,

    connectionDensity: 0.35,
    connectionOpacity: 0.12,

    structuralSpeed: 0.14,
    depthParallax: 0.5,

    lightPulseSpeed: 0.25,
    lightPulseIntensity: 0.4,

    particleCount: 20,
    particleOpacity: 0.25,

    intensity: 0.6,
  },
  candidate: {
    primaryColor: '#55DDF5',
    secondaryColor: '#8FCFFF',
    accentColor: '#8B5CF6',
    ambientColor: '#030712',
    fogColor: '#030712',
    fogDensity: 0.02,

    fabricNodeCount: 36,
    fabricLayers: 2,
    fabricScale: 0.9,
    fabricCurvature: 1.6,

    signalCount: 6,
    signalSpeed: 0.35,
    signalBrightness: 0.55,

    connectionDensity: 0.35,
    connectionOpacity: 0.14,

    structuralSpeed: 0.15,
    depthParallax: 0.55,

    lightPulseSpeed: 0.25,
    lightPulseIntensity: 0.45,

    particleCount: 22,
    particleOpacity: 0.25,

    intensity: 0.65,
  },
  recruiter: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#55DDF5',
    accentColor: '#8FCFFF',
    ambientColor: '#030712',
    fogColor: '#030712',
    fogDensity: 0.02,

    fabricNodeCount: 36,
    fabricLayers: 2,
    fabricScale: 0.9,
    fabricCurvature: 1.6,

    signalCount: 6,
    signalSpeed: 0.35,
    signalBrightness: 0.55,

    connectionDensity: 0.35,
    connectionOpacity: 0.14,

    structuralSpeed: 0.15,
    depthParallax: 0.55,

    lightPulseSpeed: 0.25,
    lightPulseIntensity: 0.45,

    particleCount: 22,
    particleOpacity: 0.25,

    intensity: 0.65,
  },
  admin: {
    primaryColor: '#10b981',
    secondaryColor: '#55DDF5',
    accentColor: '#8B5CF6',
    ambientColor: '#030712',
    fogColor: '#030712',
    fogDensity: 0.022,

    fabricNodeCount: 30,
    fabricLayers: 2,
    fabricScale: 0.85,
    fabricCurvature: 1.4,

    signalCount: 5,
    signalSpeed: 0.3,
    signalBrightness: 0.5,

    connectionDensity: 0.3,
    connectionOpacity: 0.12,

    structuralSpeed: 0.12,
    depthParallax: 0.45,

    lightPulseSpeed: 0.2,
    lightPulseIntensity: 0.35,

    particleCount: 18,
    particleOpacity: 0.2,

    intensity: 0.55,
  },
  minimal: {
    primaryColor: '#55DDF5',
    secondaryColor: '#8FCFFF',
    accentColor: '#8B5CF6',
    ambientColor: '#030712',
    fogColor: '#030712',
    fogDensity: 0.025,

    fabricNodeCount: 20,
    fabricLayers: 1,
    fabricScale: 0.7,
    fabricCurvature: 1.2,

    signalCount: 3,
    signalSpeed: 0.25,
    signalBrightness: 0.4,

    connectionDensity: 0.25,
    connectionOpacity: 0.1,

    structuralSpeed: 0.1,
    depthParallax: 0.35,

    lightPulseSpeed: 0.15,
    lightPulseIntensity: 0.3,

    particleCount: 12,
    particleOpacity: 0.15,

    intensity: 0.4,
  },
  none: {
    primaryColor: '#000000',
    secondaryColor: '#000000',
    accentColor: '#000000',
    ambientColor: '#030712',
    fogColor: '#030712',
    fogDensity: 0.1,

    fabricNodeCount: 0,
    fabricLayers: 0,
    fabricScale: 0,
    fabricCurvature: 0,

    signalCount: 0,
    signalSpeed: 0,
    signalBrightness: 0,

    connectionDensity: 0,
    connectionOpacity: 0,

    structuralSpeed: 0,
    depthParallax: 0,

    lightPulseSpeed: 0,
    lightPulseIntensity: 0,

    particleCount: 0,
    particleOpacity: 0,

    intensity: 0,
  },
};

/**
 * Creates subtle, dark-friendly pinpoint dot sprites without white bloom
 */
function createPinpointDotSprite(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, colorHex);
  gradient.addColorStop(0.5, colorHex);
  gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface Node3D {
  baseX: number;
  baseY: number;
  baseZ: number;
  x: number;
  y: number;
  z: number;
  layer: number;
  phase: number;
  freq: number;
  color: string;
}

interface Connection3D {
  from: number;
  to: number;
  alpha: number;
}

interface SignalPacket {
  connIndex: number;
  progress: number;
  speed: number;
  color: string;
}

/**
 * OBSIDIAN AURA SCENE CONTROLLER
 * Minimal, elegant, luxury enterprise AI 3D environment.
 * The left side of the viewport is protected and kept calm for headline readability.
 * The 3D depth structure and subtle intelligence network are positioned on the right side.
 */
export class NexusScene {
  private canvas: HTMLCanvasElement;
  private mode: BackgroundMode;
  private theme: BackgroundTheme;
  private animId: number = 0;
  private isDisposed: boolean = false;
  private isMobile: boolean;

  // Parallax tracking
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // Three.js instances
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private clock = new THREE.Clock();
  private depthStructureGroup: THREE.Group | null = null;
  private nodesMesh: THREE.Points | null = null;
  private linesMesh: THREE.LineSegments | null = null;

  // 2D Fallback Context
  private ctx2d: CanvasRenderingContext2D | null = null;
  private nodes2D: Node3D[] = [];
  private connections2D: Connection3D[] = [];
  private signals2D: SignalPacket[] = [];

  constructor(canvas: HTMLCanvasElement, mode: BackgroundMode = 'hero', interactive: boolean = true) {
    this.canvas = canvas;
    this.mode = mode;
    this.theme = THEMES[mode] || THEMES.hero;
    this.isMobile = isMobileDevice();

    this.canvas.style.backgroundColor = '#030712';

    const webglSuccess = this.initThreeWebGL();
    if (!webglSuccess) {
      this.initCanvas2DEngine();
    }

    if (interactive && !this.isMobile) {
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    }
    window.addEventListener('resize', this.onResize, { passive: true });

    this.animate();
  }

  // ========================================================================
  // THREE.JS WEBGL IMPLEMENTATION
  // ========================================================================

  private initThreeWebGL(): boolean {
    if (this.mode === 'none') return true;

    try {
      const tier = getDevicePerformanceTier();
      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'high' ? 1.5 : 1.0);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: false,
        antialias: tier === 'high',
        powerPreference: 'default',
        depth: true,
        stencil: false,
      });

      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.renderer.setClearColor(new THREE.Color('#030712'), 1.0);

      // 1. Scene & Dark Fog
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(
        new THREE.Color('#030712'),
        this.theme.fogDensity
      );

      // 2. Camera
      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
      this.camera.position.set(0, 0.5, 24);
      this.camera.lookAt(0, 0, 0);

      // 3. Subtle Lighting — Controlled, away from headline
      const ambient = new THREE.AmbientLight(new THREE.Color('#07111F'), 0.7);
      this.scene.add(ambient);

      // Subtle cyan accent directional light aimed at the right-side structure
      const rightAccentLight = new THREE.DirectionalLight(new THREE.Color(this.theme.primaryColor), 0.5);
      rightAccentLight.position.set(16, 8, 8);
      this.scene.add(rightAccentLight);

      // 4. ELEMENT A — Depth Structure (Positioned strictly toward right side: X ~ 8..11)
      this.initRightDepthStructure();

      // 5. ELEMENT B — Subtle Intelligence Network (Right side cluster)
      this.initSubtleNetwork();

      return true;
    } catch (e) {
      console.warn('[NexusScene] WebGL unavailable, activating Obsidian 2D Canvas engine:', e);
      if (this.renderer) {
        try { this.renderer.dispose(); } catch {}
        this.renderer = null;
      }
      this.scene = null;
      this.camera = null;
      return false;
    }
  }

  /**
   * ELEMENT A: Abstract Asymmetrical 3D Structure positioned on the RIGHT side
   */
  private initRightDepthStructure() {
    if (!this.scene) return;
    this.depthStructureGroup = new THREE.Group();
    // Positioned exclusively on the right half of the screen
    this.depthStructureGroup.position.set(this.isMobile ? 0 : 8.5, 0.5, -2);
    this.scene.add(this.depthStructureGroup);

    // Subtle dark metallic faceted monolith
    const geom1 = new THREE.IcosahedronGeometry(3.6, 1);
    const mat1 = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#07111F'),
      roughness: 0.35,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
    });
    const mesh1 = new THREE.Mesh(geom1, mat1);
    this.depthStructureGroup.add(mesh1);

    // Fine cyan accent wireframe ring
    const ringGeom = new THREE.RingGeometry(4.2, 4.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.theme.primaryColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 3.5;
    this.depthStructureGroup.add(ringMesh);

    // Distant background octahedron
    const geom2 = new THREE.OctahedronGeometry(2.0, 1);
    const mat2 = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.theme.accentColor),
      roughness: 0.4,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const mesh2 = new THREE.Mesh(geom2, mat2);
    mesh2.position.set(4, -3, -4);
    this.depthStructureGroup.add(mesh2);
  }

  /**
   * ELEMENT B: Subtle Intelligence Network (Constrained to the right side)
   */
  private initSubtleNetwork() {
    if (!this.scene) return;
    const count = this.isMobile ? 24 : this.theme.fabricNodeCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const pri = new THREE.Color(this.theme.primaryColor);
    const sec = new THREE.Color(this.theme.secondaryColor);
    const acc = new THREE.Color(this.theme.accentColor);

    const nodesList: { pos: THREE.Vector3 }[] = [];

    // Confine nodes strictly to the right side (X from 2.5 to 15.0)
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();

      // Right-side biased coordinates
      const x = (this.isMobile ? (u - 0.5) * 14 : 3.5 + u * 11) + Math.sin(v * Math.PI) * 1.5;
      const y = (v - 0.5) * 16;
      const z = -6 + Math.random() * 8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = i % 3 === 0 ? pri : i % 3 === 1 ? sec : acc;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      nodesList.push({ pos: new THREE.Vector3(x, y, z) });
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const sprite = createPinpointDotSprite(this.theme.primaryColor);
    const nodeMat = new THREE.PointsMaterial({
      size: this.isMobile ? 1.6 : 2.2,
      vertexColors: true,
      map: sprite,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.nodesMesh = new THREE.Points(nodeGeo, nodeMat);
    this.scene.add(this.nodesMesh);

    // Fine, low-opacity connections
    const lineIndices: number[] = [];
    const maxDist = 4.2;

    for (let i = 0; i < count; i++) {
      let conn = 0;
      for (let j = i + 1; j < count; j++) {
        if (conn >= 2) break;
        const d = nodesList[i].pos.distanceTo(nodesList[j].pos);
        if (d < maxDist) {
          lineIndices.push(i, j);
          conn++;
        }
      }
    }

    const linePositions = new Float32Array(lineIndices.length * 3);
    const lineColors = new Float32Array(lineIndices.length * 3);

    for (let i = 0; i < lineIndices.length; i++) {
      const idx = lineIndices[i];
      const p = nodesList[idx].pos;
      linePositions[i * 3] = p.x;
      linePositions[i * 3 + 1] = p.y;
      linePositions[i * 3 + 2] = p.z;

      const col = idx % 2 === 0 ? pri : sec;
      lineColors[i * 3] = col.r;
      lineColors[i * 3 + 1] = col.g;
      lineColors[i * 3 + 2] = col.b;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: this.theme.connectionOpacity,
      depthWrite: false,
    });

    this.linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    this.scene.add(this.linesMesh);
  }

  // ========================================================================
  // 2D OBSIDIAN AURA ENGINE (Fallback)
  // ========================================================================

  private initCanvas2DEngine() {
    this.ctx2d = this.canvas.getContext('2d');
    if (!this.ctx2d) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width;
    this.canvas.height = height;

    const count = this.isMobile ? 24 : 45;
    this.nodes2D = [];

    // Right-biased 2D nodes
    for (let i = 0; i < count; i++) {
      const layer = i % 2;
      const z = 300 + Math.random() * 500;
      const x = width * 0.55 + Math.random() * (width * 0.42);
      const y = height * 0.15 + Math.random() * (height * 0.7);

      this.nodes2D.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        x, y, z,
        layer,
        phase: Math.random() * Math.PI * 2,
        freq: 0.3 + Math.random() * 0.4,
        color: i % 2 === 0 ? '#55DDF5' : '#8FCFFF',
      });
    }

    this.connections2D = [];
    for (let i = 0; i < count; i++) {
      let made = 0;
      for (let j = i + 1; j < count; j++) {
        if (made >= 2) break;
        const dx = this.nodes2D[i].baseX - this.nodes2D[j].baseX;
        const dy = this.nodes2D[i].baseY - this.nodes2D[j].baseY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) {
          this.connections2D.push({ from: i, to: j, alpha: 0.14 });
          made++;
        }
      }
    }

    this.signals2D = [];
    for (let i = 0; i < 6; i++) {
      this.signals2D.push({
        connIndex: Math.floor(Math.random() * Math.max(1, this.connections2D.length)),
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.004,
        color: '#55DDF5',
      });
    }
  }

  // ========================================================================
  // ANIMATION LOOP & PARALLAX
  // ========================================================================

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  private onResize = () => {
    if (this.isDisposed) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (this.renderer && this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
    } else if (this.ctx2d) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  };

  private animate = () => {
    if (this.isDisposed) return;
    this.animId = requestAnimationFrame(this.animate);

    if (this.mode === 'none') return;

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    const time = this.clock.getElapsedTime();

    if (this.renderer && this.scene && this.camera) {
      this.renderWebGLFrame(time);
    } else if (this.ctx2d) {
      this.renderCanvas2DFrame(time);
    }
  };

  private renderWebGLFrame(time: number) {
    if (!this.renderer || !this.scene || !this.camera) return;

    // Subtle restrained parallax
    const parallax = this.theme.depthParallax;
    this.camera.position.x = this.mouse.x * 1.2 * parallax;
    this.camera.position.y = 0.5 + this.mouse.y * 0.8 * parallax;
    this.camera.lookAt(0, 0, 0);

    // Slow, dignified rotation of the right depth structure
    if (this.depthStructureGroup) {
      this.depthStructureGroup.rotation.y = time * 0.04;
      this.depthStructureGroup.rotation.x = Math.sin(time * 0.03) * 0.06;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private renderCanvas2DFrame(time: number) {
    if (!this.ctx2d) return;
    const ctx = this.ctx2d;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Solid deep obsidian black base
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // 2. Soft atmospheric navy aura on the right side only
    const grad = ctx.createRadialGradient(w * 0.75, h * 0.5, 60, w * 0.75, h * 0.5, w * 0.45);
    grad.addColorStop(0, '#07111F');
    grad.addColorStop(0.7, '#030712');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const px = this.mouse.x * 15;
    const py = -this.mouse.y * 10;

    // 3. Right-side subtle wireframe monolith
    ctx.save();
    const polyX = w * 0.78 + px * 0.5;
    const polyY = h * 0.45 + py * 0.5;
    const polyRadius = Math.min(w * 0.07, 70);
    const angle = time * 0.08;

    ctx.strokeStyle = 'rgba(85, 221, 245, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const sides = 6;
    for (let s = 0; s < sides; s++) {
      const a = angle + (s * Math.PI * 2) / sides;
      const vx = polyX + Math.cos(a) * polyRadius;
      const vy = polyY + Math.sin(a) * (polyRadius * 0.7);
      if (s === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 4. Subtle Intelligence Network on right side
    ctx.save();
    for (let i = 0; i < this.connections2D.length; i++) {
      const conn = this.connections2D[i];
      const na = this.nodes2D[conn.from];
      const nb = this.nodes2D[conn.to];
      if (!na || !nb) continue;

      ctx.strokeStyle = `rgba(143, 207, 255, ${conn.alpha})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(na.x + px * 0.4, na.y + py * 0.4);
      ctx.lineTo(nb.x + px * 0.4, nb.y + py * 0.4);
      ctx.stroke();
    }
    ctx.restore();

    // Nodes
    ctx.save();
    for (let i = 0; i < this.nodes2D.length; i++) {
      const n = this.nodes2D[i];
      const wave = Math.sin(time * 0.3 * n.freq + n.phase) * 5;
      const nx = n.x + px * 0.4;
      const ny = n.y + py * 0.4 + wave;

      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  public setMode(newMode: BackgroundMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    this.theme = THEMES[newMode] || THEMES.hero;

    if (newMode === 'none') {
      if (this.renderer) {
        this.renderer.setClearColor(new THREE.Color('#030712'), 1.0);
      }
      return;
    }

    if (this.scene && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density = this.theme.fogDensity;
    }
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = 0;
    }

    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);

    if (this.renderer) {
      try { this.renderer.dispose(); } catch {}
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.ctx2d = null;
  }
}
