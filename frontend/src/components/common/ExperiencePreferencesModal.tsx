import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Film,
  RotateCcw,
  Play,
  X,
  Check,
  Headphones,
} from 'lucide-react';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';
import { soundEffectService } from '../../services/audio/soundEffectService';
import { useToast } from '../../context/ToastContext';

interface ExperiencePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExperiencePreferencesModal: React.FC<ExperiencePreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cinematicEnabled, setCinematicEnabled] = useState<boolean>(true);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (isOpen) {
      setVoiceEnabled(voiceAssistantService.isEnabled());
      soundEffectService.setEnabled(true);
      setSoundEnabled(soundEffectService.isEnabled());
      const cin = localStorage.getItem('ai_ats_pref_cinematic_enabled');
      setCinematicEnabled(cin === null ? true : cin === 'true');
      setSelectedVoiceName(voiceAssistantService.getSelectedVoiceName());
      setAvailableVoices(voiceAssistantService.getAvailableVoices());
    }
  }, [isOpen]);

  const handleSelectVoice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = e.target.value;
    setSelectedVoiceName(voiceName);
    voiceAssistantService.setSelectedVoiceByName(voiceName);
    showToast({
      type: 'info',
      title: 'Voice Updated',
      message: `Nexus AI voice set to ${voiceName}.`,
    });
  };

  if (!isOpen) return null;

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceAssistantService.setEnabled(next);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffectService.setEnabled(next);
    if (next) {
      soundEffectService.playActionChime();
    }
  };

  const handleToggleCinematic = () => {
    const next = !cinematicEnabled;
    setCinematicEnabled(next);
    localStorage.setItem('ai_ats_pref_cinematic_enabled', next ? 'true' : 'false');
    localStorage.setItem('ai_ats_disable_cinematic_intro', next ? 'false' : 'true');
  };

  const handleTestVoice = () => {
    voiceAssistantService.test();
    showToast({
      type: 'info',
      title: 'Testing Voice Assistant',
      message: 'Speaking test announcement in natural female voice.',
    });
  };

  const handleTestSound = () => {
    soundEffectService.playSuccessChime();
    showToast({
      type: 'info',
      title: 'Testing Audio Tone',
      message: 'Playing gentle procedural confirmation chime.',
    });
  };

  const handleReset = () => {
    voiceAssistantService.setEnabled(true);
    voiceAssistantService.resetToRecommendedVoice();
    soundEffectService.setEnabled(true);
    localStorage.setItem('ai_ats_pref_cinematic_enabled', 'true');
    localStorage.removeItem('ai_ats_disable_cinematic_intro');
    setVoiceEnabled(true);
    setSoundEnabled(true);
    setCinematicEnabled(true);
    setSelectedVoiceName(voiceAssistantService.getSelectedVoiceName());
    showToast({
      type: 'success',
      title: 'Preferences Reset',
      message: 'Experience and audio settings restored to default soft, comfortable voice.',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="experience-pref-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-[#0a1226] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-left my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="experience-pref-title" className="text-sm font-bold text-white font-display">
                Experience & Voice Preferences
              </h2>
              <p className="text-[11px] text-slate-400">
                Tailor cinematic presentations, speech synthesis, and feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close preferences"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggles */}
        <div className="mt-4 space-y-3.5">
          {/* Soft & Comfortable Voice Assistant */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Natural Soft Voice Assistant</p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Warm, comfortable, and executive voice for sign-in welcomes and announcements
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  voiceEnabled ? 'bg-indigo-600' : 'bg-slate-750'
                }`}
                aria-label="Toggle voice assistant"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    voiceEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {voiceEnabled && availableVoices.length > 0 && (
              <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                  <span>Voice Personality</span>
                  <span className="text-[10px] text-cyan-400/90 font-mono">Soft & Professional</span>
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={handleSelectVoice}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-750 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {voiceAssistantService.getFormattedVoiceLabel(v)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Interface Confirmation Chimes */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Subtle Sound Effects</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Gentle, harmonic procedural chimes for important actions
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                soundEnabled ? 'bg-emerald-600' : 'bg-slate-750'
              }`}
              aria-label="Toggle sound effects"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Cinematic Introductions */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cinematic Portal Introductions</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Plays smooth NextGen ATS entrance on first login
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleCinematic}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                cinematicEnabled ? 'bg-purple-600' : 'bg-slate-750'
              }`}
              aria-label="Toggle cinematic introductions"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  cinematicEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Testing & Reset Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestVoice}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Play className="w-3 h-3" /> Test Voice
            </button>
            <button
              type="button"
              onClick={handleTestSound}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Volume2 className="w-3 h-3" /> Test Chime
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
