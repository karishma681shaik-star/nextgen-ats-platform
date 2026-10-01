import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  RotateCcw,
  Minimize2,
  Maximize2,
  ChevronRight,
  Bug
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';
import { sendCopilotMessage } from '../../services/api/copilotApi';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  tags?: string[];
}

export interface TalentPilotCopilotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTriggerButton?: boolean;
}

export const TalentPilotCopilot: React.FC<TalentPilotCopilotProps> = ({
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  hideTriggerButton = false,
}) => {
  const { role, user } = useAuth();
  const { showToast } = useToast();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Listen for global open/toggle events
  useEffect(() => {
    const handleToggle = () => setIsOpen(!isOpen);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('toggle-copilot', handleToggle);
    window.addEventListener('open-copilot', handleOpen);
    return () => {
      window.removeEventListener('toggle-copilot', handleToggle);
      window.removeEventListener('open-copilot', handleOpen);
    };
  }, [isOpen]);

  const getInitialMessages = (): Message[] => {
    if (role === 'recruiter') {
      return [
        {
          id: '1',
          sender: 'ai',
          text: `👋 Hello ${user?.name || 'Recruiter'}! I am **TalentPilot Copilot**, your recruitment intelligence assistant. How can I accelerate your hiring pipeline today?`,
          timestamp: 'Just now',
          tags: ['Sourcing', 'Pipelines', 'ATS Screening']
        }
      ];
    } else if (role === 'candidate') {
      return [
        {
          id: '1',
          sender: 'ai',
          text: `🚀 Hi ${user?.name || 'Candidate'}! I am **TalentPilot Copilot**. I can optimize your resume for ATS parsers, suggest high-impact keywords, or run a mock interview. What would you like to improve?`,
          timestamp: 'Just now',
          tags: ['ATS Boost', 'Keywords', 'Interview Prep']
        }
      ];
    } else {
      return [
        {
          id: '1',
          sender: 'ai',
          text: `🛡️ Welcome Administrator. TalentPilot AI is monitoring platform integrity, verifying recruiter credentials, and flagging anomalies.`,
          timestamp: 'Just now',
          tags: ['Audit', 'Verification', 'System Pulse']
        }
      ];
    }
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages);

  useEffect(() => {
    setMessages(getInitialMessages());
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const candidatePrompts = [
    { title: '⚡ Rewrite Bullet for ATS', query: 'Rewrite this bullet point to highlight high quantitative impact: "Managed frontend React code and reduced load times."' },
    { title: '🎯 Missing Keywords', query: 'What top 5 ATS keywords should I add for a Senior Full-Stack Engineer role?' },
    { title: '🎙️ Mock Interview Question', query: 'Give me a challenging behavioral interview question for a Lead Developer role and evaluate my approach.' },
    { title: '📝 30s Elevator Pitch', query: 'Craft a compelling 30-second elevator pitch highlighting my React, TypeScript, and Node.js expertise.' }
  ];

  const recruiterPrompts = [
    { title: '🔍 Boolean Search String', query: 'Create an advanced Boolean search query to source Senior React & TypeScript Engineers with AWS in London or Remote.' },
    { title: '✉️ Candidate Outreach Email', query: 'Write a personalized, high-converting cold message to an exceptional candidate on LinkedIn for a Staff Engineer role.' },
    { title: '📊 Technical Rubric', query: 'Generate an ATS scoring rubric for evaluating frontend architecture and state management candidates.' },
    { title: '💡 Fast-Track Recommendation', query: 'What key signals differentiate top 5% engineering candidates during resume screening?' }
  ];

  const adminPrompts = [
    { title: '🛡️ Audit Spam Risk', query: 'Run a heuristic scan on recent job postings to flag suspected scam or keyword-stuffed listings.' },
    { title: '📈 Platform Velocity', query: 'Summarize candidate-to-interview conversion benchmarks across tech vs business roles.' },
    { title: '⚡ System Diagnostics', query: 'Check the real-time health of AI parser workers and database read replicas.' }
  ];

  const activePrompts = role === 'candidate' ? candidatePrompts : role === 'recruiter' ? recruiterPrompts : adminPrompts;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const response = await sendCopilotMessage(query, { page: `${role}-dashboard` });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.success
          ? response.message
          : `⚠️ ${response.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ **Error:** ${err.message || 'Failed to connect to the AI service. Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast({ type: 'success', title: 'Copied to Clipboard', message: 'Content ready to paste!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages(getInitialMessages());
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && !hideTriggerButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-40 group"
          >
            {/* Radiant AI pulse aura */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400/40 via-indigo-500/60 to-purple-500/50 blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none animate-pulse" />

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              title={`Open ${role || 'Recruiter'} AI Copilot`}
              aria-label={`Open ${role || 'Recruiter'} AI Copilot`}
              className="relative flex items-center gap-3 px-4.5 py-2.5 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-b from-[#18204b]/95 via-[#12193e]/95 to-[#0b102c]/95 hover:from-[#212c66] hover:to-[#131b46] border border-indigo-400/60 hover:border-cyan-400/90 shadow-[0_4px_30px_rgba(79,70,229,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] backdrop-blur-2xl text-white transition-all duration-200 cursor-pointer active:scale-95 overflow-hidden"
            >
              {/* Top specular glass reflection line */}
              <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

              {/* Radiant AI jewel badge */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white border border-white/60 shadow-[0_0_16px_rgba(99,102,241,0.85)] group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <Sparkles className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              </div>

              <div className="flex flex-col text-left leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider bg-gradient-to-r from-white via-indigo-100 to-cyan-200 bg-clip-text text-transparent font-display drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                    TalentPilot AI
                  </span>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-indigo-200 font-bold capitalize tracking-wide">
                    {role || 'AI'} Copilot
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-300 font-mono text-[8px] font-extrabold border border-emerald-400/50 shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                    ONLINE
                  </span>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={cn(
              'fixed bottom-6 right-6 z-50 bg-[#090e1a]/95 backdrop-blur-3xl border border-indigo-500/30 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden transition-all duration-300',
              isExpanded
                ? 'w-[92vw] sm:w-[640px] h-[82vh] max-h-[750px]'
                : 'w-[92vw] sm:w-[420px] h-[590px]'
            )}
          >
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-650/8 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-650/6 rounded-full blur-2xl pointer-events-none z-0" />

            <div className="relative z-10 px-5 py-4 bg-[#0a0f24]/70 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-650 flex items-center justify-center text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white tracking-wide font-display">TalentPilot Copilot</h3>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[8px] font-black font-mono uppercase tracking-wider border border-indigo-550/20">
                      Pro AI
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Context: <span className="text-indigo-300 capitalize font-bold">{role} Intelligence</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 relative z-10">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-report-issue'))}
                  title="Report an issue or AI feedback (Alt+R)"
                  className="p-1.5 rounded-lg hover:text-violet-300 hover:bg-violet-500/15 transition-colors cursor-pointer text-slate-400"
                >
                  <Bug className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Minimize' : 'Expand'}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative z-10 px-4 py-2.5 bg-slate-950/30 border-b border-white/[0.04] overflow-x-auto flex items-center gap-2 no-scrollbar">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Prompts:
              </span>
              {activePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-indigo-650/20 text-slate-350 hover:text-indigo-200 border border-white/[0.04] hover:border-indigo-500/30 text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{p.title}</span>
                  <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                </button>
              ))}
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.15) }}
                  className={cn('flex gap-3', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7.5 h-7.5 rounded-lg bg-indigo-650/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm transition-all',
                      msg.sender === 'user'
                        ? 'bg-gradient-to-tr from-indigo-650 to-indigo-750 text-white rounded-tr-none border border-indigo-550/20'
                        : 'bg-slate-900/40 border border-white/[0.04] text-slate-200 rounded-tl-none backdrop-blur-md'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.tags && (
                      <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-white/[0.04]">
                        {msg.tags.map((t, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-950/60 text-indigo-300 text-[9px] font-bold font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 mt-2.5 text-[9px] text-slate-500 font-mono">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7.5 h-7.5 rounded-lg bg-slate-850 flex items-center justify-center text-slate-350 shrink-0 mt-0.5 border border-white/[0.04]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start items-center text-xs text-indigo-400">
                  <div className="w-7.5 h-7.5 rounded-lg bg-indigo-650/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-slate-900/40 border border-white/[0.04] rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] text-slate-450 ml-2 font-bold font-mono">TalentPilot is scanning...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative z-10 p-3 bg-slate-950/60 border-t border-white/[0.06] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  role === 'candidate'
                    ? 'Ask for resume polish, keyword hints...'
                    : role === 'recruiter'
                    ? 'Ask for Boolean search, candidate message templates...'
                    : 'Ask for platform diagnostics...'
                }
                className="flex-1 bg-slate-900/80 border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-555 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
