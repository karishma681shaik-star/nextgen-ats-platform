import * as THREE from 'three';
import { BackgroundTheme } from './types';

/**
 * NEXUS Depth Field — Ambient deep-space particle layers
 * 
 * Creates multiple depth layers of gentle background particles
 * that provide atmospheric depth and subtle parallax motion.
 * These are NOT random noise — they are carefully distributed
 * with controlled density and motion.
 */
export class DepthField {
  public group: THREE.Group;

  private layers: THREE.Points[] = [];
  private layerSpeeds: number[] = [];
  private count: number;

  constructor(theme: BackgroundTheme, isMobile: boolean) {
    this.group = new THREE.Group();

    this.count = isMobile
      ? Math.floor(theme.particleCount * 0.3)
      : theme.particleCount;

    const depthLayers = isMobile ? 2 : 3;
    const perLayer = Math.floor(this.count / depthLayers);

    const particleTexture = this.createDepthTexture();

    const primaryCol = new THREE.Color(theme.primaryColor);
    const secondaryCol = new THREE.Color(theme.secondaryColor);

    for (let layer = 0; layer < depthLayers; layer++) {
      const positions = new Float32Array(perLayer * 3);
      const colors = new Float32Array(perLayer * 3);

      // Each layer has different depth range and spread
      const depthMin = -30 - layer * 20;
      const depthMax = 20 - layer * 15;
      const spread = 50 + layer * 20;
      const layerOpacity = (0.5 - layer * 0.12) * theme.particleOpacity;

      for (let i = 0; i < perLayer; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.65;
        positions[i * 3 + 2] = depthMin + Math.random() * (depthMax - depthMin);

        const c = Math.random() > 0.6 ? primaryCol : secondaryCol;
        const brightness = (0.3 + Math.random() * 0.5) * layerOpacity;
        colors[i * 3] = c.r * brightness;
        colors[i * 3 + 1] = c.g * brightness;
        colors[i * 3 + 2] = c.b * brightness;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: isMobile ? 0.3 + layer * 0.15 : 0.5 + layer * 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      this.layers.push(points);
      this.layerSpeeds.push(0.008 + layer * 0.004);
      this.group.add(points);
    }
  }

  private createDepthTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.3, 'rgba(200, 220, 255, 0.5)');
      grad.addColorStop(0.7, 'rgba(100, 150, 220, 0.1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }

  public update(delta: number) {
    for (let i = 0; i < this.layers.length; i++) {
      // Gentle rotation — each layer at different speed for parallax
      this.layers[i].rotation.y += this.layerSpeeds[i] * delta;
      this.layers[i].rotation.x += this.layerSpeeds[i] * delta * 0.3;
    }
  }

  public dispose() {
    this.layers.forEach((points) => {
      if (points.geometry) points.geometry.dispose();
      if (points.material) {
        const mat = points.material as THREE.PointsMaterial;
        if (mat.map) mat.map.dispose();
        mat.dispose();
      }
    });
    this.layers = [];
  }
}
