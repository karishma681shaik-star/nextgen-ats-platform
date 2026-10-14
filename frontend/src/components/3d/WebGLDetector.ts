/**
 * Detect WebGL capability and user system preferences
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    const available = Boolean(gl && typeof gl.getParameter === 'function');
    if (gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    return available;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function getDevicePerformanceTier(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'low';
  
  const isMobile = isMobileDevice();
  const dpr = window.devicePixelRatio || 1;
  const pixels = window.innerWidth * window.innerHeight;
  
  // Check for hardware concurrency as a rough GPU proxy
  const cores = navigator.hardwareConcurrency || 2;
  
  if (isMobile || cores <= 2 || pixels < 500000) return 'low';
  if (dpr > 2 || cores <= 4) return 'medium';
  return 'high';
}
