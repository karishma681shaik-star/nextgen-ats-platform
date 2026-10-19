import type { Role } from '../../types';

export interface WorkspaceContext {
  // Candidate Context
  hasResume?: boolean | null;
  profileCompletion?: number | null;
  activeApplicationsCount?: number | null;
  hasATSAnalysis?: boolean | null;

  // Recruiter Context
  isVerified?: boolean | null;
  verificationStatus?: string | null;
  activeJobsCount?: number | null;
  pendingReviewCount?: number | null;
  interviewsCount?: number | null;

  // Admin Context
  pendingRecruiterCount?: number | null;
  flaggedAccountsCount?: number | null;
  systemAlertsCount?: number | null;
}

export interface RoleGreeting {
  displayName: string;
  hasName: boolean;
  headline: string;
  subtitle: string;
  voiceText: string;
  rate: number;
  pitch: number;
}

export type SpeechStateListener = (isSpeaking: boolean) => void;

class VoiceAssistantService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voiceEnabled: boolean = true;
  private volume: number = 0.9;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private isInitialized: boolean = false;
  private currentlySpeaking: boolean = false;
  private stateListeners: Set<SpeechStateListener> = new Set();
  private autoplayBlocked: boolean = false;
  private pendingWelcomeGreeting: RoleGreeting | null = null;
  private keepAliveTimer: any = null;
  private currentQueue: SpeechSynthesisUtterance[] = [];
  private currentQueueIndex: number = 0;

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
    if (typeof window !== 'undefined') {
      const savedVoiceName = localStorage.getItem('ai_ats_pref_voice_name');
      if (savedVoiceName) {
        const userChoice = voices.find((v) => v.name === savedVoiceName);
        if (userChoice) return userChoice;
      }
    }

    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const searchPool = englishVoices.length > 0 ? englishVoices : voices;

    const priorityKeywords = [
      'google uk english female',     // Soft, soothing, refined British cadence — velvety & unique
      'sonia online (natural)',       // Microsoft Sonia Online (Natural) — warm, gentle UK voice
      'neerja online (natural)',      // Microsoft Neerja Online (Natural) — gentle, melodious tone
      'jenny online (natural)',       // Microsoft Jenny Online (Natural) — warm, soft conversational
      'aria online (natural)',        // Microsoft Aria Online (Natural) — smooth, executive
      'ava online (natural)',
      'emma online (natural)',
      'serena',
      'samantha (enhanced)',
      'samantha',
      'karen (enhanced)',
      'karen',
      'google uk english male',
      'google us english',
      'microsoft sonia',
      'microsoft neerja',
      'microsoft aria',
      'microsoft jenny',
      'microsoft zira',
    ];

    for (const keyword of priorityKeywords) {
      const match = searchPool.find((v) => v.name.toLowerCase().includes(keyword));
      if (match) return match;
    }

    const anyFemale = searchPool.find((v) => v.name.toLowerCase().includes('female'));
    if (anyFemale) return anyFemale;

    const anyNatural = searchPool.find((v) => v.name.toLowerCase().includes('natural'));
    if (anyNatural) return anyNatural;

    const defaultEn = searchPool.find((v) => v.default && v.lang.startsWith('en'));
    if (defaultEn) return defaultEn;

    return searchPool[0] || null;
  }

  public subscribe(listener: SpeechStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.currentlySpeaking);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notifyListeners(speaking: boolean): void {
    this.currentlySpeaking = speaking;
    this.stateListeners.forEach((listener) => {
      try {
        listener(speaking);
      } catch {
        // Safe isolation
      }
    });
  }

  public isAvailable(): boolean {
    return !!this.synth;
  }

  public isEnabled(): boolean {
    return this.voiceEnabled;
  }

  public isMuted(): boolean {
    return !this.voiceEnabled;
  }

  public isSpeaking(): boolean {
    if (this.synth) {
      return this.currentlySpeaking && this.synth.speaking;
    }
    return this.currentlySpeaking;
  }

  public isAutoplayBlocked(): boolean {
    return this.autoplayBlocked;
  }

  public getPendingWelcome(): RoleGreeting | null {
    return this.pendingWelcomeGreeting;
  }

  public unlockAudio(): void {
    if (!this.synth) return;
    try {
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0.01;
      silent.rate = 10;
      this.synth.speak(silent);
    } catch {
      // Ignore unlock failure
    }
  }

  public retryBlockedSpeech(): boolean {
    if (this.pendingWelcomeGreeting) {
      this.autoplayBlocked = false;
      this.unlockAudio();
      this.speak(this.pendingWelcomeGreeting.voiceText, {
        interrupt: true,
        rate: this.pendingWelcomeGreeting.rate,
        pitch: this.pendingWelcomeGreeting.pitch,
        force: true
      });
      return true;
    }
    return false;
  }

  public toggleMute(): boolean {
    const nextState = !this.voiceEnabled;
    this.setEnabled(nextState);
    return nextState;
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

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices() || [];
    }
    return this.voices.filter((v) => v.lang.startsWith('en') || v.name.toLowerCase().includes('natural'));
  }

  public getFormattedVoiceLabel(voice: SpeechSynthesisVoice): string {
    const name = voice.name;
    const lower = name.toLowerCase();
    if (lower.includes('google uk english female')) {
      return 'Google UK English Female (Soft, Gentle & Elegant British - Recommended)';
    }
    if (lower.includes('sonia online')) {
      return 'Microsoft Sonia (Soft & Soothing Natural UK)';
    }
    if (lower.includes('neerja online')) {
      return 'Microsoft Neerja (Gentle, Melodious & Warm)';
    }
    if (lower.includes('jenny online')) {
      return 'Microsoft Jenny (Warm, Soft & Conversational)';
    }
    if (lower.includes('aria online')) {
      return 'Microsoft Aria (Smooth, Professional Executive)';
    }
    if (lower.includes('google us english')) {
      return 'Google US English (Direct & Articulate)';
    }
    if (lower.includes('zira')) {
      return 'Microsoft Zira (Classic Desktop)';
    }
    return `${voice.name} (${voice.lang})`;
  }

  public resetToRecommendedVoice(): SpeechSynthesisVoice | null {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai_ats_pref_voice_name');
    }
    this.selectedVoice = this.pickBestFemaleVoice(this.voices);
    return this.selectedVoice;
  }

  public setSelectedVoiceByName(name: string): boolean {
    const match = this.voices.find((v) => v.name === name);
    if (match) {
      this.selectedVoice = match;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai_ats_pref_voice_name', name);
      }
      return true;
    }
    return false;
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
    return this.selectedVoice?.name || 'Natural AI Voice';
  }

  public splitIntoSentences(text: string): string[] {
    const rawMatches = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
    if (!rawMatches) return [text];
    return rawMatches.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (this.synth?.speaking) {
        this.synth.pause();
        this.synth.resume();
      } else if (!this.currentlySpeaking) {
        this.stopKeepAlive();
      }
    }, 10000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  public stop(): void {
    this.currentQueue = [];
    this.currentQueueIndex = 0;
    this.stopKeepAlive();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore cancel errors
      }
    }
    this.notifyListeners(false);
  }

  /**
   * Speak a complete welcome or announcement using natural chained sentence utterances.
   * Completely circumvents the Chromium 15-second speech synthesis timeout bug on Windows.
   */
  public speak(
    text: string,
    options?: {
      interrupt?: boolean;
      rate?: number;
      pitch?: number;
      force?: boolean;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (!this.synth || (!this.voiceEnabled && !options?.force)) return;

    if (options?.force) {
      this.voiceEnabled = true;
      if (this.volume < 0.5) {
        this.volume = 0.9;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai_ats_pref_voice_enabled', 'true');
      }
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    // Deduplication check: ignore duplicate messages requested within 2.5 seconds while speaking (unless force is set)
    const now = Date.now();
    if (!options?.force && this.lastSpokenText === trimmed && now - this.lastSpokenTime < 2500 && this.currentlySpeaking) {
      return;
    }
    this.lastSpokenText = trimmed;
    this.lastSpokenTime = now;

    if (options?.interrupt !== false) {
      this.stop();
    }

    const available = this.synth.getVoices();
    if (available.length > 0) {
      this.voices = available;
      if (!this.selectedVoice) {
        this.selectedVoice = this.pickBestFemaleVoice(available);
      }
    }

    const sentences = this.splitIntoSentences(trimmed);
    if (sentences.length === 0) return;

    const activeVoice = this.selectedVoice && this.voices.find((v) => v.name === this.selectedVoice?.name) || this.selectedVoice;

    this.currentQueue = sentences.map((sentence) => {
      const u = new SpeechSynthesisUtterance(sentence);
      if (activeVoice) {
        u.voice = activeVoice;
        u.lang = activeVoice.lang || 'en-US';
      } else {
        u.lang = 'en-US';
      }
      u.rate = options?.rate ?? 0.92;
      u.pitch = options?.pitch ?? 0.96;
      u.volume = Math.max(0.85, this.volume);
      return u;
    });

    this.currentQueueIndex = 0;
    this.notifyListeners(true);
    this.startKeepAlive();
    this.autoplayBlocked = false;

    const playNext = () => {
      if (this.currentQueueIndex >= this.currentQueue.length) {
        this.stopKeepAlive();
        this.notifyListeners(false);
        options?.onEnd?.();
        return;
      }

      const utterance = this.currentQueue[this.currentQueueIndex];
      this.currentQueueIndex++;

      utterance.onstart = () => {
        if (!this.currentlySpeaking) {
          this.notifyListeners(true);
        }
        if (this.currentQueueIndex === 1) {
          options?.onStart?.();
        }
      };

      utterance.onend = () => {
        playNext();
      };

      utterance.onerror = (e) => {
        const errType = (e as any)?.error;
        if (errType === 'interrupted' || errType === 'canceled') {
          return;
        }
        if (errType === 'not-allowed') {
          this.autoplayBlocked = true;
        }
        this.stopKeepAlive();
        this.notifyListeners(false);
        options?.onError?.(e);
      };

      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }
        // Guard against Chromium V8 garbage collecting active utterance prematurely
        (window as any).__nexusActiveUtterance = utterance;
        this.synth?.speak(utterance);
      } catch (err) {
        this.stopKeepAlive();
        this.notifyListeners(false);
        options?.onError?.(err);
      }
    };

    // 85ms delay ensures Chromium background speech cancel has fully settled
    setTimeout(playNext, 85);
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
      lower === 'first' || // Never announce placeholder "first"
      cleaned.includes('@') // Never announce email address as person's name
    ) {
      return '';
    }
    return cleaned;
  }

  /**
   * Authoritatively resolve the user's complete saved name.
   * Handles separate firstName / lastName fields, fullName, name, candidateName, recruiterName.
   * Cleans excessive whitespace, rejects null/undefined/empty/email values.
   * Never truncates or shortens to first name.
   */
  public resolveFullName(user?: any): string {
    if (!user) return '';

    if (typeof user === 'string') {
      return this.sanitizeDisplayName(user);
    }

    const first = typeof user.firstName === 'string' ? user.firstName.trim() : '';
    const last = typeof user.lastName === 'string' ? user.lastName.trim() : '';

    let candidate = '';
    if (first && last) {
      candidate = `${first} ${last}`;
    } else if (first) {
      candidate = first;
    } else if (last) {
      candidate = last;
    } else {
      const direct = user.fullName || user.name || user.candidateName || user.recruiterName || '';
      if (typeof direct === 'string') {
        candidate = direct;
      }
    }

    return this.sanitizeDisplayName(candidate);
  }

  /**
   * Generate an authoritative, full-length, role-aware greeting for Candidate, Recruiter, or Admin.
   * Speaks what Nexus AI can help the user accomplish with natural, encouraging closing.
   */
  public getRoleGreeting(
    user?: any,
    portalRole?: Role,
    context?: WorkspaceContext
  ): RoleGreeting {
    const effectiveRole: Role = portalRole || user?.role || 'candidate';
    const displayName = this.resolveFullName(user);
    const hasName = displayName.length > 0;

    let headline = '';
    let subtitle = '';
    let voiceText = '';
    let rate = 0.92;
    let pitch = 0.96;

    // Standard salutation prefix: A trailing period creates a natural cadence pause in SpeechSynthesis.
    const prefix = hasName ? `Welcome back, ${displayName}. ` : 'Welcome back. ';
    headline = hasName ? `Welcome back, ${displayName}!` : 'Welcome back!';

    switch (effectiveRole) {
      case 'candidate': {
        rate = 0.92;
        pitch = 0.96;

        // Context-driven candidate greetings with full explanations
        if (context?.hasResume === false) {
          subtitle = "Your career workspace is ready. I'm Nexus AI, your career assistant. Let's start by building your resume and creating a strong foundation for your job search. I can guide you through ATS optimization and help you discover opportunities tailored to your skills. Let's strengthen your profile and take the next step toward your career goals.";
        } else if (
          typeof context?.activeApplicationsCount === 'number' &&
          context.activeApplicationsCount > 0
        ) {
          subtitle = "Your career workspace is ready. I'm Nexus AI, your career assistant. Let's review your active applications and track your interview progress. I'm here to help you strengthen your resume and discover your next great career opportunity. Let's take the next step toward your career goals.";
        } else if (
          typeof context?.profileCompletion === 'number' &&
          context.profileCompletion > 0 &&
          context.profileCompletion < 80
        ) {
          subtitle = "Your career workspace is ready. I'm Nexus AI, your career assistant. You're making progress toward your career goals. Let's complete your profile, strengthen your ATS readiness, and make it easier for recruiters to discover your strengths. Let's take the next step toward your career goals.";
        } else {
          subtitle = "Your career workspace is ready. I'm Nexus AI, your career assistant. I can help you build and improve your resume, review its ATS readiness, discover relevant job opportunities, track your applications, and prepare for your next career move. Let's strengthen your profile and help you take the next step toward your career goals.";
        }

        voiceText = `${prefix}${subtitle}`;
        break;
      }

      case 'recruiter': {
        rate = 0.92;
        pitch = 0.95;

        // Recruiter verification check (unverified status takes strict precedence)
        const isExplicitlyUnverified =
          context?.isVerified === false ||
          (context?.verificationStatus &&
            context.verificationStatus.toUpperCase() !== 'VERIFIED');

        if (isExplicitlyUnverified) {
          subtitle = "Your recruitment workspace is ready. I'm Nexus AI, your recruitment assistant. Please note that recruiter verification must be completed before public job publishing is enabled. I can help you review incoming applicants, understand resume match results, and manage candidate workflows. Let's complete any outstanding verification steps and move your hiring process forward.";
        } else if (
          typeof context?.pendingReviewCount === 'number' &&
          context.pendingReviewCount > 0
        ) {
          subtitle = "Your recruitment workspace is ready. I'm Nexus AI, your recruitment assistant. You have candidate applications awaiting your review. I can help you evaluate candidate profiles, examine ATS match scores, and move suitable applicants to the next interview stage. Let's keep your hiring pipeline moving.";
        } else if (
          typeof context?.interviewsCount === 'number' &&
          context.interviewsCount > 0
        ) {
          subtitle = "Your recruitment workspace is ready. I'm Nexus AI, your recruitment assistant. Let's review your upcoming interviews and track applicant progression. I can help you manage your open requisitions and evaluate candidate dossiers. Let's keep your hiring process moving forward.";
        } else {
          subtitle = "Your recruitment workspace is ready. I'm Nexus AI, your recruitment assistant. I can help you manage your job postings, review applicants, understand resume match results, organize your candidate pipeline, and keep track of your recruitment activities. Let's help you identify relevant talent and move your hiring process forward.";
        }

        voiceText = `${prefix}${subtitle}`;
        break;
      }

      case 'admin': {
        rate = 0.91;
        pitch = 0.94;

        if (
          typeof context?.pendingRecruiterCount === 'number' &&
          context.pendingRecruiterCount > 0
        ) {
          subtitle = "Your administration workspace is ready. I'm Nexus AI, your platform administration assistant. You have pending recruiter verification requests awaiting evaluation. You can review compliance evidence, monitor user activity, and maintain a trustworthy recruitment platform. Let's keep platform operations running smoothly.";
        } else if (
          (typeof context?.flaggedAccountsCount === 'number' && context.flaggedAccountsCount > 0) ||
          (typeof context?.systemAlertsCount === 'number' && context.systemAlertsCount > 0)
        ) {
          subtitle = "Your administration workspace is ready. I'm Nexus AI, your platform administration assistant. There are platform security alerts requiring review. You can examine flagged activities, inspect audit logs, and safeguard system governance. Let's review the pending alerts and ensure platform integrity.";
        } else {
          subtitle = "Your administration workspace is ready. I'm Nexus AI, your platform administration assistant. You can review account activity, manage registered candidates and recruiters, evaluate recruiter verification requests, monitor job postings and application activity, and review important platform alerts. Let's keep the platform secure, organized, and operating smoothly.";
        }

        voiceText = `${prefix}${subtitle}`;
        break;
      }

      default: {
        subtitle = "Your workspace is ready. I'm Nexus AI, your workspace assistant. Let's help you accomplish your goals today.";
        voiceText = `${prefix}${subtitle}`;
        break;
      }
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
    user?: any,
    portalRole?: Role,
    context?: WorkspaceContext,
    options?: { force?: boolean }
  ): RoleGreeting {
    const greeting = this.getRoleGreeting(user, portalRole, context);
    this.pendingWelcomeGreeting = greeting;
    this.speak(greeting.voiceText, {
      interrupt: true,
      rate: greeting.rate,
      pitch: greeting.pitch,
      force: options?.force,
      onError: (err) => {
        const errType = (err as any)?.error;
        if (errType === 'not-allowed') {
          this.autoplayBlocked = true;
        }
      },
    });
    return greeting;
  }

  /**
   * Test current voice settings
   */
  public test(): void {
    this.speak(
      "Hello! I'm Nexus AI, your intelligent career and recruitment assistant. My voice is calibrated to sound warm, comfortable, and professional for your workspace.",
      { force: true, interrupt: true, rate: 0.92, pitch: 0.96 }
    );
  }
}

export const voiceAssistantService = new VoiceAssistantService();



