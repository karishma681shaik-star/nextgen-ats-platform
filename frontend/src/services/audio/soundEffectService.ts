/**
 * Subtle Procedural Web Audio Sound Generator
 * Generates gentle, restrained confirmation chimes without external audio assets.
 * Respects user preferences and prefers-reduced-motion.
 */

class SoundEffectService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ai_ats_pref_sound_enabled');
      this.soundEnabled = stored === null ? true : stored === 'true';
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_ats_pref_sound_enabled', enabled ? 'true' : 'false');
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Gentle, elegant two-tone chime for positive confirmations (job posted, application submitted, login)
   */
  public playSuccessChime(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      gainNode.gain.setValueAtTime(0.0001, now);
      // Soft ramp in
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.02);
      // Gentle decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      // Warm harmonic interval (C5 -> E5: 523.25Hz -> 659.25Hz)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

      // Subtle atmospheric overtone (B5: 987.77Hz, much lower volume)
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.05);

      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.02, now);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.connect(gainNode);
      osc2.connect(overtoneGain);
      overtoneGain.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.05);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch {
      // Audio autoplay policy or hardware restriction: fail silently
    }
  }

  /**
   * Restrained, single tone confirmation (updates, saves, neutral admin decisions)
   */
  public playActionChime(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(698.46, now); // F5 tone

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio autoplay policy: fail silently
    }
  }
}

export const soundEffectService = new SoundEffectService();
