import { Role } from '../../types';

export interface RoleGreeting {
  displayName: string;
  hasName: boolean;
  headline: string;
  subtitle: string;
  voiceText: string;
  rate: number;
  pitch: number;
}

class VoiceAssistantService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voiceEnabled: boolean = true;
  private volume: number = 0.9;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      const storedEnabled = localStorage.getItem('ai_ats_pref_voice_enabled');
      this.voiceEnabled = storedEnabled === null ? true : storedEnabled === 'true';

      const storedVolume = localStorage.getItem('ai_ats_pref_voice_volume');
      if (storedVolume !== null) {
        const parsed = parseFloat(storedVolume);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }

      this.initVoices();
    }
  }

  private initVoices(): void {
    if (!this.synth) return;

    const loadVoices = () => {
      try {
        const available = this.synth?.getVoices() || [];
        if (available.length > 0) {
          this.voices = available;
          this.selectedVoice = this.pickBestFemaleVoice(available);
          this.isInitialized = true;
        }
      } catch {
        // Voice loading error: silent fallback
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Prioritize natural-sounding female English voices.
   * Looks for known neural/high-quality voices across OS platforms (Windows, macOS, Android, Chrome OS).
   */
  private pickBestFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const searchPool = englishVoices.length > 0 ? englishVoices : voices;

    // Ordered priority list of high quality female voices
    const priorityKeywords = [
      'google uk english female',
      'google us english',
      'microsoft jenny',
      'microsoft aria',
      'microsoft zira',
      'samantha',
      'victoria',
      'karen',
      'moira',
      'fiona',
      'serena',
      'stephanie',
    ];

    for (const keyword of priorityKeywords) {
      const match = searchPool.find((v) => v.name.toLowerCase().includes(keyword));
      if (match) return match;
    }

    // Generic check for "female" in voice name
    const anyFemale = searchPool.find((v) => v.name.toLowerCase().includes('female'));
    if (anyFemale) return anyFemale;

    // Fall back to default English voice or first voice in pool
    const defaultEn = searchPool.find((v) => v.default && v.lang.startsWith('en'));
    if (defaultEn) return defaultEn;

    return searchPool[0] || null;
  }

  public isAvailable(): boolean {
    return !!this.synth;
  }

  public isEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_ats_pref_voice_enabled', enabled ? 'true' : 'false');
    }
    if (!enabled) {
      this.stop();
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_ats_pref_voice_volume', clamped.toString());
    }
  }

  public getSelectedVoiceName(): string {
    return this.selectedVoice?.name || 'Default System Voice';
  }

  public stop(): void {
    if (!this.synth) return;
    try {
      this.synth.cancel();
    } catch {
      // Ignore cancel errors
    }
  }

  /**
   * Speak a phrase using the selected female assistant voice.
   * Handles deduplication to avoid repetitive triggers from React re-renders.
   */
  public speak(
    text: string,
    options?: {
      interrupt?: boolean;
      rate?: number;
      pitch?: number;
      force?: boolean;
    }
  ): void {
    if (!this.synth || (!this.voiceEnabled && !options?.force)) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    // Deduplication check: ignore duplicate messages requested within 2.5 seconds
    const now = Date.now();
    if (this.lastSpokenText === trimmed && now - this.lastSpokenTime < 2500) {
      return;
    }
    this.lastSpokenText = trimmed;
    this.lastSpokenTime = now;

    try {
      if (options?.interrupt !== false) {
        this.synth.cancel();
      }

      // Check if voices are loaded; if not, try once more
      if (!this.selectedVoice || this.voices.length === 0) {
        const available = this.synth.getVoices();
        if (available.length > 0) {
          this.voices = available;
          this.selectedVoice = this.pickBestFemaleVoice(available);
        }
      }

      const utterance = new SpeechSynthesisUtterance(trimmed);

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }

      // Optimal parameters for a warm, natural, professional delivery
      utterance.rate = options?.rate ?? 0.98;
      utterance.pitch = options?.pitch ?? 1.05;
      utterance.volume = this.volume;

      // Handle resume if speech synthesis was paused by browser tab management
      if (this.synth.paused) {
        this.synth.resume();
      }

      this.synth.speak(utterance);
    } catch {
      // Browser autoplay restriction or SpeechSynthesis failure: fail silently
    }
  }

  /**
   * Normalize and sanitize a display name.
   * Strips extra whitespace, rejects emails, null, undefined, or empty values.
   */
  public sanitizeDisplayName(rawName?: string | null): string {
    if (!rawName) return '';
    const cleaned = String(rawName).trim().replace(/\s+/g, ' ');
    const lower = cleaned.toLowerCase();
    if (
      !cleaned ||
      lower === 'null' ||
      lower === 'undefined' ||
      lower === 'anonymous' ||
      cleaned.includes('@') // Never announce email address as person's name
    ) {
      return '';
    }
    return cleaned;
  }

  /**
   * Generate an authoritative, role-aware greeting for Candidate, Recruiter, or Admin.
   * Dynamically formats name and role-specific templates.
   */
  public getRoleGreeting(
    user?: { name?: string; role?: Role } | null,
    portalRole?: Role
  ): RoleGreeting {
    const effectiveRole: Role = portalRole || user?.role || 'candidate';
    const displayName = this.sanitizeDisplayName(user?.name);
    const hasName = displayName.length > 0;

    let headline = '';
    let subtitle = '';
    let voiceText = '';
    let rate = 0.98;
    let pitch = 1.02;

    switch (effectiveRole) {
      case 'candidate':
        headline = hasName ? `Welcome back, ${displayName}!` : 'Welcome back!';
        subtitle = 'Your next career opportunity starts here.';
        voiceText = `${headline} ${subtitle}`;
        // Warm, encouraging, professional delivery
        rate = 0.96;
        pitch = 1.05;
        break;

      case 'recruiter':
        headline = hasName ? `Welcome back, ${displayName}!` : 'Welcome back!';
        subtitle = 'Your recruitment workspace is ready.';
        voiceText = `${headline} ${subtitle}`;
        // Confident, professional, concise delivery
        rate = 0.98;
        pitch = 1.02;
        break;

      case 'admin':
        headline = hasName ? `Welcome back, ${displayName}!` : 'Welcome back!';
        subtitle = 'Your administration dashboard is ready.';
        voiceText = `${headline} ${subtitle}`;
        // Calm, polished, authoritative delivery
        rate = 0.96;
        pitch = 1.00;
        break;

      default:
        headline = hasName ? `Welcome back, ${displayName}!` : 'Welcome back!';
        subtitle = 'Your workspace is ready.';
        voiceText = `${headline} ${subtitle}`;
        rate = 0.98;
        pitch = 1.02;
        break;
    }

    return {
      displayName,
      hasName,
      headline,
      subtitle,
      voiceText,
      rate,
      pitch,
    };
  }

  /**
   * Speak the personalized role welcome greeting.
   */
  public welcomeUser(
    user?: { name?: string; role?: Role } | null,
    portalRole?: Role
  ): RoleGreeting {
    const greeting = this.getRoleGreeting(user, portalRole);
    this.speak(greeting.voiceText, {
      interrupt: true,
      rate: greeting.rate,
      pitch: greeting.pitch,
    });
    return greeting;
  }

  /**
   * Test current voice settings
   */
  public test(): void {
    this.speak(
      'Hello! I am your AI ATS voice assistant. Natural announcements are configured and ready.',
      { force: true, interrupt: true }
    );
  }
}

export const voiceAssistantService = new VoiceAssistantService();

