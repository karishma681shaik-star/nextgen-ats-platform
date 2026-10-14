export type BackgroundMode = 
  | 'hero'        // Full NEXUS Intelligence Fabric — showcase experience
  | 'public'      // Alias for hero
  | 'auth'        // Restrained fabric with calm motion for login/register
  | 'candidate'   // Quiet network activity — subtle indigo/cyan
  | 'recruiter'   // Professional enterprise — muted violet/silver
  | 'admin'       // Restrained emerald operations — polished, calm
  | 'minimal'     // Ultra-subtle deep spatial atmosphere
  | 'none';       // Disabled for resume editor / preview

export interface BackgroundTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  ambientColor: string;
  fogColor: string;
  fogDensity: number;

  // Fabric configuration
  fabricNodeCount: number;
  fabricLayers: number;
  fabricScale: number;
  fabricCurvature: number;

  // Signal motion
  signalCount: number;
  signalSpeed: number;
  signalBrightness: number;

  // Connection graph
  connectionDensity: number;
  connectionOpacity: number;

  // Animation speeds
  structuralSpeed: number;
  depthParallax: number;

  // Light propagation
  lightPulseSpeed: number;
  lightPulseIntensity: number;

  // Particle background
  particleCount: number;
  particleOpacity: number;

  // Overall intensity
  intensity: number;
}

export interface Premium3DBackgroundProps {
  mode?: BackgroundMode;
  role?: 'public' | 'candidate' | 'recruiter' | 'admin' | 'auth';
  interactive?: boolean;
  className?: string;
  showOverlayGrid?: boolean;
  intensity?: 'full' | 'subtle' | 'minimal';
}
