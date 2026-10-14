import * as THREE from 'three';
import { BackgroundTheme } from './types';

/**
 * NEXUS Intelligence Fabric — Core geometric engine
 * 
 * Creates an enormous, abstract, gently curved intelligence fabric
 * with multiple flowing depth layers, fine geometric filaments,
 * luminous data signals, and organic spatial formations.
 */

// Generate a smooth parametric surface point using layered sine curves
function fabricPoint(u: number, v: number, layer: number, time: number, curvature: number): THREE.Vector3 {
  const layerSpread = layer * 4.5;
  const layerPhase = layer * 1.17;
  
  // Primary parametric curve — organic flowing topology
  const x = (u - 0.5) * 28 + Math.sin(v * Math.PI * 2.0 + layerPhase) * curvature * 1.8;
  const z = (v - 0.5) * 22 + Math.cos(u * Math.PI * 1.5 + layerPhase * 0.7) * curvature * 1.2;
  
  // Height field — multiple harmonic waves create the curved landscape
  const y = (
    Math.sin(u * Math.PI * 2.0 + time * 0.15 + layerPhase) * 1.8 +
    Math.cos(v * Math.PI * 3.0 + time * 0.1) * 1.2 +
    Math.sin((u + v) * Math.PI * 1.5 + time * 0.08 + layer) * 0.8
  ) - layerSpread;
  
  return new THREE.Vector3(x, y, z);
}

interface FabricNode {
  basePos: THREE.Vector3;
  pos: THREE.Vector3;
  layer: number;
  u: number;
  v: number;
  connections: number[];
  brightness: number;
  resonanceAmount: number;
}

interface SignalParticle {
  connectionStart: number;
  connectionEnd: number;
  progress: number;
  speed: number;
  brightness: number;
  active: boolean;
  color: THREE.Color;
}

export class IntelligenceFabric {
  public group: THREE.Group;

  private nodes: FabricNode[] = [];
  private signals: SignalParticle[] = [];
  private connections: [number, number][] = [];

  // Three.js objects
  private nodePoints!: THREE.Points;
  private connectionLines!: THREE.LineSegments;
  private signalPoints!: THREE.Points;
  private filamentLines!: THREE.LineSegments;

  // Buffers
  private nodePositions!: Float32Array;
  private nodeColors!: Float32Array;
  private nodeSizes!: Float32Array;
  private connectionPositions!: Float32Array;
  private connectionColors!: Float32Array;
  private signalPositions!: Float32Array;
  private signalColors!: Float32Array;
  private signalSizes!: Float32Array;
  private filamentPositions!: Float32Array;
  private filamentColors!: Float32Array;

  private theme: BackgroundTheme;
  private time: number = 0;
  private isMobile: boolean;

  // Resonance interaction state
  private resonancePoint = new THREE.Vector3(0, 0, 100);
  private resonanceActive = false;
  private resonanceDecay = 0;

  // Colors
  private primaryCol: THREE.Color;
  private secondaryCol: THREE.Color;
  private accentCol: THREE.Color;
  private dimCol: THREE.Color;

  constructor(theme: BackgroundTheme, isMobile: boolean) {
    this.theme = theme;
    this.isMobile = isMobile;
    this.group = new THREE.Group();

    this.primaryCol = new THREE.Color(theme.primaryColor);
    this.secondaryCol = new THREE.Color(theme.secondaryColor);
    this.accentCol = new THREE.Color(theme.accentColor);
    this.dimCol = new THREE.Color(theme.ambientColor).lerp(new THREE.Color(theme.primaryColor), 0.15);

    this.buildFabric();
    this.buildConnections();
    this.buildSignals();
    this.buildFilaments();
  }

  private buildFabric() {
    const nodeCount = this.isMobile
      ? Math.floor(this.theme.fabricNodeCount * 0.4)
      : this.theme.fabricNodeCount;
    const layers = this.isMobile
      ? Math.min(this.theme.fabricLayers, 2)
      : this.theme.fabricLayers;

    const nodesPerLayer = Math.floor(nodeCount / layers);

    // Generate nodes across layers using parametric sampling
    for (let layer = 0; layer < layers; layer++) {
      const gridRes = Math.ceil(Math.sqrt(nodesPerLayer));
      for (let iu = 0; iu < gridRes; iu++) {
        for (let iv = 0; iv < gridRes; iv++) {
          if (this.nodes.length >= nodeCount) break;

          // Jittered parametric coordinates for organic distribution
          const u = (iu + 0.15 + Math.random() * 0.7) / gridRes;
          const v = (iv + 0.15 + Math.random() * 0.7) / gridRes;
          
          const pos = fabricPoint(u, v, layer, 0, this.theme.fabricCurvature);
          pos.multiplyScalar(this.theme.fabricScale);

          this.nodes.push({
            basePos: pos.clone(),
            pos: pos.clone(),
            layer,
            u, v,
            connections: [],
            brightness: 0.3 + Math.random() * 0.4,
            resonanceAmount: 0,
          });
        }
      }
    }

    // Create Points geometry
    const count = this.nodes.length;
    this.nodePositions = new Float32Array(count * 3);
    this.nodeColors = new Float32Array(count * 3);
    this.nodeSizes = new Float32Array(count);

    const geo = new THREE.BufferGeometry();
    for (let i = 0; i < count; i++) {
      const n = this.nodes[i];
      this.nodePositions[i * 3] = n.pos.x;
      this.nodePositions[i * 3 + 1] = n.pos.y;
      this.nodePositions[i * 3 + 2] = n.pos.z;

      // Color varies by layer — deeper layers are dimmer
      const layerFactor = 1.0 - n.layer * 0.2;
      const col = n.layer % 3 === 0 ? this.primaryCol
        : n.layer % 3 === 1 ? this.secondaryCol
        : this.accentCol;
      this.nodeColors[i * 3] = col.r * layerFactor * n.brightness;
      this.nodeColors[i * 3 + 1] = col.g * layerFactor * n.brightness;
      this.nodeColors[i * 3 + 2] = col.b * layerFactor * n.brightness;

      this.nodeSizes[i] = (this.isMobile ? 1.5 : 2.2) * (0.6 + n.brightness * 0.6);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.nodePositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.nodeColors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(this.nodeSizes, 1));

    const nodeTexture = this.createNodeTexture();
    const mat = new THREE.PointsMaterial({
      size: this.isMobile ? 1.5 : 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      map: nodeTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.nodePoints = new THREE.Points(geo, mat);
    this.group.add(this.nodePoints);
  }

  private buildConnections() {
    // Connect nearby nodes within the same or adjacent layers
    const maxDist = this.isMobile ? 5.5 : 4.8;
    const maxConnPerNode = 4;
    const density = this.theme.connectionDensity;

    for (let i = 0; i < this.nodes.length; i++) {
      let conns = 0;
      for (let j = i + 1; j < this.nodes.length; j++) {
        if (conns >= maxConnPerNode) break;
        
        const layerDiff = Math.abs(this.nodes[i].layer - this.nodes[j].layer);
        if (layerDiff > 1) continue;

        const dist = this.nodes[i].pos.distanceTo(this.nodes[j].pos);
        if (dist < maxDist && Math.random() < density) {
          this.connections.push([i, j]);
          this.nodes[i].connections.push(this.connections.length - 1);
          this.nodes[j].connections.push(this.connections.length - 1);
          conns++;
        }
      }
    }

    // Build line geometry
    const count = this.connections.length;
    this.connectionPositions = new Float32Array(count * 6);
    this.connectionColors = new Float32Array(count * 6);

    for (let i = 0; i < count; i++) {
      const [a, b] = this.connections[i];
      const na = this.nodes[a];
      const nb = this.nodes[b];

      this.connectionPositions[i * 6] = na.pos.x;
      this.connectionPositions[i * 6 + 1] = na.pos.y;
      this.connectionPositions[i * 6 + 2] = na.pos.z;
      this.connectionPositions[i * 6 + 3] = nb.pos.x;
      this.connectionPositions[i * 6 + 4] = nb.pos.y;
      this.connectionPositions[i * 6 + 5] = nb.pos.z;

      const opacity = this.theme.connectionOpacity * 0.4;
      this.connectionColors[i * 6] = this.dimCol.r * opacity;
      this.connectionColors[i * 6 + 1] = this.dimCol.g * opacity;
      this.connectionColors[i * 6 + 2] = this.dimCol.b * opacity;
      this.connectionColors[i * 6 + 3] = this.dimCol.r * opacity;
      this.connectionColors[i * 6 + 4] = this.dimCol.g * opacity;
      this.connectionColors[i * 6 + 5] = this.dimCol.b * opacity;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.connectionPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.connectionColors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: this.theme.connectionOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.connectionLines = new THREE.LineSegments(geo, mat);
    this.group.add(this.connectionLines);
  }

  private buildSignals() {
    const signalCount = this.isMobile
      ? Math.floor(this.theme.signalCount * 0.35)
      : this.theme.signalCount;

    this.signalPositions = new Float32Array(signalCount * 3);
    this.signalColors = new Float32Array(signalCount * 3);
    this.signalSizes = new Float32Array(signalCount);

    for (let i = 0; i < signalCount; i++) {
      const connIdx = Math.floor(Math.random() * this.connections.length);
      const [a, b] = this.connections[connIdx] || [0, Math.min(1, this.nodes.length - 1)];

      const speed = (0.08 + Math.random() * 0.18) * this.theme.signalSpeed;
      const brightness = (0.4 + Math.random() * 0.6) * this.theme.signalBrightness;
      const colorChoice = Math.random();
      const color = colorChoice < 0.5 ? this.primaryCol.clone()
        : colorChoice < 0.8 ? this.secondaryCol.clone()
        : this.accentCol.clone();

      this.signals.push({
        connectionStart: a,
        connectionEnd: b,
        progress: Math.random(),
        speed,
        brightness,
        active: Math.random() < 0.5, // Not all signals active at once
        color,
      });

      // Initial positions
      const posA = this.nodes[a]?.pos || new THREE.Vector3();
      const posB = this.nodes[b]?.pos || new THREE.Vector3();
      const t = this.signals[i].progress;
      this.signalPositions[i * 3] = posA.x + (posB.x - posA.x) * t;
      this.signalPositions[i * 3 + 1] = posA.y + (posB.y - posA.y) * t;
      this.signalPositions[i * 3 + 2] = posA.z + (posB.z - posA.z) * t;

      this.signalColors[i * 3] = color.r * brightness;
      this.signalColors[i * 3 + 1] = color.g * brightness;
      this.signalColors[i * 3 + 2] = color.b * brightness;
      this.signalSizes[i] = this.isMobile ? 2.0 : 3.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.signalPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.signalColors, 3));

    const signalTexture = this.createSignalTexture();
    const mat = new THREE.PointsMaterial({
      size: this.isMobile ? 2.0 : 3.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      map: signalTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.signalPoints = new THREE.Points(geo, mat);
    this.group.add(this.signalPoints);
  }

  private buildFilaments() {
    // Fine decorative filaments — long curved lines threading through the fabric
    const filamentCount = this.isMobile ? 4 : 10;
    const segmentsPerFilament = 24;
    const totalVerts = filamentCount * segmentsPerFilament * 2;

    this.filamentPositions = new Float32Array(totalVerts * 3);
    this.filamentColors = new Float32Array(totalVerts * 3);

    let idx = 0;
    for (let f = 0; f < filamentCount; f++) {
      const baseU = Math.random();
      const baseV = Math.random();
      const layer = Math.floor(Math.random() * this.theme.fabricLayers);
      const curveDir = Math.random() > 0.5 ? 1 : -1;
      const filamentColor = f % 3 === 0 ? this.primaryCol
        : f % 3 === 1 ? this.secondaryCol
        : this.accentCol;
      const opacity = 0.08 + Math.random() * 0.12;

      for (let s = 0; s < segmentsPerFilament; s++) {
        const t0 = s / segmentsPerFilament;
        const t1 = (s + 1) / segmentsPerFilament;

        const u0 = baseU + t0 * 0.6 * curveDir;
        const v0 = baseV + t0 * 0.4;
        const u1 = baseU + t1 * 0.6 * curveDir;
        const v1 = baseV + t1 * 0.4;

        const p0 = fabricPoint(u0, v0, layer, 0, this.theme.fabricCurvature);
        const p1 = fabricPoint(u1, v1, layer, 0, this.theme.fabricCurvature);
        p0.multiplyScalar(this.theme.fabricScale);
        p1.multiplyScalar(this.theme.fabricScale);

        this.filamentPositions[idx * 3] = p0.x;
        this.filamentPositions[idx * 3 + 1] = p0.y;
        this.filamentPositions[idx * 3 + 2] = p0.z;
        this.filamentColors[idx * 3] = filamentColor.r * opacity;
        this.filamentColors[idx * 3 + 1] = filamentColor.g * opacity;
        this.filamentColors[idx * 3 + 2] = filamentColor.b * opacity;
        idx++;

        this.filamentPositions[idx * 3] = p1.x;
        this.filamentPositions[idx * 3 + 1] = p1.y;
        this.filamentPositions[idx * 3 + 2] = p1.z;
        this.filamentColors[idx * 3] = filamentColor.r * opacity;
        this.filamentColors[idx * 3 + 1] = filamentColor.g * opacity;
        this.filamentColors[idx * 3 + 2] = filamentColor.b * opacity;
        idx++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.filamentPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.filamentColors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.filamentLines = new THREE.LineSegments(geo, mat);
    this.group.add(this.filamentLines);
  }

  private createNodeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.15, 'rgba(200, 220, 255, 0.9)');
      grad.addColorStop(0.4, 'rgba(120, 180, 255, 0.35)');
      grad.addColorStop(0.75, 'rgba(60, 100, 200, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }

  private createSignalTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(180, 230, 255, 0.9)');
      grad.addColorStop(0.5, 'rgba(100, 180, 255, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Intelligence Resonance — the pointer interaction
   */
  public setResonancePoint(worldX: number, worldY: number, worldZ: number) {
    this.resonancePoint.set(worldX, worldY, worldZ);
    this.resonanceActive = true;
    this.resonanceDecay = 1.0;
  }

  public clearResonance() {
    this.resonanceActive = false;
  }

  public update(delta: number) {
    this.time += delta;
    const t = this.time;

    // Decay resonance
    if (this.resonanceDecay > 0) {
      this.resonanceDecay = Math.max(0, this.resonanceDecay - delta * 0.8);
    }

    // ── A. STRUCTURAL MOTION — fabric curvature changes slowly ──
    const structSpeed = this.theme.structuralSpeed;
    const posAttr = this.nodePoints.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = this.nodePoints.geometry.attributes.color as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      // Slowly evolving base position
      const newPos = fabricPoint(
        node.u, node.v, node.layer,
        t * structSpeed,
        this.theme.fabricCurvature
      );
      newPos.multiplyScalar(this.theme.fabricScale);

      // Apply Intelligence Resonance — nearby nodes displace gently
      if (this.resonanceDecay > 0) {
        const dist = newPos.distanceTo(this.resonancePoint);
        const resonanceRadius = 8.0;
        if (dist < resonanceRadius) {
          const influence = (1.0 - dist / resonanceRadius) * this.resonanceDecay * 0.6;
          const dir = newPos.clone().sub(this.resonancePoint).normalize();
          newPos.add(dir.multiplyScalar(influence * 1.2));
          node.resonanceAmount = influence;
        } else {
          node.resonanceAmount *= 0.92;
        }
      } else {
        node.resonanceAmount *= 0.92;
      }

      // Smooth interpolation toward target position
      node.pos.lerp(newPos, 0.03);

      positions[i * 3] = node.pos.x;
      positions[i * 3 + 1] = node.pos.y;
      positions[i * 3 + 2] = node.pos.z;

      // Glow nodes near resonance point
      const layerFactor = 1.0 - node.layer * 0.18;
      const col = node.layer % 3 === 0 ? this.primaryCol
        : node.layer % 3 === 1 ? this.secondaryCol
        : this.accentCol;

      const resonanceGlow = 1.0 + node.resonanceAmount * 3.0;
      const pulse = 1.0 + Math.sin(t * 0.8 + i * 0.3) * 0.08;
      const brightness = node.brightness * layerFactor * pulse * resonanceGlow;
      colors[i * 3] = col.r * brightness;
      colors[i * 3 + 1] = col.g * brightness;
      colors[i * 3 + 2] = col.b * brightness;
    }
    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // ── B. CONNECTION UPDATES ──
    const connPosAttr = this.connectionLines.geometry.attributes.position as THREE.BufferAttribute;
    const connColAttr = this.connectionLines.geometry.attributes.color as THREE.BufferAttribute;
    const connPositions = connPosAttr.array as Float32Array;
    const connColors = connColAttr.array as Float32Array;

    for (let i = 0; i < this.connections.length; i++) {
      const [a, b] = this.connections[i];
      const na = this.nodes[a];
      const nb = this.nodes[b];

      connPositions[i * 6] = na.pos.x;
      connPositions[i * 6 + 1] = na.pos.y;
      connPositions[i * 6 + 2] = na.pos.z;
      connPositions[i * 6 + 3] = nb.pos.x;
      connPositions[i * 6 + 4] = nb.pos.y;
      connPositions[i * 6 + 5] = nb.pos.z;

      // Connections near resonance become more visible
      const midX = (na.pos.x + nb.pos.x) * 0.5;
      const midY = (na.pos.y + nb.pos.y) * 0.5;
      const midZ = (na.pos.z + nb.pos.z) * 0.5;
      let connBrightness = this.theme.connectionOpacity * 0.35;

      if (this.resonanceDecay > 0) {
        const dx = midX - this.resonancePoint.x;
        const dy = midY - this.resonancePoint.y;
        const dz = midZ - this.resonancePoint.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 10) {
          connBrightness += (1.0 - dist / 10) * this.resonanceDecay * 0.6;
        }
      }

      // Light propagation — waves of brightness
      const propagation = Math.sin(t * this.theme.lightPulseSpeed + midX * 0.15 + midZ * 0.1) * 0.5 + 0.5;
      connBrightness += propagation * this.theme.lightPulseIntensity * 0.15;

      connColors[i * 6] = this.primaryCol.r * connBrightness;
      connColors[i * 6 + 1] = this.primaryCol.g * connBrightness;
      connColors[i * 6 + 2] = this.primaryCol.b * connBrightness;
      connColors[i * 6 + 3] = this.secondaryCol.r * connBrightness;
      connColors[i * 6 + 4] = this.secondaryCol.g * connBrightness;
      connColors[i * 6 + 5] = this.secondaryCol.b * connBrightness;
    }
    connPosAttr.needsUpdate = true;
    connColAttr.needsUpdate = true;

    // ── C. SIGNAL MOTION — data points traveling along connections ──
    const sigPosAttr = this.signalPoints.geometry.attributes.position as THREE.BufferAttribute;
    const sigColAttr = this.signalPoints.geometry.attributes.color as THREE.BufferAttribute;
    const sigPositions = sigPosAttr.array as Float32Array;
    const sigColors = sigColAttr.array as Float32Array;

    for (let i = 0; i < this.signals.length; i++) {
      const sig = this.signals[i];

      if (!sig.active) {
        // Randomly activate dormant signals
        if (Math.random() < 0.002) {
          sig.active = true;
          sig.progress = 0;
          // Pick new random connection
          const connIdx = Math.floor(Math.random() * this.connections.length);
          const [a, b] = this.connections[connIdx] || [0, Math.min(1, this.nodes.length - 1)];
          sig.connectionStart = a;
          sig.connectionEnd = b;
        }
        // Hide inactive signals
        sigColors[i * 3] = 0;
        sigColors[i * 3 + 1] = 0;
        sigColors[i * 3 + 2] = 0;
        continue;
      }

      sig.progress += sig.speed * delta;

      if (sig.progress >= 1.0) {
        // Signal reached end — either chain to a connected node or deactivate
        if (Math.random() < 0.35) {
          // Chain: pick a new connection from the end node
          const endNode = this.nodes[sig.connectionEnd];
          if (endNode && endNode.connections.length > 0) {
            const nextConnIdx = endNode.connections[Math.floor(Math.random() * endNode.connections.length)];
            const [ca, cb] = this.connections[nextConnIdx];
            sig.connectionStart = sig.connectionEnd;
            sig.connectionEnd = ca === sig.connectionEnd ? cb : ca;
            sig.progress = 0;
          } else {
            sig.active = false;
          }
        } else {
          sig.active = false;
        }
        continue;
      }

      const posA = this.nodes[sig.connectionStart]?.pos;
      const posB = this.nodes[sig.connectionEnd]?.pos;
      if (!posA || !posB) continue;

      // Smooth ease along the connection
      const smoothT = sig.progress * sig.progress * (3 - 2 * sig.progress); // smoothstep
      const x = posA.x + (posB.x - posA.x) * smoothT;
      const y = posA.y + (posB.y - posA.y) * smoothT;
      const z = posA.z + (posB.z - posA.z) * smoothT;

      sigPositions[i * 3] = x;
      sigPositions[i * 3 + 1] = y;
      sigPositions[i * 3 + 2] = z;

      // Brightness peaks in the middle of travel
      const travelGlow = Math.sin(sig.progress * Math.PI);
      const b = sig.brightness * travelGlow;
      sigColors[i * 3] = sig.color.r * b;
      sigColors[i * 3 + 1] = sig.color.g * b;
      sigColors[i * 3 + 2] = sig.color.b * b;
    }
    sigPosAttr.needsUpdate = true;
    sigColAttr.needsUpdate = true;
  }

  public dispose() {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Points) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m) => {
            if ((m as any).map) (m as any).map.dispose();
            m.dispose();
          });
        }
      }
    });
    this.nodes = [];
    this.signals = [];
    this.connections = [];
  }
}
