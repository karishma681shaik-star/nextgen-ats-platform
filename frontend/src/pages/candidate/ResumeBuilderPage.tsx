import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Eye,
  Edit3,
  Gauge,
  Target,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  Download,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Check,
  Lightbulb,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Code2,
  User,
  RefreshCw,
  Loader2,
  Maximize2,
  Minimize2,
  FileText,
  GripVertical,
  Undo2,
  Redo2,
  Bug,
  Share2,
  Layout,
  LayoutGrid,
  Sliders,
  Type,
  ChevronLeft,
  ExternalLink,
  Zap,
  Trophy,
  X,
  Palette,
  Layers,
  Camera,
  UploadCloud,
  Globe,
  Link2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Linkedin,
  Github,
  Twitter,
  Dribbble,
  Figma,
  List,
  ListOrdered,
  MoreHorizontal,
  Wand2,
  EyeOff,
  Pilcrow,
  Rocket,
  Triangle,
  Bookmark,
  Search,
  Info,
  HelpCircle
} from 'lucide-react';
import { candidateService, jobService } from '../../services';
import { storage } from '../../services/mock/storage';
import { sendCopilotMessage } from '../../services/api/copilotApi';
import { useToast } from '../../context/ToastContext';
import { Resume, Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { ReportIssue } from '../../components/common/ReportIssue';
import { cn } from '../../utils/cn';

// Spacing & Typography Configuration
interface SpacingConfig {
  fontSize: string;
  padding: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  sectionGap: string;
  itemGap: string;
  fontFamily: 'serif' | 'sans' | 'mono';
  lineHeight: string;
  fontColor: string;
}

export interface TypographyLevelConfig {
  fontStyle: string;
  fontSize: string;
  lineHeight: string;
  fontColor: string;
}

export interface TypographyConfig {
  sectionHeader: TypographyLevelConfig;
  heading: TypographyLevelConfig;
  subheading: TypographyLevelConfig;
  description: TypographyLevelConfig;
}

export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  sectionHeader: {
    fontStyle: 'Tinos',
    fontSize: '16px',
    lineHeight: '1.2',
    fontColor: '#000000'
  },
  heading: {
    fontStyle: 'Tinos',
    fontSize: '15px',
    lineHeight: '1.25',
    fontColor: '#000000'
  },
  subheading: {
    fontStyle: 'Tinos',
    fontSize: '14px',
    lineHeight: '1.25',
    fontColor: '#000000'
  },
  description: {
    fontStyle: 'Tinos',
    fontSize: '13px',
    lineHeight: '1.4',
    fontColor: '#000000'
  }
};

export const AVAILABLE_FONTS = [
  { id: 'Tinos', name: 'Tinos', family: "'Tinos', serif" },
  { id: 'Cinzel', name: 'Cinzel', family: "'Cinzel', serif" },
  { id: 'Shantell Sans', name: 'Shantell Sans', family: "'Shantell Sans', cursive, sans-serif" },
  { id: 'Geist', name: 'Geist', family: "'Geist', sans-serif" },
  { id: 'Geist Mono', name: 'Geist Mono', family: "'Geist Mono', monospace" },
  { id: 'Instrument Serif', name: 'Instrument Serif', family: "'Instrument Serif', serif" }
];

// Available Section IDs
type SectionId =
  | 'profile'
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'awards'
  | 'custom';

// Social Link Item Interface
export interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  customLabel?: string;
}

// Full Structured Resume Data Interface
interface ResumeBuilderData {
  name: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  headline: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  location: string;
  photo?: string;
  socialLinks: SocialLinkItem[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary: string;
  activeSections: SectionId[];
  experience: Array<{
    id: string;
    role: string;
    employmentType: string;
    company: string;
    locationType: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    hideMonth?: boolean;
    description: string;
    technologies: string;
    visible?: boolean;
  }>;
  education: Array<{
    id: string;
    institution: string;
    location: string;
    city?: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    cgpa: string;
    cgpaLabel?: string;
    hideMonth?: boolean;
    description?: string;
    details?: string;
    visible?: boolean;
  }>;
  projects: Array<{
    id: string;
    title: string;
    role: string;
    dates?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    hideMonth?: boolean;
    description: string;
    technologies: string;
    link?: string;
    links?: Array<{
      id: string;
      platform: string;
      customLabel?: string;
      url: string;
    }>;
    visible?: boolean;
  }>;
  skills: {
    programmingLanguages: string;
    frameworksLibraries: string;
    toolsPlatforms: string;
    databases: string;
    softSkills: string;
    languages: string;
    customCategories?: Array<{
      id: string;
      name: string;
      skills: string;
    }>;
  };
  certifications: Array<{
    id: string;
    title: string;
    issuer: string;
    issueDate: string;
    link?: string;
    linkLabel?: string;
    description?: string;
    visible?: boolean;
  }>;
  awards: Array<{
    id: string;
    title: string;
    issuer: string;
    year: string;
    description: string;
  }>;
  customSection: {
    title: string;
    content: string;
  };
  template: 'low' | 'medium' | 'bulky' | 'mit';
  layoutPreset?: string;
  spacing: SpacingConfig;
  typography?: TypographyConfig;
}

export type ResumeExperienceItem = ResumeBuilderData['experience'][number];
export type ResumeEducationItem = ResumeBuilderData['education'][number];
export type ResumeProjectItem = ResumeBuilderData['projects'][number];

export interface OptimizationHistoryItem {
  id: string;
  score: number;
  status: 'Completed' | 'In Progress';
  timestamp: number;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  resumeSnapshot?: ResumeBuilderData;
}

export const formatOptimizationTime = (timestamp: number) => {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

// Section Catalog Configuration (Image 1 Exact Match)
interface SectionInfo {
  id: SectionId;
  name: string;
  icon: React.ReactNode;
  description: string;
  boostPrefix?: string;
  boostHighlight?: string;
  boostSuffix?: string;
}

const SECTION_CATALOG: SectionInfo[] = [
  {
    id: 'profile',
    name: 'Profile',
    icon: <User className="w-4.5 h-4.5 text-indigo-300" />,
    description: 'Make a great first impression by presenting yourself in a few sentences.',
    boostPrefix: 'Adding summary boosts shortlist chances by ',
    boostHighlight: '27% ↑',
    boostSuffix: ''
  },
  {
    id: 'education',
    name: 'Education',
    icon: <GraduationCap className="w-4.5 h-4.5 text-indigo-300" />,
    description: 'Show off your primary education, college degrees & exchange semesters.',
    boostPrefix: 'Education adds ',
    boostHighlight: 'credibility',
    boostSuffix: ', especially for freshers.'
  },
  {
    id: 'experience',
    name: 'Professional Experience',
    icon: <Briefcase className="w-4.5 h-4.5 text-indigo-300" />,
    description: 'A place to highlight your professional experience - including internships.',
    boostPrefix: 'Work experiences gets ',
    boostHighlight: '40% ↑',
    boostSuffix: ' more attention'
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: <Zap className="w-4.5 h-4.5 text-indigo-300" />,
    description: 'List your technical, managerial or soft skills in this section.',
    boostPrefix: 'Adding skills boosts screening success by ',
    boostHighlight: '30% ↑',
    boostSuffix: ''
  },
  {
    id: 'certifications',
    name: 'Certifications',
    icon: <Award className="w-4.5 h-4.5 text-indigo-300" />,
    description: 'Drivers licenses and other industry-specific certificates you have belong here.'
  },
  {
    id: 'summary',
    name: 'Professional Summary',
    icon: (
      <svg className="w-4.5 h-4.5 text-indigo-300" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="6" r="3" />
        <rect x="14" y="3" width="6" height="6" rx="1" />
        <polygon points="6,14 9,20 3,20" />
        <polygon points="17,14 20,17 17,20 14,17" />
      </svg>
    ),
    description: 'Do you have a professional summary that aligns with your career aspiration?'
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: <Rocket className="w-4.5 h-4.5 text-indigo-300" />,
    description: 'Worked on a particular challenging project in the past? Mention it here.',
    boostPrefix: 'Projects boost callbacks rate by ',
    boostHighlight: '22% ↑',
    boostSuffix: ''
  },
  {
    id: 'awards',
    name: 'Awards & Achievements',
    icon: <Trophy className="w-4.5 h-4.5 text-indigo-300" />,
    description: 'Awards like student competitions or industry accolades belong here.',
    boostPrefix: 'Achievements raise recruiter\'s interest by ',
    boostHighlight: '18% ↑',
    boostSuffix: ''
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: (
      <svg className="w-4.5 h-4.5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.439 7.85c0-1.57.973-2.85 2.172-2.85v-.01a2.85 2.85 0 0 0-2.85-2.85H15.91a2.85 2.85 0 0 0-2.85 2.17 2.85 2.85 0 0 1-5.7 0 2.85 2.85 0 0 0-2.85-2.17H1.66A2.85 2.85 0 0 0-1.19 4.99v.01c1.2 0 2.172 1.28 2.172 2.85s-.973 2.85-2.172 2.85v.01a2.85 2.85 0 0 0 2.85 2.85h2.85a2.85 2.85 0 0 0 2.85-2.17 2.85 2.85 0 0 1 5.7 0 2.85 2.85 0 0 0 2.85 2.17h2.85a2.85 2.85 0 0 0 2.85-2.85v-.01c-1.2 0-2.172-1.28-2.172-2.85z" />
      </svg>
    ),
    description: 'You didn\'t find what you are looking for? or you want to combine two sections to save space?'
  }
];

export interface LayoutPresetConfig {
  step: number;
  name: string;
  fontSize: string;
  sectionGap: string;
  itemGap: string;
  padding: string;
}

export const PRESET_LAYOUTS: LayoutPresetConfig[] = [
  { step: 1, name: 'Ultra Compact', fontSize: '11px', sectionGap: '7px', itemGap: '4px', padding: '16px' },
  { step: 2, name: 'Extra Compact', fontSize: '11.5px', sectionGap: '9px', itemGap: '5px', padding: '18px' },
  { step: 3, name: 'Compact', fontSize: '12px', sectionGap: '11px', itemGap: '5px', padding: '20px' },
  { step: 4, name: 'Dense', fontSize: '12.5px', sectionGap: '12px', itemGap: '6px', padding: '22px' },
  { step: 5, name: 'Balanced', fontSize: '13px', sectionGap: '13px', itemGap: '6px', padding: '24px' },
  { step: 6, name: 'Comfortable', fontSize: '13.5px', sectionGap: '14px', itemGap: '7px', padding: '24px' },
  { step: 7, name: 'Relaxed', fontSize: '14.5px', sectionGap: '14px', itemGap: '8px', padding: '26px' },
  { step: 8, name: 'Spacious', fontSize: '15.5px', sectionGap: '15px', itemGap: '9px', padding: '26px' },
  { step: 9, name: 'Premium', fontSize: '17px', sectionGap: '16px', itemGap: '10px', padding: '28px' },
];

interface DirectEditableTextProps {
  value?: string;
  placeholder: string;
  onChange: (newVal: string) => void;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  viewMode: 'editor' | 'preview';
  defaultShowBox?: boolean;
  tag?: 'span' | 'p' | 'div' | 'h1';
}

export const DirectEditableText: React.FC<DirectEditableTextProps> = ({
  value,
  placeholder,
  onChange,
  multiline = false,
  className = '',
  style = {},
  viewMode,
  defaultShowBox = false,
  tag = 'span'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localVal, setLocalVal] = useState(value || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalVal(value || '');
  }, [value]);

  useEffect(() => {
    if (isFocused && multiline && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 24)}px`;
    }
  }, [isFocused, localVal, multiline]);

  const hasValue = Boolean(value && value.trim());

  // In Preview Mode:
  if (viewMode === 'preview') {
    if (!hasValue) return null;
    const Tag = tag;
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  // In Editor Mode:
  const isBoxActive = isFocused || isHovered || defaultShowBox;

  if (isFocused) {
    if (multiline) {
      return (
        <div className="w-full relative my-0.5" onClick={(e) => e.stopPropagation()}>
          <textarea
            ref={textareaRef}
            autoFocus
            rows={1}
            value={localVal}
            placeholder={placeholder}
            onChange={(e) => {
              setLocalVal(e.target.value);
              onChange(e.target.value);
            }}
            onBlur={() => {
              setIsFocused(false);
              onChange(localVal);
            }}
            className={cn(
              'w-full bg-indigo-500/[0.04] border border-indigo-500 rounded px-2 py-1 outline-none resize-none transition-all shadow-sm',
              className
            )}
            style={{
              ...style,
              fontFamily: style.fontFamily || 'inherit',
              fontSize: style.fontSize || 'inherit',
              lineHeight: style.lineHeight || 'inherit',
              color: style.color || '#000000'
            }}
          />
        </div>
      );
    }

    return (
      <input
        ref={inputRef}
        autoFocus
        type="text"
        value={localVal}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          setLocalVal(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={() => {
          setIsFocused(false);
          onChange(localVal);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className={cn(
          'bg-indigo-500/[0.04] border border-indigo-500 rounded px-1.5 py-0.5 outline-none transition-all shadow-sm',
          className
        )}
        style={{
          ...style,
          fontFamily: style.fontFamily || 'inherit',
          fontSize: style.fontSize || 'inherit',
          color: style.color || '#000000'
        }}
      />
    );
  }

  // Not focused (hoverable / clickable with purple border)
  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsFocused(true);
        setLocalVal(hasValue ? (value || '') : '');
      }}
      title="Click to edit directly on resume"
      className={cn(
        'inline-block transition-all duration-150 cursor-text select-text relative',
        isBoxActive
          ? 'border border-indigo-400 bg-indigo-500/[0.03] rounded px-1.5 py-0.5'
          : 'border border-transparent px-1.5 py-0.5',
        !hasValue ? 'italic text-[#64748b]' : '',
        className
      )}
      style={style}
    >
      {hasValue ? value : placeholder}
    </span>
  );
};

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: +(cx + r * Math.cos(rad)).toFixed(2),
    y: +(cy - r * Math.sin(rad)).toFixed(2),
  };
};

const createArcSegment = (
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number
) => {
  const p1 = polarToCartesian(cx, cy, rOuter, startDeg);
  const p2 = polarToCartesian(cx, cy, rOuter, endDeg);
  const p3 = polarToCartesian(cx, cy, rInner, endDeg);
  const p4 = polarToCartesian(cx, cy, rInner, startDeg);

  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 0 0 ${p4.x} ${p4.y} Z`;
};

interface SpeedometerGaugeProps {
  score: number;
  isCard?: boolean;
  continueLabel?: string;
  onContinue?: () => void;
}

const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  score,
  isCard = false,
  continueLabel = 'Continue Optimizing',
  onContinue,
}) => {
  const clamped = Math.min(100, Math.max(0, score));
  const [needleAngle, setNeedleAngle] = useState(-90);
  const [displayScore, setDisplayScore] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const runSweepAnimation = () => {
    // Reset needle to -90 (0% score on left)
    setNeedleAngle(-90);
    setDisplayScore(0);

    const targetAngle = -90 + (clamped / 100) * 180;

    // Small timeout to allow render frame, then trigger CSS transition and counter animation
    const timer = setTimeout(() => {
      setNeedleAngle(targetAngle);

      let startTime: number | null = null;
      const duration = 1500;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // easeOutCubic curve for realistic deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayScore(Math.round(eased * clamped));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayScore(clamped);
        }
      };

      requestAnimationFrame(step);
    }, 80);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    runSweepAnimation();
  }, [score]);

  // Geometry configuration
  const cx = 130;
  const cy = 118;
  const rOuter = 98;
  const rInner = 84;
  const rArc = 81;

  // 4 distinct curved pill segments matching user screenshot:
  // 1. Red (180 to 137 deg)
  // 2. Yellow (134 to 92 deg)
  // 3. Lime / Yellow-Green (89 to 47 deg)
  // 4. Emerald Green (44 to 1 deg)
  const segmentRed = createArcSegment(cx, cy, rInner, rOuter, 180, 137);
  const segmentYellow = createArcSegment(cx, cy, rInner, rOuter, 134, 92);
  const segmentLime = createArcSegment(cx, cy, rInner, rOuter, 89, 47);
  const segmentGreen = createArcSegment(cx, cy, rInner, rOuter, 44, 1);

  // Generate 46 fine tick marks along inner white arc
  const ticks = Array.from({ length: 46 }).map((_, i) => {
    const angleDeg = 180 - i * 4;
    const isMajor = i % 5 === 0;
    const pStart = polarToCartesian(cx, cy, rArc, angleDeg);
    const pEnd = polarToCartesian(cx, cy, isMajor ? rArc - 8.5 : rArc - 4.5, angleDeg);
    return {
      x1: pStart.x,
      y1: pStart.y,
      x2: pEnd.x,
      y2: pEnd.y,
      isMajor,
    };
  });

  const gaugeSvg = (
    <div className="relative w-full max-w-[270px] mx-auto flex flex-col items-center justify-center select-none">
      <svg
        className="w-full h-36 overflow-visible drop-shadow-md"
        viewBox="0 0 260 135"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Inner Semi-Circle Green Glow that fades down towards bottom */}
          <linearGradient id="meterInnerGreenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.82" />
            <stop offset="32%" stopColor="#16a34a" stopOpacity="0.55" />
            <stop offset="68%" stopColor="#15803d" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0c0a20" stopOpacity="0.02" />
          </linearGradient>

          {/* Needle Drop Shadow */}
          <filter id="needleShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Inner Green Glow Area */}
        <path
          d={`M ${polarToCartesian(cx, cy, rArc - 1, 180).x} ${polarToCartesian(cx, cy, rArc - 1, 180).y} A ${rArc - 1} ${rArc - 1} 0 0 1 ${polarToCartesian(cx, cy, rArc - 1, 0).x} ${polarToCartesian(cx, cy, rArc - 1, 0).y} L ${cx} ${cy} Z`}
          fill="url(#meterInnerGreenGlow)"
        />

        {/* 2. Outer 4 Colored Arc Segments (Exact match to screenshot) */}
        {/* Segment 1: Red */}
        <path
          d={segmentRed}
          fill="#f87171"
          stroke="#ef4444"
          strokeWidth="0.75"
          className="transition-opacity hover:opacity-90"
        />

        {/* Segment 2: Yellow */}
        <path
          d={segmentYellow}
          fill="#facc15"
          stroke="#eab308"
          strokeWidth="0.75"
          className="transition-opacity hover:opacity-90"
        />

        {/* Segment 3: Yellow-Green / Lime */}
        <path
          d={segmentLime}
          fill="#a3e635"
          stroke="#84cc16"
          strokeWidth="0.75"
          className="transition-opacity hover:opacity-90"
        />

        {/* Segment 4: Deep Green */}
        <path
          d={segmentGreen}
          fill="#22c55e"
          stroke="#16a34a"
          strokeWidth="0.75"
          className="transition-opacity hover:opacity-90"
        />

        {/* 3. Inner White Arc Border Line */}
        <path
          d={`M ${polarToCartesian(cx, cy, rArc, 180).x} ${polarToCartesian(cx, cy, rArc, 180).y} A ${rArc} ${rArc} 0 0 1 ${polarToCartesian(cx, cy, rArc, 0).x} ${polarToCartesian(cx, cy, rArc, 0).y}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.2"
        />

        {/* 4. Fine Radial Gauge Tick Marks */}
        {ticks.map((t, idx) => (
          <line
            key={idx}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="#ffffff"
            strokeWidth={t.isMajor ? '1.25' : '0.75'}
            strokeOpacity={t.isMajor ? '0.9' : '0.6'}
            strokeLinecap="round"
          />
        ))}

        {/* 5. Animated Needle with Authentic Physics Overshoot & Settling */}
        <g
          filter="url(#needleShadow)"
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 1.6s cubic-bezier(0.34, 1.45, 0.64, 1)',
          }}
        >
          {/* Sleek Tapered Black Needle */}
          <polygon
            points={`${cx - 3.5},${cy} ${cx + 3.5},${cy} ${cx + 0.8},${cy - 88} ${cx - 0.8},${cy - 88}`}
            fill="#09090b"
            stroke="#000000"
            strokeWidth="0.5"
          />

          {/* Needle Base Pivot Cap */}
          <circle cx={cx} cy={cy} r="7.5" fill="#090d16" stroke="#1e293b" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="3" fill="#334155" />
        </g>
      </svg>
    </div>
  );

  if (!isCard) {
    return gaugeSvg;
  }

  // Full Card layout matching user screenshot
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-2xl border border-indigo-500/25 p-5 space-y-3 shadow-2xl relative overflow-hidden transition-all duration-300"
      style={{
        background: 'radial-gradient(ellipse 110% 85% at 50% -10%, rgba(99, 102, 241, 0.42) 0%, rgba(30, 27, 75, 0.52) 45%, #0c0a22 100%)',
      }}
    >
      {/* Header: Overall Score (i) + Score readout + Replay trigger */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-white">
            <h3 className="text-sm font-bold tracking-wide">Overall Score</h3>
            <span
              className="text-xs text-slate-400 cursor-help hover:text-white transition-colors"
              title="Overall ATS Match Score based on resume performance and role requirements"
            >
              ⓘ
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tight">{displayScore}</span>
            <span className="text-xs text-slate-300 font-semibold">/ 100</span>
          </div>
        </div>

        {/* Interactive replay button */}
        <button
          type="button"
          onClick={runSweepAnimation}
          title="Replay meter animation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs"
        >
          ↻
        </button>
      </div>

      {/* Speedometer Gauge Component */}
      {gaugeSvg}

      {/* Full-width "Continue Optimizing ->" purple button (Exact match to screenshot) */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full py-3.5 px-4 rounded-xl bg-[#6366f1] hover:bg-[#5255e2] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>{continueLabel}</span>
        <span className="text-base font-bold">→</span>
      </button>
    </div>
  );
};

const BalloonsCelebration: React.FC = () => {
  const balloons = [
    { color: '#8b5cf6', stroke: '#7c3aed', left: '8%', delay: '0s', duration: '3.6s', scale: 0.9 },
    { color: '#ec4899', stroke: '#db2777', left: '26%', delay: '0.8s', duration: '4.2s', scale: 1.1 },
    { color: '#6366f1', stroke: '#4f46e5', left: '50%', delay: '0.3s', duration: '3.8s', scale: 0.85 },
    { color: '#a855f7', stroke: '#9333ea', left: '72%', delay: '1.4s', duration: '4.5s', scale: 1.05 },
    { color: '#38bdf8', stroke: '#0284c7', left: '88%', delay: '0.6s', duration: '4s', scale: 0.95 },
  ];

  const stars = [
    { top: '10%', left: '12%', size: 12, delay: '0.1s' },
    { top: '24%', left: '22%', size: 8, delay: '0.9s' },
    { top: '15%', left: '38%', size: 10, delay: '0.5s' },
    { top: '30%', left: '46%', size: 7, delay: '1.6s' },
    { top: '18%', left: '62%', size: 11, delay: '0.3s' },
    { top: '28%', left: '78%', size: 8, delay: '1.1s' },
    { top: '12%', left: '90%', size: 12, delay: '0.7s' },
    { top: '65%', left: '14%', size: 8, delay: '1.3s' },
    { top: '78%', left: '26%', size: 10, delay: '0.2s' },
    { top: '68%', left: '42%', size: 7, delay: '1.5s' },
    { top: '80%', left: '66%', size: 11, delay: '0.6s' },
    { top: '72%', left: '84%', size: 8, delay: '1.0s' },
    { top: '85%', left: '92%', size: 9, delay: '0.4s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes balloonDrift {
          0%, 100% { transform: translateY(6px) rotate(-3deg); }
          50% { transform: translateY(-16px) rotate(4deg); }
        }
        @keyframes starTwinkleEffect {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>

      {balloons.map((b, i) => (
        <div
          key={i}
          className="absolute -top-2"
          style={{
            left: b.left,
            animation: `balloonDrift ${b.duration} ease-in-out infinite`,
            animationDelay: b.delay,
            transform: `scale(${b.scale})`,
          }}
        >
          <svg width="42" height="74" viewBox="0 0 42 74" className="overflow-visible drop-shadow-lg">
            <defs>
              <radialGradient id={`balloonGlow-${i}`} cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                <stop offset="35%" stopColor={b.color} />
                <stop offset="100%" stopColor={b.stroke} />
              </radialGradient>
            </defs>
            <path
              d="M 21 4 C 33 4, 40 15, 40 29 C 40 44, 26 53, 22 55 L 21 56 L 20 55 C 16 53, 2 44, 2 29 C 2 15, 9 4, 21 4 Z"
              fill={`url(#balloonGlow-${i})`}
              stroke={b.stroke}
              strokeWidth="0.8"
            />
            <polygon points="18,56 24,56 22,59 20,59" fill={b.stroke} />
            <path
              d="M 21 59 Q 25 65, 19 71 T 22 79"
              fill="none"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1"
            />
          </svg>
        </div>
      ))}

      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute text-purple-400 select-none pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            fontSize: `${s.size}px`,
            animation: `starTwinkleEffect 2.4s ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        >
          ✦
        </div>
      ))}
    </div>
  );
};

export const ResumeBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const rawTab = searchParams.get('tab') || 'editor';
  const activeTab = (rawTab === 'optimize-for-job' || rawTab === 'job-optimize') ? 'job-optimize' : rawTab;
  const optimizeJobIdParam = searchParams.get('optimize_job_id');

  // Mode: Editor Mode or Preview Mode
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [activePaperItemId, setActivePaperItemId] = useState<string | null>(null);
  const [showExportGuideModal, setShowExportGuideModal] = useState<boolean>(false);
  const [dontShowExportAgain, setDontShowExportAgain] = useState<boolean>(false);

  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeData, setResumeData] = useState<ResumeBuilderData | null>(null);

  // Layout Stepper State
  const [layoutStep, setLayoutStep] = useState<number>(5);

  const applyLayoutStep = (stepNumber: number) => {
    const preset = PRESET_LAYOUTS.find((p) => p.step === stepNumber) || PRESET_LAYOUTS[4];
    setLayoutStep(stepNumber);
    handleUpdate((p) => ({
      ...p,
      layoutPreset: preset.name.toLowerCase(),
      spacing: {
        ...p.spacing,
        fontSize: preset.fontSize,
        sectionGap: preset.sectionGap,
        itemGap: preset.itemGap,
        padding: preset.padding
      }
    }));
  };

  const applyLayoutPreset = (presetName: string) => {
    const preset = PRESET_LAYOUTS.find((p) => p.name.toLowerCase() === presetName.toLowerCase()) || PRESET_LAYOUTS[4];
    setLayoutStep(preset.step);
    handleUpdate((p) => ({
      ...p,
      layoutPreset: preset.name.toLowerCase(),
      spacing: {
        ...p.spacing,
        fontSize: preset.fontSize,
        sectionGap: preset.sectionGap,
        itemGap: preset.itemGap,
        padding: preset.padding
      }
    }));
  };

  // Undo / Redo History
  const [history, setHistory] = useState<ResumeBuilderData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Loading & Saving States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add Section Modal State
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  // Personal Information Edit View Mode (Screenshots 2 & 3 vs Screenshot 1)
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [personalInfoSnapshot, setPersonalInfoSnapshot] = useState<ResumeBuilderData | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Professional Summary Edit View Mode (Image 1 vs Image 2)
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summarySnapshot, setSummarySnapshot] = useState<string>('');
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Work Experience Edit View Mode (Images 1, 2, 3, 4)
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [experienceSnapshot, setExperienceSnapshot] = useState<any[] | null>(null);
  const [isGeneratingAiExp, setIsGeneratingAiExp] = useState(false);
  const experienceDescriptionRef = useRef<HTMLTextAreaElement>(null);

  // Education Edit View Mode (Images 1, 2, 3)
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [educationSnapshot, setEducationSnapshot] = useState<any[] | null>(null);
  const [isGeneratingAiEdu, setIsGeneratingAiEdu] = useState(false);
  const [isEditingCgpaLabel, setIsEditingCgpaLabel] = useState(false);
  const educationDescriptionRef = useRef<HTMLTextAreaElement>(null);

  // Projects Edit View Mode (Images 1, 2, 3)
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectSnapshot, setProjectSnapshot] = useState<any[] | null>(null);
  const [isGeneratingAiProject, setIsGeneratingAiProject] = useState(false);
  const projectDescriptionRef = useRef<HTMLTextAreaElement>(null);

  // Skills Edit View Mode (Screenshots 1, 2, 3, 4, 5)
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillsSnapshot, setSkillsSnapshot] = useState<any | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryKeywordInputs, setCategoryKeywordInputs] = useState<Record<string, string>>({});
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);

  // Open Accordion Sections in Editor (collapsed by default matching Image 1)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profile: false,
    summary: false,
    experience: false,
    education: false,
    projects: false,
    skills: false,
    certifications: false,
    awards: false,
    custom: false
  });

  // Customize Template Accordion State
  const [customizationAccordion, setCustomizationAccordion] = useState<Record<string, boolean>>({
    templates: true,
    layouts: false,
    spacing: false,
    typography: false
  });

  const templateCarouselRef = useRef<HTMLDivElement>(null);
  const [templateScrollProgress, setTemplateScrollProgress] = useState(0);

  // Typography Quick Tips Modal & Font Dropdown State
  const [isQuickTipsOpen, setIsQuickTipsOpen] = useState(false);
  const [activeFontDropdown, setActiveFontDropdown] = useState<string | null>(null);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);

  // Custom Section Edit State (Images 1 & 2)
  const [isEditingCustomSection, setIsEditingCustomSection] = useState(false);
  const [useParagraphFormat, setUseParagraphFormat] = useState(true);
  const [customSectionForm, setCustomSectionForm] = useState<{ title: string; content: string }>({
    title: '',
    content: ''
  });
  const customDescriptionRef = useRef<HTMLTextAreaElement>(null);

  // Resizable Panel & Splitter States
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(540);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);
  const [isDraggingResizer, setIsDraggingResizer] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingResizer) return;
      const newWidth = e.clientX - 64;
      if (newWidth >= 320 && newWidth <= 850) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingResizer(false);
    };

    if (isDraggingResizer) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingResizer]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Job Optimization & Discovery States (Images 1, 2, 3, 4, 5)
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [viewingJobInModal, setViewingJobInModal] = useState<Job | null>(null);
  const [optimizeSubTab, setOptimizeSubTab] = useState<'keywords' | 'history' | 'description'>('keywords');
  const [keywordsStrongOpen, setKeywordsStrongOpen] = useState(true);
  const [keywordsGoodOpen, setKeywordsGoodOpen] = useState(false);
  const [roleAlignmentOpen, setRoleAlignmentOpen] = useState(false);
  // Controls whether the user has clicked "Start New Analysis" (Image 1 → Image 2 transition)
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);
  // Resume Readiness Gate state (Image 2 modal)
  const [isReadinessGateOpen, setIsReadinessGateOpen] = useState(false);
  const [isCheckingReadiness, setIsCheckingReadiness] = useState(false);
  // Analyzing animation state shown while backend parses the resume
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);



  // ATS Score & Suggestions State (Exact Match to Image 1)
  const [atsFilterTab, setAtsFilterTab] = useState<'pending' | 'completed' | 'deleted'>('completed');
  const [deletedSuggestionIds, setDeletedSuggestionIds] = useState<Set<string>>(new Set());
  const [selectedReasonSuggestion, setSelectedReasonSuggestion] = useState<ATSSuggestion | null>(null);

  // Guided AI Optimization Wizard State (Matching Image 1)
  const [isAiWizardActive, setIsAiWizardActive] = useState(() => searchParams.get('wizard') === 'true' || searchParams.get('tab') === 'ai-wizard');
  const [aiWizardStep, setAiWizardStep] = useState<number>(() => {
    const s = Number(searchParams.get('wizard_step'));
    return s >= 1 && s <= 4 ? s : 1;
  });
  const [aiWizardActionTab, setAiWizardActionTab] = useState<'pending' | 'completed' | 'deleted'>('pending');
  const [wizardFixedActionIds, setWizardFixedActionIds] = useState<Set<string>>(new Set());
  const [wizardDeletedActionIds, setWizardDeletedActionIds] = useState<Set<string>>(new Set());
  // Step 1: Missing Keywords Cards state (Image 1 match with throwing animation)
  const [keywordTab, setKeywordTab] = useState<'pending' | 'completed' | 'deleted'>('pending');
  const [keywordCompletedIds, setKeywordCompletedIds] = useState<Set<string>>(new Set());
  const [keywordDeletedIds, setKeywordDeletedIds] = useState<Set<string>>(new Set());
  const [throwingCardId, setThrowingCardId] = useState<string | null>(null);
  const [throwingDirection, setThrowingDirection] = useState<'right' | 'left' | null>(null);
  const [isEnvelopeCelebrationOpen, setIsEnvelopeCelebrationOpen] = useState(false);
  const [isPostOptimizationView, setIsPostOptimizationView] = useState(false);
  const [, setHistoryTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHistoryTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistoryItem[]>(() => [
    {
      id: 'opt-hist-1',
      score: 76,
      status: 'Completed',
      timestamp: Date.now() - 13 * 3600 * 1000,
      jobTitle: 'Software Engineer',
      company: 'American Express',
    },
    {
      id: 'opt-hist-2',
      score: 68,
      status: 'Completed',
      timestamp: Date.now() - 19 * 3600 * 1000,
      jobTitle: 'Software Engineer',
      company: 'American Express',
    },
    {
      id: 'opt-hist-3',
      score: 68,
      status: 'Completed',
      timestamp: Date.now() - 19 * 3600 * 1000,
      jobTitle: 'Software Engineer',
      company: 'American Express',
    },
    {
      id: 'opt-hist-4',
      score: 68,
      status: 'Completed',
      timestamp: Date.now() - 22 * 3600 * 1000,
      jobTitle: 'Software Engineer',
      company: 'American Express',
    },
  ]);

  // Suggested Changes floating popover state (Image 2 & 3)
  const [activeSuggestedChange, setActiveSuggestedChange] = useState<{
    id: string;
    title: string;
    category: string;
    existingText?: string;
    newText?: string;
    bulletItems?: string[];
  } | null>(null);

  // Dynamic AI generated summary and suggested action items
  const [aiTailoredSummary, setAiTailoredSummary] = useState<string>('');
  const [dynamicSuggestedActions, setDynamicSuggestedActions] = useState<Array<{
    id: string;
    title: string;
    section: 'Certifications' | 'Skills' | 'Education' | 'Projects' | 'Experience';
    category: string;
    reason?: string;
    existingText?: string;
    newText?: string;
    bulletItems?: string[];
  }>>([]);
  const [isEditingTailoredSummary, setIsEditingTailoredSummary] = useState(false);
  const [editableTailoredSummary, setEditableTailoredSummary] = useState('');
  const [summaryGenStageText, setSummaryGenStageText] = useState('Extracting key skills and experiences...');

  // AI Progress Modals State (Image 1: Keywords, Image 2: Summary)
  const [aiProgressModalType, setAiProgressModalType] = useState<'keywords' | 'summary' | null>(null);
  const [aiProgressPercent, setAiProgressPercent] = useState(8);
  const [aiProgressStep, setAiProgressStep] = useState<1 | 2 | 3>(1);

  // Legacy state aliases for compatibility
  const isGeneratingSummary = aiProgressModalType !== null;
  const summaryGenProgress = aiProgressPercent;
  const summaryGenStep = aiProgressStep;
  const setIsGeneratingSummary = (val: boolean) => {
    if (!val) setAiProgressModalType(null);
  };
  const setSummaryGenProgress = setAiProgressPercent;
  const setSummaryGenStep = setAiProgressStep;

  // Add Skill / Certification Modal State (Screenshots 1 & 2)
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [addSkillKeyword, setAddSkillKeyword] = useState('Distributed Systems');
  const [addSkillOption, setAddSkillOption] = useState<'add-specific' | 'let-ai' | 'do-not-add'>('add-specific');
  const [addSkillSection, setAddSkillSection] = useState('skills');
  const [addSkillContext, setAddSkillContext] = useState('');
  const [activeModalKeywordItem, setActiveModalKeywordItem] = useState<{ id: string; keyword: string } | null>(null);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [keywordSectionMap, setKeywordSectionMap] = useState<Record<string, string>>({});
  const [trackedKeywordItems, setTrackedKeywordItems] = useState<Record<string, { id: string; keyword: string; question: string }>>({});

  // Active Resume Selection States
  const [availableResumes, setAvailableResumes] = useState<Resume[]>([]);
  const [isResumeSelectorOpen, setIsResumeSelectorOpen] = useState(false);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedVersion, setOptimizedVersion] = useState<string | null>(null);
  const [isJobDiscoveryOpen, setIsJobDiscoveryOpen] = useState(false);
  const [discoverySubTab, setDiscoverySubTab] = useState<'all' | 'saved'>('all');
  const [activeDiscoveryTab, setActiveDiscoveryTab] = useState<'job-board' | 'manual'>('job-board');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobExpFilter, setJobExpFilter] = useState('All Levels');
  const [isExpDropdownOpen, setIsExpDropdownOpen] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState<Set<string>>(new Set());
  const [isJobTypeDropdownOpen, setIsJobTypeDropdownOpen] = useState(false);
  const [jobSortBy, setJobSortBy] = useState<'newest' | 'high-score'>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => new Set(storage.getSavedJobs()));
  const [manualJobTitle, setManualJobTitle] = useState('');
  const [manualJobCompany, setManualJobCompany] = useState('');
  const [manualJobDescription, setManualJobDescription] = useState('');

  useEffect(() => {
    if (optimizeJobIdParam) {
      setSelectedJobId(optimizeJobIdParam);
    }
  }, [optimizeJobIdParam]);

  // Fit to Single Page & Page Pagination
  const [fitSinglePage, setFitSinglePage] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Title Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    loadResumeAndJobs();
  }, [id]);

  const loadResumeAndJobs = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      console.log("Resume Builder resumeId:", id);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let res: Resume;
      let jobsList: Job[] = [];

      let allCandidateResumes: Resume[] = [];
      if (isUuid) {
        const [resumeRes, jobsRes, allRes] = await Promise.all([
          candidateService.getResume(id),
          jobService.getJobs().catch(() => []),
          candidateService.getResumes().catch(() => [])
        ]);
        res = resumeRes;
        jobsList = jobsRes;
        allCandidateResumes = allRes || [];
      } else {
        const [allResumes, jobsRes] = await Promise.all([
          candidateService.getResumes().catch(() => []),
          jobService.getJobs().catch(() => [])
        ]);
        jobsList = jobsRes;
        allCandidateResumes = allResumes || [];
        if (allResumes.length > 0) {
          res = allResumes[0];
        } else {
          res = {
            id,
            userId: 'candidate-1',
            fileName: 'Untitled - Resume.pdf',
            title: 'Untitled - Resume',
            fileSize: '120 KB',
            uploadDate: new Date().toISOString(),
            isPrimary: true,
            fileType: 'pdf',
            status: 'ready'
          };
        }
      }
      setAvailableResumes(allCandidateResumes);
      console.log("Resume Builder API response:", res);

      setResume(res);
      const cleanName = res.title || (res.fileName ? res.fileName.replace(/\.(pdf|docx|txt)$/i, '') : 'Untitled - Resume');
      setTitleInput(cleanName || 'Untitled - Resume');

      // Target Job: Engineer 1 at American Express
      const amexEngineerJob: Job = {
        id: 'job-amex-1',
        title: 'Engineer 1',
        company: 'American Express',
        companyId: 'comp-amex',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
        department: 'Enterprise Platforms & Commercial Architecture',
        location: 'Bengaluru, Karnataka, India / New York, NY (Hybrid)',
        type: 'Full-time',
        experienceLevel: 'Entry Level',
        experienceRequiredYears: 1,
        salary: { min: 1800000, max: 2400000, currency: 'INR', period: 'yearly' },
        description: 'American Express is looking for an Engineer 1 to join our global payment platform and engineering team. As a Software Engineer, you will design, build, and optimize high-throughput distributed systems, secure RESTful microservices, and event-driven transaction processing pipelines supporting millions of cardholders worldwide.',
        responsibilities: [
          'Design, develop, and maintain high-performance microservices using Java and Spring Boot.',
          'Build fault-tolerant distributed systems components capable of processing high-volume payment transactions.',
          'Collaborate in an Agile team with peer Software Engineers and product managers.',
          'Write comprehensive unit and integration tests to ensure enterprise software quality.',
          'Participate in architectural reviews, CI/CD pipeline automation, and performance benchmarking.'
        ],
        requirements: [
          "Bachelor's or Master's degree in Computer Science, or related engineering discipline.",
          'Proven foundation as a Software Engineer writing clean, robust code in Java and Spring Boot.',
          'Deep conceptual or hands-on understanding of Distributed Systems, microservices architecture, and scalable system design.',
          'Experience building and integrating secure REST APIs and relational databases (MySQL or PostgreSQL).',
          'Understanding of version control using Git and Agile collaborative development.'
        ],
        skills: ['Software Engineer', 'Distributed Systems', 'Java', 'Spring Boot', 'REST APIs', 'Microservices', 'SQL', 'Git'],
        educationRequired: "Bachelor's degree in Computer Science, or related field of study.",
        deadline: '2026-10-31',
        postedDate: '2026-03-01',
        status: 'active',
        applicantCount: 22,
        recruiterId: 'usr-rec-amex',
        matchScore: 78
      };

      // Load ONLY genuine recruiter-posted jobs from the database/API
      const rawApiJobs = jobsList || [];
      const cleanRecruiterJobs: Job[] = [];
      const seenKeys = new Set<string>();

      for (const j of rawApiJobs) {
        if (!j || !j.id || !j.title) continue;

        // Skip obvious test gibberish entries if any
        const isGibberish =
          (j.skills || []).some(s => s.length > 12 && !s.includes(' ') && /[b-df-hj-np-tv-z]{8,}/i.test(s)) ||
          (j.requirements || []).some(r => r.length > 12 && !r.includes(' ') && /[b-df-hj-np-tv-z]{8,}/i.test(r));
        if (isGibberish) continue;

        // Deduplicate jobs by normalized title + company
        const normKey = `${j.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}:::${(j.company || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        if (seenKeys.has(normKey) || seenKeys.has(j.id)) continue;
        seenKeys.add(normKey);
        seenKeys.add(j.id);

        cleanRecruiterJobs.push(j);
      }

      // Ensure American Express Engineer 1 is available and placed prominently
      const hasAmexInList = cleanRecruiterJobs.some(
        j => j.title.toLowerCase().includes('engineer 1') && (j.company || '').toLowerCase().includes('american express')
      );
      if (!hasAmexInList) {
        cleanRecruiterJobs.unshift(amexEngineerJob);
      }

      // Ensure ada Software Engineer, Fullstack (Job ID: 400 from recruiter) is available
      const hasAdaInList = cleanRecruiterJobs.some(
        j => j.title.toLowerCase().includes('software engineer, fullstack') || j.id === 'job-ada-1'
      );
      if (!hasAdaInList) {
        cleanRecruiterJobs.push({
          id: 'job-ada-1',
          title: 'Software Engineer, Fullstack',
          company: 'ada',
          companyId: 'comp-ada',
          companyLogo: '',
          department: 'Core Platform',
          location: 'Bengaluru, Karnataka, India',
          type: 'Full-time',
          experienceLevel: 'Mid Level',
          experienceRequiredYears: 2,
          salary: { min: 1400000, max: 2000000, currency: 'INR', period: 'yearly' },
          description: 'We are seeking a Software Engineer to develop responsive frontend interfaces and high-performance backend microservices with Java, Spring Boot, React, and REST APIs.',
          responsibilities: [
            'Design, build, and optimize scalable web applications with React.js and modern TypeScript.',
            'Develop robust RESTful backend APIs with Java and Spring Boot.',
            'Collaborate with product and UX teams to deliver seamless user experiences.'
          ],
          requirements: [
            '2 - 4 YOE',
            'Bachelor level degree or equivalent in Computer Science, or related field of study.',
            'Technical or Professional Certification in Domain will be preferred'
          ],
          skills: ['Computer Science', 'Technical Certification', 'Java', 'Spring Boot', 'React', 'REST APIs', 'SQL', 'Hibernate'],
          educationRequired: "Bachelor's level degree or equivalent in Computer Science, or related field of study.",
          deadline: '2026-08-30',
          postedDate: '2026-02-11',
          status: 'active',
          applicantCount: 16,
          recruiterId: 'usr-rec-1',
          matchScore: 68
        });
      }

      setJobs(cleanRecruiterJobs);

      if (res.resumeData) {
        try {
          const parsed = typeof res.resumeData === 'string' ? JSON.parse(res.resumeData) : res.resumeData;
          const normalized = normalizeResumeData(parsed, res);

          // Enrich with parsedData if resumeData has empty sections
          if (res.parsedData) {
            if ((!normalized.experience || normalized.experience.length === 0) && Array.isArray(res.parsedData.extractedExperience) && res.parsedData.extractedExperience.length > 0) {
              normalized.experience = res.parsedData.extractedExperience.map((expStr: string, idx: number) => ({
                id: `exp-${idx + 1}`,
                role: expStr,
                employmentType: 'Full-time',
                company: '',
                locationType: 'Onsite',
                location: '',
                startDate: '',
                endDate: 'Present',
                current: true,
                description: expStr,
                technologies: ''
              }));
            }
            if ((!normalized.projects || normalized.projects.length === 0) && Array.isArray(res.parsedData.extractedProjects) && res.parsedData.extractedProjects.length > 0) {
              normalized.projects = res.parsedData.extractedProjects.map((pStr: string, idx: number) => ({
                id: `proj-${idx + 1}`,
                title: pStr,
                role: 'Developer',
                dates: '',
                description: pStr,
                technologies: ''
              }));
            }
            if ((!normalized.education || normalized.education.length === 0) && Array.isArray(res.parsedData.extractedEducation) && res.parsedData.extractedEducation.length > 0) {
              normalized.education = res.parsedData.extractedEducation.map((eduStr: string, idx: number) => ({
                id: `edu-${idx + 1}`,
                institution: eduStr,
                location: '',
                degree: eduStr,
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                cgpa: '',
                description: `• ${eduStr}`
              }));
            }
            if (!normalized.skills?.programmingLanguages && res.parsedData.extractedSkills) {
              const extSkills = Array.isArray(res.parsedData.extractedSkills) ? res.parsedData.extractedSkills.join(', ') : res.parsedData.extractedSkills;
              normalized.skills = {
                ...normalized.skills,
                programmingLanguages: extSkills
              };
            }
          }

          console.log("Resume Builder loaded resumeData from parsed JSON:", normalized);
          setResumeData(normalized);
          setHistory([normalized]);
          setHistoryIndex(0);
          // Auto-open Personal Info form when the resume is truly blank (no name, email, phone)
          const isBlank = !normalized.name && !normalized.firstName && !normalized.email && !normalized.phone;
          if (isBlank) {
            setIsEditingPersonalInfo(true);
          }
        } catch (e) {
          console.error('Failed to parse resumeData JSON, mapping from parsedData:', e);
          const fallback = res.parsedData
            ? mapParsedDataToBuilderData(res.parsedData, res)
            : createEmptyResumeData(res);
          console.log("Resume Builder fallback loaded resumeData:", fallback);
          setResumeData(fallback);
          setHistory([fallback]);
          setHistoryIndex(0);
        }
      } else if (res.parsedData) {
        const normalized = mapParsedDataToBuilderData(res.parsedData, res);
        console.log("Resume Builder loaded from parsedData DTO:", normalized);
        setResumeData(normalized);
        setHistory([normalized]);
        setHistoryIndex(0);
      } else {
        const empty = createEmptyResumeData(res);
        console.log("Resume Builder loaded empty resume schema:", empty);
        setResumeData(empty);
        setHistory([empty]);
        setHistoryIndex(0);
        // New blank resume — guide user straight to fill personal info
        setIsEditingPersonalInfo(true);
      }
    } catch (err) {
      console.error('Load resume error:', err);
      showToast({
        type: 'error',
        title: 'Loading Failed',
        message: 'Could not load resume document.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyResumeData = (res?: Resume | null): ResumeBuilderData => {
    const fileName = res?.fileName || 'Resume';
    const cleanName = fileName.replace(/\.(pdf|docx)$/i, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
    const isUntitled = !cleanName || cleanName === 'RESUME' || cleanName === 'UNTITLED' || cleanName === 'UNTITLED RESUME' || cleanName.startsWith('UNTITLED');
    const nameParts = cleanName.split(' ');
    const firstName = isUntitled ? '' : (nameParts[0] || '');
    const lastName = isUntitled ? '' : (nameParts.slice(1).join(' ') || '');
    const name = isUntitled ? '' : cleanName;

    return {
      name,
      firstName,
      lastName,
      headline: '',
      phone: '',
      email: '',
      city: '',
      state: '',
      country: '',
      location: '',
      photo: '',
      socialLinks: [],
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      summary: '',
      activeSections: ['profile', 'summary', 'experience', 'education', 'projects', 'skills'],
      experience: [
        {
          id: 'exp-starter-1',
          role: '',
          employmentType: '',
          company: '',
          locationType: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          hideMonth: false,
          description: '',
          technologies: '',
          visible: true
        }
      ],
      education: [
        {
          id: 'edu-starter-1',
          institution: '',
          location: '',
          city: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          cgpa: '',
          cgpaLabel: 'CGPA',
          description: '',
          visible: true
        }
      ],
      projects: [
        {
          id: 'proj-starter-1',
          title: '',
          role: '',
          startDate: '',
          endDate: '',
          dates: '',
          description: '',
          technologies: '',
          link: '',
          visible: true
        }
      ],
      skills: {
        databases: '',
        frameworksLibraries: '',
        languages: '',
        programmingLanguages: '',
        toolsPlatforms: '',
        softSkills: '',
        customCategories: []
      },
      certifications: [],
      awards: [],
      customSection: {
        title: 'Custom Section',
        content: ''
      },
      template: 'medium',
      layoutPreset: 'balanced',
      spacing: {
        fontSize: '12.5px',
        padding: '24px',
        sectionGap: '12px',
        itemGap: '6px',
        fontFamily: 'serif',
        lineHeight: '1.45',
        fontColor: '#000000'
      },
      typography: DEFAULT_TYPOGRAPHY
    };
  };

  const mapParsedDataToBuilderData = (pd: any, res?: Resume | null): ResumeBuilderData => {
    const empty = createEmptyResumeData(res);
    if (!pd) return empty;

    const skillsStr = Array.isArray(pd.extractedSkills) ? pd.extractedSkills.join(', ') : (pd.extractedSkills || '');

    const dbs: string[] = [];
    const fws: string[] = [];
    const pls: string[] = [];
    const tools: string[] = [];

    const allSkillsList = Array.isArray(pd.extractedSkills)
      ? pd.extractedSkills
      : typeof pd.extractedSkills === 'string'
        ? pd.extractedSkills.split(',')
        : [];

    allSkillsList.forEach((s: string) => {
      const trimmed = s.trim();
      const lower = trimmed.toLowerCase();
      if (lower.includes('mysql') || lower.includes('mongodb') || lower.includes('postgres') || lower.includes('sql') || lower.includes('oracle')) {
        dbs.push(trimmed);
      } else if (lower.includes('spring') || lower.includes('react') || lower.includes('hibernate') || lower.includes('express') || lower.includes('rest')) {
        fws.push(trimmed);
      } else if (lower === 'java' || lower === 'javascript' || lower === 'c' || lower === 'html' || lower === 'css' || lower === 'python' || lower === 'typescript') {
        pls.push(trimmed);
      } else {
        tools.push(trimmed);
      }
    });

    return {
      ...empty,
      education: Array.isArray(pd.extractedEducation)
        ? pd.extractedEducation.map((eduStr: string, idx: number) => ({
          id: `edu-${idx + 1}`,
          institution: eduStr,
          location: '',
          degree: eduStr,
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          cgpa: '',
          description: `• ${eduStr}`
        }))
        : [],
      experience: Array.isArray(pd.extractedExperience)
        ? pd.extractedExperience.map((expStr: string, idx: number) => ({
          id: `exp-${idx + 1}`,
          role: expStr,
          employmentType: 'Full-time',
          company: '',
          locationType: 'Onsite',
          location: '',
          startDate: '',
          endDate: 'Present',
          current: true,
          description: expStr,
          technologies: ''
        }))
        : [],
      projects: Array.isArray(pd.extractedProjects)
        ? pd.extractedProjects.map((pStr: string, idx: number) => ({
          id: `proj-${idx + 1}`,
          title: pStr,
          role: 'Developer',
          dates: 'MMM 2023 - Present',
          description: pStr,
          technologies: ''
        }))
        : [],
      skills: {
        databases: dbs.join(', '),
        frameworksLibraries: fws.join(', '),
        languages: '[Add Languages]',
        programmingLanguages: pls.join(', ') || skillsStr,
        toolsPlatforms: tools.join(', '),
        softSkills: ''
      }
    };
  };

  // Strips fake/placeholder dates that the old backend hardcoded (e.g. "MMM 2023")
  const cleanDate = (d: string | undefined): string => {
    if (!d) return '';
    // Match patterns like "MMM 2023", "MMM YYYY", "Jan 2023 - Present" where month is a 3-letter abbrev
    const fakePattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|MMM)\s+202[0-9](\s*[-–]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|MMM)\s+202[0-9]|\s*[-–]\s*Present)?$/i;
    if (fakePattern.test(d.trim())) return '';
    return d;
  };

  // Helper to normalize data from stored JSON or raw parsing
  const normalizeResumeData = (parsed: any, res: Resume): ResumeBuilderData => {
    if (!parsed || typeof parsed !== 'object') {
      return createEmptyResumeData(res);
    }

    // Parse Name
    let firstName = parsed.firstName || '';
    let lastName = parsed.lastName || '';
    if (!firstName && !lastName && parsed.name) {
      const parts = parsed.name.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    let derivedName = [firstName, lastName].filter(Boolean).join(' ') || parsed.name || '';
    const isUntitledName = !derivedName || derivedName.toUpperCase() === 'UNTITLED RESUME' || derivedName.toUpperCase() === 'UNTITLED' || derivedName.toUpperCase() === 'RESUME' || derivedName.toUpperCase().startsWith('UNTITLED');
    if (isUntitledName) {
      const rawTitle = res.title || (res.fileName ? res.fileName.replace(/\.(pdf|docx|txt)$/i, '') : '');
      const cleanTitle = rawTitle.replace(/\.(pdf|docx|txt)$/i, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
      const fallbackName = (cleanTitle && !['UNTITLED', 'RESUME', 'UNTITLED RESUME'].includes(cleanTitle.toUpperCase()))
        ? cleanTitle
        : '';

      if (fallbackName && !['UNTITLED', 'RESUME', 'UNTITLED RESUME'].includes(fallbackName.toUpperCase())) {
        derivedName = fallbackName;
        const parts = fallbackName.split(/\s+/);
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      } else {
        firstName = '';
        lastName = '';
        derivedName = '';
      }
    }

    // Explicitly wipe mock "Alex Rivera" / template defaults for newly candidates
    const isMockAlex =
      derivedName.trim().toLowerCase() === 'alex rivera' ||
      derivedName.trim().toLowerCase() === 'alex' ||
      parsed.email === 'alex.rivera@example.com' ||
      parsed.phone === '+1 (555) 234-5678';

    if (isMockAlex) {
      derivedName = '';
      firstName = '';
      lastName = '';
    }

    // Parse Location
    let city = parsed.city || '';
    let state = parsed.state || '';
    let country = parsed.country || '';
    if (!city && !state && !country && parsed.location) {
      const locParts = parsed.location.split(',').map((s: string) => s.trim());
      city = locParts[0] || '';
      state = locParts[1] || '';
      country = locParts[2] || '';
    }
    if (isMockAlex && (city.toLowerCase().includes('san francisco') || parsed.location?.toLowerCase().includes('san francisco'))) {
      city = '';
      state = '';
      country = '';
    }
    const derivedLocation = [city, state, country].filter(Boolean).join(', ') || (isMockAlex ? '' : (parsed.location || city || ''));

    // Parse Social Links
    let socialLinks: SocialLinkItem[] = [];
    if (Array.isArray(parsed.socialLinks) && parsed.socialLinks.length > 0) {
      socialLinks = parsed.socialLinks.map((item: any, i: number) => {
        let platform = item.platform || 'Custom Link';
        const urlLower = (item.url || '').toLowerCase();
        const customLower = (item.customLabel || '').toLowerCase();
        const idLower = (item.id || '').toLowerCase();

        if (platform === 'Custom Link' || !platform) {
          if (urlLower.includes('github') || customLower.includes('github') || idLower.endsWith('-gh') || idLower === 'gh') {
            platform = 'GitHub';
          } else if (urlLower.includes('linkedin') || customLower.includes('linkedin') || idLower.endsWith('-li') || idLower === 'li') {
            platform = 'LinkedIn';
          } else if (urlLower.includes('twitter') || urlLower.includes('x.com') || customLower.includes('twitter') || idLower.endsWith('-tw')) {
            platform = 'Twitter';
          }
        }
        return {
          id: item.id || `link-${i}`,
          platform,
          url: item.url || '',
          customLabel: item.customLabel || ''
        };
      });
    } else {
      if (parsed.linkedinUrl) {
        socialLinks.push({
          id: 'link-li',
          platform: 'LinkedIn',
          url: parsed.linkedinUrl,
          customLabel: parsed.linkedinUrl.split('/').filter(Boolean).pop() || 'LinkedIn'
        });
      }
      if (parsed.githubUrl) {
        socialLinks.push({
          id: 'link-gh',
          platform: 'GitHub',
          url: parsed.githubUrl,
          customLabel: parsed.githubUrl.split('/').filter(Boolean).pop() || 'GitHub'
        });
      }
      if (parsed.portfolioUrl || parsed.websiteUrl) {
        socialLinks.push({
          id: 'link-web',
          platform: 'Website',
          url: parsed.portfolioUrl || parsed.websiteUrl,
          customLabel: 'Portfolio'
        });
      }
    }

    let phone = parsed.phone || '';
    let email = parsed.email || '';
    if (isMockAlex) {
      if (phone === '+1 (555) 234-5678' || phone.includes('234-5678')) phone = '';
      if (email === 'alex.rivera@example.com') email = '';
    }

    let headline = parsed.headline || parsed.title || '';
    if (isMockAlex && headline.toLowerCase().includes('senior full stack & cloud application engineer')) {
      headline = '';
    }

    return {
      name: derivedName,
      firstName,
      lastName,
      headline,
      phone,
      email,
      city,
      state,
      country,
      location: derivedLocation,
      photo: parsed.photo || parsed.avatar || '',
      socialLinks,
      linkedinUrl: parsed.linkedinUrl || socialLinks.find(l => l.platform.toLowerCase().includes('linkedin'))?.url || '',
      githubUrl: parsed.githubUrl || socialLinks.find(l => l.platform.toLowerCase().includes('github'))?.url || '',
      portfolioUrl: parsed.portfolioUrl || parsed.websiteUrl || socialLinks.find(l => l.platform.toLowerCase().includes('website') || l.platform.toLowerCase().includes('portfolio'))?.url || '',
      summary: parsed.summary || parsed.bio || '',
      activeSections: (() => {
        const defaultSecs = ['profile', 'summary', 'experience', 'education', 'projects', 'skills'];
        if (Array.isArray(parsed.activeSections) && parsed.activeSections.length > 0) {
          const merged = [...parsed.activeSections];
          defaultSecs.forEach((sec) => {
            if (!merged.includes(sec)) merged.push(sec);
          });
          return merged;
        }
        return defaultSecs;
      })(),
      experience: (Array.isArray(parsed.experience) && parsed.experience.length > 0)
        ? parsed.experience.map((exp: any, i: number) => ({
          id: exp.id || `exp-${i + 1}`,
          role: exp.role || exp.jobTitle || '',
          employmentType: exp.employmentType || '',
          company: exp.company || '',
          locationType: exp.locationType || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || (exp.current ? 'Present' : ''),
          current: !!exp.current,
          description: exp.description || '',
          technologies: Array.isArray(exp.technologies)
            ? exp.technologies.join(', ')
            : exp.technologies || '',
          visible: exp.visible !== false
        }))
        : [
            {
              id: 'exp-starter-1',
              role: '',
              employmentType: '',
              company: '',
              locationType: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              hideMonth: false,
              description: '',
              technologies: '',
              visible: true
            }
          ],
      education: (Array.isArray(parsed.education) && parsed.education.length > 0)
        ? parsed.education.map((edu: any, i: number) => ({
          id: edu.id || `edu-${i + 1}`,
          institution: edu.institution || '',
          location: edu.location || '',
          city: edu.city || '',
          degree: edu.degree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: cleanDate(edu.startDate || edu.startYear || ''),
          endDate: cleanDate(edu.endDate || edu.endYear || ''),
          cgpa: edu.cgpa || edu.grade || '',
          cgpaLabel: edu.cgpaLabel || 'CGPA',
          details: edu.details || '',
          description: edu.description || (edu.details ? `• ${edu.details}` : undefined),
          visible: edu.visible !== false
        }))
        : [
            {
              id: 'edu-starter-1',
              institution: '',
              location: '',
              city: '',
              degree: '',
              fieldOfStudy: '',
              startDate: '',
              endDate: '',
              cgpa: '',
              cgpaLabel: 'CGPA',
              description: '',
              visible: true
            }
          ],
      projects: (Array.isArray(parsed.projects) && parsed.projects.length > 0)
        ? parsed.projects.map((proj: any, i: number) => {
          const singleLink = proj.link || proj.githubUrl || proj.url || '';
          const linksArray = Array.isArray(proj.links) && proj.links.length > 0
            ? proj.links
            : (singleLink ? [{
              id: `plink-${i + 1}-1`,
              platform: singleLink.toLowerCase().includes('github') ? 'GitHub' : 'Website',
              url: singleLink,
              customLabel: singleLink.toLowerCase().includes('github') ? 'GitHub' : 'Live Demo'
            }] : []);

          return {
            id: proj.id || `proj-${i + 1}`,
            title: proj.title || proj.name || '',
            role: proj.role || '',
            dates: cleanDate(proj.dates) || (proj.startDate ? `${cleanDate(proj.startDate) || proj.startDate} - ${cleanDate(proj.endDate) || proj.endDate || 'Present'}` : ''),
            startDate: cleanDate(proj.startDate || ''),
            endDate: cleanDate(proj.endDate || ''),
            description: proj.description || '',
            technologies: Array.isArray(proj.technologies)
              ? proj.technologies.join(', ')
              : proj.technologies || '',
            link: singleLink || (linksArray[0]?.url || ''),
            links: linksArray,
            visible: proj.visible !== false
          };
        })
        : [
            {
              id: 'proj-starter-1',
              title: '',
              role: '',
              startDate: '',
              endDate: '',
              dates: '',
              description: '',
              technologies: '',
              link: '',
              visible: true
            }
          ],
      skills: {
        programmingLanguages:
          normalizeSkillsToString(parsed.skills?.programmingLanguages) ||
          normalizeSkillsToString(parsed.skills?.technical) || '',
        frameworksLibraries:
          normalizeSkillsToString(parsed.skills?.frameworksLibraries) || '',
        toolsPlatforms:
          normalizeSkillsToString(parsed.skills?.toolsPlatforms) ||
          normalizeSkillsToString(parsed.skills?.tools) || '',
        databases:
          normalizeSkillsToString(parsed.skills?.databases) || '',
        softSkills:
          normalizeSkillsToString(parsed.skills?.softSkills) ||
          normalizeSkillsToString(parsed.skills?.soft) || '',
        languages:
          normalizeSkillsToString(parsed.skills?.languages) || '',
        customCategories: Array.isArray(parsed.skills?.customCategories)
          ? parsed.skills.customCategories.map((c: any, i: number) => ({
            id: c.id || `custom-cat-${i + 1}`,
            name: c.name || 'Custom Category',
            skills: normalizeSkillsToString(c.skills)
          }))
          : []
      },
      certifications: Array.isArray(parsed.certifications)
        ? parsed.certifications.map((c: any, i: number) => ({
          id: c.id || `cert-${i + 1}`,
          title: c.title || '',
          issuer: c.issuer || '',
          issueDate: c.issueDate || '',
          link: c.link || '',
          linkLabel: c.linkLabel || 'View Certificate',
          description: c.description || '',
          visible: c.visible !== false
        }))
        : [],
      awards: Array.isArray(parsed.awards)
        ? parsed.awards.map((a: any, i: number) => ({
          id: a.id || `award-${i + 1}`,
          title: a.title || '',
          issuer: a.issuer || '',
          year: a.year || '',
          description: a.description || ''
        }))
        : [],
      customSection: {
        title: parsed.customSection?.title || 'Custom Section',
        content: parsed.customSection?.content || ''
      },
      template: parsed.template || 'medium',
      layoutPreset: parsed.layoutPreset || 'balanced',
      spacing: {
        fontSize: parsed.spacing?.fontSize || '12.5px',
        padding: parsed.spacing?.padding || '24px',
        sectionGap: parsed.spacing?.sectionGap || '12px',
        itemGap: parsed.spacing?.itemGap || '6px',
        fontFamily: parsed.spacing?.fontFamily || 'serif',
        lineHeight: parsed.spacing?.lineHeight || '1.45',
        fontColor: parsed.spacing?.fontColor || '#000000'
      },
      typography: parsed.typography || DEFAULT_TYPOGRAPHY
    };
  };

  const getDefaultBlankData = (fileName?: string): ResumeBuilderData => createEmptyResumeData();

  // Debounced Auto-Saving & History Push
  const triggerAutoSave = (updatedData: ResumeBuilderData, addToHistory = true) => {
    setSaveStatus('saving');

    if (addToHistory) {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, updatedData];
      });
      setHistoryIndex((prev) => prev + 1);
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!id) return;
      try {
        setIsSaving(true);
        await candidateService.updateResume(id, {
          resumeData: JSON.stringify(updatedData)
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  // Personal Information Handlers
  const handleStartEditPersonalInfo = () => {
    if (!resumeData) return;
    setPersonalInfoSnapshot(JSON.parse(JSON.stringify(resumeData)));
    setFormErrors({});
    setIsEditingPersonalInfo(true);
  };

  const handleCancelPersonalInfo = () => {
    if (personalInfoSnapshot) {
      setResumeData(personalInfoSnapshot);
      triggerAutoSave(personalInfoSnapshot, false);
    }
    setFormErrors({});
    setIsEditingPersonalInfo(false);
  };

  const handleAutoFillSampleDetails = () => {
    if (!resumeData) return;
    const sample = {
      firstName: 'Vicky',
      lastName: 'Gupta',
      headline: 'Software Developer at AlgoZenith',
      email: 'name@example.com',
      phone: '72899XXXXX',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      socialLinks: [
        { id: 'link-li', platform: 'LinkedIn', url: 'https://linkedin.com/in/vickygupta' },
        { id: 'link-gh', platform: 'GitHub', url: 'https://github.com/vickygupta' }
      ]
    };
    const next: ResumeBuilderData = {
      ...resumeData,
      ...sample,
      name: 'Vicky Gupta',
      location: 'New Delhi, Delhi, India',
      linkedinUrl: 'https://linkedin.com/in/vickygupta',
      githubUrl: 'https://github.com/vickygupta'
    };
    setResumeData(next);
    triggerAutoSave(next, true);
    setFormErrors({});
    showToast({
      type: 'info',
      title: 'Sample Details Auto-Filled',
      message: 'Sample candidate details loaded into editor.'
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload an image file (PNG, JPG, WebP).'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Image size must be 5 MB or less.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      handleUpdate((prev) => ({
        ...prev,
        photo: result
      }));
      showToast({
        type: 'success',
        title: 'Photo Uploaded',
        message: 'Profile photo updated successfully.'
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleUpdate((prev) => ({
      ...prev,
      photo: ''
    }));
    showToast({
      type: 'info',
      title: 'Photo Removed',
      message: 'Profile photo has been removed.'
    });
  };

  const handleAddSocialLink = (platform: string) => {
    handleUpdate((prev) => {
      const existing = prev.socialLinks || [];
      const newLink: SocialLinkItem = {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        platform,
        url: '',
        customLabel: platform === 'Custom Link' ? 'Custom Link' : undefined
      };
      return {
        ...prev,
        socialLinks: [...existing, newLink]
      };
    });
  };

  const handleUpdateSocialLink = (linkId: string, field: 'url' | 'platform' | 'customLabel', value: string) => {
    handleUpdate((prev) => {
      const updatedLinks = (prev.socialLinks || []).map((link) => {
        if (link.id === linkId) {
          return { ...link, [field]: value };
        }
        return link;
      });

      const li = updatedLinks.find((l) => l.platform.toLowerCase().includes('linkedin'))?.url || '';
      const gh = updatedLinks.find((l) => l.platform.toLowerCase().includes('github'))?.url || '';
      const web =
        updatedLinks.find(
          (l) => l.platform.toLowerCase().includes('website') || l.platform.toLowerCase().includes('portfolio')
        )?.url || '';

      return {
        ...prev,
        socialLinks: updatedLinks,
        linkedinUrl: li,
        githubUrl: gh,
        portfolioUrl: web
      };
    });
  };

  const handleRemoveSocialLink = (linkId: string) => {
    handleUpdate((prev) => {
      const updatedLinks = (prev.socialLinks || []).filter((l) => l.id !== linkId);
      const li = updatedLinks.find((l) => l.platform.toLowerCase().includes('linkedin'))?.url || '';
      const gh = updatedLinks.find((l) => l.platform.toLowerCase().includes('github'))?.url || '';
      const web =
        updatedLinks.find(
          (l) => l.platform.toLowerCase().includes('website') || l.platform.toLowerCase().includes('portfolio')
        )?.url || '';

      return {
        ...prev,
        socialLinks: updatedLinks,
        linkedinUrl: li,
        githubUrl: gh,
        portfolioUrl: web
      };
    });
  };

  const handleSavePersonalInfo = async () => {
    if (!resumeData) return;

    // Validation
    const errors: Record<string, string> = {};

    const currentFirst = (resumeData.firstName || '').trim();
    const currentLast = (resumeData.lastName || '').trim();
    const currentEmail = (resumeData.email || '').trim();
    const currentPhone = (resumeData.phone || '').trim();

    if (!currentFirst && !resumeData.name?.trim()) {
      errors.firstName = 'First name is required.';
    }

    if (!currentLast && !resumeData.name?.trim()) {
      errors.lastName = 'Last name is required.';
    }

    if (!currentEmail) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!currentPhone) {
      errors.phone = 'Phone number is required.';
    } else if (currentPhone.replace(/[^0-9+]/g, '').length < 6) {
      errors.phone = 'Please enter a valid phone number.';
    }

    // Validate social links URLs if entered
    if (resumeData.socialLinks) {
      for (const link of resumeData.socialLinks) {
        if (link.url && link.url.trim()) {
          const trimmed = link.url.trim();
          if (!trimmed.includes('.') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            errors[`link-${link.id}`] = 'Please enter a valid URL.';
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: Object.values(errors)[0]
      });
      return;
    }

    setFormErrors({});
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const derivedName = `${currentFirst} ${currentLast}`.trim() || resumeData.name || '';
      const derivedLocation = [resumeData.city, resumeData.state, resumeData.country].filter(Boolean).join(', ');

      const updated: ResumeBuilderData = {
        ...resumeData,
        name: derivedName,
        location: derivedLocation
      };

      setResumeData(updated);

      if (id) {
        await candidateService.updateResume(id, {
          resumeData: JSON.stringify(updated)
        });
      }

      setSaveStatus('saved');
      showToast({
        type: 'success',
        title: 'Saved Successfully',
        message: 'Personal Information updated and synchronized.'
      });
      setIsEditingPersonalInfo(false);
    } catch (err: any) {
      console.error('Failed to sync personal info:', err);
      setSaveStatus('error');
      showToast({
        type: 'error',
        title: 'Sync Error',
        message: 'Unable to save your changes. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Professional Summary Handlers (Matching Image 1 & Image 2)
  const handleStartEditSummary = () => {
    if (!resumeData) return;
    setSummarySnapshot(resumeData.summary || '');
    setIsEditingSummary(true);
  };

  const handleCancelSummary = () => {
    if (resumeData) {
      handleUpdate((prev) => ({ ...prev, summary: summarySnapshot }));
    }
    setIsEditingSummary(false);
  };

  const handleSaveSummary = () => {
    if (!resumeData) return;
    triggerAutoSave(resumeData, true);
    setIsEditingSummary(false);
    showToast({
      type: 'success',
      title: 'Summary Saved',
      message: 'Professional summary updated successfully.'
    });
  };

  const handleAutoFillSampleSummary = () => {
    if (!resumeData) return;
    const sample = 'Passionate and results-driven Software Developer with a strong foundation in full-stack web engineering, scalable cloud architectures, and modern UI/UX design. Proven ability to build performant applications, collaborate in cross-functional agile teams, and solve complex technical challenges with clean, maintainable code.';
    handleUpdate((prev) => ({ ...prev, summary: sample }));
    showToast({
      type: 'info',
      title: 'Sample Summary Loaded',
      message: 'Sample professional summary auto-filled.'
    });
  };

  const handleFormatText = (style: 'bold' | 'italic' | 'underline' | 'bullet' | 'number') => {
    const textarea = summaryTextareaRef.current;
    if (!textarea || !resumeData) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = resumeData.summary || '';
    const selected = current.substring(start, end);

    let replacement = '';
    if (style === 'bold') {
      replacement = selected ? `**${selected}**` : '**bold text**';
    } else if (style === 'italic') {
      replacement = selected ? `*${selected}*` : '*italic text*';
    } else if (style === 'underline') {
      replacement = selected ? `<u>${selected}</u>` : '<u>underlined text</u>';
    } else if (style === 'bullet') {
      replacement = selected ? `• ${selected}` : '\n• ';
    } else if (style === 'number') {
      replacement = selected ? `1. ${selected}` : '\n1. ';
    }

    const next = current.substring(0, start) + replacement + current.substring(end);
    handleUpdate((prev) => ({ ...prev, summary: next }));
  };

  const handleAiGenerateSummary = async () => {
    if (!resumeData) return;
    setIsGeneratingAiSummary(true);
    try {
      const headline = resumeData.headline || 'Software Developer';
      const skills = [
        resumeData.skills.programmingLanguages,
        resumeData.skills.frameworksLibraries
      ].filter(Boolean).join(', ');
      const name = (resumeData.firstName || resumeData.name || '').trim();

      const prompt = [
        `Write a professional resume summary for ${name ? name : 'a candidate'} who is a ${headline} with expertise in ${skills || 'software development'}.`,
        `STRICT RULES:`,
        `- Output ONLY the summary paragraph. Nothing else.`,
        `- Do NOT include any introduction, explanation, or label before or after the summary.`,
        `- Do NOT use markdown (no **, no *, no #).`,
        `- 2-3 sentences maximum.`,
        `- Start directly with the candidate's role or a strong action verb.`,
        `- ATS-friendly, specific, and professional tone.`,
      ].join(' ');

      const response = await sendCopilotMessage(prompt, { headline, skills });

      if (response && response.message && response.message.trim()) {
        // Strip any intro line that doesn't look like a real summary sentence
        const cleaned = response.message.trim()
          .replace(/^here (is|are).*?:\s*/i, '')
          .replace(/^sure[,!].*?:\s*/i, '')
          .replace(/^(professional summary|resume summary)[:-]?\s*/i, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .trim();
        handleUpdate((prev) => ({ ...prev, summary: cleaned }));
        showToast({
          type: 'success',
          title: 'AI Summary Generated',
          message: 'Professional summary tailored with AI.'
        });
      }
    } catch (err) {
      const fallback = `Results-oriented ${resumeData.headline || 'Software Developer'} with a solid track record in building performant web solutions, optimizing core workflows, and engineering scalable applications with modern technologies.`;
      handleUpdate((prev) => ({ ...prev, summary: fallback }));
      showToast({
        type: 'info',
        title: 'Summary Enhanced',
        message: 'Professional summary generated.'
      });
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  // Work Experience Helper Constants
  const MONTHS_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const YEARS_LIST = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i + 1));
  const EMPLOYMENT_TYPES_LIST = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance', 'Self-employed', 'Trainee'];
  const LOCATION_TYPES_LIST = ['On Site', 'Remote', 'Hybrid'];
  const SUGGESTED_TECH_PILLS = ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'];

  // Work Experience Handlers (Matching Images 1, 2, 3, 4)
  const handleStartEditExperience = (expId: string) => {
    if (!resumeData) return;
    setExperienceSnapshot(JSON.parse(JSON.stringify(resumeData.experience)));
    setEditingExperienceId(expId);
    setIsEditingExperience(true);
  };

  const handleAddNewExperience = () => {
    if (!resumeData) return;
    const newId = `exp-${Date.now()}`;
    const newExp = {
      id: newId,
      role: '',
      employmentType: 'Internship',
      company: '',
      locationType: 'On Site',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      hideMonth: false,
      description: '',
      technologies: '',
      visible: true
    };
    setExperienceSnapshot(JSON.parse(JSON.stringify(resumeData.experience)));
    handleUpdate((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
    setEditingExperienceId(newId);
    setIsEditingExperience(true);
  };

  const handleCancelExperience = () => {
    if (experienceSnapshot && resumeData) {
      handleUpdate((prev) => ({ ...prev, experience: experienceSnapshot }));
    }
    setIsEditingExperience(false);
    setEditingExperienceId(null);
  };

  const handleSaveExperience = () => {
    if (!resumeData) return;
    triggerAutoSave(resumeData, true);
    setIsEditingExperience(false);
    setEditingExperienceId(null);
    showToast({
      type: 'success',
      title: 'Work Experience Saved',
      message: 'Work experience details saved successfully.'
    });
  };

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    handleUpdate((prev) => {
      const items = [...prev.experience];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, experience: items };
    });
  };

  const handleMoveEducation = (index: number, direction: 'up' | 'down') => {
    handleUpdate((prev) => {
      const items = [...prev.education];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, education: items };
    });
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    handleUpdate((prev) => {
      const items = [...prev.projects];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, projects: items };
    });
  };

  const handleAutoFillSampleExperience = (expId: string) => {
    handleUpdate((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          role: 'Software Developer',
          employmentType: 'Internship',
          company: 'AlgoZenith',
          locationType: 'On Site',
          location: 'Bengaluru, Karnataka',
          startDate: 'May 2024',
          endDate: 'Present',
          current: true,
          hideMonth: false,
          technologies: 'React, Node.js, Express, MongoDB, Tailwind CSS',
          description: 'Engineered performant full-stack web applications using React and Tailwind CSS, improving overall page load speed by 35%. Implemented robust RESTful API endpoints and integrated MongoDB for optimized data querying and persistence.'
        };
      })
    }));
    showToast({
      type: 'info',
      title: 'Sample Details Loaded',
      message: 'Sample work experience details auto-filled.'
    });
  };

  const handleUpdateExpField = (expId: string, field: string, value: any) => {
    handleUpdate((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === expId ? { ...exp, [field]: value } : exp))
    }));
  };

  const handleUpdateExpDate = (
    expId: string,
    field: 'startMonth' | 'startYear' | 'endMonth' | 'endYear' | 'current' | 'hideMonth',
    value: string | boolean
  ) => {
    handleUpdate((prev) => {
      const updated = prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;

        let startParts = (exp.startDate || '').trim().split(' ');
        let startM = startParts.length > 1 ? startParts[0] : (MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');
        let startY = startParts.length > 1 ? startParts[1] : (startParts[0] && !MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');

        let endParts = (exp.endDate || '').trim().split(' ');
        let endM = endParts.length > 1 ? endParts[0] : (MONTHS_LIST.includes(endParts[0]) ? endParts[0] : '');
        let endY = endParts.length > 1 ? endParts[1] : (endParts[0] && !MONTHS_LIST.includes(endParts[0]) && endParts[0] !== 'Present' ? endParts[0] : '');

        let isCurr = exp.current;
        let isHideMonth = exp.hideMonth;

        if (field === 'startMonth') startM = value as string;
        if (field === 'startYear') startY = value as string;
        if (field === 'endMonth') endM = value as string;
        if (field === 'endYear') endY = value as string;
        if (field === 'current') isCurr = value as boolean;
        if (field === 'hideMonth') isHideMonth = value as boolean;

        const newStart = isHideMonth ? (startY || '') : [startM, startY].filter(Boolean).join(' ');
        const newEnd = isCurr
          ? 'Present'
          : (isHideMonth ? (endY || '') : [endM, endY].filter(Boolean).join(' '));

        return {
          ...exp,
          startDate: newStart,
          endDate: newEnd,
          current: isCurr,
          hideMonth: isHideMonth
        };
      });

      return { ...prev, experience: updated };
    });
  };

  const handleAddTechPill = (expId: string, tech: string) => {
    handleUpdate((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const currentTechs = exp.technologies ? exp.technologies.split(',').map((t) => t.trim()).filter(Boolean) : [];
        if (!currentTechs.includes(tech)) {
          currentTechs.push(tech);
        }
        return { ...exp, technologies: currentTechs.join(', ') };
      })
    }));
  };

  const handleToggleExperienceVisibility = (expId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleUpdate((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId ? { ...exp, visible: exp.visible === false ? true : false } : exp
      )
    }));
  };

  const handleDeleteExperience = (expId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleUpdate((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== expId)
    }));
    showToast({
      type: 'info',
      title: 'Experience Removed',
      message: 'Work experience item deleted.'
    });
  };

  const handleFormatExperienceDescription = (style: 'bold' | 'italic' | 'underline' | 'bullet' | 'number') => {
    const textarea = experienceDescriptionRef.current;
    if (!textarea || !editingExperienceId) return;

    const exp = resumeData?.experience.find((e) => e.id === editingExperienceId);
    if (!exp) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = exp.description || '';
    const selected = current.substring(start, end);

    let replacement = '';
    if (style === 'bold') {
      replacement = selected ? `**${selected}**` : '**bold text**';
    } else if (style === 'italic') {
      replacement = selected ? `*${selected}*` : '*italic text*';
    } else if (style === 'underline') {
      replacement = selected ? `<u>${selected}</u>` : '<u>underlined text</u>';
    } else if (style === 'bullet') {
      replacement = selected ? `• ${selected}` : '\n• ';
    } else if (style === 'number') {
      replacement = selected ? `1. ${selected}` : '\n1. ';
    }

    const next = current.substring(0, start) + replacement + current.substring(end);
    handleUpdate((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === editingExperienceId ? { ...item, description: next } : item))
    }));
  };

  const handleAiGenerateExperienceDescription = async (expId: string) => {
    const exp = resumeData?.experience.find((e) => e.id === expId);
    if (!exp) return;

    setIsGeneratingAiExp(true);
    try {
      const prompt = [
        `Generate exactly 3 resume bullet points for a ${exp.role || 'Software Developer'} at ${exp.company || 'a tech company'} using ${exp.technologies || 'modern technologies'}.`,
        `STRICT RULES:`,
        `- Output ONLY the 3 bullet points. Nothing else before or after.`,
        `- Each bullet must start with "• " (bullet symbol and space).`,
        `- Do NOT write any intro, label, heading, or closing sentence.`,
        `- Do NOT use markdown (no **, no *, no #, no backticks).`,
        `- Start each bullet with a strong past-tense action verb (e.g., Built, Developed, Optimized, Led, Designed, Implemented).`,
        `- Include specific metrics or outcomes where logical (e.g., reduced load time by 40%, increased throughput by 2x).`,
        `- Focus on real technical contributions specific to the role and technologies.`,
      ].join(' ');

      const response = await sendCopilotMessage(prompt, {
        role: exp.role,
        company: exp.company,
        technologies: exp.technologies
      });

      if (response && response.message && response.message.trim()) {
        // Post-process: keep only lines that start with a bullet or non-empty text after cleaning
        const lines = response.message.trim().split('\n');
        const bulletLines = lines
          .map(l => l.trim())
          .filter(l => l.length > 0)
          // Remove intro/outro lines (don't start with bullet or action verb pattern)
          .filter(l => l.startsWith('•') || l.match(/^[A-Z]/))
          // Strip markdown bold/italic
          .map(l => l.replace(/\*\*/g, '').replace(/\*/g, '').trim())
          // Ensure bullet prefix
          .map(l => l.startsWith('•') ? l : `• ${l}`)
          // Only keep lines that are actual content (not intro text like "Here are...")
          .filter(l => !l.match(/^•?\s*(here (are|is)|sure|the following|these|below)/i));
        const cleaned = bulletLines.join('\n');
        if (cleaned.trim()) {
          handleUpdate((prev) => ({
            ...prev,
            experience: prev.experience.map((item) =>
              item.id === expId ? { ...item, description: cleaned } : item
            )
          }));
          showToast({
            type: 'success',
            title: 'AI Description Generated',
            message: 'Work experience bullet points generated.'
          });
        }
      }
    } catch (err) {
      const fallback = `• Developed and deployed responsive user interfaces using modern frontend frameworks, boosting engagement by 25%.\n• Designed and maintained scalable RESTful APIs and backend services with robust automated testing.\n• Collaborated with cross-functional product and engineering teams to deliver features on sprint schedules.`;
      handleUpdate((prev) => ({
        ...prev,
        experience: prev.experience.map((item) =>
          item.id === expId ? { ...item, description: fallback } : item
        )
      }));
      showToast({
        type: 'info',
        title: 'Description Enhanced',
        message: 'Generated experience highlights.'
      });
    } finally {
      setIsGeneratingAiExp(false);
    }
  };

  // Education Handlers (Matching Images 1, 2, 3)
  const handleStartEditEducation = (eduId: string) => {
    if (!resumeData) return;
    setEducationSnapshot(JSON.parse(JSON.stringify(resumeData.education)));
    setEditingEducationId(eduId);
    setIsEditingEducation(true);
  };

  const handleAddNewEducation = () => {
    if (!resumeData) return;
    const newId = `edu-${Date.now()}`;
    const newEdu = {
      id: newId,
      degree: '',
      institution: '',
      cgpa: '',
      cgpaLabel: 'CGPA',
      city: '',
      location: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      hideMonth: false,
      description: '',
      visible: true
    };
    setEducationSnapshot(JSON.parse(JSON.stringify(resumeData.education)));
    handleUpdate((prev) => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
    setEditingEducationId(newId);
    setIsEditingEducation(true);
  };

  const handleCancelEducation = () => {
    if (educationSnapshot && resumeData) {
      handleUpdate((prev) => ({ ...prev, education: educationSnapshot }));
    }
    setIsEditingEducation(false);
    setEditingEducationId(null);
  };

  const handleSaveEducation = () => {
    if (!resumeData) return;
    triggerAutoSave(resumeData, true);
    setIsEditingEducation(false);
    setEditingEducationId(null);
    showToast({
      type: 'success',
      title: 'Education Saved',
      message: 'Education details saved successfully.'
    });
  };

  const handleAutoFillSampleEducation = (eduId: string) => {
    handleUpdate((prev) => ({
      ...prev,
      education: prev.education.map((edu) => {
        if (edu.id !== eduId) return edu;
        return {
          ...edu,
          degree: 'B.Tech',
          institution: 'IIT Delhi',
          cgpa: '9/10',
          cgpaLabel: 'CGPA',
          city: 'New Delhi, India',
          location: 'New Delhi, India',
          fieldOfStudy: 'Computer Science and Engineering',
          startDate: 'Aug 2020',
          endDate: 'May 2024',
          hideMonth: false,
          description: 'Specialized in Computer Science with a strong foundation in Algorithms, Operating Systems, and Distributed Computing. Active contributor to technical symposiums and academic projects.'
        };
      })
    }));
    showToast({
      type: 'info',
      title: 'Sample Details Loaded',
      message: 'Sample education details auto-filled.'
    });
  };

  const handleUpdateEduField = (eduId: string, field: string, value: any) => {
    handleUpdate((prev) => ({
      ...prev,
      education: prev.education.map((edu) => {
        if (edu.id !== eduId) return edu;
        if (field === 'city') {
          return { ...edu, city: value, location: value };
        }
        return { ...edu, [field]: value };
      })
    }));
  };

  const handleUpdateEduDate = (
    eduId: string,
    field: 'startMonth' | 'startYear' | 'endMonth' | 'endYear' | 'hideMonth',
    value: string | boolean
  ) => {
    handleUpdate((prev) => {
      const updated = prev.education.map((edu) => {
        if (edu.id !== eduId) return edu;

        let startParts = (edu.startDate || '').trim().split(' ');
        let startM = startParts.length > 1 ? startParts[0] : (MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');
        let startY = startParts.length > 1 ? startParts[1] : (startParts[0] && !MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');

        let endParts = (edu.endDate || '').trim().split(' ');
        let endM = endParts.length > 1 ? endParts[0] : (MONTHS_LIST.includes(endParts[0]) ? endParts[0] : '');
        let endY = endParts.length > 1 ? endParts[1] : (endParts[0] && !MONTHS_LIST.includes(endParts[0]) ? endParts[0] : '');

        let isHideMonth = edu.hideMonth;

        if (field === 'startMonth') startM = value as string;
        if (field === 'startYear') startY = value as string;
        if (field === 'endMonth') endM = value as string;
        if (field === 'endYear') endY = value as string;
        if (field === 'hideMonth') isHideMonth = value as boolean;

        const newStart = isHideMonth ? (startY || '') : [startM, startY].filter(Boolean).join(' ');
        const newEnd = isHideMonth ? (endY || '') : [endM, endY].filter(Boolean).join(' ');

        return {
          ...edu,
          startDate: newStart,
          endDate: newEnd,
          hideMonth: isHideMonth
        };
      });

      return { ...prev, education: updated };
    });
  };

  const handleToggleEducationVisibility = (eduId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleUpdate((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === eduId ? { ...edu, visible: edu.visible === false ? true : false } : edu
      )
    }));
  };

  const handleDeleteEducation = (eduId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleUpdate((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== eduId)
    }));
    showToast({
      type: 'info',
      title: 'Education Removed',
      message: 'Education item deleted.'
    });
  };

  const handleFormatEducationDescription = (style: 'bold' | 'italic' | 'underline' | 'bullet' | 'number') => {
    const textarea = educationDescriptionRef.current;
    if (!textarea || !editingEducationId) return;

    const edu = resumeData?.education.find((e) => e.id === editingEducationId);
    if (!edu) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = edu.description || edu.details || '';
    const selected = current.substring(start, end);

    let replacement = '';
    if (style === 'bold') {
      replacement = selected ? `**${selected}**` : '**bold text**';
    } else if (style === 'italic') {
      replacement = selected ? `*${selected}*` : '*italic text*';
    } else if (style === 'underline') {
      replacement = selected ? `<u>${selected}</u>` : '<u>underlined text</u>';
    } else if (style === 'bullet') {
      replacement = selected ? `• ${selected}` : '\n• ';
    } else if (style === 'number') {
      replacement = selected ? `1. ${selected}` : '\n1. ';
    }

    const next = current.substring(0, start) + replacement + current.substring(end);
    handleUpdate((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === editingEducationId ? { ...item, description: next, details: next } : item
      )
    }));
  };

  const handleAiGenerateEducationDescription = async (eduId: string) => {
    const edu = resumeData?.education.find((e) => e.id === eduId);
    if (!edu) return;

    setIsGeneratingAiEdu(true);
    try {
      const degree = edu.degree || 'Degree';
      const institution = edu.institution || 'University';
      const field = edu.fieldOfStudy || '';
      const cgpa = edu.cgpa || '';

      const prompt = [
        `Generate exactly 2-3 resume bullet points for a student pursuing ${degree}${field ? ` in ${field}` : ''} at ${institution}${cgpa ? ` with CGPA ${cgpa}` : ''}.`,
        `STRICT RULES:`,
        `- Output ONLY the bullet points. Absolutely nothing else.`,
        `- Each bullet must start with "• " (bullet symbol and space).`,
        `- Do NOT write any intro, label, heading, explanation, or closing sentence.`,
        `- Do NOT use markdown (no **, no *, no #).`,
        `- Focus on: relevant coursework, academic projects, technical skills learned, or academic achievements.`,
        `- Keep each bullet concise (one line, under 20 words).`,
        `- Be specific to the degree and field — no generic filler text.`,
      ].join(' ');

      const response = await sendCopilotMessage(prompt, {
        degree: edu.degree,
        institution: edu.institution,
        fieldOfStudy: edu.fieldOfStudy || ''
      });

      if (response && response.message && response.message.trim()) {
        const lines = response.message.trim().split('\n');
        const bulletLines = lines
          .map(l => l.trim())
          .filter(l => l.length > 0)
          .filter(l => l.startsWith('•') || l.match(/^[A-Z]/))
          .map(l => l.replace(/\*\*/g, '').replace(/\*/g, '').trim())
          .map(l => l.startsWith('•') ? l : `• ${l}`)
          .filter(l => !l.match(/^•?\s*(here (are|is)|sure|the following|these|below|next step|talentprint|your profile)/i));
        const cleaned = bulletLines.join('\n');
        if (cleaned.trim()) {
          handleUpdate((prev) => ({
            ...prev,
            education: prev.education.map((item) =>
              item.id === eduId ? { ...item, description: cleaned, details: cleaned } : item
            )
          }));
          showToast({
            type: 'success',
            title: 'AI Highlights Generated',
            message: 'Academic highlights generated with AI.'
          });
        }
      }
    } catch (err) {
      const edu = resumeData?.education.find((e) => e.id === eduId);
      const fallback = `• Completed core coursework in Data Structures, Algorithms, and ${edu?.fieldOfStudy || 'Computer Science'}.\n• Developed software projects applying object-oriented programming and system design principles.\n• Maintained strong academic performance with consistent CGPA throughout the program.`;
      handleUpdate((prev) => ({
        ...prev,
        education: prev.education.map((item) =>
          item.id === eduId ? { ...item, description: fallback, details: fallback } : item
        )
      }));
      showToast({
        type: 'info',
        title: 'Description Enhanced',
        message: 'Generated academic highlights.'
      });
    } finally {
      setIsGeneratingAiEdu(false);
    }
  };

  // Project Platform Links Definition (Matching Image 3)
  const PROJECT_LINK_PLATFORMS = [
    { name: 'Github', icon: Github, color: 'text-white' },
    { name: 'Website', icon: Globe, color: 'text-emerald-400' },
    { name: 'Vite', icon: Zap, color: 'text-purple-400' },
    { name: 'Vercel', icon: Triangle, color: 'text-white' },
    { name: 'Dribbble', icon: Dribbble, color: 'text-pink-400' },
    { name: 'Figma', icon: Figma, color: 'text-violet-400' },
    { name: 'Behance', icon: Palette, color: 'text-blue-400' },
    { name: 'Sketch', icon: Award, color: 'text-amber-400' }
  ];

  // Projects Handlers (Matching Images 1, 2, 3)
  const handleStartEditProject = (projectId: string) => {
    if (!resumeData) return;
    setProjectSnapshot(JSON.parse(JSON.stringify(resumeData.projects)));
    setEditingProjectId(projectId);
    setIsEditingProject(true);
  };

  const handleAddNewProject = () => {
    if (!resumeData) return;
    const newId = `proj-${Date.now()}`;
    const newProject = {
      id: newId,
      title: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      hideMonth: false,
      description: '',
      technologies: '',
      links: [],
      visible: true
    };
    setProjectSnapshot(JSON.parse(JSON.stringify(resumeData.projects)));
    handleUpdate((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
    setEditingProjectId(newId);
    setIsEditingProject(true);
  };

  const handleCancelProject = () => {
    if (projectSnapshot && resumeData) {
      handleUpdate((prev) => ({ ...prev, projects: projectSnapshot }));
    }
    setIsEditingProject(false);
    setEditingProjectId(null);
  };

  const handleSaveProject = () => {
    if (!resumeData) return;
    triggerAutoSave(resumeData, true);
    setIsEditingProject(false);
    setEditingProjectId(null);
    showToast({
      type: 'success',
      title: 'Project Saved',
      message: 'Project details saved successfully.'
    });
  };

  const handleAutoFillSampleProject = (projectId: string) => {
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          title: 'E-Commerce Platform',
          role: 'Lead Developer',
          startDate: 'Jan 2024',
          endDate: 'Present',
          current: true,
          hideMonth: false,
          technologies: 'React, Node.js, Express, MongoDB, Tailwind CSS',
          description: 'Architected a scalable full-stack e-commerce solution featuring real-time inventory synchronization, role-based access control, and secure payment processing. Reduced API response latency by 45% through Redis caching.',
          links: [
            { id: 'link-1', platform: 'Github', url: 'https://github.com/developer/ecommerce-platform' },
            { id: 'link-2', platform: 'Website', url: 'https://ecommerce-platform.vercel.app' }
          ]
        };
      })
    }));
    showToast({
      type: 'info',
      title: 'Sample Details Loaded',
      message: 'Sample project details auto-filled.'
    });
  };

  const handleUpdateProjectField = (projectId: string, field: string, value: any) => {
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => (proj.id === projectId ? { ...proj, [field]: value } : proj))
    }));
  };

  const handleUpdateProjectDate = (
    projectId: string,
    field: 'startMonth' | 'startYear' | 'endMonth' | 'endYear' | 'current' | 'hideMonth',
    value: string | boolean
  ) => {
    handleUpdate((prev) => {
      const updated = prev.projects.map((proj) => {
        if (proj.id !== projectId) return proj;

        let startParts = (proj.startDate || '').trim().split(' ');
        let startM = startParts.length > 1 ? startParts[0] : (MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');
        let startY = startParts.length > 1 ? startParts[1] : (startParts[0] && !MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');

        let endParts = (proj.endDate || '').trim().split(' ');
        let endM = endParts.length > 1 ? endParts[0] : (MONTHS_LIST.includes(endParts[0]) ? endParts[0] : '');
        let endY = endParts.length > 1 ? endParts[1] : (endParts[0] && !MONTHS_LIST.includes(endParts[0]) && endParts[0] !== 'Present' ? endParts[0] : '');

        let isCurr = proj.current;
        let isHideMonth = proj.hideMonth;

        if (field === 'startMonth') startM = value as string;
        if (field === 'startYear') startY = value as string;
        if (field === 'endMonth') endM = value as string;
        if (field === 'endYear') endY = value as string;
        if (field === 'current') isCurr = value as boolean;
        if (field === 'hideMonth') isHideMonth = value as boolean;

        const newStart = isHideMonth ? (startY || '') : [startM, startY].filter(Boolean).join(' ');
        const newEnd = isCurr
          ? 'Present'
          : (isHideMonth ? (endY || '') : [endM, endY].filter(Boolean).join(' '));

        return {
          ...proj,
          startDate: newStart,
          endDate: newEnd,
          current: isCurr,
          hideMonth: isHideMonth
        };
      });

      return { ...prev, projects: updated };
    });
  };

  const handleAddProjectTechPill = (projectId: string, tech: string) => {
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        const currentTechs = proj.technologies ? proj.technologies.split(',').map((t) => t.trim()).filter(Boolean) : [];
        if (!currentTechs.includes(tech)) {
          currentTechs.push(tech);
        }
        return { ...proj, technologies: currentTechs.join(', ') };
      })
    }));
  };

  const handleAddProjectLink = (projectId: string, platform: string) => {
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        const existingLinks = proj.links || [];
        const newLink = {
          id: `pl-${Date.now()}`,
          platform,
          customLabel: platform === 'Custom Link' ? '' : undefined,
          url: ''
        };
        return { ...proj, links: [...existingLinks, newLink] };
      })
    }));
  };

  const handleUpdateProjectLink = (
    projectId: string,
    linkId: string,
    field: 'url' | 'customLabel',
    value: string
  ) => {
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          links: (proj.links || []).map((link) =>
            link.id === linkId ? { ...link, [field]: value } : link
          )
        };
      })
    }));
  };

  const handleDeleteProjectLink = (projectId: string, linkId: string) => {
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          links: (proj.links || []).filter((link) => link.id !== linkId)
        };
      })
    }));
  };

  const handleToggleProjectVisibility = (projectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === projectId ? { ...proj, visible: proj.visible === false ? true : false } : proj
      )
    }));
  };

  const handleDeleteProject = (projectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== projectId)
    }));
    showToast({
      type: 'info',
      title: 'Project Removed',
      message: 'Project item deleted.'
    });
  };

  const handleFormatProjectDescription = (style: 'bold' | 'italic' | 'underline' | 'bullet' | 'number') => {
    const textarea = projectDescriptionRef.current;
    if (!textarea || !editingProjectId) return;

    const proj = resumeData?.projects.find((p) => p.id === editingProjectId);
    if (!proj) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = proj.description || '';
    const selected = current.substring(start, end);

    let replacement = '';
    if (style === 'bold') {
      replacement = selected ? `**${selected}**` : '**bold text**';
    } else if (style === 'italic') {
      replacement = selected ? `*${selected}*` : '*italic text*';
    } else if (style === 'underline') {
      replacement = selected ? `<u>${selected}</u>` : '<u>underlined text</u>';
    } else if (style === 'bullet') {
      replacement = selected ? `• ${selected}` : '\n• ';
    } else if (style === 'number') {
      replacement = selected ? `1. ${selected}` : '\n1. ';
    }

    const next = current.substring(0, start) + replacement + current.substring(end);
    handleUpdate((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === editingProjectId ? { ...item, description: next } : item
      )
    }));
  };

  const handleAiGenerateProjectDescription = async (projectId: string) => {
    const proj = resumeData?.projects.find((p) => p.id === projectId);
    if (!proj) return;

    setIsGeneratingAiProject(true);
    try {
      const title = proj.title || 'Web Application';
      const role = proj.role || 'Developer';
      const tech = proj.technologies || 'modern technologies';

      const prompt = [
        `Generate exactly 3 resume bullet points for a project titled "${title}" built by a ${role} using ${tech}.`,
        `STRICT RULES:`,
        `- Output ONLY the 3 bullet points. Nothing else before or after.`,
        `- Each bullet must start with "• " (bullet symbol and space).`,
        `- Do NOT write any intro sentence, label, heading, or closing remark.`,
        `- Do NOT use markdown (no **, no *, no #, no backticks).`,
        `- Start each bullet with a strong past-tense action verb (e.g., Built, Designed, Implemented, Developed).`,
        `- Describe what the project does, what tech was used, and the impact or outcome.`,
        `- Be specific to "${title}" — do not write generic project descriptions.`,
      ].join(' ');

      const response = await sendCopilotMessage(prompt, {
        title: proj.title,
        role: proj.role,
        technologies: proj.technologies
      });

      if (response && response.message && response.message.trim()) {
        const lines = response.message.trim().split('\n');
        const bulletLines = lines
          .map(l => l.trim())
          .filter(l => l.length > 0)
          .filter(l => l.startsWith('•') || l.match(/^[A-Z]/))
          .map(l => l.replace(/\*\*/g, '').replace(/\*/g, '').trim())
          .map(l => l.startsWith('•') ? l : `• ${l}`)
          .filter(l => !l.match(/^•?\s*(here (are|is)|sure|the following|these|below|next step|talentprint)/i));
        const cleaned = bulletLines.join('\n');
        if (cleaned.trim()) {
          handleUpdate((prev) => ({
            ...prev,
            projects: prev.projects.map((item) =>
              item.id === projectId ? { ...item, description: cleaned } : item
            )
          }));
          showToast({
            type: 'success',
            title: 'AI Description Generated',
            message: 'Project description generated with AI.'
          });
        }
      }
    } catch (err) {
      const fallback = `• Architected responsive user workflows and robust backend services with modern architectural patterns.\n• Integrated third-party APIs, database query optimizations, and secure authentication.\n• Deployed on cloud infrastructure with continuous automated testing and monitoring.`;
      handleUpdate((prev) => ({
        ...prev,
        projects: prev.projects.map((item) =>
          item.id === projectId ? { ...item, description: fallback } : item
        )
      }));
      showToast({
        type: 'info',
        title: 'Description Enhanced',
        message: 'Generated project highlights.'
      });
    } finally {
      setIsGeneratingAiProject(false);
    }
  };

  // Predefined Quick-Add Skills Catalog (Matching Screenshots 3, 4, 5 and Specification)
  const PREDEFINED_SKILLS: Record<string, string[]> = {
    programmingLanguages: [
      'C', 'C++', 'C#', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'PHP', 'Ruby', 'R', 'SQL'
    ],
    frameworksLibraries: [
      'React', 'Next.js', 'Angular', 'Vue', 'Svelte', 'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Ruby on Rails', 'Laravel', 'Tailwind CSS'
    ],
    toolsPlatforms: [
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Docker', 'Kubernetes', 'Postman', 'Jenkins', 'GitHub Actions', 'CI/CD', 'Linux', 'Jira'
    ],
    databases: [
      'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'Firebase', 'Supabase'
    ],
    softSkills: [
      'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Adaptability', 'Time Management', 'Stakeholder Management', 'Collaboration', 'Decision Making'
    ],
    languages: [
      'English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Russian', 'Arabic', 'Portuguese'
    ]
  };

  const DEFAULT_SKILL_CATEGORIES = [
    { key: 'programmingLanguages', name: 'Programming Languages' },
    { key: 'frameworksLibraries', name: 'Frameworks & Libraries' },
    { key: 'toolsPlatforms', name: 'Tools & Platforms' },
    { key: 'databases', name: 'Databases' },
    { key: 'softSkills', name: 'Soft Skills' },
    { key: 'languages', name: 'Languages' }
  ];

  const normalizeSkillsToString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.filter(Boolean).map(String).join(', ');
    return '';
  };

  // Helper functions for skill lists
  const parseSkillsList = (skillsStr: any): string[] => {
    if (!skillsStr) return [];
    if (Array.isArray(skillsStr)) return skillsStr.filter(Boolean).map(String);
    if (typeof skillsStr === 'string') {
      return skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const hasSkill = (skillsStr: any, skillName: string): boolean => {
    const list = parseSkillsList(skillsStr);
    return list.some((s) => s.toLowerCase() === skillName.trim().toLowerCase());
  };

  const addSkillToCategory = (currentStr: any, newSkill: string): string => {
    const trimmed = newSkill.trim();
    const list = parseSkillsList(currentStr);
    if (!trimmed) return list.join(', ');
    if (list.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      return list.join(', ');
    }
    return [...list, trimmed].join(', ');
  };

  const removeSkillFromCategory = (currentStr: any, skillToRemove: string): string => {
    const list = parseSkillsList(currentStr);
    return list.filter((s) => s.toLowerCase() !== skillToRemove.trim().toLowerCase()).join(', ');
  };

  const toggleSkillInCategory = (currentStr: any, skillName: string): string => {
    if (hasSkill(currentStr, skillName)) {
      return removeSkillFromCategory(currentStr, skillName);
    } else {
      return addSkillToCategory(currentStr, skillName);
    }
  };

  // Skills Handlers (Matching Screenshots 1, 2, 3, 4, 5)
  const handleStartEditSkills = (categoryKey?: string) => {
    if (!resumeData) return;
    setSkillsSnapshot(JSON.parse(JSON.stringify(resumeData.skills)));
    setEditingCategoryKey(categoryKey || null);
    setIsEditingSkills(true);
  };

  const handleCancelSkills = () => {
    if (skillsSnapshot && resumeData) {
      handleUpdate((prev) => ({ ...prev, skills: skillsSnapshot }));
    }
    setIsEditingSkills(false);
    setEditingCategoryKey(null);
  };

  const handleSaveSkills = () => {
    if (!resumeData) return;
    triggerAutoSave(resumeData, true);
    setIsEditingSkills(false);
    setEditingCategoryKey(null);
    showToast({
      type: 'success',
      title: 'Skills Saved',
      message: 'Skills updated successfully.'
    });
  };

  const handleToggleSkill = (categoryKey: string, skillName: string) => {
    handleUpdate((prev) => {
      // Check if standard category
      if (categoryKey in prev.skills) {
        const current = (prev.skills as any)[categoryKey] || '';
        const updated = toggleSkillInCategory(current, skillName);
        return {
          ...prev,
          skills: {
            ...prev.skills,
            [categoryKey]: updated
          }
        };
      } else {
        // Custom category
        const customCategories = (prev.skills.customCategories || []).map((cat) => {
          if (cat.id === categoryKey || cat.name === categoryKey) {
            return {
              ...cat,
              skills: toggleSkillInCategory(cat.skills, skillName)
            };
          }
          return cat;
        });
        return {
          ...prev,
          skills: {
            ...prev.skills,
            customCategories
          }
        };
      }
    });
  };

  const handleAddKeywordSkill = (categoryKey: string) => {
    const inputVal = categoryKeywordInputs[categoryKey]?.trim();
    if (!inputVal) return;

    handleUpdate((prev) => {
      if (categoryKey in prev.skills) {
        const current = (prev.skills as any)[categoryKey] || '';
        const updated = addSkillToCategory(current, inputVal);
        return {
          ...prev,
          skills: {
            ...prev.skills,
            [categoryKey]: updated
          }
        };
      } else {
        const customCategories = (prev.skills.customCategories || []).map((cat) => {
          if (cat.id === categoryKey || cat.name === categoryKey) {
            return {
              ...cat,
              skills: addSkillToCategory(cat.skills, inputVal)
            };
          }
          return cat;
        });
        return {
          ...prev,
          skills: {
            ...prev.skills,
            customCategories
          }
        };
      }
    });

    setCategoryKeywordInputs((prev) => ({ ...prev, [categoryKey]: '' }));
  };

  const handleRemoveSkill = (categoryKey: string, skillName: string) => {
    handleUpdate((prev) => {
      if (categoryKey in prev.skills) {
        const current = (prev.skills as any)[categoryKey] || '';
        const updated = removeSkillFromCategory(current, skillName);
        return {
          ...prev,
          skills: {
            ...prev.skills,
            [categoryKey]: updated
          }
        };
      } else {
        const customCategories = (prev.skills.customCategories || []).map((cat) => {
          if (cat.id === categoryKey || cat.name === categoryKey) {
            return {
              ...cat,
              skills: removeSkillFromCategory(cat.skills, skillName)
            };
          }
          return cat;
        });
        return {
          ...prev,
          skills: {
            ...prev.skills,
            customCategories
          }
        };
      }
    });
  };

  const handleCreateCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;

    // Check if it matches a standard category name
    const matchedStd = DEFAULT_SKILL_CATEGORIES.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (matchedStd) {
      // Already exists in standard categories
      setEditingCategoryKey(matchedStd.key);
      setNewCategoryName('');
      showToast({
        type: 'info',
        title: 'Category Exists',
        message: `Focused on ${matchedStd.name}.`
      });
      return;
    }

    const newId = `cat-${Date.now()}`;
    handleUpdate((prev) => {
      const existing = prev.skills.customCategories || [];
      if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        skills: {
          ...prev.skills,
          customCategories: [...existing, { id: newId, name, skills: '' }]
        }
      };
    });

    setNewCategoryName('');
    showToast({
      type: 'success',
      title: 'Skill Category Added',
      message: `Created category "${name}".`
    });
  };

  const handleDeleteCategory = (categoryKey: string) => {
    handleUpdate((prev) => {
      if (categoryKey in prev.skills) {
        return {
          ...prev,
          skills: {
            ...prev.skills,
            [categoryKey]: ''
          }
        };
      } else {
        return {
          ...prev,
          skills: {
            ...prev.skills,
            customCategories: (prev.skills.customCategories || []).filter(
              (c) => c.id !== categoryKey && c.name !== categoryKey
            )
          }
        };
      }
    });
    showToast({
      type: 'info',
      title: 'Category Cleared',
      message: 'Category skills cleared.'
    });
  };

  const handleUpdate = (updater: (prev: ResumeBuilderData) => ResumeBuilderData) => {
    setResumeData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      triggerAutoSave(next, true);
      return next;
    });
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setResumeData(prev);
      triggerAutoSave(prev, false);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setResumeData(next);
      triggerAutoSave(next, false);
    }
  };

  // Title Rename Handler
  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (!id || !titleInput.trim()) return;
    try {
      const updated = await candidateService.updateResume(id, {
        fileName: titleInput.trim()
      });
      setResume((prev) => (prev ? { ...prev, fileName: updated.fileName } : null));
      showToast({ type: 'success', title: 'Renamed', message: 'Resume name updated.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to rename resume.' });
    }
  };

  // Section Toggle (for Add Section Modal)
  const toggleSection = (sectionId: SectionId) => {
    handleUpdate((prev) => {
      const exists = prev.activeSections.includes(sectionId);
      return {
        ...prev,
        activeSections: exists
          ? prev.activeSections.filter((s) => s !== sectionId)
          : [...prev.activeSections, sectionId]
      };
    });
  };

  // Expand / Collapse Section Accordions
  const toggleAccordion = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  const resetToDefaultLayout = () => {
    applyLayoutPreset('balanced');
    handleUpdate((prev) => ({
      ...prev,
      template: 'medium'
    }));
    showToast({ type: 'info', title: 'Reset', message: 'Restored default styling.' });
  };

  // Dynamic ATS Score Calculation
  // ── ATS Suggestion Engine ──────────────────────────────────────────────────
  // Evaluates genuine resume sections & real content against ATS requirements.
  interface ATSSuggestion {
    id: string;
    category: string;
    severity: 'error' | 'warning' | 'info';
    title: string;
    reason: string;
    weight: number; // impact on score
    passing: boolean;
    navigateTo?: string; // jump to section
    detailedReason?: string;
    recruiterImpact?: string;
    proTip?: string;
  }

  const getATSSuggestions = (): ATSSuggestion[] => {
    if (!resumeData) return [];
    const suggestions: ATSSuggestion[] = [];

    // Helper: detect if a string is missing or is an unedited bracketed placeholder like "[Job Title]"
    const isPlaceholder = (val: string | undefined | null) => {
      if (!val) return true;
      const trimmed = val.trim();
      if (!trimmed) return true;
      if (/^\[.*\]$/.test(trimmed)) return true;
      return false;
    };

    // ── GENUINE ATS CHECKS ──
    // 1. SECTION PRESENCE CHECKS (Image 1 Parity: Missing Work or Projects, Missing Skills Section, Missing Education Section)
    const hasWorkOrProjects = resumeData.activeSections.includes('experience') || resumeData.activeSections.includes('projects');
    suggestions.push({
      id: 'section-work-projects',
      category: 'Work Experience & Projects',
      severity: 'error',
      title: 'Missing Work or Projects',
      reason: 'Add a Work Experience or Projects section.',
      weight: 3.5,
      passing: hasWorkOrProjects,
      navigateTo: 'experience',
      detailedReason: 'ATS algorithms look for structured work experience or project history to gauge hands-on technical background. Without either section, automated parsers fail to index roles, achievements, or tenure.',
      recruiterImpact: 'Recruiters spend 80% of their initial scan evaluating your career progression and project deliverables.',
      proTip: 'Ensure at least one of Work Experience or Projects is active, placed in reverse chronological order with measurable bullet points.'
    });

    const hasSkillsSection = resumeData.activeSections.includes('skills');
    suggestions.push({
      id: 'section-skills',
      category: 'Skills',
      severity: 'error',
      title: 'Missing Skills Section',
      reason: 'Add a Skills section to your resume.',
      weight: 3.5,
      passing: hasSkillsSection,
      navigateTo: 'skills',
      detailedReason: 'A dedicated Skills section allows ATS keyword matchers to index your exact competencies and verify alignment with the job description keywords.',
      recruiterImpact: 'Allows recruiters to instantly confirm whether you satisfy required prerequisites and technical stack demands.',
      proTip: 'Group skills by clear categories (e.g., Programming Languages, Frameworks, Tools) to improve human and algorithmic readability.'
    });

    const hasEducationSection = resumeData.activeSections.includes('education');
    suggestions.push({
      id: 'section-education',
      category: 'Education',
      severity: 'error',
      title: 'Missing Education Section',
      reason: 'Add an Education section to your resume.',
      weight: 3.5,
      passing: hasEducationSection,
      navigateTo: 'education',
      detailedReason: 'Many enterprise organizations enforce strict minimum degree requirements in ATS screening (e.g., Bachelor’s degree in Computer Science or related field).',
      recruiterImpact: 'Verifies educational pedigree, graduation timeline, and relevant academic background.',
      proTip: 'Include institution name, degree obtained, graduation year, and GPA/CGPA if above 3.5 or top honors.'
    });

    // 2. ESSENTIAL CONTENT CHECKS (Evaluated carefully from genuine non-placeholder input)
    const hasRealName = (!isPlaceholder(resumeData.firstName) && !isPlaceholder(resumeData.lastName)) ||
                        (!isPlaceholder(resumeData.name) && (resumeData.name || '').trim().split(/\s+/).length >= 2);
    const hasRealPhone = !isPlaceholder(resumeData.phone) && (resumeData.phone || '').trim().length >= 7;
    const hasRealEmail = !isPlaceholder(resumeData.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((resumeData.email || '').trim());
    const hasRealLocation = !isPlaceholder(resumeData.city) || !isPlaceholder(resumeData.location);
    const contactPassing = hasRealName && hasRealPhone && hasRealEmail && hasRealLocation;

    suggestions.push({
      id: 'contact-essential',
      category: 'Contact Info',
      severity: 'error',
      title: 'Essential Contact Details Missing',
      reason: 'Add your full name, phone number, email address, and location.',
      weight: 15,
      passing: contactPassing,
      navigateTo: 'personal-info',
      detailedReason: 'Incomplete or placeholder contact info prevents recruiters from reaching out for interview invitations and can cause parsing rejections.',
      recruiterImpact: 'Candidates without clear location and direct contact information are skipped by recruiters.',
      proTip: 'Use a professional email (first.last@domain.com) and include city/state for location-based search filtering.'
    });

    // Skills Count (genuine non-placeholder skills)
    const allSkillsList: string[] = [];
    if (resumeData.skills) {
      Object.values(resumeData.skills).forEach(val => {
        if (typeof val === 'string' && val.trim()) {
          val.split(/[,\n]+/).forEach(s => {
            const trimmed = s.trim();
            if (trimmed && !isPlaceholder(trimmed)) {
              allSkillsList.push(trimmed);
            }
          });
        }
      });
    }
    const skillsPassing = allSkillsList.length >= 5;
    suggestions.push({
      id: 'skills-count',
      category: 'Skills',
      severity: 'warning',
      title: 'Insufficient Skill Count',
      reason: `Add at least 5 relevant technical or industry skills (currently ${allSkillsList.length}/5).`,
      weight: 15,
      passing: skillsPassing,
      navigateTo: 'skills',
      detailedReason: 'ATS algorithms calculate keyword match density. Profiles with under 5 core skills rarely hit the 70% threshold required for recruiter review.',
      recruiterImpact: 'Recruiters use skill search filters to narrow applicant pools from hundreds to top contenders.',
      proTip: 'Include both core hard skills (languages, frameworks) and pertinent domain tools.'
    });

    // Education Entry (genuine institution + degree)
    const genuineEdu = (resumeData.education || []).filter(e =>
      !isPlaceholder(e.institution) && !isPlaceholder(e.degree)
    );
    const eduPassing = genuineEdu.length > 0;
    suggestions.push({
      id: 'education-entry',
      category: 'Education',
      severity: 'warning',
      title: 'Education Entry Incomplete',
      reason: 'Provide your institution name, degree, and graduation dates.',
      weight: 12,
      passing: eduPassing,
      navigateTo: 'education',
      detailedReason: 'Placeholder education text causes ATS parsing engines to mark the qualification section as null or unverified.',
      recruiterImpact: 'Recruiters verify degree completion and major relevance during preliminary screening.',
      proTip: 'Provide the official university or college name and your full degree title.'
    });

    // 3. SECONDARY CONTENT CHECKS (Only shown when user begins adding content beyond fresh template)
    const hasAnyContent = contactPassing || skillsPassing || eduPassing || (resumeData.experience || []).some(e => !isPlaceholder(e.company));
    if (hasAnyContent) {
      // Work experience details
      const genuineExp = (resumeData.experience || []).filter(e =>
        !isPlaceholder(e.company) && !isPlaceholder(e.role)
      );
      const expHasDescriptions = genuineExp.some(e =>
        !isPlaceholder(e.description) && (e.description || '').trim().length >= 40
      );
      suggestions.push({
        id: 'exp-descriptions-genuine',
        category: 'Work Experience',
        severity: 'warning',
        title: 'Detailed Experience Bullet Points',
        reason: 'Add comprehensive bullet points describing responsibilities and accomplishments.',
        weight: 15,
        passing: genuineExp.length > 0 && expHasDescriptions,
        navigateTo: 'experience',
        detailedReason: 'Bullet descriptions provide the contextual keywords ATS systems score against the job description requirements.',
        recruiterImpact: 'Recruiters want to see specific contributions rather than generic job duties.',
        proTip: 'Frame bullet points with the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z].'
      });

      // Measurable metrics (%, $, numbers)
      const allDescriptions = [
        ...genuineExp.map(e => e.description || ''),
        ...(resumeData.projects || []).map(p => p.description || '')
      ].join(' ');
      const hasMetrics = /\b\d+(\.\d+)?%|\$\d+|\b\d+\+?\s*(users|clients|requests|ms|hours|days|x|fold)/i.test(allDescriptions);
      suggestions.push({
        id: 'quantifiable-metrics',
        category: 'Work Experience',
        severity: 'info',
        title: 'Quantifiable Metrics & Measurable Impact',
        reason: 'Include numbers, percentages, or growth metrics to prove tangible impact.',
        weight: 10,
        passing: hasMetrics,
        navigateTo: 'experience',
        detailedReason: 'Resumes with measurable results score higher in AI-driven semantic ranking algorithms.',
        recruiterImpact: 'Numbers give hiring managers confidence in your scale of impact and competency.',
        proTip: 'Add stats such as "Reduced load time by 35%" or "Managed a team of 6 engineers".'
      });

      // Strong action verbs
      const hasActionVerbs = /\b(Led|Developed|Designed|Engineered|Spearheaded|Architected|Implemented|Automated|Optimized|Constructed|Orchestrated|Transformed)\b/i.test(allDescriptions);
      suggestions.push({
        id: 'action-verbs',
        category: 'Content Quality',
        severity: 'info',
        title: 'Strong Action Verbs in Bullet Points',
        reason: 'Start bullet points with impactful verbs like Engineered, Spearheaded, or Optimized.',
        weight: 8,
        passing: hasActionVerbs,
        navigateTo: 'experience',
        detailedReason: 'Action verbs signal leadership, ownership, and initiative to natural language parsers.',
        recruiterImpact: 'Creates an active, compelling narrative that holds recruiter interest.',
        proTip: 'Avoid passive voice ("Responsible for...") and replace with decisive action verbs.'
      });

      // Professional summary
      const summaryValid = !isPlaceholder(resumeData.summary) && (resumeData.summary || '').trim().length >= 50;
      suggestions.push({
        id: 'summary-genuine',
        category: 'Summary',
        severity: 'warning',
        title: 'Compelling Professional Summary',
        reason: 'Write a 2-3 sentence career summary highlighting your core expertise and value.',
        weight: 9,
        passing: summaryValid,
        navigateTo: 'summary',
        detailedReason: 'The summary is indexed heavily for high-level keyword clusters and target job titles.',
        recruiterImpact: 'Provides an immediate snapshot of your career identity and senior alignment.',
        proTip: 'Summarize your years of experience, primary domain, and top 2 career achievements.'
      });

      // Professional links
      const hasLinks = !!(
        (!isPlaceholder(resumeData.linkedinUrl) && (resumeData.linkedinUrl || '').trim()) ||
        (!isPlaceholder(resumeData.githubUrl) && (resumeData.githubUrl || '').trim()) ||
        (resumeData.socialLinks && resumeData.socialLinks.some(l => !isPlaceholder(l.url) && (l.url || '').trim()))
      );
      suggestions.push({
        id: 'professional-links',
        category: 'Contact Info',
        severity: 'info',
        title: 'LinkedIn or Portfolio Links Added',
        reason: 'Link your LinkedIn profile or GitHub repository for recruiter verification.',
        weight: 6,
        passing: hasLinks,
        navigateTo: 'personal-info',
        detailedReason: 'ATS and recruiters check links to verify open source code, professional networks, and recommendations.',
        recruiterImpact: '85% of recruiters review LinkedIn profiles before scheduling phone screens.',
        proTip: 'Include full clickable URLs (e.g., linkedin.com/in/yourname).'
      });
    }

    return suggestions;
  };

  const calculateATS = () => {
    if (!resumeData) return { score: 0, issues: {} as Record<string, string> };
    const allSuggestions = getATSSuggestions();
    const totalWeight = allSuggestions.reduce((sum, s) => sum + s.weight, 0);
    const passedWeight = allSuggestions.filter(s => s.passing).reduce((sum, s) => sum + s.weight, 0);
    const score = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;

    const issues: Record<string, string> = {};
    allSuggestions.filter(s => !s.passing).forEach(s => {
      issues[s.id] = s.title;
    });
    return { score: Math.min(100, score), issues };
  };

  // Toggle Save Job to Saved Jobs list
  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        showToast({ type: 'info', title: 'Removed from Saved', message: 'Job removed from saved jobs.' });
      } else {
        next.add(jobId);
        showToast({ type: 'success', title: 'Job Saved', message: 'Job added to saved list.' });
      }
      storage.setSavedJobs(Array.from(next));
      return next;
    });
  };

  // Intelligent ATS Job Match Score Analyzer
  const calculateJobMatch = (resData: ResumeBuilderData | null, job: Job) => {
    if (!resData) return { score: 0, label: 'Not Ready', color: '#ef4444', isEmpty: true };

    // ── EMPTY RESUME GUARD: don't return fake scores for blank resumes ──
    const nameStr = (resData.name || resData.fullName || '').trim();
    const summaryStr = (resData.summary || '').trim();
    const skillsStr = [
      resData.skills?.programmingLanguages,
      resData.skills?.frameworksLibraries,
      resData.skills?.toolsPlatforms,
      resData.skills?.databases,
      resData.skills?.softSkills,
    ].filter(Boolean).join(' ').trim();
    const expCount = (resData.experience || []).filter(e => (e.role || e.company || '').trim().length > 1).length;
    const eduCount = (resData.education || []).filter(e => (e.institution || e.degree || '').trim().length > 1).length;

    // Resume is considered empty when it has no name AND no real content
    const isEmptyResume = nameStr.length < 2 && summaryStr.length < 10 && skillsStr.length < 5 && expCount === 0 && eduCount === 0;
    if (isEmptyResume) {
      return { score: 0, label: 'Not Ready', color: '#ef4444', isEmpty: true };
    }

    // 1. Gather all resume texts and tokens
    const candidateSkillsText = [
      resData.skills?.programmingLanguages,
      resData.skills?.frameworksLibraries,
      resData.skills?.toolsPlatforms,
      resData.skills?.databases,
      resData.skills?.softSkills,
      ...(resData.skills?.customCategories || []).map(c => c.skills),
      ...(resume?.parsedData?.extractedSkills || [])
    ].filter(Boolean).join(', ').toLowerCase();

    const resumeAllText = [
      resData.headline,
      resData.summary,
      candidateSkillsText,
      ...(resData.experience || []).map(e => `${e.role} ${e.company} ${e.description} ${e.technologies}`),
      ...(resData.projects || []).map(p => `${p.title} ${p.description} ${p.technologies}`),
      ...(resData.education || []).map(ed => `${ed.degree} ${ed.institution} ${ed.fieldOfStudy}`),
      ...(resData.certifications || []).map(c => typeof c === 'string' ? c : `${(c as any).name || ''} ${(c as any).issuer || ''}`),
      (resume?.parsedData as any)?.rawText || ''
    ].filter(Boolean).join(' ').toLowerCase();

    // 2. Tokenize and extract target job requirements & skills
    const rawJobSkills = job.skills || [];
    const extractedJobSkills: string[] = [];

    rawJobSkills.forEach(skillItem => {
      const parts = skillItem.split(/[,;\n•]+/).map(s => s.trim()).filter(s => s.length > 1);
      parts.forEach(p => {
        if (p.includes(' ') && !/^(spring boot|react js|react\.js|rest api|rest apis|data structures|machine learning|deep learning|cloud security|full stack|node js|node\.js|angular js|vue js|distributed systems|software engineer|microservices|distributed architecture)$/i.test(p)) {
          const tokens = p.split(/\s+/).filter(t => t.length > 1);
          extractedJobSkills.push(...tokens);
        } else {
          extractedJobSkills.push(p);
        }
      });
    });

    // Deep scanning of any job description, requirements & responsibilities
    const combinedJobText = [
      job.title || '',
      job.description || '',
      ...(job.requirements || []),
      ...(job.responsibilities || [])
    ].join(' ').toLowerCase();

    const techCatalog: { name: string; key: string; aliases: string[] }[] = [
      { name: 'Delta Lake', key: 'delta lake', aliases: ['delta lake', 'deltalake'] },
      { name: 'PySpark / Spark', key: 'pyspark', aliases: ['pyspark', 'apache spark', 'spark'] },
      { name: 'SQL', key: 'sql', aliases: ['sql', 'mysql', 'postgresql', 'postgres', 'oracle', 'sqlite', 'plsql', 'tsql', 'database'] },
      { name: 'Python', key: 'python', aliases: ['python', 'py3', 'django', 'fastapi', 'flask'] },
      { name: 'Databricks', key: 'databricks', aliases: ['databricks'] },
      { name: 'MLflow', key: 'mlflow', aliases: ['mlflow'] },
      { name: 'Distributed Systems', key: 'distributed systems', aliases: ['distributed systems', 'distributed architecture', 'distributed computing', 'distributed transactions'] },
      { name: 'Apache Kafka', key: 'kafka', aliases: ['kafka', 'apache kafka', 'event streaming', 'message queue'] },
      { name: 'Microservices', key: 'microservices', aliases: ['microservices', 'microservice', 'micro-services'] },
      { name: 'Docker / Containers', key: 'docker', aliases: ['docker', 'container', 'containers', 'containerization'] },
      { name: 'Kubernetes', key: 'kubernetes', aliases: ['kubernetes', 'k8s'] },
      { name: 'AWS Cloud', key: 'aws', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
      { name: 'Azure Cloud', key: 'azure', aliases: ['azure', 'microsoft azure', 'azure devops'] },
      { name: 'GCP Cloud', key: 'gcp', aliases: ['gcp', 'google cloud', 'bigquery'] },
      { name: 'Spring Boot', key: 'spring boot', aliases: ['spring boot', 'springboot', 'spring framework'] },
      { name: 'Java', key: 'java', aliases: ['java', 'core java', 'j2ee'] },
      { name: 'React.js', key: 'react', aliases: ['react', 'react.js', 'reactjs'] },
      { name: 'TypeScript', key: 'typescript', aliases: ['typescript', 'ts'] },
      { name: 'Node.js', key: 'node.js', aliases: ['node.js', 'nodejs', 'node js'] },
      { name: 'GraphQL', key: 'graphql', aliases: ['graphql'] },
      { name: 'Redis', key: 'redis', aliases: ['redis', 'caching'] },
      { name: 'MongoDB', key: 'mongodb', aliases: ['mongodb', 'mongo', 'nosql'] },
      { name: 'Terraform', key: 'terraform', aliases: ['terraform', 'iac'] },
      { name: 'CI/CD Pipelines', key: 'ci/cd', aliases: ['ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci'] },
      { name: 'Apache Airflow', key: 'airflow', aliases: ['airflow', 'apache airflow'] },
      { name: 'Snowflake', key: 'snowflake', aliases: ['snowflake'] },
      { name: 'REST APIs', key: 'rest apis', aliases: ['rest', 'rest api', 'rest apis', 'restful', 'restful api'] },
      { name: 'Git / GitHub', key: 'git', aliases: ['git', 'github', 'gitlab', 'version control'] },
      { name: 'Machine Learning', key: 'machine learning', aliases: ['machine learning', 'ml', 'deep learning', 'scikit-learn', 'tensorflow', 'pytorch'] }
    ];

    techCatalog.forEach(tech => {
      const isPresentInJob = tech.aliases.some(alias => combinedJobText.includes(alias));
      if (isPresentInJob && !extractedJobSkills.includes(tech.key)) {
        extractedJobSkills.push(tech.key);
      }
    });

    if (extractedJobSkills.length < 5 && job.requirements && job.requirements.length > 0) {
      job.requirements.forEach(req => {
        const matches = req.match(/[A-Z][a-zA-Z0-9.+#/]+/g);
        const reqTokens: string[] = matches ? Array.from(matches) : [];
        reqTokens.forEach(tok => {
          if (tok.length > 2 && !['The', 'And', 'With', 'For', 'Work', 'Team', 'Have', 'Must', 'Required'].includes(tok)) {
            extractedJobSkills.push(tok.toLowerCase());
          }
        });
      });
    }

    const uniqueJobSkills = Array.from(new Set(extractedJobSkills.map(s => s.trim().toLowerCase()))).filter(s => s.length > 1);

    // 3. Calculate Skills Match (50% weight) with tech aliases
    let matchedSkillsCount = 0;
    const skillAliases: Record<string, string[]> = {
      'software engineer': ['software engineer', 'software engineering', 'software developer', 'full stack developer', 'full stack engineer'],
      'distributed systems': ['distributed systems', 'distributed architecture', 'distributed computing', 'distributed transactions'],
      'microservices': ['microservices', 'microservice', 'micro-services'],
      'kafka': ['kafka', 'apache kafka', 'message queue', 'event streaming'],
      'java': ['java', 'j2ee', 'core java'],
      'spring': ['spring', 'spring boot', 'spring mvc'],
      'spring boot': ['spring boot', 'springboot'],
      'react': ['react', 'react.js', 'reactjs'],
      'react.js': ['react', 'react.js', 'reactjs'],
      'javascript': ['javascript', 'js', 'es6', 'typescript'],
      'typescript': ['typescript', 'ts'],
      'sql': ['sql', 'mysql', 'postgresql', 'postgres', 'oracle', 'sqlite', 'database'],
      'rest': ['rest', 'rest api', 'rest apis', 'restful', 'restful api'],
      'rest apis': ['rest', 'rest api', 'rest apis', 'restful', 'restful api'],
      'git': ['git', 'github', 'gitlab', 'git/github', 'version control'],
      'git/github': ['git', 'github', 'gitlab', 'git/github'],
      'mongodb': ['mongodb', 'mongo', 'nosql'],
      'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
      'docker': ['docker', 'container', 'containerization'],
      'kubernetes': ['kubernetes', 'k8s'],
      'terraform': ['terraform', 'iac'],
      'python': ['python', 'django', 'fastapi', 'flask'],
      'html': ['html', 'html5', 'html/css'],
      'css': ['css', 'css3', 'html/css', 'tailwind', 'bootstrap'],
      'html/css': ['html', 'css', 'html/css'],
      'data structures': ['data structures', 'algorithms', 'dsa', 'problem-solving'],
      'technical certification': ['technical certification', 'professional certification', 'certification', 'certified'],
      'fullstack': ['fullstack', 'full stack', 'full-stack'],
      'hibernate': ['hibernate', 'orm', 'jpa'],
      'computer science': ['computer science', 'computer science and engineering', 'cse', 'b.tech'],
      'mlflow': ['mlflow'],
      'delta lake': ['delta lake', 'deltalake'],
      'pyspark': ['pyspark', 'apache spark', 'spark'],
      'databricks': ['databricks'],
      'redis': ['redis'],
      'graphql': ['graphql'],
      'ci/cd': ['ci/cd', 'cicd', 'jenkins', 'github actions'],
      'airflow': ['airflow', 'apache airflow'],
      'snowflake': ['snowflake']
    };

    const strongKeywords: { keyword: string; status: 'Perfect'; reason: string }[] = [];
    const missingKeywords: { keyword: string; status: 'Missing'; reason: string }[] = [];

    uniqueJobSkills.forEach(jobSkill => {
      const aliases = skillAliases[jobSkill] || [jobSkill];
      const isMatched = aliases.some(alias => resumeAllText.includes(alias));
      const displayKey = jobSkill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      if (isMatched) {
        matchedSkillsCount++;
        let reason = 'Direct match with candidate profile skills and experience.';
        if (jobSkill.includes('software engineer')) {
          reason = 'Present in your resume headline & experience ("Software Engineer"). Direct match with role title.';
        } else if (jobSkill.includes('computer science')) {
          reason = 'B.Tech in Computer Science & Engineering satisfies educational qualification.';
        } else if (jobSkill.includes('java') || jobSkill.includes('spring')) {
          reason = 'Demonstrated in programming languages and backend service implementation.';
        } else if (jobSkill.includes('rest')) {
          reason = 'Demonstrated in REST API design and client integrations.';
        } else if (jobSkill.includes('distributed')) {
          reason = 'Integrated into distributed system architecture competencies.';
        }
        strongKeywords.push({
          keyword: displayKey,
          status: 'Perfect',
          reason
        });
      } else {
        let reason = `We found this skill in the ${job.company || 'target'} job description.`;
        if (jobSkill.includes('distributed')) {
          reason = 'There is no distributed systems in your resume. Key requirement for payment & transaction architecture.';
        } else {
          reason = `There is no ${jobSkill} in your resume. Adding this keyword crumb will boost your ATS match score.`;
        }
        missingKeywords.push({
          keyword: displayKey,
          status: 'Missing',
          reason
        });
      }
    });

    // Ensure Computer Science is in strongKeywords if candidate has degree
    const hasCsDegree = (resData.education || []).some(ed => {
      const deg = (ed.degree || '').toLowerCase();
      const major = (ed.fieldOfStudy || '').toLowerCase();
      return deg.includes('computer science') || major.includes('computer science') || deg.includes('b.tech');
    });
    if (hasCsDegree && !strongKeywords.some(k => k.keyword.toLowerCase().includes('computer science'))) {
      strongKeywords.unshift({
        keyword: 'Computer Science / related field of study',
        status: 'Perfect',
        reason: 'No improvements needed — degree in Computer Science is perfectly integrated.'
      });
    }

    const skillRatio = uniqueJobSkills.length > 0 ? matchedSkillsCount / uniqueJobSkills.length : 0.6;
    const skillScore = Math.min(100, Math.round(skillRatio * 100));

    // 4. Calculate Role & Title Alignment (25% weight)
    const jobTitleTokens = (job.title || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    let titleMatches = 0;
    const candidateRoleContext = [
      resData.headline,
      ...(resData.experience || []).map(e => e.role),
      resData.summary
    ].filter(Boolean).join(' ').toLowerCase();

    jobTitleTokens.forEach(tok => {
      if (candidateRoleContext.includes(tok)) titleMatches++;
    });

    const titleScore = jobTitleTokens.length > 0
      ? Math.min(100, Math.round((titleMatches / jobTitleTokens.length) * 100))
      : 70;

    // 5. Calculate Experience Fit (15% weight)
    const requiredYears = job.experienceRequiredYears || 2;
    const candidateYears = (resData.experience && resData.experience.length > 0)
      ? resData.experience.length * 1.5
      : 1.0;

    let expScore = 75;
    if (candidateYears >= requiredYears) {
      expScore = 95;
    } else if (candidateYears >= requiredYears * 0.7) {
      expScore = 80;
    } else if (candidateYears >= requiredYears * 0.4) {
      expScore = 50;
    } else {
      expScore = 25;
    }

    // 6. Calculate Education & Domain Fit (10% weight)
    let eduScore = 70;
    const hasDegree = (resData.education || []).some(ed => {
      const deg = (ed.degree || '').toLowerCase();
      const major = (ed.fieldOfStudy || '').toLowerCase();
      return deg.includes('b.tech') || deg.includes('b.e.') || deg.includes('bachelor') || deg.includes('master') || deg.includes('cs') || major.includes('computer') || major.includes('information');
    });
    if (hasDegree) eduScore = 95;

    // 7. Composite ATS Match Score
    // IMPORTANT: Never use job.matchScore (backend default) as it gives the same score for all jobs.
    // Always compute purely from resume content vs job description.
    const computedScore = Math.round(
      (skillScore * 0.50) +
      (titleScore * 0.25) +
      (expScore * 0.15) +
      (eduScore * 0.10)
    );

    const fixedBonus = (wizardFixedActionIds?.size || 0) * 8;
    const finalScore = Math.min(98, Math.max(5, computedScore + fixedBonus));
    const label = finalScore >= 75 ? 'Strong Match' : finalScore >= 45 ? 'Fair Match' : 'Poor Match';
    const color = finalScore >= 75 ? '#22c55e' : finalScore >= 45 ? '#f97316' : '#ef4444';

    return {
      score: finalScore,
      label,
      color,
      matchedSkillsCount,
      totalSkillsCount: uniqueJobSkills.length,
      strongKeywords,
      missingKeywords,
      hasDistributedSystemsMissing: missingKeywords.some(m => m.keyword.toLowerCase().includes('distributed'))
    };
  };

  const handleSelectJobForOptimization = (job: Job) => {
    setSelectedJobId(job.id);
    setIsJobDiscoveryOpen(false);
    setViewingJobInModal(null);
    setIsAiWizardActive(false);
    setSearchParams({ tab: 'optimize-for-job', optimize_job_id: job.id });
    showToast({
      type: 'success',
      title: 'Job Selected',
      message: `Now optimizing your resume for ${job.title} at ${job.company}`
    });
  };

  // ─── COMPREHENSIVE AI BACKGROUND PROFILE ANALYZER & REPHRASER ───
  const handleRunAiProfileAnalysis = async (options?: {
    addSkill?: boolean;
    section?: string;
    context?: string;
    targetStep?: number;
  }) => {
    if (!resumeData) {
      showToast({ type: 'error', title: 'Error', message: 'No resume profile found to analyze.' });
      return;
    }

    const job = selectedJob;
    const currentResume = resumeData;

    // Open Incorporating Selected Keywords modal & initialize state
    setIsGeneratingSummary(true);
    setSummaryGenProgress(0);
    setSummaryGenStep(1);
    setSummaryGenStageText('Capturing current resume snapshot...');

    try {
      // ── STAGE 1: Process Candidate Profile & Added Credential (if any) ──
      const candidateName = `${currentResume.firstName || ''} ${currentResume.lastName || ''}`.trim() || currentResume.name || 'Candidate';
      const candidateHeadline = currentResume.headline || 'Software Developer';

      const allCandidateSkills = [
        currentResume.skills?.programmingLanguages,
        currentResume.skills?.frameworksLibraries,
        currentResume.skills?.toolsPlatforms,
        currentResume.skills?.databases,
        currentResume.skills?.softSkills,
        ...(currentResume.skills?.customCategories || []).map((c) => `${c.name}: ${c.skills}`),
      ].filter(Boolean).join(', ');

      const candidateExperience = (currentResume.experience || [])
        .map(
          (e) =>
            `${e.role} at ${e.company} (${e.startDate}-${e.endDate || 'Present'}): ${e.description || ''}`
        )
        .join('; ');

      const candidateProjects = (currentResume.projects || [])
        .map(
          (p) =>
            `${p.title} (${p.role || 'Developer'}): ${p.description || ''} Technologies: ${p.technologies || ''}.`
        )
        .join('; ');

      const candidateEducation = (currentResume.education || [])
        .map(
          (ed) =>
            `${ed.degree} from ${ed.institution} (${ed.fieldOfStudy || ''}${ed.cgpa ? `, CGPA: ${ed.cgpa}` : ''})`
        )
        .join('; ');

      // If user selected to add a skill / credential from the modal
      if (options?.addSkill) {
        const sec = options.section || 'certifications';
        const ctx = (options.context || '').trim();
        const skillKeyword = job?.skills?.[0] || 'Full Stack Development';

        handleUpdate((prev) => {
          if (sec === 'certifications') {
            const updatedCerts = [...(prev.certifications || [])];
            const certTitle = ctx
              ? `${ctx} Certification`
              : job
              ? `${job.title} Professional Certification`
              : 'Technical / Professional Certification';
            const exists = updatedCerts.some(
              (c) => c.title.toLowerCase() === certTitle.toLowerCase()
            );
            if (!exists) {
              updatedCerts.push({
                id: `cert-${Date.now()}`,
                title: certTitle,
                issuer: 'Accredited Certification Authority',
                issueDate: new Date().getFullYear().toString(),
                description: ctx
                  ? `Demonstrated applied competence: ${ctx}.`
                  : `Demonstrated technical competence aligned with ${job?.title || 'modern industry standards'}.`,
              });
            }
            return { ...prev, certifications: updatedCerts };
          } else if (sec === 'skills') {
            const currentProg = prev.skills?.programmingLanguages || '';
            const toAdd = ctx || skillKeyword;
            const updatedProg = currentProg.toLowerCase().includes(toAdd.toLowerCase())
              ? currentProg
              : currentProg
              ? `${currentProg}, ${toAdd}`
              : toAdd;
            return {
              ...prev,
              skills: {
                ...prev.skills,
                programmingLanguages: updatedProg,
              },
            };
          } else if (sec === 'projects') {
            const updatedProj = [...(prev.projects || [])];
            if (updatedProj.length > 0) {
              const p = { ...updatedProj[0] };
              const addTech = ctx || skillKeyword;
              p.technologies = p.technologies ? `${p.technologies}, ${addTech}` : addTech;
              if (ctx) {
                p.description = p.description
                  ? `${p.description}\n• Applied ${ctx} to enhance system performance and maintainability.`
                  : `• Applied ${ctx} to enhance system performance and maintainability.`;
              }
              updatedProj[0] = p;
            }
            return { ...prev, projects: updatedProj };
          } else if (sec === 'education') {
            const updatedEdu = [...(prev.education || [])];
            if (updatedEdu.length > 0) {
              const e = { ...updatedEdu[0] };
              if (ctx) {
                e.description = e.description
                  ? `${e.description} Coursework & specialization: ${ctx}.`
                  : `Specialization: ${ctx}.`;
              }
              updatedEdu[0] = e;
            }
            return { ...prev, education: updatedEdu };
          }
          return prev;
        });
      }

      setSummaryGenProgress(18);
      await new Promise((r) => setTimeout(r, 120));
      setSummaryGenProgress(35);
      await new Promise((r) => setTimeout(r, 180));

      // ── STAGE 2: Rephrase Content & Draft Tailored Summary ──
      setSummaryGenStep(2);
      setSummaryGenProgress(40);
      const targetRoleTitle = job?.title || candidateHeadline || 'Software Engineer';
      setSummaryGenStageText('Analyzing resume content for next section...');

      const targetCompany = job?.company || 'Target Organization';
      const targetSkills =
        (job?.skills || []).join(', ') || 'modern software development, REST APIs, problem solving';

      const prompt = `You are TalentPilot Copilot, an expert AI ATS resume optimizer.
Analyze this candidate's actual resume profile against the target job role and produce tailored optimizations.

CANDIDATE ACTUAL PROFILE:
- Name: ${candidateName}
- Headline: ${candidateHeadline}
- Current Summary: ${currentResume.summary || 'None'}
- Technical Skills: ${allCandidateSkills || 'Not listed'}
- Work Experience: ${candidateExperience || 'None listed'}
- Key Projects: ${candidateProjects || 'None listed'}
- Education: ${candidateEducation || 'None listed'}
${options?.context ? `- Candidate Input Context: ${options.context}` : ''}

TARGET JOB ROLE:
- Role: ${targetRoleTitle}
- Company: ${targetCompany}
- Required Skills: ${targetSkills}
${job?.description ? `- Job Excerpt: ${job.description.slice(0, 300)}` : ''}

INSTRUCTIONS:
1. Write a tailored, high-impact ATS professional summary (3-4 sentences, approx 50-70 words) for THIS specific candidate. Mention their actual background, key technical strengths that align with ${targetRoleTitle}, practical project/work highlights, and education. Do NOT fabricate unrelated degrees or titles.
2. Provide 2-3 specific suggested actions / content rephrasings for their projects, experience, or skills to boost keyword alignment and ATS score.

Return ONLY a valid JSON object in this format (no markdown fences, no conversational text):
{
  "summary": "...",
  "suggestedActions": [
    {
      "id": "action-1",
      "title": "Short title of suggested rephrase",
      "section": "Projects",
      "category": "Impact Rephrase",
      "existingText": "Original text snippet",
      "newText": "Optimized version with target keywords and action verbs",
      "bulletItems": ["bullet 1", "bullet 2"]
    }
  ]
}`;

      let aiSummary = '';
      let aiActions: Array<any> = [];

      try {
        const progressTimer = setInterval(() => {
          setSummaryGenProgress((p) => (p < 78 ? p + 8 : p));
        }, 160);

        const responsePromise = sendCopilotMessage(prompt, {
          role: 'candidate',
          resumeId: id || '',
          jobId: job?.id || '',
        });

        // Fast timeout so UI never hangs while allowing responsive copilot answer
        const timeoutPromise = new Promise<{ success: boolean; message: string }>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timeout')), 1800)
        );

        const response = await Promise.race([responsePromise, timeoutPromise]);
        clearInterval(progressTimer);

        if (response.success && response.message) {
          try {
            let cleaned = response.message.trim();
            if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
            else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();

            const parsed = JSON.parse(cleaned);
            if (parsed.summary && typeof parsed.summary === 'string') {
              aiSummary = parsed.summary.trim();
            }
            if (Array.isArray(parsed.suggestedActions) && parsed.suggestedActions.length > 0) {
              aiActions = parsed.suggestedActions;
            }
          } catch (jsonErr) {
            console.warn('AI returned non-JSON text, extracting plain summary text:', jsonErr);
            if (response.message.length > 30) {
              aiSummary = response.message.replace(/[{}[\]"]/g, '').trim();
            }
          }
        }
      } catch (aiErr) {
        console.warn('AI copilot call fallback engaged:', aiErr);
      }

      setSummaryGenProgress(80);

      // ── Intelligent Profile Synthesizer Fallback (Personalized from candidate's actual profile) ──
      if (!aiSummary) {
        const topSkills =
          allCandidateSkills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 4)
            .join(', ') || 'Software Engineering and Modern Development';
        const firstProject = currentResume.projects?.[0]?.title || 'web applications';
        const eduBrief = currentResume.education?.[0]
          ? `${currentResume.education[0].degree || 'Degree'} from ${currentResume.education[0].institution || 'University'}${currentResume.education[0].cgpa ? ` with a CGPA of ${currentResume.education[0].cgpa}` : ''}`
          : 'a solid academic foundation in Computer Science';

        aiSummary = `${candidateHeadline} with practical expertise in ${topSkills}, dedicated to engineering reliable, database-driven applications aligned with the ${targetRoleTitle} position at ${targetCompany}. Experienced in contributing to ${firstProject}, developing responsive interfaces, and integrating RESTful APIs. Currently pursuing ${eduBrief}, with a passion for building scalable solutions and quickly adopting emerging technologies.`;
      }

      if (!aiActions || aiActions.length === 0) {
        const primaryProject = currentResume.projects?.[0];
        const projTitle = primaryProject ? primaryProject.title : 'Primary Project';
        aiActions = [
          {
            id: `rephrase-proj-${Date.now()}`,
            title: `Optimized project impact for ${projTitle}`,
            section: 'Projects',
            category: 'Impact Rephrase',
            existingText:
              primaryProject?.description?.slice(0, 100) || 'Developed responsive full-stack features.',
            newText: `Architected and deployed scalable features using ${job?.skills?.slice(0, 3).join(', ') || 'modern APIs'}, improving response times and user engagement.`,
            bulletItems: [
              `Engineered core services for ${projTitle} leveraging ${job?.skills?.slice(0, 2).join(' & ') || 'REST APIs and database indexing'}.`,
              `Enhanced system reliability and throughput with automated validation and responsive client-side state management.`,
              `Aligned architectural components with production deployment and cloud standards.`,
            ],
          },
          {
            id: `align-skills-${Date.now()}`,
            title: `Emphasized ${job?.skills?.[0] || 'Core Domain'} keyword alignment`,
            section: 'Skills',
            category: 'Keyword Match',
            existingText: 'Technical skills inventory',
            newText: `Highlighted ${targetSkills} across primary technical competencies.`,
            bulletItems: [
              `Prioritized ${job?.skills?.slice(0, 4).join(', ') || 'key requirements'} in technical competencies section.`,
              `Enhanced keyword density to pass automated ATS screening filters with high relevancy.`,
            ],
          },
        ];
      }

      // ── STAGE 3: Finalizing Updates & Applying to Resume ──
      setSummaryGenStep(3);
      setSummaryGenProgress(90);
      setSummaryGenStageText('Preparing optimization recommendations...');

      setAiTailoredSummary(aiSummary);
      setEditableTailoredSummary(aiSummary);
      setDynamicSuggestedActions(aiActions);

      // Save summary into candidate resume
      handleUpdate((prev) => ({
        ...prev,
        summary: aiSummary,
      }));

      await new Promise((r) => setTimeout(r, 200));
      setSummaryGenProgress(100);
      await new Promise((r) => setTimeout(r, 350));

      showToast({
        type: 'success',
        title: 'Keywords Incorporated! 🎉',
        message: 'AI analyzed your profile and prepared tailored content for rephrasing.',
      });

      setIsGeneratingSummary(false);
      setAiWizardStep(options?.targetStep || 2);
    } catch (err: any) {
      console.error('Error during profile analysis and summary generation:', err);
      showToast({
        type: 'error',
        title: 'Analysis Error',
        message: err?.message || 'Could not complete background analysis. Please try again.',
      });
      setIsGeneratingSummary(false);
    }
  };

  const handleAcceptSuggestedChange = (actionId: string) => {
    if (actionId === 'skills-cs') {
      handleUpdate((prev) => {
        const currentProg = prev.skills?.programmingLanguages || 'Java, JavaScript, C, HTML, CSS';
        const updatedProg = currentProg.includes('Computer Science')
          ? currentProg
          : `${currentProg}, Computer Science, related field of study`;
        return {
          ...prev,
          skills: {
            ...prev.skills,
            programmingLanguages: updatedProg,
          },
        };
      });
      setWizardFixedActionIds((prev) => new Set(prev).add('skills-cs'));
      showToast({
        type: 'success',
        title: 'Skills Updated',
        message: 'Added Computer Science & related field of study keywords.',
      });
    } else if (actionId === 'edu-degree') {
      handleUpdate((prev) => {
        const updatedEdu = [...(prev.education || [])];
        if (updatedEdu.length > 0) {
          updatedEdu[0] = {
            ...updatedEdu[0],
            degree: updatedEdu[0].degree || 'B.Tech in Computer Science and Engineering',
            fieldOfStudy: updatedEdu[0].fieldOfStudy || 'Computer Science and Engineering',
            description: updatedEdu[0].description
              ? `${updatedEdu[0].description} • Bachelor's level coursework in core CS fundamentals.`
              : "Bachelor's level degree in Computer Science or related field of study. Coursework in Data Structures, Algorithms, OOP, DBMS, Computer Networks.",
          };
        }
        return { ...prev, education: updatedEdu };
      });
      setWizardFixedActionIds((prev) => new Set(prev).add('edu-degree'));
      showToast({
        type: 'success',
        title: 'Education Updated',
        message: "Added Bachelor's level degree qualification.",
      });
    } else if (actionId === 'cert-tech') {
      handleUpdate((prev) => {
        const updatedCerts = [...(prev.certifications || [])];
        const exists = updatedCerts.some((c) =>
          c.title.toLowerCase().includes('technical certification')
        );
        if (!exists) {
          updatedCerts.push({
            id: `cert-${Date.now()}`,
            title: selectedJob
              ? `${selectedJob.title} Technical Certification`
              : 'Technical Certification',
            issuer: 'Industry Certification Body',
            issueDate: new Date().getFullYear().toString(),
            description:
              'Demonstrated proficiency in core technical domains and software standards.',
          });
        }
        return { ...prev, certifications: updatedCerts };
      });
      setWizardFixedActionIds((prev) => new Set(prev).add('cert-tech'));
      showToast({
        type: 'success',
        title: 'Certification Added! 🎉',
        message: 'Technical Certification added to your resume.',
      });
    } else {
      // Dynamic suggested action
      const matchedAction = dynamicSuggestedActions.find((a) => a.id === actionId);
      if (matchedAction) {
        handleUpdate((prev) => {
          if (matchedAction.section === 'Projects' && prev.projects && prev.projects.length > 0) {
            const updatedProj = [...prev.projects];
            const p = { ...updatedProj[0] };
            if (matchedAction.bulletItems && matchedAction.bulletItems.length > 0) {
              p.description = matchedAction.bulletItems.map((b) => `• ${b}`).join('\n');
            } else if (matchedAction.newText) {
              p.description = matchedAction.newText;
            }
            updatedProj[0] = p;
            return { ...prev, projects: updatedProj };
          } else if (
            matchedAction.section === 'Experience' &&
            prev.experience &&
            prev.experience.length > 0
          ) {
            const updatedExp = [...prev.experience];
            const e = { ...updatedExp[0] };
            if (matchedAction.bulletItems && matchedAction.bulletItems.length > 0) {
              e.description = matchedAction.bulletItems.map((b) => `• ${b}`).join('\n');
            } else if (matchedAction.newText) {
              e.description = matchedAction.newText;
            }
            updatedExp[0] = e;
            return { ...prev, experience: updatedExp };
          } else if (matchedAction.section === 'Skills' && prev.skills) {
            const currentProg = prev.skills.programmingLanguages || '';
            const addWord = selectedJob?.skills?.[0] || 'Cloud & Distributed Systems';
            const updatedProg = currentProg.includes(addWord)
              ? currentProg
              : currentProg
              ? `${currentProg}, ${addWord}`
              : addWord;
            return {
              ...prev,
              skills: {
                ...prev.skills,
                programmingLanguages: updatedProg,
              },
            };
          }
          return prev;
        });
        setWizardFixedActionIds((prev) => new Set(prev).add(actionId));
        showToast({
          type: 'success',
          title: 'Changes Applied! 🪄',
          message: `${matchedAction.title} applied to your resume.`,
        });
      }
    }
    setActiveSuggestedChange(null);
  };

  const handleMarkAsCompleteStep1 = async () => {
    setAiProgressModalType('keywords');
    setAiProgressPercent(8);
    setAiProgressStep(1);

    await new Promise(r => setTimeout(r, 450));
    setAiProgressPercent(24);
    await new Promise(r => setTimeout(r, 350));
    setAiProgressPercent(36);

    setAiProgressStep(2);
    await new Promise(r => setTimeout(r, 450));
    setAiProgressPercent(62);
    await new Promise(r => setTimeout(r, 400));
    setAiProgressPercent(84);

    setAiProgressStep(3);
    await new Promise(r => setTimeout(r, 400));
    setAiProgressPercent(100);
    await new Promise(r => setTimeout(r, 380));

    setAiProgressModalType(null);
    setAiWizardStep(2);
    showToast({
      type: 'success',
      title: 'Keywords Incorporated! 🎉',
      message: 'AI analyzed your profile and prepared tailored content for rephrasing.'
    });
  };

  const handleMarkAsCompleteStep2 = async () => {
    setAiProgressModalType('summary');
    setAiProgressPercent(0);
    setAiProgressStep(1);

    await new Promise(r => setTimeout(r, 450));
    setAiProgressPercent(20);
    await new Promise(r => setTimeout(r, 350));
    setAiProgressPercent(38);

    setAiProgressStep(2);
    const edu = resumeData?.education?.[0];
    const degree = edu?.degree || 'Computer Science and Engineering student';
    const cgpa = edu?.cgpa || '8.5';
    const role = selectedJob?.title || 'Java Full Stack Development';
    const tailoredSummaryText = `${degree} focused on ${role}, with hands-on experience in building responsive and database-driven web applications. Proficient in Java, Spring Boot, and REST APIs, actively involved in projects that enhance user experience, including a real-time chat application. Currently pursuing a B.Tech with a CGPA of ${cgpa}.`;
    
    setAiTailoredSummary(tailoredSummaryText);
    setEditableTailoredSummary(tailoredSummaryText);

    await new Promise(r => setTimeout(r, 500));
    setAiProgressPercent(68);
    await new Promise(r => setTimeout(r, 400));
    setAiProgressPercent(88);

    setAiProgressStep(3);
    await new Promise(r => setTimeout(r, 400));
    setAiProgressPercent(100);
    await new Promise(r => setTimeout(r, 380));

    setAiProgressModalType(null);
    setAiWizardStep(3);
  };

  const handleMarkAsComplete = handleMarkAsCompleteStep1;

  const handleContinueFromAddSkillModal = () => {
    setIsAddSkillModalOpen(false);

    const keywordToAdd = addSkillKeyword || 'Skill';
    const targetItem = activeModalKeywordItem || {
      id: `kw-${keywordToAdd.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      keyword: keywordToAdd
    };

    setTrackedKeywordItems(prev => ({
      ...prev,
      [targetItem.id]: {
        id: targetItem.id,
        keyword: targetItem.keyword,
        question: (targetItem as any).question || `Do you have experience with ${targetItem.keyword}?`
      }
    }));

    if (addSkillOption === 'do-not-add') {
      // Throw animation to the LEFT into Deleted section
      setThrowingCardId(targetItem.id);
      setThrowingDirection('left');
      setTimeout(() => {
        setKeywordDeletedIds(prev => new Set(prev).add(targetItem.id));
        setKeywordCompletedIds(prev => {
          const next = new Set(prev);
          next.delete(targetItem.id);
          return next;
        });
        setThrowingCardId(null);
        setThrowingDirection(null);
      }, 290);

      showToast({
        type: 'info',
        title: 'Suggestion Dismissed',
        message: `Moved "${keywordToAdd}" to Deleted section.`
      });
      return;
    }

    // Otherwise: Add to a specific place or Let AI Choose
    const targetSection = addSkillOption === 'let-ai' ? 'skills' : addSkillSection;
    const sectionLabels: Record<string, string> = {
      personal_info: 'Personal Information',
      summary: 'Professional Summary',
      education: 'Educations',
      projects: 'Projects',
      skills: 'Skills'
    };
    const chosenLabel = sectionLabels[targetSection] || 'Skills';

    handleUpdate((prev) => {
      const updated = { ...prev };

      if (targetSection === 'skills') {
        const isProgLang = /^(python|java|javascript|typescript|c\+\+|golang|ruby|rust|c#|sql|php|swift|kotlin|scala|r|html|css)$/i.test(keywordToAdd.trim());
        if (isProgLang) {
          const currentProg = updated.skills?.programmingLanguages || '';
          if (!currentProg.toLowerCase().includes(keywordToAdd.toLowerCase())) {
            updated.skills = {
              ...updated.skills,
              programmingLanguages: currentProg ? `${currentProg}, ${keywordToAdd}` : keywordToAdd
            };
          }
        } else {
          const currentTools = updated.skills?.toolsPlatforms || '';
          if (!currentTools.toLowerCase().includes(keywordToAdd.toLowerCase())) {
            updated.skills = {
              ...updated.skills,
              toolsPlatforms: currentTools ? `${currentTools}, ${keywordToAdd}` : keywordToAdd
            };
          }
        }
      } else if (targetSection === 'summary') {
        const existingSummary = updated.summary || '';
        const contextSentence = addSkillContext?.trim()
          ? ` Demonstrated applied expertise in ${keywordToAdd}, utilizing it to ${addSkillContext.trim().replace(/^to\s+/i, '').replace(/\.$/, '')}.`
          : ` Experienced in leveraging ${keywordToAdd} to build robust, high-performance architectures aligned with industry best practices.`;

        if (!existingSummary.toLowerCase().includes(keywordToAdd.toLowerCase())) {
          updated.summary = existingSummary ? `${existingSummary.trim()}${contextSentence}` : contextSentence.trim();
        }
        // ONLY added to summary. Does NOT touch skills or other sections.
      } else if (targetSection === 'projects') {
        const updatedProj = [...(updated.projects || [])];
        const bulletText = addSkillContext?.trim()
          ? `• Applied ${keywordToAdd} to ${addSkillContext.trim().replace(/^•\s*/, '')}`
          : `• Leveraged ${keywordToAdd} to optimize system efficiency, reliability, and architectural standards.`;

        if (updatedProj.length > 0) {
          const p = { ...updatedProj[0] };
          const curTech = p.technologies || '';
          if (!curTech.toLowerCase().includes(keywordToAdd.toLowerCase())) {
            p.technologies = curTech ? `${curTech}, ${keywordToAdd}` : keywordToAdd;
          }
          if (!p.description?.toLowerCase().includes(keywordToAdd.toLowerCase())) {
            p.description = p.description ? `${p.description}\n${bulletText}` : bulletText;
          }
          updatedProj[0] = p;
        } else {
          updatedProj.push({
            id: `proj-${Date.now()}`,
            title: `${keywordToAdd} Integration Project`,
            role: 'Developer',
            technologies: keywordToAdd,
            description: bulletText,
            link: ''
          });
        }
        updated.projects = updatedProj;
      } else if (targetSection === 'education') {
        const updatedEd = [...(updated.education || [])];
        const coursework = addSkillContext?.trim()
          ? `Specialized coursework and applied laboratory implementation in ${keywordToAdd} (${addSkillContext.trim()}).`
          : `Specialized coursework and applied laboratory modules in ${keywordToAdd}.`;

        if (updatedEd.length > 0) {
          const ed = { ...updatedEd[0] };
          const curDesc = ed.description || '';
          if (!curDesc.toLowerCase().includes(keywordToAdd.toLowerCase())) {
            ed.description = curDesc ? `${curDesc}\n• ${coursework}` : `• ${coursework}`;
          }
          updatedEd[0] = ed;
        }
        updated.education = updatedEd;
      } else if (targetSection === 'personal_info') {
        if (!updated.headline?.toLowerCase().includes(keywordToAdd.toLowerCase())) {
          updated.headline = updated.headline
            ? `${updated.headline} • ${keywordToAdd}`
            : `${keywordToAdd} Specialist`;
        }
      }

      return updated;
    });

    setKeywordSectionMap(prev => ({
      ...prev,
      [targetItem.id]: chosenLabel
    }));

    // Throw animation to the RIGHT into Completed section
    setThrowingCardId(targetItem.id);
    setThrowingDirection('right');
    setTimeout(() => {
      setKeywordCompletedIds(prev => new Set(prev).add(targetItem.id));
      setKeywordDeletedIds(prev => {
        const next = new Set(prev);
        next.delete(targetItem.id);
        return next;
      });
      setThrowingCardId(null);
      setThrowingDirection(null);
    }, 290);

    showToast({
      type: 'success',
      title: 'Keyword Added! 🚀',
      message: `Added "${keywordToAdd}" to ${chosenLabel}. ATS match boosted!`
    });
  };

  // AI Summary Optimization
  const handleAIEnhanceSummary = async (job: Job) => {
    if (!resumeData) return;
    try {
      setIsOptimizing(true);
      setOptimizedVersion(null);

      const prompt = `Rewrite and optimize this professional summary: "${resumeData.summary || 'Aspiring Software Engineer'}" targeted for the job role: "${job.title}" at "${job.company}" requiring skills: "${job.skills.join(', ')}". Return ONLY the refined summary without intro or quotes.`;

      const response = await sendCopilotMessage(prompt, {
        role: 'candidate',
        resumeId: id || ''
      });

      if (response.success && response.message) {
        setOptimizedVersion(response.message);
        showToast({
          type: 'success',
          title: 'AI Optimization Generated',
          message: 'Review and click Apply to update.'
        });
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Optimization Failed',
        message: 'Could not connect to AI service.'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyAIOptimizedSummary = () => {
    if (!optimizedVersion) return;
    handleUpdate((prev) => ({
      ...prev,
      summary: optimizedVersion
    }));
    setOptimizedVersion(null);
    showToast({ type: 'success', title: 'Applied', message: 'Summary updated successfully.' });
  };

  // Custom Section Handlers (Images 1 & 2)
  const handleStartEditCustomSection = () => {
    setCustomSectionForm({
      title: resumeData?.customSection?.title || '',
      content: resumeData?.customSection?.content || ''
    });
    setIsEditingCustomSection(true);
  };

  const handleCancelCustomSection = () => {
    setIsEditingCustomSection(false);
  };

  const handleSaveCustomSection = () => {
    handleUpdate((prev) => ({
      ...prev,
      customSection: {
        title: customSectionForm.title.trim() || 'Custom Section',
        content: customSectionForm.content.trim()
      }
    }));
    setIsEditingCustomSection(false);
    showToast({ type: 'success', title: 'Saved', message: 'Custom section updated.' });
  };

  const handleAutoFillCustomSection = () => {
    setCustomSectionForm({
      title: 'Volunteering',
      content: 'Led community tech workshops mentoring 50+ aspiring software engineers on modern web development, algorithms, and collaborative team projects.'
    });
  };

  const handleFormatCustomText = (type: 'bold' | 'italic' | 'underline' | 'bullet' | 'number') => {
    const textarea = customDescriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = customSectionForm.content || '';
    const selected = current.substring(start, end);

    let replacement = '';
    if (type === 'bold') replacement = `**${selected || 'bold text'}**`;
    else if (type === 'italic') replacement = `*${selected || 'italic text'}*`;
    else if (type === 'underline') replacement = `<u>${selected || 'underlined text'}</u>`;
    else if (type === 'bullet') replacement = selected ? selected.split('\n').map((l) => `• ${l}`).join('\n') : '• ';
    else if (type === 'number') replacement = selected ? selected.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n') : '1. ';

    const next = current.substring(0, start) + replacement + current.substring(end);
    setCustomSectionForm((p) => ({ ...p, content: next }));
  };

  // Robust High-Fidelity PDF Export matching Preview Mode 1:1 with clickable hyperlinks
  const startBrowserPrint = () => {
    const prevViewMode = viewMode;

    // 1. Ensure Preview Mode is active so the DOM contains the clean, styled resume format
    setViewMode('preview');

    showToast({
      type: 'info',
      title: 'Preparing Resume PDF',
      message: 'Generating high-fidelity document. Choose "Save as PDF" to preserve clickable links!'
    });

    const exportTitle = (resumeData?.name || titleInput || resume?.fileName || 'Resume')
      .replace(/\.(pdf|docx|txt)$/i, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const oldTitle = document.title;
    document.title = exportTitle;

    // Reset scroll positions so print starts at the very top (0, 0)
    window.scrollTo(0, 0);
    document.querySelectorAll('.overflow-y-auto, [class*="overflow"]').forEach((el) => {
      el.scrollTop = 0;
    });

    // 2. Allow React to paint the clean Preview Mode DOM
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.querySelectorAll('.overflow-y-auto, [class*="overflow"]').forEach((el) => {
        el.scrollTop = 0;
      });

      const handleAfterPrint = () => {
        setViewMode(prevViewMode);
        document.title = oldTitle;
        window.removeEventListener('afterprint', handleAfterPrint);
      };
      window.addEventListener('afterprint', handleAfterPrint);

      // Trigger browser print
      window.print();

      // Fallback timeout to restore viewMode if afterprint is skipped
      setTimeout(() => {
        setViewMode(prevViewMode);
        document.title = oldTitle;
      }, 4000);
    }, 400);
  };

  const handleExportPDF = () => {
    // Show the guidance modal every time user clicks Export PDF so they don't accidentally select Microsoft Print to PDF
    setShowExportGuideModal(true);
  };


    // Handle candidate clicking "Continue Editing" from the Post-Optimization Dashboard (Images 1 & 2)
  const handleContinueEditing = () => {
    // 1. Re-measure the ATS score dynamically according to the resume currently showing
    const activeTargetJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
    const remeasuredMatch = activeTargetJob ? calculateJobMatch(resumeData, activeTargetJob) : null;
    const measuredScore = remeasuredMatch ? remeasuredMatch.score : (calculateATS().score || 76);

    // 2. Prepend new optimization history entry with real-time modified timestamp
    const newHistoryRecord: OptimizationHistoryItem = {
      id: `opt-${Date.now()}`,
      score: measuredScore,
      status: 'Completed',
      timestamp: Date.now(),
      jobId: activeTargetJob?.id,
      jobTitle: activeTargetJob?.title || 'Target Role',
      company: activeTargetJob?.company || 'Recruiter',
      resumeSnapshot: resumeData ? JSON.parse(JSON.stringify(resumeData)) : undefined,
    };

    setOptimizationHistory((prev) => [newHistoryRecord, ...prev]);

    // 3. Return to editor view and show optimization history sub-tab (Image 2)
    setIsPostOptimizationView(false);
    setOptimizeSubTab('history');

    showToast({
      type: 'success',
      title: 'ATS Score Re-evaluated',
      message: `Resume scored ${measuredScore}/100 based on your latest modifications!`
    });
  };

  const handleRestoreOptimization = (item: OptimizationHistoryItem) => {
    if (item.resumeSnapshot) {
      setResumeData(JSON.parse(JSON.stringify(item.resumeSnapshot)));
      showToast({
        type: 'success',
        title: 'Resume Version Restored',
        message: `Restored resume snapshot with overall score ${item.score}/100.`
      });
    } else {
      showToast({
        type: 'info',
        title: 'Session Restored',
        message: `Restored snapshot from ${formatOptimizationTime(item.timestamp)} (${item.score}/100).`
      });
    }
  };

  const handleViewOptimizationDetails = (_item: OptimizationHistoryItem) => {
    setIsPostOptimizationView(true);
  };

  if (isLoading || !resumeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
        <span className="text-sm font-bold text-slate-300">Loading CareerZenith Resume Builder...</span>
      </div>
    );
  }

  const { score, issues } = calculateATS();
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="h-screen w-screen bg-[#070a13] text-white flex flex-col font-sans select-none antialiased overflow-hidden">
      {/* ─── MAIN BUILDER LAYOUT ───────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT-MOST VERTICAL NAVIGATION ────────────────────────── */}
        {/* ── LEFT-MOST VERTICAL NAVIGATION (Spacious Image 1 Match) ── */}
        <aside className={cn("w-[88px] bg-[#090d18] border-r border-white/[0.06] flex flex-col items-center justify-between py-6 shrink-0 no-print z-20 select-none transition-all duration-200", viewMode === 'preview' && "hidden")}>
          {/* Top: Back link + Navigation items */}
          <div className="flex flex-col items-center w-full px-2">
            {/* Back to All Resumes Button */}
            <Link
              to="/candidate/resumes"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-center w-full group py-1"
              title="Back to All Resumes"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-300" />
              <span className="text-[11px] font-medium leading-tight text-slate-300 group-hover:text-white">
                Back to<br />All Resumes
              </span>
            </Link>

            {/* Subtle Divider */}
            <div className="w-11 h-px bg-slate-800/80 my-4" />

            {/* Feature Navigation Items with Generous Vertical Spacing */}
            <div className="flex flex-col items-center gap-6 w-full">
              {[
                {
                  id: 'editor',
                  label: 'Edit Content',
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>
                  )
                },
                {
                  id: 'customization',
                  label: 'Customize Template',
                  icon: <Palette className="w-5 h-5" />
                },
                {
                  id: 'ats-score',
                  label: 'ATS Score',
                  icon: <Gauge className="w-5 h-5" />
                },
                {
                  id: 'job-optimize',
                  label: 'Optimize for Job',
                  icon: <Briefcase className="w-5 h-5" />
                }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSearchParams({ tab: tab.id })}
                    className="flex flex-col items-center justify-center w-full group cursor-pointer"
                  >
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center transition-all',
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35 border border-indigo-400/30'
                          : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.04]'
                      )}
                    >
                      {tab.icon}
                    </div>
                    <span
                      className={cn(
                        'text-center text-[11px] font-medium leading-tight mt-1.5 max-w-[74px] transition-colors',
                        isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom: Report Bug and GZ brand mark (Image 1 match) */}
          <div className="flex flex-col items-center w-full pt-4 pb-3">
            <div className="w-11 h-px bg-slate-800/80 mb-4" />
            <button
              type="button"
              onClick={() => setIsReportIssueModalOpen(true)}
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors group cursor-pointer py-1"
              title="Report Bug / Issue"
            >
              <Bug className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium leading-tight">Report Bug</span>
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-600/30 mt-3">
              GZ
            </div>
          </div>
        </aside>

        {/* ── WORKSPACE CONTENT (SPLIT PANE) ───────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Stepper Bar when AI Wizard is active (Exact Image 1 match) */}
          {isAiWizardActive && (
            <div className="w-full bg-[#070b16] border-b border-slate-800/80 px-6 py-3 relative flex items-center justify-center z-30 shrink-0 no-print shadow-md">
              {/* Stepper container */}
              <div className="w-full max-w-2xl flex flex-col items-center">
                {/* Horizontal Capsule / Pill Track */}
                <div className="relative w-full h-11 rounded-full bg-[#0b1222] border border-slate-800/70 overflow-hidden shadow-inner flex items-center">
                  {/* Glowing dynamic gradient fill from left to active step */}
                  <div
                    className="absolute top-0 bottom-0 left-0 transition-all duration-500 ease-out pointer-events-none"
                    style={{
                      width:
                        aiWizardStep === 1
                          ? '30%'
                          : aiWizardStep === 2
                          ? '56%'
                          : aiWizardStep === 3
                          ? '81%'
                          : '100%',
                      background:
                        aiWizardStep === 4
                          ? 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 70%, #2563eb 100%)'
                          : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 65%, rgba(29, 78, 216, 0.4) 85%, rgba(37, 99, 235, 0) 100%)',
                      borderRadius: aiWizardStep === 4 ? '9999px' : '9999px 0 0 9999px',
                    }}
                  />

                  {/* Step Circles Row */}
                  <div className="relative z-10 w-full grid grid-cols-4 items-center h-full px-2">
                    {[
                      { step: 1, title: 'Add Missing\nKeywords' },
                      { step: 2, title: 'Rephrase\nContent' },
                      { step: 3, title: 'Add Professional\nSummary' },
                      { step: 4, title: 'Reorder &\nNormalize' },
                    ].map((s) => {
                      const isActive = aiWizardStep === s.step;
                      const isCompleted = aiWizardStep > s.step;
                      return (
                        <div key={s.step} className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setAiWizardStep(s.step)}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer",
                              isActive
                                ? "bg-white text-slate-950 shadow-[0_0_18px_rgba(59,130,246,0.9),0_0_32px_rgba(37,99,235,0.6)] ring-2 ring-white/60 scale-105"
                                : isCompleted
                                ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] ring-1 ring-blue-400/40 hover:scale-105"
                                : "bg-[#182338]/80 text-slate-400 border border-slate-700/50 hover:bg-[#1e2d46] hover:text-slate-200"
                            )}
                            title={`Step ${s.step}: ${s.title.replace('\n', ' ')}`}
                          >
                            {s.step}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step Labels Row Below Pill Bar */}
                <div className="w-full grid grid-cols-4 gap-2 mt-2 px-2">
                  {[
                    { step: 1, title: 'Add Missing\nKeywords' },
                    { step: 2, title: 'Rephrase\nContent' },
                    { step: 3, title: 'Add Professional\nSummary' },
                    { step: 4, title: 'Reorder &\nNormalize' },
                  ].map((s) => {
                    const isActive = aiWizardStep === s.step;
                    const isCompleted = aiWizardStep > s.step;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => setAiWizardStep(s.step)}
                        className="flex flex-col items-center justify-start text-center cursor-pointer group transition-all"
                      >
                        <span
                          className={cn(
                            "text-xs md:text-[13px] tracking-tight leading-tight whitespace-pre-line text-center transition-colors",
                            isActive
                              ? "text-white font-bold drop-shadow-sm"
                              : isCompleted
                              ? "text-slate-300 font-medium group-hover:text-white"
                              : "text-slate-400 font-normal group-hover:text-slate-200"
                          )}
                        >
                          {s.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close Button on right */}
              <button
                type="button"
                onClick={() => setIsAiWizardActive(false)}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer shrink-0"
                title="Exit AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex-1 flex min-w-0 overflow-hidden relative">
            {/* ── LEFT PANE: TAB CONTENT ───────────────────────────── */}
            <div
              style={{
                width: (isLeftPanelCollapsed || viewMode === 'preview') ? '0px' : `${leftPanelWidth}px`,
                display: (isLeftPanelCollapsed || viewMode === 'preview') ? 'none' : 'block'
              }}
              className="border-r border-white/[0.06] overflow-y-auto p-6 space-y-6 bg-[#090d16] no-print shrink-0 transition-[width] duration-75 relative custom-scrollbar"
            >
              {/* ── TAB 1: EDIT CONTENT ────────────────────────────── */}
              {activeTab === 'editor' && (
                isEditingPersonalInfo ? (
                  /* ── PERSONAL INFORMATION FORM (Screenshots 2 & 3) ── */
                  <div className="space-y-5">
                    {/* Top Header: Title + Auto-Fill Sample Details */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelPersonalInfo}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                          title="Back to Sections"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white tracking-tight">Personal Information</h2>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAutoFillSampleDetails}
                        className="bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.12] text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer"
                      >
                        Auto-Fill Sample Details
                      </Button>
                    </div>

                    {/* Hidden file input for Photo Upload */}
                    <input
                      type="file"
                      ref={photoFileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Form Fields Body */}
                    <div className="space-y-4 pt-1">
                      {/* Row 1: First Name & Last Name on Left, Photo on Right */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                        {/* Left Column: First Name & Last Name */}
                        <div className="sm:col-span-8 space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-0.5">
                              First Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={resumeData.firstName || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdate((p) => {
                                  const nextFirst = val;
                                  const nextName = `${nextFirst} ${p.lastName || ''}`.trim();
                                  return { ...p, firstName: nextFirst, name: nextName };
                                });
                                if (formErrors.firstName) {
                                  setFormErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.firstName;
                                    return next;
                                  });
                                }
                              }}
                              placeholder="e.g. Vicky"
                              className={cn(
                                "w-full bg-[#0d121f] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors",
                                formErrors.firstName ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
                              )}
                            />
                            {formErrors.firstName && (
                              <p className="text-[10px] text-rose-400 font-medium">{formErrors.firstName}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-0.5">
                              Last Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={resumeData.lastName || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdate((p) => {
                                  const nextLast = val;
                                  const nextName = `${p.firstName || ''} ${nextLast}`.trim();
                                  return { ...p, lastName: nextLast, name: nextName };
                                });
                                if (formErrors.lastName) {
                                  setFormErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.lastName;
                                    return next;
                                  });
                                }
                              }}
                              placeholder="e.g. Gupta"
                              className={cn(
                                "w-full bg-[#0d121f] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors",
                                formErrors.lastName ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
                              )}
                            />
                            {formErrors.lastName && (
                              <p className="text-[10px] text-rose-400 font-medium">{formErrors.lastName}</p>
                            )}
                          </div>
                        </div>

                        {/* Right Column: Profile Photo Circular Dropzone */}
                        <div className="sm:col-span-4 flex flex-col items-center justify-center pt-1">
                          <div
                            onClick={() => photoFileInputRef.current?.click()}
                            className="relative w-28 h-28 rounded-full border border-slate-700/80 bg-slate-900/80 flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:border-indigo-500/80 hover:bg-slate-900 transition-all group overflow-hidden shadow-inner"
                          >
                            {resumeData.photo ? (
                              <>
                                <img
                                  src={resumeData.photo}
                                  alt="Candidate Profile"
                                  className="w-full h-full object-cover rounded-full"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity rounded-full">
                                  <Camera className="w-4 h-4 text-white" />
                                  <span className="text-[9px] text-slate-200 font-bold">Replace</span>
                                  <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="text-[9px] text-rose-400 hover:text-rose-300 font-bold"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-1">
                                  <User className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] text-slate-300 font-medium leading-tight">
                                  Upload or drag &amp; drop your image
                                </span>
                                <span className="text-[8px] text-slate-400 mt-0.5">500 × 500px</span>
                                <span className="text-[7.5px] text-slate-400">Max 5 MB</span>
                              </>
                            )}
                          </div>

                          {/* Guidance doodle & message */}
                          <div className="flex items-center gap-1 text-[9.5px] text-slate-400 italic text-center mt-2 px-1">
                            <span>PS: Face should cover ~70% of the image</span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Headline (Full Width) */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Headline</label>
                        <input
                          type="text"
                          value={resumeData.headline || ''}
                          onChange={(e) => handleUpdate((p) => ({ ...p, headline: e.target.value }))}
                          placeholder="e.g. Software Developer at AlgoZenith"
                          className="w-full bg-[#0d121f] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Row 3: Email * (Full Width) */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-0.5">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={resumeData.email || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdate((p) => ({ ...p, email: val }));
                            if (formErrors.email) {
                              setFormErrors((prev) => {
                                const next = { ...prev };
                                delete next.email;
                                return next;
                              });
                            }
                          }}
                          placeholder="e.g. name@example.com"
                          className={cn(
                            "w-full bg-[#0d121f] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors",
                            formErrors.email ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
                          )}
                        />
                        {formErrors.email && (
                          <p className="text-[10px] text-rose-400 font-medium">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Row 4: Phone Number * and City (Two Columns) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-0.5">
                            Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={resumeData.phone || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdate((p) => ({ ...p, phone: val }));
                              if (formErrors.phone) {
                                setFormErrors((prev) => {
                                  const next = { ...prev };
                                  delete next.phone;
                                  return next;
                                });
                              }
                            }}
                            placeholder="e.g. 72899XXXXX"
                            className={cn(
                              "w-full bg-[#0d121f] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors",
                              formErrors.phone ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
                            )}
                          />
                          {formErrors.phone && (
                            <p className="text-[10px] text-rose-400 font-medium">{formErrors.phone}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">City</label>
                          <input
                            type="text"
                            value={resumeData.city || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdate((p) => {
                                const nextCity = val;
                                const nextLoc = [nextCity, p.state, p.country].filter(Boolean).join(', ');
                                return { ...p, city: nextCity, location: nextLoc };
                              });
                            }}
                            placeholder="e.g. New Delhi"
                            className="w-full bg-[#0d121f] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Row 5: State and Country (Two Columns) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">State</label>
                          <input
                            type="text"
                            value={resumeData.state || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdate((p) => {
                                const nextState = val;
                                const nextLoc = [p.city, nextState, p.country].filter(Boolean).join(', ');
                                return { ...p, state: nextState, location: nextLoc };
                              });
                            }}
                            placeholder="e.g. Delhi"
                            className="w-full bg-[#0d121f] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">Country</label>
                          <input
                            type="text"
                            value={resumeData.country || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdate((p) => {
                                const nextCountry = val;
                                const nextLoc = [p.city, p.state, nextCountry].filter(Boolean).join(', ');
                                return { ...p, country: nextCountry, location: nextLoc };
                              });
                            }}
                            placeholder="e.g. India"
                            className="w-full bg-[#0d121f] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Row 6: Social Links */}
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-white block">Social Links</label>

                        {/* Active Custom Links List */}
                        {resumeData.socialLinks && resumeData.socialLinks.length > 0 && (
                          <div className="space-y-2.5">
                            {resumeData.socialLinks.map((link) => (
                              <div
                                key={link.id}
                                className="flex items-center gap-2 bg-[#0c101c] border border-slate-800/90 rounded-xl p-1.5 transition-all"
                              >
                                <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />

                                {/* Platform Selector or Custom Label */}
                                {link.platform === 'Custom Link' ? (
                                  <input
                                    type="text"
                                    value={link.customLabel || 'Custom Link'}
                                    onChange={(e) => handleUpdateSocialLink(link.id, 'customLabel', e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 w-28 shrink-0 focus:outline-none focus:border-indigo-500 font-medium"
                                    placeholder="Label"
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg shrink-0 text-xs font-semibold text-slate-200">
                                    {link.platform.toLowerCase().includes('linkedin') && <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />}
                                    {link.platform.toLowerCase().includes('github') && <Github className="w-3.5 h-3.5 text-white" />}
                                    {link.platform.toLowerCase().includes('twitter') && <Twitter className="w-3.5 h-3.5 text-white" />}
                                    {link.platform.toLowerCase().includes('website') && <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                                    {link.platform.toLowerCase().includes('dribbble') && <Dribbble className="w-3.5 h-3.5 text-[#EA4C89]" />}
                                    {link.platform.toLowerCase().includes('figma') && <Figma className="w-3.5 h-3.5 text-[#F24E1E]" />}
                                    {!link.platform.match(/linkedin|github|twitter|website|dribbble|figma/i) && <Link2 className="w-3.5 h-3.5 text-indigo-400" />}
                                    <span>{link.platform}</span>
                                  </div>
                                )}

                                {/* URL Input */}
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => handleUpdateSocialLink(link.id, 'url', e.target.value)}
                                  placeholder="e.g. https://example.com"
                                  className="flex-1 bg-transparent border-none px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                                />

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSocialLink(link.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mr-1 cursor-pointer"
                                  title="Remove Link"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quick-Add Platform Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {[
                            { id: 'LinkedIn', label: 'LinkedIn', icon: <Linkedin className="w-3 h-3 text-[#0077B5]" /> },
                            { id: 'X (Twitter)', label: 'X (Twitter)', icon: <Twitter className="w-3 h-3 text-slate-300" /> },
                            { id: 'Discord', label: 'Discord', icon: <span className="text-[10px] font-bold text-[#5865F2]">💬</span> },
                            { id: 'GitHub', label: 'GitHub', icon: <Github className="w-3 h-3 text-white" /> },
                            { id: 'Website', label: 'Website', icon: <Globe className="w-3 h-3 text-emerald-400" /> },
                            { id: 'Dribbble', label: 'Dribbble', icon: <Dribbble className="w-3 h-3 text-[#EA4C89]" /> },
                            { id: 'Figma', label: 'Figma', icon: <Figma className="w-3 h-3 text-[#F24E1E]" /> },
                            { id: 'Behance', label: 'Behance', icon: <span className="text-[9px] font-bold text-[#1769FF] font-mono">Bē</span> },
                            { id: 'Sketch', label: 'Sketch', icon: <span className="text-[10px] text-amber-400">💎</span> }
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleAddSocialLink(p.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d121f] border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer shadow-sm"
                            >
                              <Plus className="w-3 h-3 text-slate-400" />
                              {p.icon}
                              <span>{p.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Add Custom Link Button */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddSocialLink('Custom Link')}
                            className="text-xs text-slate-400 hover:text-indigo-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add custom link</span>
                          </button>
                        </div>
                      </div>

                      {/* Sticky Action Footer: Cancel & Save */}
                      <div className="pt-6 pb-2 flex items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleCancelPersonalInfo}
                          className="px-6 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white border border-slate-700 bg-transparent hover:bg-slate-900 cursor-pointer"
                        >
                          Cancel
                        </Button>

                        <Button
                          type="button"
                          variant="primary"
                          onClick={handleSavePersonalInfo}
                          disabled={isSaving}
                          className="px-8 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : isEditingSummary ? (
                  /* ── PROFESSIONAL SUMMARY FORM (Image 2) ── */
                  <div className="space-y-5">
                    {/* Top Header: Title + Auto-Fill Sample Details */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelSummary}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                          title="Back to Sections"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white tracking-tight">Professional Summary</h2>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAutoFillSampleSummary}
                        className="bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.12] text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-all"
                      >
                        Auto-Fill Sample Details
                      </Button>
                    </div>

                    {/* Rich Editor Box with Glow Card matching Image 2 */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0d121f] p-4 shadow-xl space-y-3">
                      {/* Toolbar Header */}
                      <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
                        <label className="text-xs font-medium text-slate-400">Description</label>

                        {/* Rich Text Toolbar */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleFormatText('bold')}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="Bold"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormatText('italic')}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs italic font-serif text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="Italic"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormatText('underline')}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs underline text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="Underline"
                          >
                            U
                          </button>
                          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                          <button
                            type="button"
                            onClick={() => handleFormatText('bullet')}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="Bullet List"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormatText('number')}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="Numbered List"
                          >
                            <ListOrdered className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                          <button
                            type="button"
                            onClick={handleAiGenerateSummary}
                            disabled={isGeneratingAiSummary}
                            className="px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-semibold text-indigo-300 flex items-center gap-1 transition-all cursor-pointer"
                            title="Enhance / Generate with AI"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>{isGeneratingAiSummary ? 'Generating...' : 'AI Enhance'}</span>
                          </button>
                          <button
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="More Options"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Editor Textarea */}
                      <textarea
                        ref={summaryTextareaRef}
                        rows={9}
                        value={resumeData.summary || ''}
                        onChange={(e) => handleUpdate((p) => ({ ...p, summary: e.target.value }))}
                        placeholder="Briefly describe your professional background and key skills."
                        className="w-full bg-transparent text-xs text-white leading-relaxed focus:outline-none resize-none placeholder:text-slate-500"
                      />
                    </div>

                    {/* Sticky Bottom Action Bar */}
                    <div className="sticky bottom-0 pt-4 pb-2 bg-[#090d16]/95 backdrop-blur border-t border-white/[0.06] flex items-center justify-center gap-4 z-10">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelSummary}
                        className="px-8 py-2.5 rounded-xl border-slate-700 bg-[#0d121f] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveSummary}
                        className="px-10 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 cursor-pointer"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : isEditingExperience ? (
                  /* ── WORK EXPERIENCE FORM (Images 2, 3, 4) ── */
                  (() => {
                    const currentExp =
                      resumeData.experience.find((e) => e.id === editingExperienceId) ||
                      resumeData.experience[0];
                    if (!currentExp) return null;
                    const expIndex = resumeData.experience.findIndex((e) => e.id === currentExp.id);

                    // Parse start date & end date into month and year
                    const startParts = (currentExp.startDate || '').trim().split(' ');
                    const startMonth =
                      startParts.length > 1
                        ? startParts[0]
                        : (MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');
                    const startYear =
                      startParts.length > 1
                        ? startParts[1]
                        : (startParts[0] && !MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');

                    const endParts = (currentExp.endDate || '').trim().split(' ');
                    const endMonth =
                      endParts.length > 1
                        ? endParts[0]
                        : (MONTHS_LIST.includes(endParts[0]) ? endParts[0] : '');
                    const endYear =
                      endParts.length > 1
                        ? endParts[1]
                        : (endParts[0] && !MONTHS_LIST.includes(endParts[0]) && endParts[0] !== 'Present'
                          ? endParts[0]
                          : '');

                    return (
                      <div className="space-y-5">
                        {/* Top Header: Title + Auto-Fill Sample Details */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelExperience}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                              title="Back to Sections"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                              Work Experience #{expIndex + 1}
                            </h2>
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAutoFillSampleExperience(currentExp.id)}
                            className="bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.12] text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-all"
                          >
                            Auto-Fill Sample Details
                          </Button>
                        </div>

                        {/* Glow Form Card Container matching Images 2, 3, 4 */}
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0d121f] p-5 shadow-xl space-y-4">
                          {/* Row 1: Job Title & Employment Type */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">Job Title</label>
                              <input
                                type="text"
                                value={currentExp.role || ''}
                                onChange={(e) => handleUpdateExpField(currentExp.id, 'role', e.target.value)}
                                placeholder="e.g. Software Developer"
                                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">Employment Type</label>
                              <div className="relative">
                                <select
                                  value={currentExp.employmentType || ''}
                                  onChange={(e) =>
                                    handleUpdateExpField(currentExp.id, 'employmentType', e.target.value)
                                  }
                                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                  <option value="" disabled className="text-slate-500">
                                    e.g. Internship
                                  </option>
                                  {EMPLOYMENT_TYPES_LIST.map((type) => (
                                    <option key={type} value={type} className="bg-[#090d16] text-white">
                                      {type}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Company & Location */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">Company</label>
                              <input
                                type="text"
                                value={currentExp.company || ''}
                                onChange={(e) => handleUpdateExpField(currentExp.id, 'company', e.target.value)}
                                placeholder="e.g. AlgoZenith"
                                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">Location</label>
                              <input
                                type="text"
                                value={currentExp.location || ''}
                                onChange={(e) => handleUpdateExpField(currentExp.id, 'location', e.target.value)}
                                placeholder="e.g. Bengaluru, Karnataka"
                                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          {/* Row 3: Location Type */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">Location Type</label>
                              <div className="relative">
                                <select
                                  value={currentExp.locationType || ''}
                                  onChange={(e) =>
                                    handleUpdateExpField(currentExp.id, 'locationType', e.target.value)
                                  }
                                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                  <option value="" disabled className="text-slate-500">
                                    e.g. On Site
                                  </option>
                                  {LOCATION_TYPES_LIST.map((locType) => (
                                    <option key={locType} value={locType} className="bg-[#090d16] text-white">
                                      {locType}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* Row 4: Start Date & End Date (with Month & Year Dropdowns) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">Start Date</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <select
                                    value={startMonth}
                                    onChange={(e) =>
                                      handleUpdateExpDate(currentExp.id, 'startMonth', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-slate-500">
                                      Month
                                    </option>
                                    {MONTHS_LIST.map((m) => (
                                      <option key={m} value={m} className="bg-[#090d16] text-white">
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>

                                <div className="relative">
                                  <select
                                    value={startYear}
                                    onChange={(e) =>
                                      handleUpdateExpDate(currentExp.id, 'startYear', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-slate-500">
                                      Year
                                    </option>
                                    {YEARS_LIST.map((y) => (
                                      <option key={y} value={y} className="bg-[#090d16] text-white">
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>
                              </div>
                            </div>

                            {/* End Date */}
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">End Date</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <select
                                    disabled={!!currentExp.current}
                                    value={currentExp.current ? '' : endMonth}
                                    onChange={(e) =>
                                      handleUpdateExpDate(currentExp.id, 'endMonth', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <option value="" className="text-slate-500">
                                      Month
                                    </option>
                                    {MONTHS_LIST.map((m) => (
                                      <option key={m} value={m} className="bg-[#090d16] text-white">
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>

                                <div className="relative">
                                  <select
                                    disabled={!!currentExp.current}
                                    value={currentExp.current ? '' : endYear}
                                    onChange={(e) =>
                                      handleUpdateExpDate(currentExp.id, 'endYear', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <option value="" className="text-slate-500">
                                      Year
                                    </option>
                                    {YEARS_LIST.map((y) => (
                                      <option key={y} value={y} className="bg-[#090d16] text-white">
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Checkboxes Row */}
                          <div className="flex flex-wrap items-center gap-6 pt-0.5">
                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!currentExp.current}
                                onChange={(e) =>
                                  handleUpdateExpDate(currentExp.id, 'current', e.target.checked)
                                }
                                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>I am currently working in this role</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!currentExp.hideMonth}
                                onChange={(e) =>
                                  handleUpdateExpDate(currentExp.id, 'hideMonth', e.target.checked)
                                }
                                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>Hide month and show only year</span>
                            </label>
                          </div>

                          {/* Row 5: Tech Stack & Suggestion Pills */}
                          <div className="space-y-2 pt-1">
                            <label className="text-xs font-semibold text-slate-300">Tech Stack</label>
                            <input
                              type="text"
                              value={currentExp.technologies || ''}
                              onChange={(e) =>
                                handleUpdateExpField(currentExp.id, 'technologies', e.target.value)
                              }
                              placeholder="e.g. React"
                              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                            />

                            {/* Suggestion Pills */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {SUGGESTED_TECH_PILLS.map((pill) => (
                                <button
                                  key={pill}
                                  type="button"
                                  onClick={() => handleAddTechPill(currentExp.id, pill)}
                                  className="px-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-indigo-500/60 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                >
                                  <span>+</span>
                                  <span>{pill}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Row 6: Description & Toolbar */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                              <label className="text-xs font-medium text-slate-400">Description</label>

                              {/* Rich Text Toolbar */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleFormatExperienceDescription('bold')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Bold"
                                >
                                  B
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatExperienceDescription('italic')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs italic font-serif text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Italic"
                                >
                                  I
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatExperienceDescription('underline')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs underline text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Underline"
                                >
                                  U
                                </button>
                                <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                                <button
                                  type="button"
                                  onClick={() => handleFormatExperienceDescription('bullet')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Bullet List"
                                >
                                  <List className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatExperienceDescription('number')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Numbered List"
                                >
                                  <ListOrdered className="w-3.5 h-3.5" />
                                </button>
                                <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                                <button
                                  type="button"
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Paragraph"
                                >
                                  <Pilcrow className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAiGenerateExperienceDescription(currentExp.id)}
                                  disabled={isGeneratingAiExp}
                                  className="px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-semibold text-indigo-300 flex items-center gap-1 transition-all cursor-pointer"
                                  title="Enhance / Generate with AI"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-400" />
                                  <span>{isGeneratingAiExp ? 'Generating...' : 'AI Enhance'}</span>
                                </button>
                                <button
                                  type="button"
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="More Options"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Textarea */}
                            <textarea
                              ref={experienceDescriptionRef}
                              rows={6}
                              value={currentExp.description || ''}
                              onChange={(e) =>
                                handleUpdateExpField(currentExp.id, 'description', e.target.value)
                              }
                              placeholder="Briefly describe how you have applied this skill in real-world scenarios or projects."
                              className="w-full bg-transparent text-xs text-white leading-relaxed focus:outline-none resize-none placeholder:text-slate-500"
                            />
                          </div>
                        </div>

                        {/* Sticky Bottom Action Bar */}
                        <div className="sticky bottom-0 pt-4 pb-2 bg-[#090d16]/95 backdrop-blur border-t border-white/[0.06] flex items-center justify-center gap-4 z-10">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelExperience}
                            className="px-8 py-2.5 rounded-xl border-slate-700 bg-[#0d121f] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSaveExperience}
                            className="px-10 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 cursor-pointer"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                ) : isEditingEducation ? (
                  /* ── EDUCATION FORM (Images 2 & 3) ── */
                  (() => {
                    const currentEdu =
                      resumeData.education.find((e) => e.id === editingEducationId) ||
                      resumeData.education[0];
                    if (!currentEdu) return null;
                    const eduIndex = resumeData.education.findIndex((e) => e.id === currentEdu.id);

                    // Parse start date & end date into month and year
                    const startParts = (currentEdu.startDate || '').trim().split(' ');
                    const startMonth =
                      startParts.length > 1
                        ? startParts[0]
                        : (MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');
                    const startYear =
                      startParts.length > 1
                        ? startParts[1]
                        : (startParts[0] && !MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');

                    const endParts = (currentEdu.endDate || '').trim().split(' ');
                    const endMonth =
                      endParts.length > 1
                        ? endParts[0]
                        : (MONTHS_LIST.includes(endParts[0]) ? endParts[0] : '');
                    const endYear =
                      endParts.length > 1
                        ? endParts[1]
                        : (endParts[0] && !MONTHS_LIST.includes(endParts[0]) ? endParts[0] : '');

                    return (
                      <div className="space-y-5">
                        {/* Top Header: Title + Auto-Fill Sample Details (Image 3) */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEducation}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                              title="Back to Sections"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                              Education #{eduIndex + 1}
                            </h2>
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAutoFillSampleEducation(currentEdu.id)}
                            className="bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.12] text-xs font-semibold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all"
                          >
                            Auto-Fill Sample Details
                          </Button>
                        </div>

                        {/* Glow Form Card Container matching Images 2 & 3 */}
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0d121f] p-5 shadow-xl space-y-4">
                          {/* Row 1: Degree (Full width) */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300">Degree</label>
                            <input
                              type="text"
                              value={currentEdu.degree || ''}
                              onChange={(e) => handleUpdateEduField(currentEdu.id, 'degree', e.target.value)}
                              placeholder="e.g. B.Tech"
                              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                          </div>

                          {/* Row 2: Institution Name (Full width) */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300">Institution Name</label>
                            <input
                              type="text"
                              value={currentEdu.institution || ''}
                              onChange={(e) => handleUpdateEduField(currentEdu.id, 'institution', e.target.value)}
                              placeholder="e.g. IIT Delhi"
                              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                          </div>

                          {/* Row 3: CGPA (with pencil icon) & City (2 columns) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <label className="text-xs font-semibold text-slate-300">
                                  {currentEdu.cgpaLabel || 'CGPA'}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setIsEditingCgpaLabel(!isEditingCgpaLabel)}
                                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="Edit Label (e.g. GPA, Percentage)"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                              {isEditingCgpaLabel && (
                                <input
                                  type="text"
                                  value={currentEdu.cgpaLabel || 'CGPA'}
                                  onChange={(e) => handleUpdateEduField(currentEdu.id, 'cgpaLabel', e.target.value)}
                                  placeholder="Score label, e.g. GPA, Percentage, Marks"
                                  className="w-full bg-[#060a12] border border-indigo-500/50 rounded-lg px-2.5 py-1 text-[11px] text-white mb-1 focus:outline-none"
                                />
                              )}
                              <input
                                type="text"
                                value={currentEdu.cgpa || ''}
                                onChange={(e) => handleUpdateEduField(currentEdu.id, 'cgpa', e.target.value)}
                                placeholder="e.g. 9/10"
                                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">City</label>
                              <input
                                type="text"
                                value={currentEdu.city || currentEdu.location || ''}
                                onChange={(e) => handleUpdateEduField(currentEdu.id, 'city', e.target.value)}
                                placeholder="e.g. New Delhi, India"
                                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          {/* Row 4: Start Date & End Date (with Month & Year Dropdowns) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">Start Date</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <select
                                    value={startMonth}
                                    onChange={(e) =>
                                      handleUpdateEduDate(currentEdu.id, 'startMonth', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-slate-500">
                                      Month
                                    </option>
                                    {MONTHS_LIST.map((m) => (
                                      <option key={m} value={m} className="bg-[#090d16] text-white">
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>

                                <div className="relative">
                                  <select
                                    value={startYear}
                                    onChange={(e) =>
                                      handleUpdateEduDate(currentEdu.id, 'startYear', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-slate-500">
                                      Year
                                    </option>
                                    {YEARS_LIST.map((y) => (
                                      <option key={y} value={y} className="bg-[#090d16] text-white">
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>
                              </div>
                            </div>

                            {/* End Date */}
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">End Date</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <select
                                    value={endMonth}
                                    onChange={(e) =>
                                      handleUpdateEduDate(currentEdu.id, 'endMonth', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-slate-500">
                                      Month
                                    </option>
                                    {MONTHS_LIST.map((m) => (
                                      <option key={m} value={m} className="bg-[#090d16] text-white">
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>

                                <div className="relative">
                                  <select
                                    value={endYear}
                                    onChange={(e) =>
                                      handleUpdateEduDate(currentEdu.id, 'endYear', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-slate-500">
                                      Year
                                    </option>
                                    {YEARS_LIST.map((y) => (
                                      <option key={y} value={y} className="bg-[#090d16] text-white">
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Checkboxes Row */}
                          <div className="flex flex-wrap items-center gap-6 pt-0.5">
                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!currentEdu.hideMonth}
                                onChange={(e) =>
                                  handleUpdateEduDate(currentEdu.id, 'hideMonth', e.target.checked)
                                }
                                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>Hide month and show only year</span>
                            </label>
                          </div>

                          {/* Row 5: Description & Toolbar */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                              <label className="text-xs font-medium text-slate-400">Description</label>

                              {/* Rich Text Toolbar */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleFormatEducationDescription('bold')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Bold"
                                >
                                  B
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatEducationDescription('italic')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs italic font-serif text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Italic"
                                >
                                  I
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatEducationDescription('underline')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs underline text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Underline"
                                >
                                  U
                                </button>
                                <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                                <button
                                  type="button"
                                  onClick={() => handleFormatEducationDescription('bullet')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Bullet List"
                                >
                                  <List className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatEducationDescription('number')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Numbered List"
                                >
                                  <ListOrdered className="w-3.5 h-3.5" />
                                </button>
                                <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                                <button
                                  type="button"
                                  className="px-1.5 h-6 rounded flex items-center gap-0.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Paragraph"
                                >
                                  <Pilcrow className="w-3.5 h-3.5" />
                                  <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAiGenerateEducationDescription(currentEdu.id)}
                                  disabled={isGeneratingAiEdu}
                                  className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-purple-600/30"
                                  title="Enhance / Generate with AI"
                                >
                                  <Sparkles className="w-3 h-3 text-white" />
                                  <span>{isGeneratingAiEdu ? 'Generating...' : 'AI Enhance'}</span>
                                  <ChevronDown className="w-2.5 h-2.5 text-white/80" />
                                </button>
                                <button
                                  type="button"
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="More Options"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Textarea */}
                            <textarea
                              ref={educationDescriptionRef}
                              rows={6}
                              value={currentEdu.description || currentEdu.details || ''}
                              onChange={(e) =>
                                handleUpdateEduField(currentEdu.id, 'description', e.target.value)
                              }
                              placeholder="Describe your role, key responsibilities, and notable achievements. Highlight tools used and measurable impact if any."
                              className="w-full bg-transparent text-xs text-white leading-relaxed focus:outline-none resize-none placeholder:text-slate-500"
                            />
                          </div>
                        </div>

                        {/* Sticky Bottom Action Bar */}
                        <div className="sticky bottom-0 pt-4 pb-2 bg-[#090d16]/95 backdrop-blur border-t border-white/[0.06] flex items-center justify-center gap-4 z-10">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEducation}
                            className="px-8 py-2.5 rounded-xl border-slate-700 bg-[#0d121f] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSaveEducation}
                            className="px-10 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 cursor-pointer"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                ) : isEditingProject ? (
                  /* ── PROJECTS FORM (Images 2 & 3) ── */
                  (() => {
                    const currentProj =
                      resumeData.projects.find((p) => p.id === editingProjectId) ||
                      resumeData.projects[0];
                    if (!currentProj) return null;
                    const projIndex = resumeData.projects.findIndex((p) => p.id === currentProj.id);

                    // Parse start date & end date into month and year
                    const startParts = (currentProj.startDate || '').trim().split(' ');
                    const startMonth =
                      startParts.length > 1
                        ? startParts[0]
                        : (MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');
                    const startYear =
                      startParts.length > 1
                        ? startParts[1]
                        : (startParts[0] && !MONTHS_LIST.includes(startParts[0]) ? startParts[0] : '');

                    const endParts = (currentProj.endDate || '').trim().split(' ');
                    const endMonth =
                      endParts.length > 1
                        ? endParts[0]
                        : (MONTHS_LIST.includes(endParts[0]) ? endParts[0] : '');
                    const endYear =
                      endParts.length > 1
                        ? endParts[1]
                        : (endParts[0] && !MONTHS_LIST.includes(endParts[0]) && endParts[0] !== 'Present'
                          ? endParts[0]
                          : '');

                    return (
                      <div className="space-y-5">
                        {/* Top Header: Title + Auto-Fill Sample Details (Image 3) */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelProject}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                              title="Back to Sections"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                              Project #{projIndex + 1}
                            </h2>
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAutoFillSampleProject(currentProj.id)}
                            className="bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.12] text-xs font-semibold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all"
                          >
                            Auto-Fill Sample Details
                          </Button>
                        </div>

                        {/* Glow Form Card Container matching Images 2 & 3 */}
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0d121f] p-5 shadow-xl space-y-4">
                          {/* Row 1: Project Name (Full width) */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300">Project Name</label>
                            <input
                              type="text"
                              value={currentProj.title || ''}
                              onChange={(e) => handleUpdateProjectField(currentProj.id, 'title', e.target.value)}
                              placeholder="e.g. E-Commerce Platform"
                              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                          </div>

                          {/* Row 2: Role (Full width) */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300">Role</label>
                            <input
                              type="text"
                              value={currentProj.role || ''}
                              onChange={(e) => handleUpdateProjectField(currentProj.id, 'role', e.target.value)}
                              placeholder="e.g. Lead Developer"
                              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                          </div>

                          {/* Row 3: Start Date & End Date (with Month & Year Dropdowns) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">Start Date</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <select
                                    value={startMonth}
                                    onChange={(e) =>
                                      handleUpdateProjectDate(currentProj.id, 'startMonth', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-slate-500">
                                      Month
                                    </option>
                                    {MONTHS_LIST.map((m) => (
                                      <option key={m} value={m} className="bg-[#090d16] text-white">
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>

                                <div className="relative">
                                  <select
                                    value={startYear}
                                    onChange={(e) =>
                                      handleUpdateProjectDate(currentProj.id, 'startYear', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-slate-500">
                                      Year
                                    </option>
                                    {YEARS_LIST.map((y) => (
                                      <option key={y} value={y} className="bg-[#090d16] text-white">
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>
                              </div>
                            </div>

                            {/* End Date */}
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">End Date</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <select
                                    disabled={!!currentProj.current}
                                    value={currentProj.current ? '' : endMonth}
                                    onChange={(e) =>
                                      handleUpdateProjectDate(currentProj.id, 'endMonth', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <option value="" className="text-slate-500">
                                      Month
                                    </option>
                                    {MONTHS_LIST.map((m) => (
                                      <option key={m} value={m} className="bg-[#090d16] text-white">
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>

                                <div className="relative">
                                  <select
                                    disabled={!!currentProj.current}
                                    value={currentProj.current ? '' : endYear}
                                    onChange={(e) =>
                                      handleUpdateProjectDate(currentProj.id, 'endYear', e.target.value)
                                    }
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <option value="" className="text-slate-500">
                                      Year
                                    </option>
                                    {YEARS_LIST.map((y) => (
                                      <option key={y} value={y} className="bg-[#090d16] text-white">
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Checkboxes Row */}
                          <div className="flex flex-wrap items-center gap-6 pt-0.5">
                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!currentProj.current}
                                onChange={(e) =>
                                  handleUpdateProjectDate(currentProj.id, 'current', e.target.checked)
                                }
                                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>I am currently working in this role</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!currentProj.hideMonth}
                                onChange={(e) =>
                                  handleUpdateProjectDate(currentProj.id, 'hideMonth', e.target.checked)
                                }
                                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>Hide month and show only year</span>
                            </label>
                          </div>

                          {/* Row 4: Description & Toolbar */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                              <label className="text-xs font-medium text-slate-400">Description</label>

                              {/* Rich Text Toolbar */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleFormatProjectDescription('bold')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Bold"
                                >
                                  B
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatProjectDescription('italic')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs italic font-serif text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Italic"
                                >
                                  I
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatProjectDescription('underline')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs underline text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Underline"
                                >
                                  U
                                </button>
                                <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                                <button
                                  type="button"
                                  onClick={() => handleFormatProjectDescription('bullet')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Bullet List"
                                >
                                  <List className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFormatProjectDescription('number')}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Numbered List"
                                >
                                  <ListOrdered className="w-3.5 h-3.5" />
                                </button>
                                <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                                <button
                                  type="button"
                                  className="px-1.5 h-6 rounded flex items-center gap-0.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="Paragraph"
                                >
                                  <Pilcrow className="w-3.5 h-3.5" />
                                  <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAiGenerateProjectDescription(currentProj.id)}
                                  disabled={isGeneratingAiProject}
                                  className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-purple-600/30"
                                  title="Enhance / Generate with AI"
                                >
                                  <Sparkles className="w-3 h-3 text-white" />
                                  <span>{isGeneratingAiProject ? 'Generating...' : 'AI Enhance'}</span>
                                  <ChevronDown className="w-2.5 h-2.5 text-white/80" />
                                </button>
                                <button
                                  type="button"
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                  title="More Options"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Textarea */}
                            <textarea
                              ref={projectDescriptionRef}
                              rows={6}
                              value={currentProj.description || ''}
                              onChange={(e) =>
                                handleUpdateProjectField(currentProj.id, 'description', e.target.value)
                              }
                              placeholder="Briefly describe how you have applied this skill in real-world scenarios or projects."
                              className="w-full bg-transparent text-xs text-white leading-relaxed focus:outline-none resize-none placeholder:text-slate-500"
                            />
                          </div>

                          {/* Row 5: Tech Stack & Suggestion Pills (Image 3) */}
                          <div className="space-y-2 pt-1">
                            <label className="text-xs font-semibold text-slate-300">Tech Stack</label>
                            <input
                              type="text"
                              value={currentProj.technologies || ''}
                              onChange={(e) =>
                                handleUpdateProjectField(currentProj.id, 'technologies', e.target.value)
                              }
                              placeholder="e.g. React"
                              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                            />

                            {/* Suggestion Pills */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {SUGGESTED_TECH_PILLS.map((pill) => (
                                <button
                                  key={pill}
                                  type="button"
                                  onClick={() => handleAddProjectTechPill(currentProj.id, pill)}
                                  className="px-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-indigo-500/60 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                >
                                  <span>+</span>
                                  <span>{pill}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Row 6: Links (Image 3) */}
                          <div className="space-y-3 pt-1">
                            <label className="text-xs font-semibold text-slate-300">Links</label>

                            {/* Active Links Input List */}
                            {currentProj.links && currentProj.links.length > 0 && (
                              <div className="space-y-2 pb-1">
                                {currentProj.links.map((link) => {
                                  const platformDef = PROJECT_LINK_PLATFORMS.find((p) => p.name === link.platform);
                                  const IconComponent = platformDef ? platformDef.icon : Link2;

                                  return (
                                    <div
                                      key={link.id}
                                      className="flex items-center gap-2 bg-[#090d16] border border-slate-800 rounded-xl p-2"
                                    >
                                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
                                        <IconComponent className={cn("w-3.5 h-3.5", platformDef?.color || "text-slate-300")} />
                                      </div>

                                      {link.platform === 'Custom Link' && (
                                        <input
                                          type="text"
                                          value={link.customLabel || ''}
                                          onChange={(e) =>
                                            handleUpdateProjectLink(currentProj.id, link.id, 'customLabel', e.target.value)
                                          }
                                          placeholder="Label (e.g. Demo)"
                                          className="w-28 bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none shrink-0"
                                        />
                                      )}

                                      <input
                                        type="text"
                                        value={link.url || ''}
                                        onChange={(e) =>
                                          handleUpdateProjectLink(currentProj.id, link.id, 'url', e.target.value)
                                        }
                                        placeholder={`Paste ${link.platform} URL`}
                                        className="flex-1 min-w-0 bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                                      />

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProjectLink(currentProj.id, link.id)}
                                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                                        title="Delete Link"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Quick Add Platform Buttons matching Image 3 */}
                            <div className="flex flex-wrap items-center gap-2">
                              {PROJECT_LINK_PLATFORMS.map((platform) => {
                                const IconComponent = platform.icon;
                                return (
                                  <button
                                    key={platform.name}
                                    type="button"
                                    onClick={() => handleAddProjectLink(currentProj.id, platform.name)}
                                    className="px-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-indigo-500/60 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                  >
                                    <span>+</span>
                                    <IconComponent className={cn("w-3.5 h-3.5", platform.color)} />
                                    <span>{platform.name}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* + Add custom link button */}
                            <button
                              type="button"
                              onClick={() => handleAddProjectLink(currentProj.id, 'Custom Link')}
                              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                            >
                              <span>+ Add custom link</span>
                            </button>
                          </div>
                        </div>

                        {/* Sticky Bottom Action Bar */}
                        <div className="sticky bottom-0 pt-4 pb-2 bg-[#090d16]/95 backdrop-blur border-t border-white/[0.06] flex items-center justify-center gap-4 z-10">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelProject}
                            className="px-8 py-2.5 rounded-xl border-slate-700 bg-[#0d121f] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSaveProject}
                            className="px-10 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 cursor-pointer"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                ) : isEditingSkills ? (
                  /* ── SKILLS EDIT FORM (Screenshots 3, 4, 5) ── */
                  (() => {
                    const allCategories = [
                      ...DEFAULT_SKILL_CATEGORIES.map((c) => ({
                        key: c.key,
                        name: c.name,
                        skills: normalizeSkillsToString((resumeData.skills as any)?.[c.key]),
                        isCustom: false
                      })),
                      ...(Array.isArray(resumeData.skills?.customCategories)
                        ? resumeData.skills.customCategories.map((c) => ({
                          key: c.id,
                          name: c.name,
                          skills: normalizeSkillsToString(c.skills),
                          isCustom: true
                        }))
                        : [])
                    ];

                    return (
                      <div className="space-y-5">
                        {/* Top Header: Title + Create Skill Input (Screenshot 3) */}
                        <div className="space-y-3 pb-2 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelSkills}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                              title="Back to Sections"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-white tracking-tight">Create Skill</h2>
                          </div>

                          {/* Create Skill Input & Add Button */}
                          <div className="flex items-center gap-2.5">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                              placeholder="e.g. Programming Languages"
                              className="flex-1 bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                            <button
                              type="button"
                              onClick={handleCreateCategory}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer shrink-0 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Skill</span>
                            </button>
                          </div>
                        </div>

                        {/* Category Cards List (Screenshots 3, 4, 5) */}
                        <div className="space-y-4">
                          {allCategories.map((cat) => {
                            const currentSkills = parseSkillsList(cat.skills);
                            const predefinedList = PREDEFINED_SKILLS[cat.key] || [];

                            return (
                              <div
                                key={cat.key}
                                id={`skill-cat-${cat.key}`}
                                className="rounded-2xl border border-white/[0.08] bg-[#0d121f] p-4 shadow-xl space-y-3 transition-all"
                              >
                                {/* Header: Drag handle, Category Title, Edit & Delete Buttons */}
                                <div className="flex items-center justify-between pb-1">
                                  <div className="flex items-center gap-2.5">
                                    <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
                                    <h3 className="text-sm font-bold text-white tracking-tight">{cat.name}</h3>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const inputEl = document.getElementById(`keyword-input-${cat.key}`);
                                        inputEl?.focus();
                                      }}
                                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                      title={`Edit ${cat.name}`}
                                      aria-label={`Edit ${cat.name}`}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(cat.key)}
                                      className="p-1 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                      title={`Delete ${cat.name}`}
                                      aria-label={`Delete ${cat.name}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Keyword Input: Type a keyword and press Enter */}
                                <div>
                                  <input
                                    id={`keyword-input-${cat.key}`}
                                    type="text"
                                    value={categoryKeywordInputs[cat.key] || ''}
                                    onChange={(e) =>
                                      setCategoryKeywordInputs((prev) => ({
                                        ...prev,
                                        [cat.key]: e.target.value
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddKeywordSkill(cat.key);
                                      }
                                    }}
                                    placeholder="Type a keyword and press Enter"
                                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                                  />
                                </div>

                                {/* Active Selected Custom / Added Skills Chips (with remove x) */}
                                {currentSkills.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {currentSkills.map((skill) => (
                                      <span
                                        key={skill}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/40 text-[11px] font-medium text-purple-200 shadow-sm"
                                      >
                                        <span>{skill}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSkill(cat.key, skill)}
                                          className="text-purple-400 hover:text-rose-300 transition-colors cursor-pointer"
                                          title={`Remove ${skill}`}
                                          aria-label={`Remove ${skill}`}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Predefined Quick-Add Buttons Grid */}
                                {predefinedList.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {predefinedList.map((skill) => {
                                      const isSelected = hasSkill(cat.skills, skill);
                                      return (
                                        <button
                                          key={skill}
                                          type="button"
                                          onClick={() => handleToggleSkill(cat.key, skill)}
                                          className={cn(
                                            'px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer shadow-sm',
                                            isSelected
                                              ? 'bg-purple-950/70 border border-purple-500 text-purple-200 shadow-md shadow-purple-900/30'
                                              : 'bg-[#090d16] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                                          )}
                                        >
                                          <span>+</span>
                                          <span>{skill}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Sticky Bottom Action Bar */}
                        <div className="sticky bottom-0 pt-4 pb-2 bg-[#090d16]/95 backdrop-blur border-t border-white/[0.06] flex items-center justify-center gap-4 z-10">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelSkills}
                            className="px-8 py-2.5 rounded-xl border-slate-700 bg-[#0d121f] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSaveSkills}
                            className="px-10 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 cursor-pointer"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                ) : isEditingCustomSection ? (
                  /* ── CUSTOM SECTION EDIT VIEW (Image 2 Match) ── */
                  <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Top Header: Custom #1 + Auto-Fill Sample Details */}
                    <div className="flex items-center justify-between pb-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelCustomSection}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                          title="Back to Sections"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white tracking-tight">Custom #1</h2>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillCustomSection}
                        className="px-3.5 py-1.5 rounded-lg bg-[#0d1222] border border-slate-700/80 hover:border-slate-500 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
                      >
                        Auto-Fill Sample Details
                      </button>
                    </div>

                    {/* Main Glow Card (Image 2) */}
                    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#121634]/90 via-[#0e1124]/95 to-[#0a0d1c] p-5 space-y-4 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

                      {/* Section Title Input */}
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={customSectionForm.title}
                          onChange={(e) => setCustomSectionForm((p) => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. Volunteering"
                          className="w-full bg-[#080b18]/90 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Description Field with Rich Toolbar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-300">Description</label>

                          {/* Rich Text Toolbar */}
                          <div className="flex items-center gap-1 bg-[#080b18]/80 border border-slate-800 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleFormatCustomText('bold')}
                              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                              title="Bold"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFormatCustomText('italic')}
                              className="w-6 h-6 rounded flex items-center justify-center text-xs italic font-serif text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                              title="Italic"
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFormatCustomText('underline')}
                              className="w-6 h-6 rounded flex items-center justify-center text-xs underline text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                              title="Underline"
                            >
                              U
                            </button>
                            <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                            <button
                              type="button"
                              onClick={() => handleFormatCustomText('bullet')}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                              title="Bullet List"
                            >
                              <List className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFormatCustomText('number')}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                              title="Numbered List"
                            >
                              <ListOrdered className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                            <button
                              type="button"
                              className="px-1.5 h-6 rounded flex items-center gap-0.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                              title="Paragraph"
                            >
                              <span>¶</span>
                              <ChevronDown className="w-3 h-3 text-slate-500" />
                            </button>
                            <button
                              type="button"
                              className="px-1.5 h-6 rounded bg-purple-600/30 border border-purple-500/40 flex items-center gap-0.5 text-xs text-purple-300 transition-colors cursor-pointer"
                              title="Align"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="21" y1="10" x2="3" y2="10" />
                                <line x1="21" y1="6" x2="3" y2="6" />
                                <line x1="21" y1="14" x2="3" y2="14" />
                                <line x1="21" y1="18" x2="3" y2="18" />
                              </svg>
                              <ChevronDown className="w-3 h-3 text-purple-400" />
                            </button>
                            <button
                              type="button"
                              className="w-6 h-6 rounded flex items-center justify-center text-xs text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                              title="More"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                          ref={customDescriptionRef}
                          rows={6}
                          value={customSectionForm.content}
                          onChange={(e) => setCustomSectionForm((p) => ({ ...p, content: e.target.value }))}
                          placeholder="Describe your role, key responsibilities, and notable achievements. Highlight tools used and measurable impact if any."
                          className="w-full bg-[#080b18]/90 border border-slate-700/80 focus:border-indigo-500 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Bottom Footer Actions (Image 2) */}
                    <div className="pt-6 relative">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
                      <div className="flex items-center justify-center gap-4 pt-3">
                        <button
                          type="button"
                          onClick={handleCancelCustomSection}
                          className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCustomSection}
                          className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/40 transition-all cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── SECTIONS LIST (Screenshot 1) ── */
                  <div className="space-y-5">
                    {/* Top: Edit Content Title + Add Section + Collapse Icon (Image 1 match) */}
                    <div className="flex items-center justify-between pb-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">Edit Content</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsAddSectionOpen(true)}
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                          className="bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/25 text-xs font-bold cursor-pointer rounded-xl px-3 py-1.5"
                        >
                          Add Section
                        </Button>
                        <button
                          type="button"
                          onClick={() => setIsLeftPanelCollapsed(true)}
                          className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Collapse editor panel"
                        >
                          <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="9" y1="3" x2="9" y2="21" />
                            <path d="M16 15l-3-3 3-3" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* ── ACCORDION SECTION CARDS (Exact Image 1 Match) ─────────────────────── */}
                    <div className="space-y-4">
                      {/* 1. PERSONAL INFORMATION CARD (Image 1 Exact Match) */}
                      {resumeData.activeSections.includes('profile') && (
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] overflow-hidden transition-all duration-300 relative shadow-lg">
                          {/* Left glowing neon vertical aura */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.85)] z-20" />
                          <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                          <div
                            onClick={() => toggleAccordion('profile')}
                            className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                          >
                            <div className="flex items-center gap-3.5">
                              <User className="w-5 h-5 text-indigo-300 shrink-0" />
                              <span className="text-[14.5px] font-semibold text-white tracking-tight">Personal Information</span>
                            </div>
                            <ChevronDown
                              className={cn(
                                'w-4 h-4 text-slate-400 transition-transform duration-200',
                                expandedSections.profile ? 'rotate-180' : ''
                              )}
                            />
                          </div>

                          {expandedSections.profile && (
                            <div className="p-4 pt-0 border-t border-white/[0.04] space-y-3 pt-3 relative z-10">
                              {/* Inner Card matching reference screenshot */}
                              <div className="rounded-2xl bg-[#090d16] border border-white/[0.06] p-4 relative flex flex-col sm:flex-row items-center gap-4">
                                {/* Top-right Edit button */}
                                <button
                                  type="button"
                                  onClick={handleStartEditPersonalInfo}
                                  className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors shadow-sm cursor-pointer"
                                  title="Edit Personal Information"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Left: Avatar area */}
                                <div className="shrink-0 flex items-center justify-center">
                                  {resumeData.photo ? (
                                    <img
                                      src={resumeData.photo}
                                      alt="Profile"
                                      className="w-20 h-20 rounded-full object-cover border border-indigo-500/50 shadow-md"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-full bg-slate-900/90 border border-dashed border-slate-700/80 flex flex-col items-center justify-center text-center p-1 relative shadow-inner">
                                      <User className="w-7 h-7 text-slate-500" />
                                      <span className="text-[7.5px] text-slate-400 italic leading-tight mt-0.5">
                                        I promise I'll look better with your photo
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Middle/Right: Info details */}
                                <div className="flex-1 min-w-0 space-y-1.5 text-left sm:pr-8">
                                  <div>
                                    {/* Name — real value or styled placeholder */}
                                    {(() => {
                                      const displayName = (resumeData.firstName || resumeData.lastName)
                                        ? `${resumeData.firstName || ''} ${resumeData.lastName || ''}`.trim()
                                        : (resumeData.name || '');
                                      return displayName ? (
                                        <h3 className="text-sm font-bold text-white truncate">{displayName}</h3>
                                      ) : (
                                        <h3 className="text-sm font-medium truncate flex items-center gap-1.5">
                                          <span className="text-amber-400/70 italic">Your Name</span>
                                          <span className="text-[9px] font-semibold text-amber-500/60 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full not-italic">Required</span>
                                        </h3>
                                      );
                                    })()}
                                    {/* Headline */}
                                    {resumeData.headline ? (
                                      <p className="text-xs text-slate-400 truncate">{resumeData.headline}</p>
                                    ) : (
                                      <p className="text-xs text-slate-600 italic truncate">Your one-line professional headline</p>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px] pt-1">
                                    {/* Email */}
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                                      {resumeData.email ? (
                                        <span className="truncate text-slate-400">{resumeData.email}</span>
                                      ) : (
                                        <span className="truncate text-slate-600 italic">your@email.com</span>
                                      )}
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-1.5 truncate">
                                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                      {(() => {
                                        const loc = [resumeData.city, resumeData.state, resumeData.country].filter(Boolean).join(', ') || resumeData.location || '';
                                        return loc ? (
                                          <span className="truncate text-slate-400">{loc}</span>
                                        ) : (
                                          <span className="truncate text-slate-600 italic">City, State, Country</span>
                                        );
                                      })()}
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                                      {resumeData.phone ? (
                                        <span className="truncate text-slate-400">{resumeData.phone}</span>
                                      ) : (
                                        <span className="truncate text-slate-600 italic">+91 XXXXX XXXXX</span>
                                      )}
                                    </div>

                                    {/* Social Links */}
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Link2 className="w-3 h-3 text-slate-500 shrink-0" />
                                      {resumeData.socialLinks && resumeData.socialLinks.filter((l) => l.url && l.url.trim()).length > 0 ? (
                                        <div className="flex items-center gap-1.5 truncate text-[10.5px]">
                                          {resumeData.socialLinks
                                            .filter((l) => l.url && l.url.trim())
                                            .map((l, idx, arr) => {
                                              const label = l.platform === 'Custom Link' && l.customLabel?.trim() ? l.customLabel.trim() : l.platform;
                                              const rawUrl = l.url.trim();
                                              const href = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;
                                              return (
                                                <React.Fragment key={l.id || idx}>
                                                  <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-slate-300 hover:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                                                  >
                                                    <span>{label}</span>
                                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                                  </a>
                                                  {idx < arr.length - 1 && <span className="text-slate-600">|</span>}
                                                </React.Fragment>
                                              );
                                            })}
                                        </div>
                                      ) : (
                                        <span className="truncate text-slate-600 italic">LinkedIn, GitHub, Portfolio…</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* CTA hint when nothing is filled */}
                                  {!resumeData.name && !resumeData.firstName && !resumeData.email && !resumeData.phone && (
                                    <button
                                      type="button"
                                      onClick={handleStartEditPersonalInfo}
                                      className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                                    >
                                      <span>✏ Click to add your details</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. PROFESSIONAL SUMMARY (Image 1 Exact Match) */}
                      {resumeData.activeSections.includes('summary') && (
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] overflow-hidden transition-all duration-300 relative shadow-lg">
                          {/* Left glowing neon vertical aura */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.85)] z-20" />
                          <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                          <div
                            onClick={() => toggleAccordion('summary')}
                            className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                              <FileText className="w-5 h-5 text-indigo-300 shrink-0" />
                              <span className="text-[14.5px] font-semibold text-white tracking-tight">Professional Summary</span>
                            </div>
                            <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleSection('summary')}
                                className="p-1.5 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-700 text-xs select-none">|</span>
                              <button
                                type="button"
                                onClick={() => toggleAccordion('summary')}
                                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title={expandedSections.summary ? 'Collapse' : 'Expand'}
                              >
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                                    expandedSections.summary ? 'rotate-180' : ''
                                  )}
                                />
                              </button>
                            </div>
                          </div>

                          {expandedSections.summary && (
                            <div className="p-4 pt-0 border-t border-white/[0.04] pt-3 relative z-10">
                              <div
                                onClick={handleStartEditSummary}
                                className="rounded-xl bg-[#090d16] border border-white/[0.06] p-4 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition-colors group"
                              >
                                <p className="text-xs text-slate-400 font-medium truncate pr-4">
                                  {resumeData.summary && resumeData.summary.trim()
                                    ? resumeData.summary.trim()
                                    : 'No professional summary available. Please add one.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditSummary();
                                  }}
                                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm shrink-0 cursor-pointer"
                                  title="Edit Professional Summary"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. WORK EXPERIENCE (Image 1 Exact Match) */}
                      {resumeData.activeSections.includes('experience') && (
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] overflow-hidden transition-all duration-300 relative shadow-lg">
                          {/* Left glowing neon vertical aura */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.85)] z-20" />
                          <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                          <div
                            onClick={() => toggleAccordion('experience')}
                            className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                              <Briefcase className="w-5 h-5 text-indigo-300 shrink-0" />
                              <div className="flex items-baseline gap-2">
                                <span className="text-[14.5px] font-semibold text-white tracking-tight">Work Experience</span>
                                <span className="text-slate-300 font-mono text-[13px] font-normal">
                                  [{Math.max(1, resumeData.experience.length)}/{Math.max(1, resumeData.experience.length)}]
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleSection('experience')}
                                className="p-1.5 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-700 text-xs select-none">|</span>
                              <button
                                type="button"
                                onClick={() => toggleAccordion('experience')}
                                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title={expandedSections.experience ? 'Collapse' : 'Expand'}
                              >
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                                    expandedSections.experience ? 'rotate-180' : ''
                                  )}
                                />
                              </button>
                            </div>
                          </div>

                          {expandedSections.experience && (
                            <div className="p-4 pt-0 border-t border-white/[0.04] pt-3 space-y-3 relative z-10">
                              {resumeData.experience.length > 0 ? (
                                resumeData.experience.map((exp) => (
                                  <div
                                    key={exp.id}
                                    onClick={() => handleStartEditExperience(exp.id)}
                                    className="rounded-xl bg-[#090d16] border border-white/[0.06] p-4 flex items-start justify-between cursor-pointer hover:border-indigo-500/40 transition-colors group relative"
                                  >
                                    <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                                      <GripVertical className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                      <div className="min-w-0 space-y-1">
                                        <h4 className="font-bold text-sm text-white truncate">
                                          {exp.role && exp.company
                                            ? `${exp.role} - ${exp.company}`
                                            : (exp.role || exp.company || 'Job Title - Company')}
                                        </h4>
                                        <p className="text-xs text-slate-400 truncate">
                                          {[
                                            exp.employmentType || 'Employment Type',
                                            exp.locationType || 'Location Type',
                                            exp.location || 'Location'
                                          ].join(' | ')}
                                        </p>
                                        <p className="text-xs text-slate-400 pt-1 line-clamp-2 leading-relaxed">
                                          {exp.description || 'Add description about your work experience'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Action Buttons: Edit, Visibility, Delete */}
                                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditExperience(exp.id)}
                                        className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                        title="Edit Work Experience"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleToggleExperienceVisibility(exp.id, e)}
                                        className={cn(
                                          "w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer",
                                          exp.visible !== false ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-400"
                                        )}
                                        title={exp.visible !== false ? "Hide from resume" : "Show on resume"}
                                      >
                                        {exp.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleDeleteExperience(exp.id, e)}
                                        className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-rose-500/80 hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                        title="Delete Work Experience"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div
                                  onClick={handleAddNewExperience}
                                  className="rounded-xl bg-[#090d16] border border-white/[0.06] p-4 flex items-start justify-between cursor-pointer hover:border-indigo-500/40 transition-colors group relative"
                                >
                                  <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                                    <GripVertical className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                    <div className="min-w-0 space-y-1">
                                      <h4 className="font-bold text-sm text-white truncate">Job Title - Company</h4>
                                      <p className="text-xs text-slate-400 truncate">Employment Type | Location Type | Location</p>
                                      <p className="text-xs text-slate-400 pt-1 line-clamp-2 leading-relaxed">
                                        Add description about your work experience
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={handleAddNewExperience}
                                      className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                      title="Edit Work Experience"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-rose-500/80 hover:text-rose-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* + Add work experience button */}
                              <button
                                type="button"
                                onClick={handleAddNewExperience}
                                className="w-full py-3 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-900/30 to-indigo-950/40 hover:from-indigo-900/60 hover:to-purple-800/50 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg mt-2"
                              >
                                <Plus className="w-4 h-4 text-indigo-400" />
                                <span>+ Add work experience</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. EDUCATION (Image 1 Exact Match with 1 ATS issue found) */}
                      {resumeData.activeSections.includes('education') && (
                        <div className="space-y-0">
                          {/* ATS Issue Banner (Exact Image 1 Match) */}
                          <div className="rounded-t-2xl bg-[#2a1705] border border-amber-600/40 px-4 py-1.5 flex items-center gap-2 text-amber-500 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>1 ATS issue found</span>
                          </div>

                          {/* Card Body */}
                          <div className="rounded-b-2xl border border-amber-600/40 border-t-0 bg-[#0c1020] overflow-hidden transition-all duration-300 relative shadow-lg">
                            {/* Left glowing neon vertical aura */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.85)] z-20" />
                            <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                            <div
                              onClick={() => toggleAccordion('education')}
                              className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                            >
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                                <GraduationCap className="w-5 h-5 text-indigo-300 shrink-0" />
                                <div className="flex items-baseline gap-2">
                                  <span className="text-[14.5px] font-semibold text-white tracking-tight">Education</span>
                                  <span className="text-slate-300 font-mono text-[13px] font-normal">
                                    [{resumeData.education.filter(e => e.visible !== false).length}/{resumeData.education.length}]
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => toggleSection('education')}
                                  className="p-1.5 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-slate-700 text-xs select-none">|</span>
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion('education')}
                                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title={expandedSections.education ? 'Collapse' : 'Expand'}
                                >
                                  <ChevronDown
                                    className={cn(
                                      'w-4 h-4 text-slate-400 transition-transform duration-200',
                                      expandedSections.education ? 'rotate-180' : ''
                                    )}
                                  />
                                </button>
                              </div>
                            </div>

                            {expandedSections.education && (
                              <div className="p-4 pt-0 border-t border-white/[0.04] pt-3 space-y-3 relative z-10">
                                {resumeData.education.length > 0 ? (
                                  resumeData.education.map((edu) => (
                                    <div
                                      key={edu.id}
                                      onClick={() => handleStartEditEducation(edu.id)}
                                      className="rounded-xl bg-[#090d16] border border-white/[0.06] p-4 flex items-start justify-between cursor-pointer hover:border-indigo-500/40 transition-colors group relative"
                                    >
                                      <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                                        <GripVertical className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                        <div className="min-w-0 space-y-1">
                                          <h4 className="font-bold text-sm text-white truncate">
                                            {edu.institution && edu.degree
                                              ? `${edu.institution} - ${edu.degree}`
                                              : (edu.institution || edu.degree || 'Institution - Degree')}
                                          </h4>
                                          <p className="text-xs text-slate-400 pt-1 line-clamp-2 leading-relaxed">
                                            {edu.description || edu.details || 'Add description about your education'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Action Buttons: Edit, Visibility, Delete */}
                                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditEducation(edu.id)}
                                          className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                          title="Edit Education"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => handleToggleEducationVisibility(edu.id, e)}
                                          className={cn(
                                            "w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer",
                                            edu.visible !== false ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-400"
                                          )}
                                          title={edu.visible !== false ? "Hide from resume" : "Show on resume"}
                                        >
                                          {edu.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteEducation(edu.id, e)}
                                          className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-rose-500/80 hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                          title="Delete Education"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div
                                    onClick={handleAddNewEducation}
                                    className="rounded-xl bg-[#090d16] border border-white/[0.06] p-4 flex items-start justify-between cursor-pointer hover:border-indigo-500/40 transition-colors group relative"
                                  >
                                    <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                                      <GripVertical className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                      <div className="min-w-0 space-y-1">
                                        <h4 className="font-bold text-sm text-white truncate">Institution - Degree</h4>
                                        <p className="text-xs text-slate-400 pt-1 line-clamp-2 leading-relaxed">
                                          Add description about your education
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={handleAddNewEducation}
                                        className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                        title="Edit Education"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-rose-500/80 hover:text-rose-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* + Add education button */}
                                <button
                                  type="button"
                                  onClick={handleAddNewEducation}
                                  className="w-full py-3 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-900/30 to-indigo-950/40 hover:from-indigo-900/60 hover:to-purple-800/50 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg mt-2"
                                >
                                  <Plus className="w-4 h-4 text-indigo-400" />
                                  <span>+ Add education</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 5. PROJECTS (Image 1 Exact Match) */}
                      {resumeData.activeSections.includes('projects') && (
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] overflow-hidden transition-all duration-300 relative shadow-lg">
                          {/* Left glowing neon vertical aura */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.85)] z-20" />
                          <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                          <div
                            onClick={() => toggleAccordion('projects')}
                            className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                              <Rocket className="w-5 h-5 text-indigo-300 shrink-0" />
                              <div className="flex items-baseline gap-2">
                                <span className="text-[14.5px] font-semibold text-white tracking-tight">Projects</span>
                                <span className="text-slate-300 font-mono text-[13px] font-normal">
                                  [{Math.max(1, resumeData.projects.length)}/{Math.max(1, resumeData.projects.length)}]
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleSection('projects')}
                                className="p-1.5 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-700 text-xs select-none">|</span>
                              <button
                                type="button"
                                onClick={() => toggleAccordion('projects')}
                                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title={expandedSections.projects ? 'Collapse' : 'Expand'}
                              >
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                                    expandedSections.projects ? 'rotate-180' : ''
                                  )}
                                />
                              </button>
                            </div>
                          </div>

                          {expandedSections.projects && (
                            <div className="p-4 pt-0 border-t border-white/[0.04] pt-3 space-y-3 relative z-10">
                              {resumeData.projects.length > 0 ? (
                                resumeData.projects.map((proj) => (
                                  <div
                                    key={proj.id}
                                    onClick={() => handleStartEditProject(proj.id)}
                                    className="rounded-xl bg-[#090d16] border border-white/[0.06] p-4 flex items-start justify-between cursor-pointer hover:border-indigo-500/40 transition-colors group relative"
                                  >
                                    <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                                      <GripVertical className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                      <div className="min-w-0 space-y-1">
                                        <h4 className="font-bold text-sm text-white truncate">
                                          {proj.title || 'Project Name'}
                                        </h4>
                                        <p className="text-xs text-slate-400 pt-1 line-clamp-2 leading-relaxed">
                                          {proj.description || 'Add description about the project'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Action Buttons: Edit, Visibility, Delete */}
                                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditProject(proj.id)}
                                        className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                        title="Edit Project"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleToggleProjectVisibility(proj.id, e)}
                                        className={cn(
                                          "w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer",
                                          proj.visible !== false ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-400"
                                        )}
                                        title={proj.visible !== false ? "Hide from resume" : "Show on resume"}
                                      >
                                        {proj.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleDeleteProject(proj.id, e)}
                                        className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-rose-500/80 hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                        title="Delete Project"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div
                                  onClick={handleAddNewProject}
                                  className="rounded-xl bg-[#090d16] border border-white/[0.06] p-4 flex items-start justify-between cursor-pointer hover:border-indigo-500/40 transition-colors group relative"
                                >
                                  <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                                    <GripVertical className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                    <div className="min-w-0 space-y-1">
                                      <h4 className="font-bold text-sm text-white truncate">Project Name</h4>
                                      <p className="text-xs text-slate-400 pt-1 line-clamp-2 leading-relaxed">
                                        Add description about the project
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={handleAddNewProject}
                                      className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                      title="Edit Project"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-rose-500/80 hover:text-rose-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* + Add project button */}
                              <button
                                type="button"
                                onClick={handleAddNewProject}
                                className="w-full py-3 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-900/30 to-indigo-950/40 hover:from-indigo-900/60 hover:to-purple-800/50 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg mt-2"
                              >
                                <Plus className="w-4 h-4 text-indigo-400" />
                                <span>+ Add project</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 6. SKILLS (Image 1 Exact Match with 1 ATS issue found) */}
                      {resumeData.activeSections.includes('skills') && (
                        <div className="space-y-0">
                          {/* ATS Issue Banner (Exact Image 1 Match) */}
                          <div className="rounded-t-2xl bg-[#2a1705] border border-amber-600/40 px-4 py-1.5 flex items-center gap-2 text-amber-500 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>1 ATS issue found</span>
                          </div>

                          {/* Card Body */}
                          <div className="rounded-b-2xl border border-amber-600/40 border-t-0 bg-[#0c1020] overflow-hidden transition-all duration-300 relative shadow-lg">
                            {/* Left glowing neon vertical aura */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.85)] z-20" />
                            <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                            <div
                              onClick={() => toggleAccordion('skills')}
                              className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                            >
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                                <Zap className="w-5 h-5 text-indigo-300 shrink-0" />
                                <span className="text-[14.5px] font-semibold text-white tracking-tight">Skills</span>
                              </div>
                              <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => toggleSection('skills')}
                                  className="p-1.5 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-slate-700 text-xs select-none">|</span>
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion('skills')}
                                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title={expandedSections.skills ? 'Collapse' : 'Expand'}
                                >
                                  <ChevronDown
                                    className={cn(
                                      'w-4 h-4 text-slate-400 transition-transform duration-200',
                                      expandedSections.skills ? 'rotate-180' : ''
                                    )}
                                  />
                                </button>
                              </div>
                            </div>

                            {expandedSections.skills && (
                              <div className="p-4 pt-0 border-t border-white/[0.04] pt-3 space-y-3 relative z-10">
                                {[
                                  ...DEFAULT_SKILL_CATEGORIES.map((c) => ({
                                    key: c.key,
                                    name: c.name,
                                    skills: normalizeSkillsToString((resumeData.skills as any)?.[c.key])
                                  })),
                                  ...(Array.isArray(resumeData.skills?.customCategories)
                                    ? resumeData.skills.customCategories.map((c) => ({
                                      key: c.id,
                                      name: c.name,
                                      skills: normalizeSkillsToString(c.skills)
                                    }))
                                    : [])
                                ].map((cat) => {
                                  const rawVal = (resumeData.skills as any)?.[cat.key];
                                  const displayStr = typeof rawVal === 'string' ? rawVal : (cat.skills || '');
                                  return (
                                    <div
                                      key={cat.key}
                                      onClick={() => handleStartEditSkills(cat.key)}
                                      className="rounded-xl bg-[#090d16] border border-white/[0.06] p-3 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition-colors group relative"
                                    >
                                      <div className="min-w-0 flex-1 pr-3">
                                        <h5 className="text-xs font-bold text-white mb-0.5">{cat.name}</h5>
                                        <p className="text-[11px] text-slate-400 truncate">
                                          {displayStr && displayStr.trim()
                                            ? displayStr.trim()
                                            : `No ${cat.name.toLowerCase()} added yet`}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditSkills(cat.key)}
                                          className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                          title={`Edit ${cat.name}`}
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* + Add / Manage skills button */}
                                <button
                                  type="button"
                                  onClick={() => handleStartEditSkills()}
                                  className="w-full py-3 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-900/30 to-indigo-950/40 hover:from-indigo-900/60 hover:to-purple-800/50 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg mt-2"
                                >
                                  <Plus className="w-4 h-4 text-indigo-400" />
                                  <span>+ Add / Manage skills</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 7. CERTIFICATIONS */}
                      {resumeData.activeSections.includes('certifications') && (
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] overflow-hidden transition-all duration-300 relative shadow-lg">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.85)] z-20" />
                          <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                          <div
                            onClick={() => toggleAccordion('certifications')}
                            className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                              <Award className="w-5 h-5 text-indigo-300 shrink-0" />
                              <span className="text-[14.5px] font-semibold text-white tracking-tight">Certifications</span>
                            </div>
                            <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSection('certifications');
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-700 text-xs select-none">|</span>
                              <ChevronDown
                                className={cn(
                                  'w-4 h-4 text-slate-400 transition-transform duration-200',
                                  expandedSections.certifications ? 'rotate-180' : ''
                                )}
                              />
                            </div>
                          </div>

                          {expandedSections.certifications && (
                            <div className="p-4 pt-0 space-y-3 border-t border-white/[0.04] pt-3 relative z-10">
                              {resumeData.certifications.map((cert, idx) => (
                                <div key={cert.id} className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-2.5 relative">
                                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                                    <span className="text-[11px] font-semibold text-indigo-400">Certification #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdate((p) => ({
                                          ...p,
                                          certifications: p.certifications.filter((_, i) => i !== idx)
                                        }))
                                      }
                                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                                      title="Delete Certificate"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div>
                                    <label className="text-[10.5px] font-medium text-slate-400 block mb-1">Certification Title</label>
                                    <input
                                      type="text"
                                      value={cert.title}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        handleUpdate((p) => {
                                          const list = [...p.certifications];
                                          list[idx].title = v;
                                          return { ...p, certifications: list };
                                        });
                                      }}
                                      placeholder="Certification Title (e.g. NPTEL Elite Certification - Introduction to Information Retrieval)"
                                      className="w-full bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10.5px] font-medium text-slate-400 block mb-1">Issuer / Organization</label>
                                      <input
                                        type="text"
                                        value={cert.issuer || ''}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          handleUpdate((p) => {
                                            const list = [...p.certifications];
                                            list[idx].issuer = v;
                                            return { ...p, certifications: list };
                                          });
                                        }}
                                        placeholder="Issuer (e.g. NPTEL)"
                                        className="w-full bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-medium text-slate-400 block mb-1">Issue Date</label>
                                      <input
                                        type="text"
                                        value={cert.issueDate || ''}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          handleUpdate((p) => {
                                            const list = [...p.certifications];
                                            list[idx].issueDate = v;
                                            return { ...p, certifications: list };
                                          });
                                        }}
                                        placeholder="e.g. 2023 or Sep 2023"
                                        className="w-full bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                      <label className="text-[10.5px] font-medium text-slate-400 block mb-1">Certificate URL / Link</label>
                                      <input
                                        type="text"
                                        value={cert.link || ''}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          handleUpdate((p) => {
                                            const list = [...p.certifications];
                                            list[idx].link = v;
                                            return { ...p, certifications: list };
                                          });
                                        }}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-medium text-slate-400 block mb-1">Link Text</label>
                                      <input
                                        type="text"
                                        value={cert.linkLabel || 'View Certificate'}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          handleUpdate((p) => {
                                            const list = [...p.certifications];
                                            list[idx].linkLabel = v;
                                            return { ...p, certifications: list };
                                          });
                                        }}
                                        placeholder="View Certificate"
                                        className="w-full bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10.5px] font-medium text-slate-400 block mb-1">Highlights / Bullet Points</label>
                                    <textarea
                                      rows={3}
                                      value={cert.description || ''}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        handleUpdate((p) => {
                                          const list = [...p.certifications];
                                          list[idx].description = v;
                                          return { ...p, certifications: list };
                                        });
                                      }}
                                      placeholder="• Key learnings, topics covered, or score achieved"
                                      className="w-full bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none font-sans"
                                    />
                                  </div>
                                </div>
                              ))}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  handleUpdate((p) => ({
                                    ...p,
                                    certifications: [
                                      ...p.certifications,
                                      {
                                        id: `cert-${Date.now()}`,
                                        title: '',
                                        issuer: '',
                                        issueDate: '',
                                        link: '',
                                        linkLabel: 'View Certificate',
                                        description: '',
                                        visible: true
                                      }
                                    ]
                                  }))
                                }
                                leftIcon={<Plus className="w-3.5 h-3.5" />}
                                className="w-full text-xs font-bold cursor-pointer"
                              >
                                Add Certificate
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 8. AWARDS & ACHIEVEMENTS */}
                      {resumeData.activeSections.includes('awards') && (
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] overflow-hidden transition-all duration-300 relative shadow-lg">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.85)] z-20" />
                          <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                          <div
                            onClick={() => toggleAccordion('awards')}
                            className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                              <Trophy className="w-5 h-5 text-indigo-300 shrink-0" />
                              <span className="text-[14.5px] font-semibold text-white tracking-tight">Awards & Achievements</span>
                            </div>
                            <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSection('awards');
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-700 text-xs select-none">|</span>
                              <ChevronDown
                                className={cn(
                                  'w-4 h-4 text-slate-400 transition-transform duration-200',
                                  expandedSections.awards ? 'rotate-180' : ''
                                )}
                              />
                            </div>
                          </div>

                          {expandedSections.awards && (
                            <div className="p-4 pt-0 space-y-3 border-t border-white/[0.04] pt-3 relative z-10">
                              {resumeData.awards.map((award, idx) => (
                                <div key={award.id} className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2 relative">
                                  <button
                                    onClick={() =>
                                      handleUpdate((p) => ({
                                        ...p,
                                        awards: p.awards.filter((_, i) => i !== idx)
                                      }))
                                    }
                                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <input
                                    type="text"
                                    value={award.title}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      handleUpdate((p) => {
                                        const list = [...p.awards];
                                        list[idx].title = v;
                                        return { ...p, awards: list };
                                      });
                                    }}
                                    placeholder="Award / Competition Name"
                                    className="w-full bg-[#0d121f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                              ))}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  handleUpdate((p) => ({
                                    ...p,
                                    awards: [
                                      ...p.awards,
                                      {
                                        id: `award-${Date.now()}`,
                                        title: '',
                                        issuer: '',
                                        year: '',
                                        description: ''
                                      }
                                    ]
                                  }))
                                }
                                leftIcon={<Plus className="w-3.5 h-3.5" />}
                                className="w-full text-xs font-bold cursor-pointer"
                              >
                                Add Award
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 9. CUSTOM SECTION (Image 1 Exact Match) */}
                      {resumeData.activeSections.includes('custom') && (
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c101d] overflow-hidden transition-all duration-300 relative shadow-lg">
                          {/* Left glowing neon vertical aura */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_14px_rgba(168,85,247,0.85)] z-20" />
                          <div className="absolute -left-6 top-0 bottom-0 w-28 bg-purple-600/15 blur-xl pointer-events-none z-10" />

                          {/* Accordion Header */}
                          <div
                            onClick={() => toggleAccordion('custom')}
                            className="flex items-center justify-between p-4 pl-5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                              <div className="w-6 h-6 flex items-center justify-center text-purple-400">
                                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M19.439 7.85c0-1.57.973-2.85 2.172-2.85v-.01a2.85 2.85 0 0 0-2.85-2.85H15.91a2.85 2.85 0 0 0-2.85 2.17 2.85 2.85 0 0 1-5.7 0 2.85 2.85 0 0 0-2.85-2.17H1.66A2.85 2.85 0 0 0-1.19 4.99v.01c1.2 0 2.172 1.28 2.172 2.85s-.973 2.85-2.172 2.85v.01a2.85 2.85 0 0 0 2.85 2.85h2.85a2.85 2.85 0 0 0 2.85-2.17 2.85 2.85 0 0 1 5.7 0 2.85 2.85 0 0 0 2.85 2.17h2.85a2.85 2.85 0 0 0 2.85-2.85v-.01c-1.2 0-2.172-1.28-2.172-2.85z" />
                                </svg>
                              </div>
                              <span className="text-[14.5px] font-semibold text-white tracking-tight">
                                {resumeData.customSection?.title || 'Custom Section'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleSection('custom')}
                                className="p-1.5 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-700 text-xs select-none">|</span>
                              <button
                                type="button"
                                onClick={() => toggleAccordion('custom')}
                                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title={expandedSections.custom ? 'Collapse' : 'Expand'}
                              >
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                                    expandedSections.custom ? 'rotate-180' : ''
                                  )}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Body (Image 1) */}
                          {expandedSections.custom && (
                            <div className="p-4 pt-1 space-y-3.5 border-t border-white/[0.04] relative z-10">
                              {/* Paragraph format toggle switch */}
                              <div className="flex items-center justify-end gap-2 text-xs">
                                <span className="text-slate-300 text-[12px] font-medium">Use paragraph format</span>
                                <div className="group/tooltip relative inline-flex items-center text-slate-400 hover:text-white cursor-help">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                  </svg>
                                  <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:block bg-slate-900 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap z-30">
                                    Toggle continuous paragraph formatting
                                  </div>
                                </div>
                                {/* iOS-style toggle */}
                                <button
                                  type="button"
                                  onClick={() => setUseParagraphFormat(!useParagraphFormat)}
                                  className={cn(
                                    'w-9 h-5 rounded-full transition-colors relative cursor-pointer focus:outline-none p-0.5',
                                    useParagraphFormat ? 'bg-purple-600' : 'bg-slate-700'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm',
                                      useParagraphFormat ? 'translate-x-4' : 'translate-x-0'
                                    )}
                                  />
                                </button>
                              </div>

                              {/* Inner Content Card with Edit Pencil */}
                              <div
                                onClick={handleStartEditCustomSection}
                                className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800/80 hover:border-indigo-500/50 transition-all flex items-center justify-between cursor-pointer group/item shadow-inner"
                              >
                                <p className="text-xs text-slate-300 group-hover/item:text-white transition-colors truncate max-w-[85%]">
                                  {resumeData.customSection?.content || 'Add description about your award or achievement'}
                                </p>
                                <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 group-hover/item:text-white group-hover/item:border-indigo-500 flex items-center justify-center transition-colors shrink-0">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* ── TAB 2: CUSTOMIZE TEMPLATE ──────────────────────── */}
              {activeTab === 'customization' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-2">
                    <h2 className="text-xl font-black text-white tracking-tight">Customize Template</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToDefaultLayout}
                      className="text-xs font-bold"
                    >
                      Reset to default
                    </Button>
                  </div>

                  {/* Accordion 1: Choose a template (Spacious Image 2 Match) */}
                  <div className="rounded-2xl border border-slate-800/90 bg-[#0c101d] relative overflow-hidden transition-all duration-300 hover:border-slate-700 shadow-md group">
                    {/* Top-Left Glowing Ambient Aura & Corner Highlight */}
                    <div className="absolute -top-10 -left-10 w-44 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute top-0 left-0 w-28 h-[1.5px] bg-gradient-to-r from-blue-400 via-blue-500/60 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-[1.5px] h-14 bg-gradient-to-b from-blue-400 via-blue-500/60 to-transparent pointer-events-none" />

                    <div
                      onClick={() =>
                        setCustomizationAccordion((p) => ({ ...p, templates: !p.templates }))
                      }
                      className="flex items-center justify-between py-5 px-6 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="9" y1="3" x2="9" y2="21" />
                            <line x1="9" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="15" x2="21" y2="15" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <span className="text-[14.5px] font-semibold text-slate-100 tracking-tight block">Choose a template</span>
                          <span className="text-xs text-slate-400 font-normal block mt-0.5">Get started with a template and then customize it easily</span>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-slate-400 transition-transform duration-200',
                          customizationAccordion.templates ? 'rotate-180' : ''
                        )}
                      />
                    </div>

                    {customizationAccordion.templates && (
                      <div className="p-4 pt-0 border-t border-white/[0.04] space-y-3">
                        {/* Horizontal Template Carousel */}
                        <div
                          ref={templateCarouselRef}
                          onScroll={(e) => {
                            const el = e.currentTarget;
                            const maxScroll = el.scrollWidth - el.clientWidth;
                            if (maxScroll > 0) {
                              setTemplateScrollProgress(el.scrollLeft / maxScroll);
                            }
                          }}
                          className="flex gap-3 pt-3 overflow-x-auto scrollbar-none no-scrollbar scroll-smooth"
                        >
                          {[
                            {
                              id: 'low',
                              name: 'Low'
                            },
                            {
                              id: 'medium',
                              name: 'Medium'
                            },
                            {
                              id: 'bulky',
                              name: 'Bulky'
                            },
                            {
                              id: 'mit',
                              name: 'MIT'
                            }
                          ].map((tmpl) => {
                            const isSelected = resumeData.template === tmpl.id;
                            return (
                              <div
                                key={tmpl.id}
                                onClick={() => handleUpdate((p) => ({ ...p, template: tmpl.id as any }))}
                                className={cn(
                                  'w-[130px] shrink-0 flex flex-col items-center justify-between rounded-xl overflow-hidden cursor-pointer transition-all border bg-black shadow-lg',
                                  isSelected
                                    ? 'border-2 border-purple-500 ring-2 ring-purple-500/50'
                                    : 'border-slate-800 hover:border-slate-700 opacity-90 hover:opacity-100'
                                )}
                              >
                                {/* Miniature Document Preview Box */}
                                <div className="w-full h-32 bg-white p-1.5 flex flex-col justify-between overflow-hidden shadow-sm pointer-events-none text-left select-none font-serif leading-none">
                                  {tmpl.id === 'low' ? (
                                    <div className="space-y-1 w-full">
                                      {/* Low: Blue titlecase/lowercase name, blue headings */}
                                      <div className="text-center">
                                        <div className="text-[6.5px] font-bold text-blue-700 tracking-tight">Vicky Gupta</div>
                                        <div className="text-[3px] text-gray-500 italic mt-0.5">Software Developer</div>
                                        <div className="text-[3px] text-gray-600 mt-0.5">☎ 9347840962 | ✉ email | LinkedIn</div>
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-blue-700 border-b border-blue-600 pb-0.5 uppercase">WORK EXPERIENCE</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                        <div className="h-0.5 w-4/5 bg-gray-200 mt-0.5" />
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-blue-700 border-b border-blue-600 pb-0.5 uppercase">EDUCATION</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                        <div className="h-0.5 w-3/4 bg-gray-200 mt-0.5" />
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-blue-700 border-b border-blue-600 pb-0.5 uppercase">PROJECTS</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                      </div>
                                    </div>
                                  ) : tmpl.id === 'medium' ? (
                                    <div className="space-y-1 w-full">
                                      {/* Medium: Black name, black headings */}
                                      <div className="text-center">
                                        <div className="text-[6.5px] font-bold text-slate-900 tracking-wider uppercase">VICKY GUPTA</div>
                                        <div className="text-[3px] text-gray-500 italic mt-0.5">Software Developer</div>
                                        <div className="text-[3px] text-gray-600 mt-0.5">☎ [Phone] ✉ [Email] 📍 [Location]</div>
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-slate-900 border-b border-black pb-0.5 uppercase">WORK EXPERIENCE</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                        <div className="h-0.5 w-4/5 bg-gray-200 mt-0.5" />
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-slate-900 border-b border-black pb-0.5 uppercase">EDUCATION</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                        <div className="h-0.5 w-3/4 bg-gray-200 mt-0.5" />
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-slate-900 border-b border-black pb-0.5 uppercase">PROJECTS</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                      </div>
                                    </div>
                                  ) : tmpl.id === 'bulky' ? (
                                    <div className="space-y-1 w-full">
                                      {/* Bulky: Black name, blue headings, 4-column table */}
                                      <div className="text-center">
                                        <div className="text-[6.5px] font-bold text-slate-900 tracking-wider uppercase">VICKY GUPTA</div>
                                        <div className="text-[3px] text-gray-500 italic mt-0.5">Software Developer</div>
                                        <div className="text-[3px] text-gray-600 mt-0.5">9347840962 | ✉ email | 📍 location</div>
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-blue-700 border-b border-blue-600 pb-0.5 uppercase">EDUCATION</div>
                                        {/* Miniature 4-column table */}
                                        <div className="border border-black text-[2.8px] grid grid-cols-4 text-center my-0.5 leading-tight">
                                          <div className="border-r border-b border-black font-bold">Year</div>
                                          <div className="border-r border-b border-black font-bold">Degree</div>
                                          <div className="border-r border-b border-black font-bold">Institute</div>
                                          <div className="border-b border-black font-bold">CGPA</div>
                                          <div className="border-r border-black">2024</div>
                                          <div className="border-r border-black">B.Tech</div>
                                          <div className="border-r border-black">IIT</div>
                                          <div>8.8</div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-blue-700 border-b border-blue-600 pb-0.5 uppercase">WORK EXPERIENCE</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                        <div className="h-0.5 w-3/4 bg-gray-200 mt-0.5" />
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-blue-700 border-b border-blue-600 pb-0.5 uppercase">SKILLS</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 w-full">
                                      {/* MIT: Centered classic academic style */}
                                      <div className="text-center border-b border-black pb-0.5">
                                        <div className="text-[6.5px] font-bold text-slate-900 tracking-wider">FIRST NAME LAST NAME</div>
                                        <div className="text-[2.8px] text-gray-600">Cambridge, MA • email@mit.edu • 555-0199</div>
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-slate-900 uppercase">EDUCATION</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-slate-900 uppercase">EXPERIENCE</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                        <div className="h-0.5 w-4/5 bg-gray-200 mt-0.5" />
                                      </div>
                                      <div>
                                        <div className="text-[4.5px] font-bold text-slate-900 uppercase">PUBLICATIONS</div>
                                        <div className="h-0.5 w-full bg-gray-200 mt-0.5" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full bg-black py-1 text-center text-xs font-bold text-white border-t border-slate-900">
                                  {tmpl.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Scroll Progress Bar Track (Images 1, 2, 3 Match) */}
                        <div className="w-full bg-slate-950 h-1 rounded-full relative overflow-hidden mt-1 mb-2">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-150"
                            style={{
                              width: '40%',
                              transform: `translateX(${templateScrollProgress * 150}%)`
                            }}
                          />
                        </div>

                        {/* Bottom Buttons: View all ↗, College Templates, <, > (Images 1, 2, 3 Match) */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => showToast({ type: 'info', title: 'Templates', message: 'Showing all ATS-friendly templates.' })}
                              className="border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>View all</span>
                              <span className="text-[11px]">↗</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdate((p) => ({ ...p, template: 'mit' as any }));
                                showToast({ type: 'info', title: 'College Templates', message: 'Selected College / Academic template format.' });
                              }}
                              className="border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              College Templates
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (templateCarouselRef.current) {
                                  templateCarouselRef.current.scrollBy({ left: -160, behavior: 'smooth' });
                                }
                              }}
                              className="w-7 h-7 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer text-xs"
                              title="Previous templates"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (templateCarouselRef.current) {
                                  templateCarouselRef.current.scrollBy({ left: 160, behavior: 'smooth' });
                                }
                              }}
                              className="w-7 h-7 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer text-xs"
                              title="Next templates"
                            >
                              ›
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Pre-built Layouts (Spacious Image 2 Match) */}
                  <div className="rounded-2xl border border-slate-800/90 bg-[#0c101d] relative overflow-hidden transition-all duration-300 hover:border-slate-700 shadow-md group">
                    {/* Top-Left Glowing Ambient Aura & Corner Highlight */}
                    <div className="absolute -top-10 -left-10 w-44 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute top-0 left-0 w-28 h-[1.5px] bg-gradient-to-r from-cyan-400 via-cyan-500/60 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-[1.5px] h-14 bg-gradient-to-b from-cyan-400 via-cyan-500/60 to-transparent pointer-events-none" />

                    <div
                      onClick={() =>
                        setCustomizationAccordion((p) => ({ ...p, layouts: !p.layouts }))
                      }
                      className="flex items-center justify-between py-5 px-6 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-5 h-5 flex items-center justify-center text-cyan-400">
                          <LayoutGrid className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[14.5px] font-medium text-slate-100 tracking-tight">Pre-built Layouts</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-slate-400 transition-transform duration-200',
                          customizationAccordion.layouts ? 'rotate-180' : ''
                        )}
                      />
                    </div>

                    {customizationAccordion.layouts && (() => {
                      const currentPreset = PRESET_LAYOUTS.find((p) => p.step === layoutStep) || PRESET_LAYOUTS[4];
                      return (
                        <div className="p-4 pt-0 border-t border-white/[0.04] space-y-4">
                          {/* 1. Active Preset Header Row */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-white stroke-[2.5]" />
                              <span className="text-sm font-bold text-white tracking-tight">
                                {currentPreset.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-slate-300">
                              {layoutStep} / 9
                            </span>
                          </div>

                          {/* 2. 9-Step Stepper Slider */}
                          <div className="space-y-2.5">
                            {/* Track Container with Thumb */}
                            <div className="relative flex items-center w-full h-3 bg-slate-900/90 rounded-full border border-white/20 px-1">
                              <input
                                type="range"
                                min="1"
                                max="9"
                                step="1"
                                value={layoutStep}
                                onChange={(e) => applyLayoutStep(parseInt(e.target.value))}
                                className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              {/* Purple Thumb Knob */}
                              <div
                                className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md ring-2 ring-purple-400/60 absolute top-1/2 -translate-y-1/2 transition-all pointer-events-none"
                                style={{
                                  left: `calc(${((layoutStep - 1) / 8) * 100}% - ${(layoutStep - 1) * 2.2}px)`
                                }}
                              />
                            </div>

                            {/* 9 White Step Dots */}
                            <div className="flex justify-between items-center px-1">
                              {PRESET_LAYOUTS.map((p) => (
                                <div
                                  key={p.step}
                                  onClick={() => applyLayoutStep(p.step)}
                                  className={cn(
                                    'w-1.5 h-1.5 rounded-full cursor-pointer transition-all',
                                    layoutStep === p.step ? 'bg-purple-400 ring-2 ring-purple-400/50' : 'bg-white hover:opacity-100 opacity-90'
                                  )}
                                />
                              ))}
                            </div>

                            {/* 3 Text Labels: Compact | Balanced | Spacious */}
                            <div className="flex justify-between items-center text-xs text-slate-300 font-medium px-0.5">
                              <span>Compact</span>
                              <span>Balanced</span>
                              <span>Spacious</span>
                            </div>
                          </div>

                          {/* 3. 2x2 Metric Value Display Cards */}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-[#050811] border border-white/[0.06] rounded-xl p-3.5 flex flex-col justify-center space-y-1">
                              <span className="text-xs text-slate-400 font-medium">Font Size</span>
                              <span className="text-base font-bold text-white tracking-wide">{resumeData.spacing.fontSize}</span>
                            </div>
                            <div className="bg-[#050811] border border-white/[0.06] rounded-xl p-3.5 flex flex-col justify-center space-y-1">
                              <span className="text-xs text-slate-400 font-medium">Section Gap</span>
                              <span className="text-base font-bold text-white tracking-wide">{resumeData.spacing.sectionGap}</span>
                            </div>
                            <div className="bg-[#050811] border border-white/[0.06] rounded-xl p-3.5 flex flex-col justify-center space-y-1">
                              <span className="text-xs text-slate-400 font-medium">Item Spacing</span>
                              <span className="text-base font-bold text-white tracking-wide">{resumeData.spacing.itemGap}</span>
                            </div>
                            <div className="bg-[#050811] border border-white/[0.06] rounded-xl p-3.5 flex flex-col justify-center space-y-1">
                              <span className="text-xs text-slate-400 font-medium">Padding</span>
                              <span className="text-base font-bold text-white tracking-wide">{resumeData.spacing.padding}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Accordion 3: Padding & Spacing (Spacious Image 2 Match) */}
                  <div className="rounded-2xl border border-slate-800/90 bg-[#0c101d] relative overflow-hidden transition-all duration-300 hover:border-slate-700 shadow-md group">
                    {/* Top-Left Glowing Ambient Aura & Corner Highlight */}
                    <div className="absolute -top-10 -left-10 w-44 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute top-0 left-0 w-28 h-[1.5px] bg-gradient-to-r from-pink-400 via-pink-500/60 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-[1.5px] h-14 bg-gradient-to-b from-pink-400 via-pink-500/60 to-transparent pointer-events-none" />

                    <div
                      onClick={() =>
                        setCustomizationAccordion((p) => ({ ...p, spacing: !p.spacing }))
                      }
                      className="flex items-center justify-between py-5 px-6 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-5 h-5 flex items-center justify-center text-pink-400">
                          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="6" x2="20" y2="6" />
                            <line x1="4" y1="18" x2="20" y2="18" />
                            <rect x="8" y="10" width="8" height="4" rx="1" />
                          </svg>
                        </div>
                        <span className="text-[14.5px] font-medium text-slate-100 tracking-tight">Padding & Spacing</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-slate-400 transition-transform duration-200',
                          customizationAccordion.spacing ? 'rotate-180' : ''
                        )}
                      />
                    </div>

                    {customizationAccordion.spacing && (() => {
                      const getNumeric = (val: string | undefined, defaultVal: number): number => {
                        if (!val) return defaultVal;
                        const n = parseInt(val, 10);
                        return isNaN(n) ? defaultVal : n;
                      };

                      const sectionGapVal = getNumeric(resumeData.spacing.sectionGap, 13);
                      const itemGapVal = getNumeric(resumeData.spacing.itemGap, 10);

                      const basePad = getNumeric(resumeData.spacing.padding, 26);
                      const padLeft = getNumeric(resumeData.spacing.paddingLeft, basePad);
                      const padRight = getNumeric(resumeData.spacing.paddingRight, basePad);
                      const padTop = getNumeric(resumeData.spacing.paddingTop, basePad);
                      const padBottom = getNumeric(resumeData.spacing.paddingBottom, basePad);

                      const updateSectionGap = (newVal: number) => {
                        const clamped = Math.max(0, Math.min(40, newVal));
                        handleUpdate((p) => ({
                          ...p,
                          spacing: { ...p.spacing, sectionGap: `${clamped}px` }
                        }));
                      };

                      const updateItemGap = (newVal: number) => {
                        const clamped = Math.max(0, Math.min(30, newVal));
                        handleUpdate((p) => ({
                          ...p,
                          spacing: { ...p.spacing, itemGap: `${clamped}px` }
                        }));
                      };

                      const updateSidePadding = (side: 'left' | 'right' | 'top' | 'bottom', newVal: number) => {
                        const clamped = Math.max(0, Math.min(60, newVal));
                        handleUpdate((p) => {
                          const curLeft = p.spacing.paddingLeft ? getNumeric(p.spacing.paddingLeft, 26) : getNumeric(p.spacing.padding, 26);
                          const curRight = p.spacing.paddingRight ? getNumeric(p.spacing.paddingRight, 26) : getNumeric(p.spacing.padding, 26);
                          const curTop = p.spacing.paddingTop ? getNumeric(p.spacing.paddingTop, 26) : getNumeric(p.spacing.padding, 26);
                          const curBottom = p.spacing.paddingBottom ? getNumeric(p.spacing.paddingBottom, 26) : getNumeric(p.spacing.padding, 26);

                          const newL = side === 'left' ? clamped : curLeft;
                          const newR = side === 'right' ? clamped : curRight;
                          const newT = side === 'top' ? clamped : curTop;
                          const newB = side === 'bottom' ? clamped : curBottom;

                          return {
                            ...p,
                            spacing: {
                              ...p.spacing,
                              paddingLeft: `${newL}px`,
                              paddingRight: `${newR}px`,
                              paddingTop: `${newT}px`,
                              paddingBottom: `${newB}px`,
                              padding: `${newT}px ${newR}px ${newB}px ${newL}px`
                            }
                          };
                        });
                      };

                      return (
                        <div className="p-4 pt-0 border-t border-white/[0.04] space-y-6 pt-3">
                          {/* ── 1. SECTION GAPS ────────────────────────── */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-3 tracking-tight">
                              Section Gaps (Between 2 sections)
                            </h4>
                            <div className="flex items-center gap-4">
                              {/* Visual Diagram Box */}
                              <div className="w-28 h-28 shrink-0 rounded-xl bg-[#060a14] border border-white/[0.08] p-2.5 flex flex-col justify-between items-center relative select-none">
                                {/* Top Mock Section */}
                                <div className="w-full space-y-1">
                                  <div className="h-1.5 w-12 bg-indigo-400/40 rounded-xs" />
                                  <div className="h-1 w-full bg-slate-700/50 rounded-xs" />
                                  <div className="h-1 w-4/5 bg-slate-700/50 rounded-xs" />
                                </div>
                                {/* Vertical Double Arrow */}
                                <div className="text-sky-400 flex flex-col items-center justify-center my-0.5 animate-pulse">
                                  <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[4px] border-b-sky-400" />
                                  <div className="w-0.5 h-3.5 bg-sky-400" />
                                  <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4px] border-t-sky-400" />
                                </div>
                                {/* Bottom Mock Section */}
                                <div className="w-full space-y-1">
                                  <div className="h-1.5 w-12 bg-indigo-400/40 rounded-xs" />
                                  <div className="h-1 w-full bg-slate-700/50 rounded-xs" />
                                  <div className="h-1 w-4/5 bg-slate-700/50 rounded-xs" />
                                </div>
                              </div>

                              {/* Slider & Counter */}
                              <div className="flex-1 flex items-center gap-3">
                                {/* Slider Track with 11 Step Dots */}
                                <div className="relative flex items-center flex-1 h-3 bg-slate-900/90 rounded-full border border-white/20 px-1">
                                  <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    value={sectionGapVal}
                                    onChange={(e) => updateSectionGap(parseInt(e.target.value))}
                                    className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
                                  />
                                  {/* Glowing Purple Thumb */}
                                  <div
                                    className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md ring-2 ring-purple-400/60 absolute top-1/2 -translate-y-1/2 transition-all pointer-events-none"
                                    style={{
                                      left: `calc(${(Math.min(30, Math.max(0, sectionGapVal)) / 30) * 100}% - ${Math.min(30, Math.max(0, sectionGapVal)) * 0.4}px)`
                                    }}
                                  />
                                  {/* 11 subtle step dots */}
                                  <div className="w-full flex justify-between px-1 pointer-events-none">
                                    {Array.from({ length: 11 }).map((_, i) => (
                                      <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                                    ))}
                                  </div>
                                </div>

                                {/* Counter: Minus, Value, Plus */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => updateSectionGap(sectionGapVal - 1)}
                                    className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <div className="w-11 h-8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white flex items-center justify-center font-mono">
                                    {sectionGapVal}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateSectionGap(sectionGapVal + 1)}
                                    className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── 2. ITEM SPACING ────────────────────────── */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-3 tracking-tight">
                              Item Spacing
                            </h4>
                            <div className="flex items-center gap-4">
                              {/* Visual Diagram Box */}
                              <div className="w-28 h-28 shrink-0 rounded-xl bg-[#060a14] border border-white/[0.08] p-2.5 flex flex-col justify-between items-center relative select-none">
                                {/* Top Item */}
                                <div className="w-full space-y-1">
                                  <div className="h-1.5 w-14 bg-indigo-400/40 rounded-xs" />
                                  <div className="h-1 w-full bg-slate-700/50 rounded-xs" />
                                  <div className="h-1 w-3/4 bg-slate-700/50 rounded-xs" />
                                </div>
                                {/* Vertical Double Arrow */}
                                <div className="text-sky-400 flex flex-col items-center justify-center my-0.5 animate-pulse">
                                  <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[4px] border-b-sky-400" />
                                  <div className="w-0.5 h-3.5 bg-sky-400" />
                                  <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4px] border-t-sky-400" />
                                </div>
                                {/* Bottom Item */}
                                <div className="w-full space-y-1">
                                  <div className="h-1 w-full bg-slate-700/50 rounded-xs" />
                                  <div className="h-1 w-4/5 bg-slate-700/50 rounded-xs" />
                                </div>
                              </div>

                              {/* Slider & Counter */}
                              <div className="flex-1 flex items-center gap-3">
                                {/* Slider Track with 11 Step Dots */}
                                <div className="relative flex items-center flex-1 h-3 bg-slate-900/90 rounded-full border border-white/20 px-1">
                                  <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={itemGapVal}
                                    onChange={(e) => updateItemGap(parseInt(e.target.value))}
                                    className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
                                  />
                                  {/* Glowing Purple Thumb */}
                                  <div
                                    className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md ring-2 ring-purple-400/60 absolute top-1/2 -translate-y-1/2 transition-all pointer-events-none"
                                    style={{
                                      left: `calc(${(Math.min(20, Math.max(0, itemGapVal)) / 20) * 100}% - ${Math.min(20, Math.max(0, itemGapVal)) * 0.4}px)`
                                    }}
                                  />
                                  {/* 11 subtle step dots */}
                                  <div className="w-full flex justify-between px-1 pointer-events-none">
                                    {Array.from({ length: 11 }).map((_, i) => (
                                      <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                                    ))}
                                  </div>
                                </div>

                                {/* Counter: Minus, Value, Plus */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => updateItemGap(itemGapVal - 1)}
                                    className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <div className="w-11 h-8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white flex items-center justify-center font-mono">
                                    {itemGapVal}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateItemGap(itemGapVal + 1)}
                                    className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── 3. PADDING ON THE SIDE ─────────────────── */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-3 tracking-tight">
                              Padding on the side
                            </h4>
                            <div className="flex items-center gap-4">
                              {/* Visual Diagram Box with Orange Diagonal Hatching and Content Box */}
                              <div className="w-28 h-28 shrink-0 rounded-xl bg-[#060a14] border border-white/[0.08] relative overflow-hidden flex items-center justify-center select-none">
                                {/* Orange diagonal hatched left margin */}
                                <div
                                  className="absolute left-0 top-0 bottom-0 w-6 border-r border-orange-500/80"
                                  style={{
                                    background: 'repeating-linear-gradient(45deg, #f97316 0, #f97316 1.5px, transparent 1.5px, transparent 6px)'
                                  }}
                                />
                                {/* Inner Content Block */}
                                <div className="w-14 h-16 bg-indigo-950/70 border border-indigo-500/40 rounded flex items-center justify-center ml-4">
                                  <span className="text-[10.5px] font-medium text-slate-200">Content</span>
                                </div>
                              </div>

                              {/* 2x2 Grid of 4 Directional Padding Controls */}
                              <div className="flex-1 grid grid-cols-2 gap-2.5">
                                {/* Top-Left: Left Padding */}
                                <div className="bg-[#060a14] border border-slate-800 rounded-xl p-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                      <rect x="1" y="2" width="2" height="12" rx="0.5" fill="currentColor" />
                                      <rect x="5" y="4" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
                                    </svg>
                                    <span className="text-xs font-bold text-white font-mono">{padLeft}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateSidePadding('left', padLeft - 1)}
                                      className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      −
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSidePadding('left', padLeft + 1)}
                                      className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Top-Right: Right Padding */}
                                <div className="bg-[#060a14] border border-slate-800 rounded-xl p-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                      <rect x="3" y="4" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
                                      <rect x="13" y="2" width="2" height="12" rx="0.5" fill="currentColor" />
                                    </svg>
                                    <span className="text-xs font-bold text-white font-mono">{padRight}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateSidePadding('right', padRight - 1)}
                                      className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      −
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSidePadding('right', padRight + 1)}
                                      className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Bottom-Left: Top Padding */}
                                <div className="bg-[#060a14] border border-slate-800 rounded-xl p-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                      <rect x="2" y="1" width="12" height="2" rx="0.5" fill="currentColor" />
                                      <rect x="4" y="5" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
                                    </svg>
                                    <span className="text-xs font-bold text-white font-mono">{padTop}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateSidePadding('top', padTop - 1)}
                                      className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      −
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSidePadding('top', padTop + 1)}
                                      className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Bottom-Right: Bottom Padding */}
                                <div className="bg-[#060a14] border border-slate-800 rounded-xl p-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                      <rect x="4" y="3" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
                                      <rect x="2" y="13" width="12" height="2" rx="0.5" fill="currentColor" />
                                    </svg>
                                    <span className="text-xs font-bold text-white font-mono">{padBottom}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateSidePadding('bottom', padBottom - 1)}
                                      className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      −
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSidePadding('bottom', padBottom + 1)}
                                      className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Accordion 4: Text Size & Styles (Spacious Image 2 Match) */}
                  <div className="rounded-2xl border border-slate-800/90 bg-[#0c101d] relative overflow-hidden transition-all duration-300 hover:border-slate-700 shadow-md group">
                    {/* Top-Left Glowing Ambient Aura & Corner Highlight */}
                    <div className="absolute -top-10 -left-10 w-44 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute top-0 left-0 w-28 h-[1.5px] bg-gradient-to-r from-amber-400 via-amber-500/60 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-[1.5px] h-14 bg-gradient-to-b from-amber-400 via-amber-500/60 to-transparent pointer-events-none" />

                    <div
                      onClick={() =>
                        setCustomizationAccordion((p) => ({ ...p, typography: !p.typography }))
                      }
                      className="flex items-center justify-between py-5 px-6 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-5 h-5 flex items-center justify-center font-serif font-bold text-base text-amber-400">
                          T<span className="text-[11px]">T</span>
                        </div>
                        <span className="text-[14.5px] font-medium text-slate-100 tracking-tight">Text Size & Styles</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-slate-400 transition-transform duration-200',
                          customizationAccordion.typography ? 'rotate-180' : ''
                        )}
                      />
                    </div>

                    {customizationAccordion.typography && (() => {
                      const typo = resumeData.typography || DEFAULT_TYPOGRAPHY;

                      const updateTypographyLevel = (
                        level: keyof TypographyConfig,
                        key: keyof TypographyLevelConfig,
                        val: string
                      ) => {
                        handleUpdate((p) => {
                          const currentTypo = p.typography || DEFAULT_TYPOGRAPHY;
                          const updatedLevel = {
                            ...currentTypo[level],
                            [key]: val
                          };
                          const newTypo = {
                            ...currentTypo,
                            [level]: updatedLevel
                          };
                          return {
                            ...p,
                            typography: newTypo
                          };
                        });
                      };

                      const typographySections: Array<{
                        id: keyof TypographyConfig;
                        name: string;
                        defaultSize: number;
                        defaultLineHeight: number;
                      }> = [
                          { id: 'sectionHeader', name: 'Section Header', defaultSize: 18, defaultLineHeight: 1.0 },
                          { id: 'heading', name: 'Heading', defaultSize: 18, defaultLineHeight: 1.1 },
                          { id: 'subheading', name: 'Subheading', defaultSize: 17, defaultLineHeight: 1.1 },
                          { id: 'description', name: 'Description', defaultSize: 16, defaultLineHeight: 1.2 }
                        ];

                      return (
                        <div className="p-4 pt-0 border-t border-white/[0.04] space-y-5 pt-3">
                          {/* Top Bar: Quick Tips Button */}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setIsQuickTipsOpen(true)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <span className="text-amber-400 text-xs">💡</span>
                              <span>Quick Tips</span>
                            </button>
                          </div>

                          {/* 4 Typography Level Cards */}
                          {typographySections.map((sec) => {
                            const cfg = typo[sec.id] || DEFAULT_TYPOGRAPHY[sec.id];
                            const fontSizeVal = parseInt(cfg.fontSize, 10) || sec.defaultSize;
                            const lineHeightVal = parseFloat(cfg.lineHeight) || sec.defaultLineHeight;
                            const isDropdownOpen = activeFontDropdown === sec.id;

                            return (
                              <div key={sec.id} className="space-y-2">
                                <h4 className="text-sm font-semibold text-white tracking-tight">{sec.name}</h4>

                                {/* Card Container */}
                                <div className="bg-[#060a14] border border-slate-800/90 rounded-2xl p-4 space-y-4">
                                  {/* 1. Font Style Dropdown */}
                                  <div className="space-y-1.5 relative">
                                    <label className="text-xs text-slate-400 font-medium block">Font Style</label>
                                    <div
                                      onClick={() =>
                                        setActiveFontDropdown(isDropdownOpen ? null : sec.id)
                                      }
                                      className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                                    >
                                      <span style={{ fontFamily: AVAILABLE_FONTS.find((f) => f.name.toLowerCase() === cfg.fontStyle.toLowerCase())?.family || 'inherit' }}>
                                        {cfg.fontStyle}
                                      </span>
                                      <ChevronDown
                                        className={cn(
                                          'w-4 h-4 text-slate-400 transition-transform',
                                          isDropdownOpen ? 'rotate-180' : ''
                                        )}
                                      />
                                    </div>

                                    {/* Open Dropdown Menu */}
                                    {isDropdownOpen && (
                                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#070b16] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden py-1">
                                        {AVAILABLE_FONTS.map((font) => {
                                          const isSelected = font.name.toLowerCase() === cfg.fontStyle.toLowerCase();
                                          return (
                                            <div
                                              key={font.id}
                                              onClick={() => {
                                                updateTypographyLevel(sec.id, 'fontStyle', font.name);
                                                setActiveFontDropdown(null);
                                              }}
                                              className={cn(
                                                'px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors',
                                                isSelected
                                                  ? 'bg-indigo-600/20 text-white font-bold'
                                                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                                              )}
                                              style={{ fontFamily: font.family }}
                                            >
                                              <span>{font.name}</span>
                                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* 2. Font Size Stepper Slider & Counter */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs text-slate-400 font-medium block">Font Size</label>
                                    <div className="flex items-center gap-3">
                                      {/* Stepper Slider */}
                                      <div className="relative flex items-center flex-1 h-3 bg-slate-900/90 rounded-full border border-white/20 px-1">
                                        <input
                                          type="range"
                                          min="10"
                                          max="26"
                                          value={fontSizeVal}
                                          onChange={(e) =>
                                            updateTypographyLevel(sec.id, 'fontSize', `${e.target.value}px`)
                                          }
                                          className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        {/* Glowing Purple Knob */}
                                        <div
                                          className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md ring-2 ring-purple-400/60 absolute top-1/2 -translate-y-1/2 transition-all pointer-events-none"
                                          style={{
                                            left: `calc(${((fontSizeVal - 10) / 16) * 100}% - ${(fontSizeVal - 10) * 0.5}px)`
                                          }}
                                        />
                                        {/* 11 step dots */}
                                        <div className="w-full flex justify-between px-1 pointer-events-none">
                                          {Array.from({ length: 11 }).map((_, i) => (
                                            <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                                          ))}
                                        </div>
                                      </div>

                                      {/* Counter: Minus, Value, Plus */}
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateTypographyLevel(sec.id, 'fontSize', `${Math.max(8, fontSizeVal - 1)}px`)
                                          }
                                          className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                                        >
                                          −
                                        </button>
                                        <div className="w-11 h-8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white flex items-center justify-center font-mono">
                                          {fontSizeVal}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateTypographyLevel(sec.id, 'fontSize', `${Math.min(32, fontSizeVal + 1)}px`)
                                          }
                                          className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 3. Line Height Stepper Slider & Counter */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs text-slate-400 font-medium block">Line Height</label>
                                    <div className="flex items-center gap-3">
                                      {/* Stepper Slider */}
                                      <div className="relative flex items-center flex-1 h-3 bg-slate-900/90 rounded-full border border-white/20 px-1">
                                        <input
                                          type="range"
                                          min="0.8"
                                          max="2.0"
                                          step="0.1"
                                          value={lineHeightVal}
                                          onChange={(e) =>
                                            updateTypographyLevel(sec.id, 'lineHeight', parseFloat(e.target.value).toFixed(1))
                                          }
                                          className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        {/* Glowing Purple Knob */}
                                        <div
                                          className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md ring-2 ring-purple-400/60 absolute top-1/2 -translate-y-1/2 transition-all pointer-events-none"
                                          style={{
                                            left: `calc(${((lineHeightVal - 0.8) / 1.2) * 100}% - ${(lineHeightVal - 0.8) * 4}px)`
                                          }}
                                        />
                                        {/* 11 step dots */}
                                        <div className="w-full flex justify-between px-1 pointer-events-none">
                                          {Array.from({ length: 11 }).map((_, i) => (
                                            <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                                          ))}
                                        </div>
                                      </div>

                                      {/* Counter: Minus, Value, Plus */}
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateTypographyLevel(
                                              sec.id,
                                              'lineHeight',
                                              Math.max(0.8, +(lineHeightVal - 0.1).toFixed(1)).toString()
                                            )
                                          }
                                          className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                                        >
                                          −
                                        </button>
                                        <div className="w-11 h-8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white flex items-center justify-center font-mono">
                                          {lineHeightVal.toString().replace(/\.0$/, '')}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateTypographyLevel(
                                              sec.id,
                                              'lineHeight',
                                              Math.min(2.5, +(lineHeightVal + 0.1).toFixed(1)).toString()
                                            )
                                          }
                                          className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 4. Font Color Box */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs text-slate-400 font-medium block">Font Color</label>
                                    <label className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors">
                                      <input
                                        type="color"
                                        value={cfg.fontColor.startsWith('#') ? cfg.fontColor : '#000000'}
                                        onChange={(e) => updateTypographyLevel(sec.id, 'fontColor', e.target.value)}
                                        className="opacity-0 absolute w-0 h-0"
                                      />
                                      <div
                                        className="w-5 h-5 rounded border border-white/20 shadow-xs shrink-0"
                                        style={{ backgroundColor: cfg.fontColor }}
                                      />
                                      <span className="text-xs text-white font-mono">{cfg.fontColor}</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── TAB 3: ATS SCORE (Comprehensive, Accurate, Dynamic - Exact Image 1 Match) ─────────── */}
              {activeTab === 'ats-score' && (() => {
                const allSuggestions = getATSSuggestions();
                const pendingSuggestions = allSuggestions.filter(
                  s => !s.passing && !deletedSuggestionIds.has(s.id)
                );
                const completedSuggestions = allSuggestions.filter(s => s.passing);
                const deletedSuggestions = allSuggestions.filter(
                  s => !s.passing && deletedSuggestionIds.has(s.id)
                );

                const pendingCount = pendingSuggestions.length;
                const completedCount = completedSuggestions.length;
                const deletedCount = deletedSuggestions.length;

                // Total rubric points = 100
                const totalPossibleRubricWeight = 100;
                const passedWeight = completedSuggestions.reduce((sum, s) => sum + s.weight, 0);
                const atsPercent = Math.min(100, Math.round((passedWeight / totalPossibleRubricWeight) * 100));
                // Filled bars out of 32: 3 bars for blank template (matching Image 1 exactly), scaling up smoothly
                const filledBars = Math.max(completedCount > 0 ? 3 : 0, Math.round((atsPercent / 100) * 32));

                const readinessLabel =
                  atsPercent >= 90 ? 'Apply Ready' :
                    atsPercent >= 75 ? 'Almost Ready' :
                      atsPercent >= 55 ? 'Above Average' :
                        atsPercent >= 35 ? 'Needs Work' : 'Poor';

                const readinessBadgeClass =
                  atsPercent >= 90
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                    : atsPercent >= 75
                      ? 'bg-teal-950/40 border-teal-500/30 text-teal-300'
                      : atsPercent >= 55
                        ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                        : atsPercent >= 35
                          ? 'bg-orange-950/40 border-orange-500/30 text-orange-300'
                          : 'bg-[#3f1313] border-[#7f1d1d] text-[#fca5a5]';

                const severityIcon = (sev: 'error' | 'warning' | 'info') =>
                  sev === 'error' ? '🔴' : sev === 'warning' ? '🟡' : '🔵';
                const severityBadge = (sev: 'error' | 'warning' | 'info') =>
                  sev === 'error'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : sev === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                const severityLabel = (sev: 'error' | 'warning' | 'info') =>
                  sev === 'error' ? 'Critical' : sev === 'warning' ? 'Warning' : 'Tip';

                return (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white tracking-tight">ATS Score</h2>
                    </div>

                    {/* Readiness Rating Card (Exact match to Image 1: 3 red/orange bars, "Poor" badge) */}
                    <div
                      className="rounded-2xl border border-slate-800/80 p-6 space-y-4 shadow-xl relative overflow-hidden"
                      style={{
                        background: 'radial-gradient(ellipse 90% 80% at 50% -10%, rgba(99, 102, 241, 0.38) 0%, rgba(30, 27, 75, 0.5) 50%, #0c1020 100%)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-wide">Readiness Rating</h3>
                        <span className="text-xs text-slate-400 cursor-help" title="ATS Readiness score based on comprehensive evaluation">ⓘ</span>
                      </div>

                      {/* Segmented Meter (32 rounded bar pills) */}
                      <div className="flex items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-1.5 flex-1 overflow-hidden py-1">
                          {Array.from({ length: 32 }).map((_, i) => {
                            const isFilled = i < filledBars;
                            // Continuous rainbow gradient: 0 = Red (#ef4444), 8 = Orange, 16 = Yellow, 24 = Lime, 31 = Vivid Green
                            const hue = Math.round((i / 31) * 125);
                            return (
                              <div
                                key={i}
                                className="h-9 md:h-10 flex-1 min-w-[6px] max-w-[11px] rounded-full transition-all duration-300"
                                style={{
                                  backgroundColor: isFilled ? `hsl(${hue}, 95%, 52%)` : '#1e293b',
                                  boxShadow: isFilled ? `0 0 8px hsla(${hue}, 95%, 52%, 0.55)` : 'none'
                                }}
                              />
                            );
                          })}
                        </div>
                        <div className={cn('px-4 py-2.5 rounded-xl border font-bold text-xs shrink-0 shadow-sm tracking-wide', readinessBadgeClass)}>
                          {readinessLabel}
                        </div>
                      </div>
                    </div>

                    {/* Suggested Actions Card (Exact match to Image 1) */}
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-white">Suggested Actions</h3>

                      {/* Action Status Tabs (Image 1 style: Pending 3, Completed 3 [active purple pill], Deleted 0) */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAtsFilterTab('pending')}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer",
                            atsFilterTab === 'pending'
                              ? "bg-indigo-600 text-white shadow-md font-bold"
                              : "bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-white"
                          )}
                        >
                          <span>Pending</span>
                          <span className={cn(
                            "w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold",
                            atsFilterTab === 'pending' ? "bg-white text-indigo-700" : "bg-indigo-950/80 text-indigo-300"
                          )}>
                            {pendingCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAtsFilterTab('completed')}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer",
                            atsFilterTab === 'completed'
                              ? "bg-indigo-600 text-white shadow-md font-bold"
                              : "bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-white"
                          )}
                        >
                          <span>Completed</span>
                          <span className={cn(
                            "w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold",
                            atsFilterTab === 'completed' ? "bg-white text-indigo-700" : "bg-slate-800 text-slate-300"
                          )}>
                            {completedCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAtsFilterTab('deleted')}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer",
                            atsFilterTab === 'deleted'
                              ? "bg-indigo-600 text-white shadow-md font-bold"
                              : "bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-white"
                          )}
                        >
                          <span>Deleted</span>
                          <span className={cn(
                            "w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold",
                            atsFilterTab === 'deleted' ? "bg-white text-indigo-700" : "bg-slate-800 text-slate-300"
                          )}>
                            {deletedCount}
                          </span>
                        </button>
                      </div>

                      {/* ── PENDING TAB ── */}
                      {atsFilterTab === 'pending' && (
                        pendingSuggestions.length === 0 ? (
                          <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] p-8 text-center text-xs text-slate-400 space-y-2">
                            <p className="font-bold text-white text-sm">All Suggested Actions Completed! 🎉</p>
                            <p className="text-slate-400">Your resume satisfies all core ATS structure and content recommendations.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 animate-in fade-in duration-150">
                            {pendingSuggestions.map(suggestion => (
                              <div key={suggestion.id} className="rounded-2xl border border-slate-800/80 bg-[#0c1020] p-4 space-y-3 shadow-xl hover:border-slate-700/80 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={cn(
                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold',
                                        severityBadge(suggestion.severity)
                                      )}>
                                        {severityIcon(suggestion.severity)} {severityLabel(suggestion.severity)}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-medium">{suggestion.category}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white leading-snug">{suggestion.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{suggestion.reason}</p>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                    {suggestion.navigateTo && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSearchParams({ tab: 'editor' });
                                          const nav = suggestion.navigateTo;
                                          if (nav === 'personal-info') {
                                            setIsEditingPersonalInfo(true);
                                          } else if (nav === 'summary') {
                                            setIsEditingSummary(true);
                                          } else if (nav === 'experience') {
                                            if (resumeData && resumeData.experience.length > 0) {
                                              handleStartEditExperience(resumeData.experience[0].id);
                                            } else {
                                              handleAddNewExperience();
                                            }
                                          } else if (nav === 'education') {
                                            if (resumeData && resumeData.education.length > 0) {
                                              handleStartEditEducation(resumeData.education[0].id);
                                            } else {
                                              handleAddNewEducation();
                                            }
                                          } else if (nav === 'projects') {
                                            if (resumeData && resumeData.projects.length > 0) {
                                              handleStartEditProject(resumeData.projects[0].id);
                                            } else {
                                              handleAddNewProject();
                                            }
                                          } else if (nav === 'skills') {
                                            handleStartEditSkills();
                                          }
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-md cursor-pointer"
                                      >
                                        Fix →
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletedSuggestionIds(prev => new Set([...prev, suggestion.id]));
                                        showToast({ type: 'info', title: 'Suggestion dismissed', message: 'Moved to Deleted tab.' });
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                                      title="Dismiss suggestion"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReasonSuggestion(suggestion)}
                                    className="px-2.5 py-1 rounded-lg bg-[#141b30] border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                  >
                                    <span>Reason</span>
                                    <span className="text-slate-400 text-[10px] w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center font-bold">?</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}

                      {/* ── COMPLETED TAB (Exact match to Image 1: Individual cards with purple checkmark and Reason button) ── */}
                      {atsFilterTab === 'completed' && (
                        completedSuggestions.length === 0 ? (
                          <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] p-6 text-center text-xs text-slate-400">
                            <p>No checks passed yet. Start filling in your resume.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 animate-in fade-in duration-150">
                            {completedSuggestions.map(suggestion => (
                              <div
                                key={suggestion.id}
                                className="rounded-2xl border border-slate-800/80 bg-[#0c1020] p-4 transition-all hover:border-slate-700/80 shadow-lg space-y-2.5"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                    <Check className="w-3 h-3 text-white stroke-[3]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white tracking-tight leading-snug">{suggestion.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{suggestion.reason}</p>
                                  </div>
                                </div>
                                <div className="pl-8">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReasonSuggestion(suggestion)}
                                    className="px-2.5 py-1 rounded-lg bg-[#141b30] border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                  >
                                    <span>Reason</span>
                                    <span className="text-slate-400 text-[10px] w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center font-bold">?</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}

                      {/* ── DELETED TAB ── */}
                      {atsFilterTab === 'deleted' && (
                        deletedSuggestions.length === 0 ? (
                          <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] p-6 text-center text-xs text-slate-400">
                            <p>No dismissed suggestions.</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 animate-in fade-in duration-150">
                            {deletedSuggestions.map(suggestion => (
                              <div key={suggestion.id} className="rounded-2xl border border-slate-800/60 bg-[#0c1020] p-4 opacity-60 space-y-1.5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-400 font-medium line-through leading-snug">{suggestion.title}</p>
                                    <p className="text-[10px] text-slate-600 mt-0.5">{suggestion.category}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeletedSuggestionIds(prev => {
                                        const next = new Set(prev);
                                        next.delete(suggestion.id);
                                        return next;
                                      });
                                      showToast({ type: 'success', title: 'Suggestion restored', message: 'Moved back to Pending.' });
                                    }}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 transition-colors cursor-pointer shrink-0"
                                  >
                                    Restore
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── TAB 4: OPTIMIZE FOR JOB ────────────────────────── */}
              {activeTab === 'job-optimize' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white tracking-tight">Optimize For Job</h2>
                    {selectedJob && (
                      <button
                        type="button"
                        onClick={() => setIsJobDiscoveryOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Browse Jobs</span>
                      </button>
                    )}
                  </div>

                  {/* ── Active Resume Selector (Only shown after analysis started or job selected) ── */}
                  {(hasStartedAnalysis || selectedJob) && (
                  <div className="rounded-2xl border border-slate-800/80 bg-[#0a0f1e] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-slate-400">Target Resume:</span>
                          <span className="text-xs font-bold text-white truncate">
                            {resume?.fileName ? resume.fileName.replace(/\.(pdf|docx|txt)$/i, '') : 'Active Resume'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-900/50 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Active Resume
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Job description keywords will be matched and optimized across this active resume.
                        </p>
                      </div>
                    </div>

                    {availableResumes.length > 1 && (
                      <div className="relative shrink-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setIsResumeSelectorOpen(!isResumeSelectorOpen)}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between sm:justify-start gap-2 transition-all cursor-pointer"
                        >
                          <span>Switch Resume</span>
                          <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isResumeSelectorOpen ? "rotate-180" : "")} />
                        </button>

                        {isResumeSelectorOpen && (
                          <div className="absolute top-full mt-1.5 right-0 w-72 rounded-2xl bg-[#0c1222] border border-slate-700 p-2 shadow-2xl z-30 space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Select Resume to Optimize</p>
                            {availableResumes.map(r => {
                              const isCurrent = r.id === id;
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => {
                                    setIsResumeSelectorOpen(false);
                                    if (r.id !== id) {
                                      navigate(`/candidate/resume-builder/${r.id}?tab=job-optimize${selectedJobId ? `&optimize_job_id=${selectedJobId}` : ''}`);
                                    }
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer",
                                    isCurrent ? "bg-indigo-600/25 text-indigo-200 font-bold border border-indigo-500/40" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                                  )}
                                >
                                  <div className="truncate pr-2">
                                    <p className="truncate font-semibold">{r.fileName.replace(/\.[^/.]+$/, "")}</p>
                                    <p className="text-[10px] text-slate-400">{r.isPrimary ? 'Primary Active' : 'Vault Document'}</p>
                                  </div>
                                  {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  )}

                  {!selectedJob ? (
                    <>
                      {!hasStartedAnalysis ? (
                        /* ── PHASE 1 or PHASE 2: Start New Analysis OR Analyzing overlay ── */
                        /* ── PHASE 1: Idle OR PHASE 2: Analyzing animation overlay ── */
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-xl min-h-[400px] relative overflow-hidden">
                          {/* Diffused glow background */}
                          <div
                            className="absolute -top-10 inset-x-0 h-48 opacity-60 pointer-events-none"
                            style={{
                              background: isAnalyzingResume
                                ? 'radial-gradient(ellipse at 50% 80%, rgba(99, 102, 241, 0.5) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 75%)'
                                : 'radial-gradient(ellipse at 50% 80%, rgba(139, 92, 246, 0.35) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 75%)',
                              filter: 'blur(12px)'
                            }}
                          />

                          {isAnalyzingResume ? (
                            /* ── PHASE 2: Animated Analyzing Overlay ── */
                            <div className="relative z-10 w-full max-w-sm space-y-6 animate-in fade-in duration-300">
                              {/* Pulsing scanner icon */}
                              <div className="flex justify-center">
                                <div className="relative w-20 h-20">
                                  {/* Outer pulse rings */}
                                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                                  <div className="absolute inset-2 rounded-full bg-purple-500/20 animate-ping" style={{ animationDelay: '0.3s' }} />
                                  {/* Scanner icon */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
                                      <rect x="6" y="8" width="28" height="36" rx="3" fill="#1e2a44" stroke="#6366f1" strokeWidth="1.5"/>
                                      <rect x="10" y="14" width="20" height="2" rx="1" fill="#818cf8" opacity="0.8"/>
                                      <rect x="10" y="19" width="16" height="2" rx="1" fill="#818cf8" opacity="0.6"/>
                                      <rect x="10" y="24" width="20" height="2" rx="1" fill="#818cf8" opacity="0.5"/>
                                      <rect x="10" y="29" width="12" height="2" rx="1" fill="#818cf8" opacity="0.4"/>
                                      {/* Scanning line */}
                                      <line x1="4" y1={`${18 + (analyzeProgress * 0.2)}`} x2="36" y2={`${18 + (analyzeProgress * 0.2)}`} stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                                      <circle cx="38" cy="38" r="9" fill="#0e1324"/>
                                      <circle cx="38" cy="38" r="6" fill="#059669"/>
                                      <path d="M35 38l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* Steps */}
                              <div className="space-y-2 text-left w-full">
                                {[
                                  { label: 'Parsing resume content...', threshold: 0 },
                                  { label: 'Extracting skills & experience...', threshold: 30 },
                                  { label: 'Checking readiness score...', threshold: 55 },
                                  { label: 'Matching against job descriptions...', threshold: 75 },
                                  { label: 'Analysis complete!', threshold: 95 },
                                ].map((step, i) => {
                                  const done = analyzeProgress > step.threshold;
                                  const active = analyzeProgress >= step.threshold && (i === 4 ? analyzeProgress >= 95 : analyzeProgress < [0,30,55,75,95][i+1]);
                                  return (
                                    <div key={i} className={cn('flex items-center gap-2.5 text-xs transition-all duration-300', done ? 'opacity-100' : 'opacity-30')}>
                                      <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all', done ? 'bg-green-500' : 'bg-slate-700', active && !done ? 'bg-indigo-500 animate-pulse' : '')}>
                                        {done ? (
                                          <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        ) : (
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                        )}
                                      </div>
                                      <span className={cn(done ? 'text-slate-300' : 'text-slate-500', active && !done ? 'text-indigo-300' : '')}>{step.label}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Progress bar */}
                              <div className="w-full space-y-1.5">
                                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-300"
                                    style={{ width: `${analyzeProgress}%` }}
                                  />
                                </div>
                                <p className="text-[11px] text-slate-500">{analyzeProgress}% complete</p>
                              </div>
                            </div>
                          ) : (
                            /* ── PHASE 1: Initial clean state ── */
                            <>
                              {/* 3D Open Box Illustration with upward light beams */}
                              <div className="relative w-40 h-36 flex items-center justify-center">
                                <svg className="absolute -top-8 w-44 h-32 pointer-events-none opacity-75" viewBox="0 0 160 120" fill="none">
                                  <polygon points="80,110 20,0 55,0" fill="url(#homeBeam1)" opacity="0.45" />
                                  <polygon points="80,110 63,0 97,0" fill="url(#homeBeam1)" opacity="0.75" />
                                  <polygon points="80,110 105,0 140,0" fill="url(#homeBeam1)" opacity="0.45" />
                                  <defs>
                                    <linearGradient id="homeBeam1" x1="80" y1="110" x2="80" y2="0" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#c084fc" stopOpacity="0.9" />
                                      <stop offset="0.5" stopColor="#818cf8" stopOpacity="0.4" />
                                      <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                {/* 3D Box */}
                                <svg className="w-24 h-24 relative z-10 drop-shadow-2xl" viewBox="0 0 100 100" fill="none">
                                  <path d="M50 36 L86 54 L50 72 L14 54 Z" fill="#1b1d33" stroke="#6366f1" strokeWidth="1.2" />
                                  <path d="M14 54 L50 72 L50 94 L14 76 Z" fill="#131526" stroke="#4f46e5" strokeWidth="1.2" />
                                  <path d="M86 54 L50 72 L50 94 L86 76 Z" fill="#20223f" stroke="#6366f1" strokeWidth="1.2" />
                                  <path d="M14 54 L50 36 L38 22 L4 40 Z" fill="#2b2854" stroke="#818cf8" strokeWidth="1" />
                                  <path d="M86 54 L50 36 L62 22 L96 40 Z" fill="#353163" stroke="#a78bfa" strokeWidth="1" />
                                  <ellipse cx="50" cy="48" rx="14" ry="7" fill="#c084fc" opacity="0.8" filter="blur(2px)" />
                                  <circle cx="50" cy="47" r="3.5" fill="#ffffff" />
                                </svg>
                              </div>

                              <div className="space-y-2 relative z-10">
                                <h3 className="text-xl font-bold text-white tracking-tight">There are no items here!</h3>
                                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                                  Start optimizing your resume for your dream job
                                </p>
                              </div>

                              {/* Single CTA: Start New Analysis */}
                              <button
                                type="button"
                                onClick={async () => {
                                  // Quick local pre-check first (for obviously empty resumes — no API call needed)
                                  const nameStr = (resumeData?.name || resumeData?.fullName || '').trim();
                                  const skillsStr = [
                                    resumeData?.skills?.programmingLanguages,
                                    resumeData?.skills?.frameworksLibraries,
                                    resumeData?.skills?.toolsPlatforms,
                                    resumeData?.skills?.softSkills,
                                  ].filter(Boolean).join(' ').trim();
                                  const expCount = (resumeData?.experience || []).filter(e => (e.role || e.company || '').trim().length > 1).length;
                                  const eduCount = (resumeData?.education || []).filter(e => (e.institution || e.degree || '').trim().length > 1).length;
                                  const locallyEmpty = nameStr.length < 2 && skillsStr.length < 5 && expCount === 0 && eduCount === 0;

                                  if (locallyEmpty) {
                                    setIsReadinessGateOpen(true);
                                    return;
                                  }

                                  // Show the analyzing animation
                                  setIsAnalyzingResume(true);
                                  setAnalyzeProgress(0);

                                  // Animated progress steps
                                  const steps = [
                                    { target: 25, delay: 400 },
                                    { target: 50, delay: 700 },
                                    { target: 72, delay: 600 },
                                    { target: 88, delay: 500 },
                                    { target: 100, delay: 400 },
                                  ];

                                  let ready = true;
                                  // Run backend readiness check concurrently while animation plays
                                  const readinessPromise = (async () => {
                                    try {
                                      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
                                      const res = await fetch(`/api/resumes/${id}/readiness`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                      });
                                      if (res.ok) {
                                        const json = await res.json();
                                        const data = json.data || json;
                                        ready = data.ready !== false;
                                      }
                                    } catch (_) {
                                      // fail-open on network error
                                    }
                                  })();

                                  // Drive the progress bar
                                  let current = 0;
                                  for (const step of steps) {
                                    await new Promise(r => setTimeout(r, step.delay));
                                    current = step.target;
                                    setAnalyzeProgress(current);
                                  }

                                  // Wait for backend to finish
                                  await readinessPromise;
                                  await new Promise(r => setTimeout(r, 300));

                                  setIsAnalyzingResume(false);
                                  setAnalyzeProgress(0);

                                  if (!ready) {
                                    setIsReadinessGateOpen(true);
                                  } else {
                                    setHasStartedAnalysis(true);
                                  }
                                }}
                                className="relative z-10 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-purple-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
                              >
                                <span>Start New Analysis</span>
                                <span className="text-base">→</span>
                              </button>
                            </>
                          )}
                        </div>

                      ) : (
                        /* ── IMAGE 2: After clicking Start New Analysis — show job discovery UI ── */
                        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1020] p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-5 shadow-xl min-h-[380px] relative overflow-hidden">
                          {/* Glowing open box with radiant light beams shining upward (Image 2) */}
                          <div className="relative w-40 h-36 flex items-center justify-center">
                            <div
                              className="absolute -top-10 inset-x-0 h-32 opacity-80 pointer-events-none"
                              style={{
                                background: 'radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.5) 0%, rgba(99, 102, 241, 0.25) 45%, transparent 75%)',
                                filter: 'blur(8px)'
                              }}
                            />
                            <svg className="absolute -top-8 w-44 h-32 pointer-events-none opacity-80" viewBox="0 0 160 120" fill="none">
                              <polygon points="80,110 25,0 60,0" fill="url(#boxBeam1)" opacity="0.5" />
                              <polygon points="80,110 65,0 95,0" fill="url(#boxBeam1)" opacity="0.8" />
                              <polygon points="80,110 100,0 135,0" fill="url(#boxBeam1)" opacity="0.5" />
                              <defs>
                                <linearGradient id="boxBeam1" x1="80" y1="110" x2="80" y2="0" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#c084fc" stopOpacity="0.8" />
                                  <stop offset="0.6" stopColor="#818cf8" stopOpacity="0.3" />
                                  <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                            </svg>
                            {/* 3D Box Illustration */}
                            <svg className="w-24 h-24 relative z-10 drop-shadow-2xl" viewBox="0 0 100 100" fill="none">
                              <path d="M50 36 L86 54 L50 72 L14 54 Z" fill="#1b1d33" stroke="#6366f1" strokeWidth="1.2" />
                              <path d="M14 54 L50 72 L50 94 L14 76 Z" fill="#131526" stroke="#4f46e5" strokeWidth="1.2" />
                              <path d="M86 54 L50 72 L50 94 L86 76 Z" fill="#20223f" stroke="#6366f1" strokeWidth="1.2" />
                              <path d="M14 54 L50 36 L38 22 L4 40 Z" fill="#2b2854" stroke="#818cf8" strokeWidth="1" />
                              <path d="M86 54 L50 36 L62 22 L96 40 Z" fill="#353163" stroke="#a78bfa" strokeWidth="1" />
                              <ellipse cx="50" cy="48" rx="14" ry="7" fill="#c084fc" opacity="0.8" filter="blur(2px)" />
                              <circle cx="50" cy="47" r="3.5" fill="#ffffff" />
                            </svg>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="text-lg font-bold text-white tracking-tight">There are no items here!</h3>
                            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                              Select a target job below or browse opportunities to optimize your resume
                            </p>
                          </div>

                          {/* Featured Target Job: from available jobs or American Express */}
                          <div className="w-full max-w-md rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#080d19] p-4 flex items-center justify-between gap-3 text-left shadow-lg">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1 shadow-md shrink-0">
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg"
                                  alt="American Express"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate">Engineer 1</h4>
                                <p className="text-[11px] text-indigo-300 font-semibold truncate">American Express • Bengaluru, India</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const amex = jobs.find(j => (j.company || '').toLowerCase().includes('american express')) || jobs[0];
                                if (amex) handleSelectJobForOptimization(amex);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap hover:scale-105"
                            >
                              Optimize Role →
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsJobDiscoveryOpen(true)}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-all cursor-pointer"
                          >
                            <span>Browse All Jobs</span>
                            <span className="text-sm">→</span>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* ── Selected Job Active Optimization View (Images 2, 3, 4, 5) ── */
                    <div className="space-y-5 animate-in fade-in duration-200">
                      {isAiWizardActive ? (
                        <div className="space-y-5 animate-in fade-in duration-150">
                          {/* ── STEP 1: ADD MISSING KEYWORDS (Exact Image 1 Cards & Suggested Actions Match) ── */}
                          {aiWizardStep === 1 && (() => {
                            const match = calculateJobMatch(resumeData, selectedJob);

                            // Base list from selectedJob missingKeywords or defaults
                            const baseMissingKeywords: string[] = [];
                            (match.missingKeywords || []).forEach(k => {
                              if (k.keyword && !baseMissingKeywords.includes(k.keyword)) {
                                baseMissingKeywords.push(k.keyword);
                              }
                            });

                            // Priority list matching Image 1:
                            // Card 1: Delta Lake
                            // Card 2: PySpark / Spark
                            // Card 3: SQL
                            // Card 4: Python
                            // Card 5: Databricks
                            const image1Keywords = [
                              'Delta Lake',
                              'PySpark / Spark',
                              'SQL',
                              'Python',
                              'Databricks',
                              'Distributed Systems',
                              'Apache Kafka',
                              'Microservices',
                              'Docker / Containers',
                              'AWS Cloud'
                            ];

                            image1Keywords.forEach(kw => {
                              if (baseMissingKeywords.length < 10 && !baseMissingKeywords.some(b => b.toLowerCase().includes(kw.toLowerCase().split(' ')[0]))) {
                                baseMissingKeywords.push(kw);
                              }
                            });

                            const getQuestionForKeyword = (kw: string) => {
                              const lower = kw.toLowerCase();
                              if (lower.includes('delta lake')) return 'Have you had exposure to Delta Lake?';
                              if (lower.includes('pyspark') || lower.includes('spark')) return 'Are you experienced with PySpark / Spark?';
                              if (lower.includes('sql')) return 'Can you highlight your experience with SQL?';
                              if (lower.includes('python')) return 'Does your experience include Python?';
                              if (lower.includes('databricks')) return 'Do you have experience with Databricks?';
                              if (lower.includes('mlflow')) return 'Do you have experience with MLflow?';
                              if (lower.includes('distributed')) return 'Have you worked with Distributed Systems?';
                              if (lower.includes('kafka')) return 'Are you familiar with Apache Kafka?';
                              if (lower.includes('microservices')) return 'Can you highlight your experience with Microservices?';
                              if (lower.includes('docker')) return 'Do you have experience with Docker?';
                              if (lower.includes('kubernetes') || lower.includes('k8s')) return 'Have you worked with Kubernetes?';
                              if (lower.includes('aws')) return 'Have you had exposure to AWS Cloud?';
                              if (lower.includes('azure')) return 'Do you have experience with Azure Cloud?';
                              if (lower.includes('gcp')) return 'Have you had exposure to Google Cloud Platform?';
                              if (lower.includes('spring boot') || lower.includes('spring')) return 'Can you highlight your experience with Spring Boot?';
                              if (lower.includes('react')) return 'Can you highlight your experience with React?';
                              if (lower.includes('graphql')) return 'Does your experience include GraphQL?';
                              if (lower.includes('redis')) return 'Have you worked with Redis?';
                              if (lower.includes('ci/cd')) return 'Have you had exposure to CI/CD pipelines?';
                              return `Do you have experience with ${kw}?`;
                            };

                            const baseKeywordItems = baseMissingKeywords.map(kw => ({
                              id: `kw-${kw.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                              keyword: kw,
                              question: getQuestionForKeyword(kw),
                            }));

                            // Retain all items including those that were completed or deleted
                            const allItemsMap = new Map<string, { id: string; keyword: string; question: string }>();
                            baseKeywordItems.forEach(item => allItemsMap.set(item.id, item));
                            Object.values(trackedKeywordItems).forEach(item => allItemsMap.set(item.id, item));
                            const keywordItems = Array.from(allItemsMap.values());

                            const pendingItems = keywordItems.filter(item => !keywordCompletedIds.has(item.id) && !keywordDeletedIds.has(item.id));
                            const completedItems = keywordItems.filter(item => keywordCompletedIds.has(item.id));
                            const deletedItems = keywordItems.filter(item => keywordDeletedIds.has(item.id));

                            const handleKeywordYes = (kw: string, itemId: string) => {
                              setTrackedKeywordItems(prev => ({
                                ...prev,
                                [itemId]: {
                                  id: itemId,
                                  keyword: kw,
                                  question: getQuestionForKeyword(kw)
                                }
                              }));
                              setKeywordCompletedIds(prev => new Set(prev).add(itemId));
                              setKeywordDeletedIds(prev => {
                                const next = new Set(prev);
                                next.delete(itemId);
                                return next;
                              });

                              handleUpdate(prev => {
                                const existingTools = prev.skills?.toolsPlatforms || '';
                                if (existingTools.toLowerCase().includes(kw.toLowerCase())) {
                                  return prev;
                                }
                                return {
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    toolsPlatforms: existingTools ? `${existingTools}, ${kw}` : kw
                                  }
                                };
                              });

                              showToast({
                                type: 'success',
                                title: 'Keyword Added',
                                message: `Added "${kw}" to your skills section.`
                              });
                            };

                            const handleKeywordDelete = (kw: string, itemId: string) => {
                              setTrackedKeywordItems(prev => ({
                                ...prev,
                                [itemId]: {
                                  id: itemId,
                                  keyword: kw,
                                  question: getQuestionForKeyword(kw)
                                }
                              }));
                              setKeywordDeletedIds(prev => new Set(prev).add(itemId));
                              setKeywordCompletedIds(prev => {
                                const next = new Set(prev);
                                next.delete(itemId);
                                return next;
                              });
                              showToast({
                                type: 'info',
                                title: 'Suggestion Dismissed',
                                message: `Moved "${kw}" to Deleted tab.`
                              });
                            };

                            const handleKeywordUndo = (itemId: string) => {
                              setKeywordCompletedIds(prev => {
                                const next = new Set(prev);
                                next.delete(itemId);
                                return next;
                              });
                            };

                            const handleKeywordRestore = (itemId: string) => {
                              setKeywordDeletedIds(prev => {
                                const next = new Set(prev);
                                next.delete(itemId);
                                return next;
                              });
                            };

                            const triggerThrow = (item: { id: string; keyword: string }, direction: 'right' | 'left') => {
                              if (throwingCardId) return;
                              setThrowingCardId(item.id);
                              setThrowingDirection(direction);

                              setTimeout(() => {
                                if (direction === 'right') {
                                  handleKeywordYes(item.keyword, item.id);
                                } else {
                                  handleKeywordDelete(item.keyword, item.id);
                                }
                                setThrowingCardId(null);
                                setThrowingDirection(null);
                              }, 290);
                            };

                            return (
                              <div className="space-y-4 animate-in fade-in duration-200">
                                {/* Title: Suggested Actions (Image 1 Match) */}
                                <div className="flex items-center justify-between">
                                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Suggested Actions
                                  </h3>
                                  <span className="text-[11px] text-slate-400/80 flex items-center gap-1 font-medium">
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                    <span>Swipe or click to throw</span>
                                  </span>
                                </div>

                                {/* Filter Tabs: Pending (N), Completed (N), Deleted (N) - Image 1 Style */}
                                <div className="inline-flex items-center p-1 rounded-full bg-[#0c1222] border border-slate-800/80 shadow-inner">
                                  <button
                                    type="button"
                                    onClick={() => setKeywordTab('pending')}
                                    className={cn(
                                      "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                                      keywordTab === 'pending'
                                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                                        : "text-slate-400 hover:text-white"
                                    )}
                                  >
                                    <span>Pending</span>
                                    <span className={cn(
                                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                      keywordTab === 'pending' ? "bg-white/25 text-white" : "text-slate-500"
                                    )}>
                                      {pendingItems.length}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setKeywordTab('completed')}
                                    className={cn(
                                      "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                                      keywordTab === 'completed'
                                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                                        : "text-slate-400 hover:text-white"
                                    )}
                                  >
                                    <span>Completed</span>
                                    <span className={cn(
                                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                      keywordTab === 'completed' ? "bg-white/25 text-white" : "text-slate-500"
                                    )}>
                                      {completedItems.length}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setKeywordTab('deleted')}
                                    className={cn(
                                      "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                                      keywordTab === 'deleted'
                                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                                        : "text-slate-400 hover:text-white"
                                    )}
                                  >
                                    <span>Deleted</span>
                                    <span className={cn(
                                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                      keywordTab === 'deleted' ? "bg-white/25 text-white" : "text-slate-500"
                                    )}>
                                      {deletedItems.length}
                                    </span>
                                  </button>
                                </div>

                                {/* Cards List: Pending Tab with Throw Animation */}
                                {keywordTab === 'pending' && (
                                  <div className="space-y-3 pt-1">
                                    {pendingItems.length === 0 ? (
                                      <div className="space-y-4 pt-1">
                                        {/* Celebratory Card matching Image 1 */}
                                        <div className="relative overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-b from-[#101426] via-[#0c1020] to-[#080a14] p-8 text-center space-y-4 shadow-2xl shadow-purple-950/40 min-h-[290px] flex flex-col items-center justify-center">
                                          {/* Injected Continuous Animation Styles */}
                                          <style>{`
                                            @keyframes atsContinuousConfetti {
                                              0% {
                                                transform: translateY(-24px) translateX(0px) rotate(0deg) scale(0.9);
                                                opacity: 0;
                                              }
                                              12% {
                                                opacity: 0.95;
                                              }
                                              80% {
                                                opacity: 0.85;
                                              }
                                              100% {
                                                transform: translateY(280px) translateX(var(--drift, 18px)) rotate(var(--rot, 360deg)) scale(0.65);
                                                opacity: 0;
                                              }
                                            }
                                            @keyframes atsBoxLevitate {
                                              0%, 100% { transform: translateY(0px); }
                                              50% { transform: translateY(-7px); }
                                            }
                                            @keyframes atsBadgeGlowPulse {
                                              0%, 100% { transform: scale(1); box-shadow: 0 0 12px 2px rgba(168, 85, 247, 0.7); }
                                              50% { transform: scale(1.08); box-shadow: 0 0 20px 4px rgba(192, 132, 252, 0.95); }
                                            }
                                          `}</style>

                                          {/* Floating / Falling Purple & Magenta Confetti & Sparkles in Continuous Motion */}
                                          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                                            {[
                                              // Paper rectangles
                                              { type: 'rect', color: 'bg-purple-400', left: '8%', top: '-10px', w: 'w-2.5', h: 'h-1.5', dur: '3.1s', delay: '0.1s', drift: '18px', rot: '320deg' },
                                              { type: 'rect', color: 'bg-pink-400', left: '16%', top: '-10px', w: 'w-2', h: 'h-3', dur: '3.6s', delay: '1.4s', drift: '-22px', rot: '-280deg' },
                                              { type: 'rect', color: 'bg-violet-400', left: '26%', top: '-10px', w: 'w-3', h: 'h-2', dur: '2.8s', delay: '0.6s', drift: '14px', rot: '240deg' },
                                              { type: 'rect', color: 'bg-fuchsia-400', left: '38%', top: '-10px', w: 'w-2', h: 'h-2.5', dur: '3.9s', delay: '2.1s', drift: '-16px', rot: '-360deg' },
                                              { type: 'rect', color: 'bg-indigo-300', left: '52%', top: '-10px', w: 'w-2.5', h: 'h-1.5', dur: '3.3s', delay: '0.8s', drift: '24px', rot: '180deg' },
                                              { type: 'rect', color: 'bg-pink-500', left: '64%', top: '-10px', w: 'w-3', h: 'h-2', dur: '4.1s', delay: '1.7s', drift: '-20px', rot: '300deg' },
                                              { type: 'rect', color: 'bg-purple-300', left: '74%', top: '-10px', w: 'w-2', h: 'h-3', dur: '2.9s', delay: '0.3s', drift: '12px', rot: '-210deg' },
                                              { type: 'rect', color: 'bg-violet-300', left: '84%', top: '-10px', w: 'w-2.5', h: 'h-2', dur: '3.7s', delay: '2.4s', drift: '-18px', rot: '260deg' },
                                              { type: 'rect', color: 'bg-fuchsia-300', left: '92%', top: '-10px', w: 'w-3', h: 'h-1.5', dur: '3.4s', delay: '1.1s', drift: '16px', rot: '-310deg' },

                                              // Stars and sparkles
                                              { type: 'star', char: '★', color: 'text-purple-300', left: '12%', top: '-10px', size: 'text-[11px]', dur: '3.5s', delay: '0.9s', drift: '-14px', rot: '180deg' },
                                              { type: 'star', char: '✦', color: 'text-pink-300', left: '22%', top: '-10px', size: 'text-[13px]', dur: '2.7s', delay: '0.2s', drift: '20px', rot: '-240deg' },
                                              { type: 'star', char: '♦', color: 'text-violet-300', left: '33%', top: '-10px', size: 'text-[10px]', dur: '4.2s', delay: '2.6s', drift: '-10px', rot: '190deg' },
                                              { type: 'star', char: '★', color: 'text-fuchsia-300', left: '46%', top: '-10px', size: 'text-[12px]', dur: '3.2s', delay: '1.2s', drift: '15px', rot: '270deg' },
                                              { type: 'star', char: '●', color: 'text-purple-400', left: '58%', top: '-10px', size: 'text-[8px]', dur: '3.8s', delay: '1.9s', drift: '-25px', rot: '90deg' },
                                              { type: 'star', char: '✦', color: 'text-indigo-300', left: '68%', top: '-10px', size: 'text-[14px]', dur: '3.0s', delay: '0.5s', drift: '18px', rot: '-160deg' },
                                              { type: 'star', char: '★', color: 'text-pink-400', left: '79%', top: '-10px', size: 'text-[11px]', dur: '4.0s', delay: '2.2s', drift: '-12px', rot: '330deg' },
                                              { type: 'star', char: '♦', color: 'text-purple-200', left: '89%', top: '-10px', size: 'text-[9px]', dur: '3.3s', delay: '1.5s', drift: '14px', rot: '-200deg' },

                                              // Second wave for rich continuous density
                                              { type: 'rect', color: 'bg-purple-500', left: '19%', top: '-10px', w: 'w-2', h: 'h-2', dur: '3.4s', delay: '1.8s', drift: '22px', rot: '140deg' },
                                              { type: 'rect', color: 'bg-pink-300', left: '42%', top: '-10px', w: 'w-2.5', h: 'h-1.5', dur: '3.1s', delay: '2.8s', drift: '-15px', rot: '-170deg' },
                                              { type: 'rect', color: 'bg-indigo-400', left: '61%', top: '-10px', w: 'w-2', h: 'h-2.5', dur: '3.7s', delay: '0.4s', drift: '16px', rot: '210deg' },
                                              { type: 'rect', color: 'bg-fuchsia-400', left: '81%', top: '-10px', w: 'w-3', h: 'h-2', dur: '3.0s', delay: '1.6s', drift: '-19px', rot: '-250deg' },
                                              { type: 'star', char: '✦', color: 'text-purple-300', left: '6%', top: '-10px', size: 'text-[12px]', dur: '3.8s', delay: '2.0s', drift: '10px', rot: '120deg' },
                                              { type: 'star', char: '★', color: 'text-violet-200', left: '94%', top: '-10px', size: 'text-[10px]', dur: '3.2s', delay: '2.7s', drift: '-14px', rot: '-190deg' },
                                            ].map((p, idx) => (
                                              p.type === 'rect' ? (
                                                <span
                                                  key={idx}
                                                  className={cn("absolute rounded-[1.5px] opacity-80 shadow-sm", p.color, p.w, p.h)}
                                                  style={{
                                                    top: p.top,
                                                    left: p.left,
                                                    ['--drift' as string]: p.drift,
                                                    ['--rot' as string]: p.rot,
                                                    animation: `atsContinuousConfetti ${p.dur} linear infinite`,
                                                    animationDelay: p.delay,
                                                  }}
                                                />
                                              ) : (
                                                <span
                                                  key={idx}
                                                  className={cn("absolute font-bold opacity-85 select-none", p.color, p.size)}
                                                  style={{
                                                    top: p.top,
                                                    left: p.left,
                                                    ['--drift' as string]: p.drift,
                                                    ['--rot' as string]: p.rot,
                                                    animation: `atsContinuousConfetti ${p.dur} linear infinite`,
                                                    animationDelay: p.delay,
                                                  }}
                                                >
                                                  {p.char}
                                                </span>
                                              )
                                            ))}
                                          </div>

                                          {/* Center Content: 3D Tray Box with Papers and Checkmark Badge */}
                                          <div className="relative z-10 flex flex-col items-center justify-center space-y-3 pt-2 pb-1">
                                            {/* 3D Tray / Archive Box Graphic (Image 1 Match) */}
                                            <div
                                              className="relative flex items-center justify-center select-none"
                                              style={{ animation: 'atsBoxLevitate 3s ease-in-out infinite' }}
                                            >
                                              {/* Soft purple radial glow behind the tray */}
                                              <div className="absolute w-28 h-28 rounded-full bg-purple-600/25 blur-xl pointer-events-none" />

                                              {/* 3D Inbox Tray SVG */}
                                              <svg className="w-20 h-20 drop-shadow-2xl overflow-visible" viewBox="0 0 100 88" fill="none">
                                                {/* Ground shadow */}
                                                <ellipse cx="50" cy="80" rx="32" ry="6" fill="#000000" opacity="0.5" filter="blur(3px)" />

                                                {/* Tray back wall */}
                                                <path d="M18 38 L32 24 L68 24 L82 38 Z" fill="#242838" stroke="#384059" strokeWidth="1" />

                                                {/* Stacked Paper Sheets inside tray */}
                                                <path d="M26 36 L36 26 L64 26 L74 36 Z" fill="#94a3b8" opacity="0.6" />
                                                <path d="M24 39 L35 28 L65 28 L76 39 Z" fill="#cbd5e1" opacity="0.85" />
                                                <path d="M22 42 L34 30 L66 30 L78 42 Z" fill="#f8fafc" />
                                                {/* Text lines on top paper sheet */}
                                                <line x1="33" y1="34" x2="52" y2="34" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                                                <line x1="33" y1="38" x2="60" y2="38" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />

                                                {/* Tray Body Outer / Left, Right & Front with cutout handle */}
                                                {/* Left outer side */}
                                                <path d="M16 38 L24 68 L32 68 L26 38 Z" fill="#2c3349" stroke="#414c6d" strokeWidth="1.2" />
                                                {/* Right outer side */}
                                                <path d="M84 38 L76 68 L68 68 L74 38 Z" fill="#1b2030" stroke="#323a54" strokeWidth="1.2" />
                                                {/* Front face with center notch */}
                                                <path d="M16 38 L24 68 L76 68 L84 38 L65 38 L62 47 L38 47 L35 38 Z" fill="#282f45" stroke="#455174" strokeWidth="1.2" />
                                                {/* Inside notch shadow */}
                                                <path d="M38 47 L62 47 L60 52 L40 52 Z" fill="#131622" />
                                                {/* Bottom metallic rim line */}
                                                <path d="M25 66 L75 66" stroke="#5b6b96" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                                              </svg>

                                              {/* Glowing Purple Circular Badge with Checkmark at Top Right */}
                                              <div
                                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                                                style={{
                                                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                                                  border: '2px solid #0c1020',
                                                  animation: 'atsBadgeGlowPulse 2.6s ease-in-out infinite'
                                                }}
                                              >
                                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                              </div>
                                            </div>

                                            {/* Typography (Exact Image 1 Match) */}
                                            <div className="space-y-1.5 pt-1">
                                              <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                                All Actions Completed! 🎉
                                              </h4>
                                              <p className="text-xs sm:text-[13px] text-slate-300 max-w-sm mx-auto leading-relaxed">
                                                All the suggested changes have been applied to your resume and ready for opportunities ahead.
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Exactly ONE "Mark as Complete" Button below the card (Exact Image 1 Match) */}
                                        <button
                                          type="button"
                                          onClick={handleMarkAsCompleteStep1}
                                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#6366f1] bg-[length:200%_auto] hover:bg-right hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-[0.99] transition-all duration-300 cursor-pointer text-center"
                                        >
                                          Mark as Complete
                                        </button>
                                      </div>
                                    ) : (
                                      <AnimatePresence mode="popLayout">
                                        {pendingItems.map((item) => {
                                          const isThrowing = throwingCardId === item.id;
                                          return (
                                            <motion.div
                                              key={item.id}
                                              layout
                                              drag="x"
                                              dragConstraints={{ left: 0, right: 0 }}
                                              dragElastic={0.65}
                                              onDragEnd={(_e, info) => {
                                                if (info.offset.x > 80 || info.velocity.x > 300) {
                                                  triggerThrow(item, 'right');
                                                } else if (info.offset.x < -80 || info.velocity.x < -300) {
                                                  triggerThrow(item, 'left');
                                                }
                                              }}
                                              initial={{ opacity: 0, y: 14, scale: 0.96 }}
                                              animate={
                                                isThrowing
                                                  ? throwingDirection === 'right'
                                                    ? { x: 380, y: -16, rotate: 9, scale: 0.82, opacity: 0 }
                                                    : { x: -380, y: 16, rotate: -9, scale: 0.82, opacity: 0 }
                                                  : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
                                              }
                                              exit={{
                                                opacity: 0,
                                                x: throwingDirection === 'left' ? -380 : 380,
                                                y: throwingDirection === 'left' ? 16 : -16,
                                                scale: 0.82,
                                                rotate: throwingDirection === 'left' ? -9 : 9,
                                                transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
                                              }}
                                              transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 26,
                                                mass: 0.75,
                                                layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
                                              }}
                                              whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                                              whileTap={{ cursor: 'grabbing' }}
                                              onClick={() => {
                                                setTrackedKeywordItems(prev => ({
                                                  ...prev,
                                                  [item.id]: item
                                                }));
                                                setActiveModalKeywordItem(item);
                                                setAddSkillKeyword(item.keyword);
                                                setAddSkillOption('add-specific');
                                                setAddSkillSection('skills');
                                                setAddSkillContext('');
                                                setIsSectionDropdownOpen(false);
                                                setIsAddSkillModalOpen(true);
                                              }}
                                              className={cn(
                                                "relative rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 shadow-md select-none transition-colors cursor-grab active:cursor-grabbing overflow-hidden",
                                                isThrowing
                                                  ? throwingDirection === 'right'
                                                    ? "border-purple-500/80 bg-purple-950/40 shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                                                    : "border-rose-500/80 bg-rose-950/40 shadow-[0_0_25px_rgba(244,63,94,0.5)]"
                                                  : "border-slate-800/80 bg-[#0d1424] hover:border-slate-700/80"
                                              )}
                                            >
                                              <p className="text-xs sm:text-[13.5px] font-medium text-slate-100 leading-snug pointer-events-none">
                                                {item.question}
                                              </p>
                                              <div className="flex items-center gap-2.5 shrink-0">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    triggerThrow(item, 'left');
                                                  }}
                                                  className="p-2 rounded-xl text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                                                  title="Dismiss suggestion (or swipe left)"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveModalKeywordItem(item);
                                                    setAddSkillKeyword(item.keyword);
                                                    setAddSkillOption('add-specific');
                                                    setAddSkillSection('skills');
                                                    setAddSkillContext('');
                                                    setIsSectionDropdownOpen(false);
                                                    setIsAddSkillModalOpen(true);
                                                  }}
                                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                  title="Add keyword or customize placement"
                                                >
                                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                                  <span>Yes</span>
                                                </button>
                                              </div>
                                            </motion.div>
                                          );
                                        })}
                                      </AnimatePresence>
                                    )}
                                  </div>
                                )}

                                {/* Cards List: Completed Tab with smooth layout */}
                                {keywordTab === 'completed' && (
                                  <div className="space-y-3 pt-1">
                                    {completedItems.length === 0 ? (
                                      <div className="rounded-2xl border border-slate-800/80 bg-[#0a0f1d] p-8 text-center text-xs text-slate-400">
                                        No completed items yet. Click <strong>Yes</strong> or swipe right on any card to add it to your resume.
                                      </div>
                                    ) : (
                                      <AnimatePresence mode="popLayout">
                                        {completedItems.map((item) => (
                                          <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.25 }}
                                            className="rounded-2xl border border-emerald-900/40 bg-[#09151e] px-5 py-3.5 flex items-center justify-between gap-3 shadow-md"
                                          >
                                            <div className="flex items-center gap-2.5">
                                              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                              </div>
                                              <div>
                                                <p className="text-xs sm:text-[13px] font-semibold text-white">Added "{item.keyword}" to {keywordSectionMap[item.id] || 'skills'}</p>
                                                <p className="text-[11px] text-emerald-400/80 font-medium">Included in resume keywords</p>
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleKeywordUndo(item.id)}
                                              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                                            >
                                              Undo
                                            </button>
                                          </motion.div>
                                        ))}
                                      </AnimatePresence>
                                    )}
                                  </div>
                                )}

                                {/* Cards List: Deleted Tab with smooth layout */}
                                {keywordTab === 'deleted' && (
                                  <div className="space-y-3 pt-1">
                                    {deletedItems.length === 0 ? (
                                      <div className="rounded-2xl border border-slate-800/80 bg-[#0a0f1d] p-8 text-center text-xs text-slate-400">
                                        No dismissed items in trash.
                                      </div>
                                    ) : (
                                      <AnimatePresence mode="popLayout">
                                        {deletedItems.map((item) => (
                                          <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.25 }}
                                            className="rounded-2xl border border-slate-800/80 bg-[#0a0f1d] px-5 py-3.5 flex items-center justify-between gap-3 shadow-md opacity-75"
                                          >
                                            <p className="text-xs sm:text-[13px] text-slate-400 line-through">
                                              {item.question}
                                            </p>
                                            <button
                                              type="button"
                                              onClick={() => handleKeywordRestore(item.id)}
                                              className="px-3 py-1.5 rounded-lg border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/20 text-xs font-medium transition-colors cursor-pointer"
                                            >
                                              Restore
                                            </button>
                                          </motion.div>
                                        ))}
                                      </AnimatePresence>
                                    )}
                                  </div>
                                )}

                                {/* Bottom Step Navigation (Only when items are still pending to avoid duplicate button) */}
                                {pendingItems.length > 0 && (
                                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                                    <span className="text-xs text-slate-400">
                                      {completedItems.length} of {keywordItems.length} keywords added
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setAiWizardStep(2)}
                                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105"
                                    >
                                      <span>Next: Rephrase Content</span>
                                      <span>→</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* ── STEP 2: REPHRASE CONTENT (SUGGESTED ACTIONS) ── */}
                          {aiWizardStep === 2 && (
                            <div className="space-y-5 animate-in fade-in duration-150">
                              <div className="space-y-1">
                                <h3 className="text-base font-bold text-white tracking-tight">Suggested Actions</h3>
                              </div>

                              {/* Filter Tabs: Pending (N), Completed (N), Deleted (N) */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setAiWizardActionTab('pending')}
                                  className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer",
                                    aiWizardActionTab === 'pending'
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                                  )}
                                >
                                  <span>Pending</span>
                                  <span className={cn(
                                    "w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold",
                                    aiWizardActionTab === 'pending' ? "bg-white text-indigo-700" : "bg-slate-800 text-slate-400"
                                  )}>
                                    {Math.max(0, (!wizardFixedActionIds.has('cert-tech') && !wizardDeletedActionIds.has('cert-tech') ? 1 : 0) + dynamicSuggestedActions.filter(act => !wizardFixedActionIds.has(act.id) && !wizardDeletedActionIds.has(act.id)).length)}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setAiWizardActionTab('completed')}
                                  className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer",
                                    aiWizardActionTab === 'completed'
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                                  )}
                                >
                                  <span>Completed</span>
                                  <span className={cn(
                                    "w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold",
                                    aiWizardActionTab === 'completed' ? "bg-white text-indigo-700" : "bg-slate-800 text-slate-400"
                                  )}>
                                    {wizardFixedActionIds.size}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setAiWizardActionTab('deleted')}
                                  className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer",
                                    aiWizardActionTab === 'deleted'
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                                  )}
                                >
                                  <span>Deleted</span>
                                  <span className={cn(
                                    "w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold",
                                    aiWizardActionTab === 'deleted' ? "bg-white text-indigo-700" : "bg-slate-800 text-slate-400"
                                  )}>
                                    {wizardDeletedActionIds.size}
                                  </span>
                                </button>
                              </div>

                              {/* Action Cards List */}
                              <div className="space-y-3 pt-1">
                                {aiWizardActionTab === 'pending' && (
                                  <>
                                    {!wizardFixedActionIds.has('cert-tech') && !wizardDeletedActionIds.has('cert-tech') ? (
                                      /* Exact Card Match to Image 2 */
                                      <div className="rounded-2xl border border-slate-800 bg-[#080d19] p-4 flex items-center justify-between gap-3 shadow-lg hover:border-slate-700 transition-all">
                                        <div className="space-y-1 min-w-0">
                                          <h4 className="text-xs md:text-sm font-semibold text-slate-200 leading-snug">
                                            Added Technical Certification as a keyword
                                          </h4>
                                          <p className="text-[11px] text-slate-400 font-medium">In Certifications</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setWizardDeletedActionIds(prev => new Set(prev).add('cert-tech'));
                                              showToast({ type: 'info', title: 'Action Dismissed', message: 'Moved to Deleted' });
                                            }}
                                            className="p-2 rounded-xl text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800 transition-colors cursor-pointer"
                                            title="Dismiss action"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveSuggestedChange({
                                                id: 'cert-tech',
                                                title: "Added Technical Certification as a keyword",
                                                category: "Description",
                                                bulletItems: [
                                                  "Developed a strong foundation in Information Retrieval, including document indexing, query processing, search models, and retrieval techniques.",
                                                  "Learned Boolean Retrieval, Vector Space Model, TF-IDF, document ranking, and retrieval evaluation used in modern search systems.",
                                                  "Technical Certification"
                                                ]
                                              });
                                            }}
                                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
                                          >
                                            <span>Fix</span>
                                            <span>→</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : null}

                                    {/* Dynamic AI Suggested Action Cards */}
                                    {dynamicSuggestedActions
                                      .filter(act => !wizardFixedActionIds.has(act.id) && !wizardDeletedActionIds.has(act.id))
                                      .map((action) => (
                                        <div key={action.id} className="rounded-2xl border border-slate-800 bg-[#080d19] p-4 flex items-center justify-between gap-3 shadow-lg hover:border-slate-700 transition-all">
                                          <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                                                {action.category}
                                              </span>
                                              <span className="text-[11px] text-slate-400 font-medium">In {action.section}</span>
                                            </div>
                                            <h4 className="text-xs md:text-sm font-semibold text-slate-200 leading-snug">
                                              {action.title}
                                            </h4>
                                            {action.newText && (
                                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                                {action.newText}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setWizardDeletedActionIds(prev => new Set(prev).add(action.id));
                                                showToast({ type: 'info', title: 'Action Dismissed', message: 'Moved to Deleted' });
                                              }}
                                              className="p-2 rounded-xl text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800 transition-colors cursor-pointer"
                                              title="Dismiss action"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveSuggestedChange({
                                                  id: action.id,
                                                  title: action.title,
                                                  category: action.category,
                                                  existingText: action.existingText,
                                                  newText: action.newText,
                                                  bulletItems: action.bulletItems
                                                });
                                              }}
                                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
                                            >
                                              <span>Fix</span>
                                              <span>→</span>
                                            </button>
                                          </div>
                                        </div>

                                      ))}
                                    {wizardFixedActionIds.size > 0 && (
                                      <div className="space-y-4 pt-1 animate-in fade-in zoom-in-95 duration-300">
                                        {/* Celebration Card matching Image 1 & 2 */}
                                        <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-b from-[#101426] via-[#0c1020] to-[#080a14] p-8 text-center relative overflow-hidden shadow-2xl space-y-4">
                                          <BalloonsCelebration />
                                          <div className="relative z-10 space-y-1.5 max-w-sm mx-auto pt-2">
                                            <h3 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
                                              <span>All Actions Completed!</span>
                                              <span>🎉</span>
                                            </h3>
                                            <p className="text-xs text-slate-300/80 leading-relaxed">
                                              All the suggested changes have been applied to your resume and ready for opportunities ahead.
                                            </p>
                                          </div>
                                        </div>

                                        {/* Mark as Complete Button to trigger Image 2 Generating Professional Summary */}
                                        <button
                                          type="button"
                                          onClick={handleMarkAsCompleteStep2}
                                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#6366f1] bg-[length:200%_auto] hover:bg-right hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-[0.99] transition-all duration-300 cursor-pointer text-center"
                                        >
                                          Mark as Complete
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}

                                {aiWizardActionTab === 'completed' && (
                                  <div className="space-y-3">
                                    {wizardFixedActionIds.size === 0 ? (
                                      /* Exact Match to Image 1: No Completed Actions Yet */
                                      <div className="rounded-3xl border border-slate-800/80 bg-[#0c1020] p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-xl min-h-[300px]">
                                        <div className="w-14 h-14 rounded-full border border-slate-700 bg-slate-900/80 flex items-center justify-center text-slate-500">
                                          <CheckCircle2 className="w-7 h-7 text-slate-500" />
                                        </div>
                                        <div className="space-y-1.5 max-w-xs">
                                          <h4 className="text-base font-bold text-white tracking-tight">No Completed Actions Yet</h4>
                                          <p className="text-xs text-slate-400 leading-relaxed">
                                            Actions you complete will appear here. Start optimizing your resume to see progress!
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      Array.from(wizardFixedActionIds).map((actionId) => (
                                        <div key={actionId} className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center justify-between gap-3">
                                          <div className="space-y-1">
                                            <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                              {actionId === 'cert-tech'
                                                ? "Added Technical Certification as a keyword"
                                                : actionId === 'edu-degree'
                                                ? "Updated education qualification to include Bachelor's level degree"
                                                : 'Added Computer Science and related field of study keywords'}
                                            </span>
                                            <p className="text-[11px] text-slate-400 font-mono">In Certifications • Applied to resume</p>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}

                                {aiWizardActionTab === 'deleted' && (
                                  <div className="space-y-3">
                                    {wizardDeletedActionIds.size === 0 ? (
                                      <p className="text-xs text-slate-500 text-center py-8">No deleted actions.</p>
                                    ) : (
                                      Array.from(wizardDeletedActionIds).map((actionId) => (
                                        <div key={actionId} className="rounded-2xl border border-slate-800 bg-[#080d19] p-4 flex items-center justify-between gap-3">
                                          <span className="text-xs text-slate-400">
                                            {actionId === 'cert-tech' ? "Technical Certification keyword suggestion" : "Suggested action"}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setWizardDeletedActionIds(prev => {
                                                const next = new Set(prev);
                                                next.delete(actionId);
                                                return next;
                                              });
                                              showToast({ type: 'success', title: 'Action Restored', message: 'Returned to Pending' });
                                            }}
                                            className="text-xs text-indigo-400 hover:text-white font-bold cursor-pointer"
                                          >
                                            Restore
                                          </button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}

                                {aiWizardActionTab === 'deleted' && (
                                  <div className="space-y-3">
                                    {wizardDeletedActionIds.size === 0 ? (
                                      <p className="text-xs text-slate-500 text-center py-8">No deleted actions.</p>
                                    ) : (
                                      Array.from(wizardDeletedActionIds).map((actionId) => (
                                        <div key={actionId} className="rounded-2xl border border-slate-800 bg-[#080d19] p-4 flex items-center justify-between gap-3">
                                          <span className="text-xs text-slate-400">
                                            {actionId === 'edu-degree' ? "Education qualification suggestion" : "Skills keyword suggestion"}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setWizardDeletedActionIds(prev => {
                                                const next = new Set(prev);
                                                next.delete(actionId);
                                                return next;
                                              });
                                              showToast({ type: 'success', title: 'Action Restored', message: 'Returned to Pending' });
                                            }}
                                            className="text-xs text-indigo-400 hover:text-white font-bold cursor-pointer"
                                          >
                                            Restore
                                          </button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ── STEP 3: ADD PROFESSIONAL SUMMARY (Exact Image 3 Match) ── */}
                          {aiWizardStep === 3 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                              <div className="space-y-1">
                                <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                                  Add a tailored professional summary
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  Based on the updates you've made, we've created a concise summary that highlights your fit for this role.
                                </p>
                              </div>

                              {/* Recruiter tip box (Exact Image 3) */}
                              <div className="rounded-2xl border border-purple-500/25 bg-purple-950/20 p-4 flex items-start gap-3">
                                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  Recruiters often read the summary first. This helps them quickly understand your strengths.
                                </p>
                              </div>

                              {/* Tailored Summary Content Card (Exact Image 3 styling with bold keywords) */}
                              <div className="rounded-2xl border border-slate-800 bg-[#080d19] p-5 text-xs sm:text-[13px] text-slate-300 leading-relaxed shadow-xl">
                                <p className="leading-relaxed font-sans text-slate-200">
                                  <strong className="text-white font-bold">{resumeData?.education?.[0]?.degree || 'Computer Science and Engineering student'}</strong> focused on <strong className="text-white font-bold">{selectedJob?.title || 'Java Full Stack Development'}</strong>, with hands-on experience in building responsive and <strong className="text-white font-bold">database-driven web applications</strong>. Proficient in <strong className="text-white font-bold">Java, Spring Boot</strong>, and <strong className="text-white font-bold">REST APIs</strong>, actively involved in projects that enhance user experience, including a real-time chat application. Currently pursuing a B.Tech with a <strong className="text-white font-bold">CGPA of {resumeData?.education?.[0]?.cgpa || '8.5'}</strong>.
                                </p>
                              </div>

                              {/* Action Buttons (Exact Image 3) */}
                              <div className="space-y-3 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const edu = resumeData?.education?.[0];
                                    const degree = edu?.degree || 'Computer Science and Engineering student';
                                    const cgpa = edu?.cgpa || '8.5';
                                    const role = selectedJob?.title || 'Java Full Stack Development';
                                    const finalSummary = `${degree} focused on ${role}, with hands-on experience in building responsive and database-driven web applications. Proficient in Java, Spring Boot, and REST APIs, actively involved in projects that enhance user experience, including a real-time chat application. Currently pursuing a B.Tech with a CGPA of ${cgpa}.`;
                                    
                                    handleUpdate((prev) => ({
                                      ...prev,
                                      summary: finalSummary
                                    }));
                                    showToast({ type: 'success', title: 'Summary Added', message: 'Tailored summary applied to resume.' });
                                    setAiWizardStep(4);
                                  }}
                                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#6366f1] hover:brightness-110 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                                >
                                  Add Summary and Continue
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setAiWizardStep(4);
                                  }}
                                  className="w-full py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  Skip Summary
                                </button>
                              </div>
                            </div>
                          )}
{/* ── STEP 4: REORDER & NORMALIZE (Exact Image 4 Match) ── */}
                          {aiWizardStep === 4 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                              <div className="space-y-1">
                                <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                                  Reorder & Normalize your resume
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  Keyword order affects prominence. Reorder them to improve your score.
                                </p>
                              </div>

                              {/* Info Box (Exact Image 4) */}
                              <div className="rounded-2xl border border-blue-500/25 bg-[#08152e]/60 p-4 flex items-start gap-3">
                                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  These changes don't remove or rewrite your content. They only improve clarity and scanning.
                                </p>
                              </div>

                              {/* Success Banner (Exact Image 4) */}
                              <div className="rounded-2xl border border-emerald-500/30 bg-[#062419] p-4 flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0 font-bold text-xs">
                                  ✓
                                </div>
                                <p className="text-xs font-semibold text-emerald-300 leading-relaxed">
                                  Your resume sections are already perfectly structured based on the job keywords!
                                </p>
                              </div>

                              {/* Mark as Complete Button -> Opens Image 5 Celebration Modal */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEnvelopeCelebrationOpen(true);
                                  }}
                                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#6366f1] bg-[length:200%_auto] hover:bg-right hover:brightness-110 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all cursor-pointer"
                                >
                                  Mark as Complete
                                </button>
                              </div>
                            </div>
                          )}
</div>
                      ) : (
                        /* ── VIEW B: OPTIMIZATION DASHBOARD (Images 2, 3, 4) ── */
                        (() => {
                          const match = calculateJobMatch(resumeData, selectedJob);

                          if (isPostOptimizationView) {
                            return (
                              /* ── VIEW B1: POST-OPTIMIZATION SUMMARY (Image 4 exact match) ── */
                              <div className="space-y-5 animate-in fade-in duration-300">
                                {/* Top Row: Back Button */}
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsPostOptimizationView(false);
                                      setSelectedJobId('');
                                      setSearchParams({ tab: 'optimize-for-job' });
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <span>←</span>
                                    <span>Back</span>
                                  </button>
                                </div>

                                {/* Heading: Good potential for this role (Image 4) */}
                                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                                  Good potential for this role
                                </h2>

                                {/* Two side-by-side cards: Readiness Rating & Overall Score (Image 4) */}
                                <div className="grid grid-cols-2 gap-4">
                                  {/* Card 1: Readiness Rating */}
                                  <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] p-4 md:p-5 flex flex-col justify-between space-y-3 shadow-xl">
                                    <div className="flex items-center gap-1.5 text-white">
                                      <h3 className="text-xs md:text-sm font-bold">Readiness Rating</h3>
                                      <span className="text-xs text-slate-400 cursor-help" title="ATS Readiness Rating">ⓘ</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                      <div className="flex items-center gap-1 flex-1 overflow-hidden py-1">
                                        {Array.from({ length: 14 }).map((_, i) => {
                                          const hue = Math.round((i / 13) * 125);
                                          const fillCount = Math.max(1, Math.round((match.score / 100) * 14));
                                          const isFilled = i < fillCount;
                                          return (
                                            <div
                                              key={i}
                                              className="h-8 md:h-9 flex-1 min-w-[4px] max-w-[8px] rounded-full transition-all"
                                              style={{
                                                backgroundColor: isFilled ? `hsl(${hue}, 95%, 52%)` : '#1e293b',
                                                boxShadow: isFilled ? `0 0 6px hsla(${hue}, 95%, 52%, 0.5)` : 'none'
                                              }}
                                            />
                                          );
                                        })}
                                      </div>
                                      <div className="px-2.5 py-1.5 rounded-xl bg-[#18392b] border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shrink-0">
                                        Apply Ready
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card 2: Overall Score & Speedometer (Image 1 Dynamic Match) */}
                                  <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] p-4 md:p-5 space-y-1 shadow-xl">
                                    <div className="flex items-center gap-1.5 text-white">
                                      <h3 className="text-xs md:text-sm font-bold">Overall Score</h3>
                                      <span className="text-xs text-slate-400 cursor-help" title="Overall Score">ⓘ</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-2xl font-extrabold text-white tracking-tight">{match.score}</span>
                                      <span className="text-xs text-slate-400 font-medium">/ 100</span>
                                    </div>
                                    <div className="pt-0.5">
                                      <SpeedometerGauge score={match.score} isCard={false} />
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons: Continue Editing & Export PDF (Image 1 exact) */}
                                <div className="grid grid-cols-2 gap-4">
                                  <button
                                    type="button"
                                    onClick={handleContinueEditing}
                                    className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    Continue Editing
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleExportPDF}
                                    className="w-full py-2.5 px-4 rounded-xl bg-[#6366f1] hover:bg-[#5255e2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Export PDF</span>
                                  </button>
                                </div>

                                {/* Accordions below (Strong Keywords, Good-to-Have Keywords, Role Alignment Criteria) */}
                                <div className="space-y-3 pt-1">
                                  {/* Accordion 1: Strong Keywords (Must-Have) */}
                                  <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] overflow-hidden shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => setKeywordsStrongOpen(!keywordsStrongOpen)}
                                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                                    >
                                      <div className="space-y-1.5">
                                        <h4 className="text-xs md:text-sm font-bold text-white">Strong Keywords (Must-Have)</h4>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                                          All Keywords Optimized ✓
                                        </span>
                                      </div>
                                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", keywordsStrongOpen ? "transform rotate-180" : "")} />
                                    </button>

                                    {keywordsStrongOpen && (
                                      <div className="p-4 pt-0 border-t border-slate-800/60 overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                          <thead>
                                            <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 font-bold">
                                              <th className="py-2 pr-3">Keyword</th>
                                              <th className="py-2 px-3">Status</th>
                                              <th className="py-2 pl-3">Reason</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-800/50">
                                            <tr>
                                              <td className="py-2.5 pr-3 font-medium text-slate-200">
                                                Computer Science / related field of study
                                              </td>
                                              <td className="py-2.5 px-3">
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]">
                                                  Perfect
                                                </span>
                                              </td>
                                              <td className="py-2.5 pl-3 text-slate-400 text-[11px] leading-relaxed">
                                                No improvements needed — keyword is perfectly integrated.
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>

                                  {/* Accordion 2: Good-to-Have Keywords */}
                                  <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] overflow-hidden shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => setKeywordsGoodOpen(!keywordsGoodOpen)}
                                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                                    >
                                      <div className="space-y-1.5">
                                        <h4 className="text-xs md:text-sm font-bold text-white">Good-to-Have Keywords</h4>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[11px] font-bold">
                                          1 Weak Keyword Missing
                                        </span>
                                      </div>
                                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", keywordsGoodOpen ? "transform rotate-180" : "")} />
                                    </button>
                                  </div>

                                  {/* Accordion 3: Role Alignment Criteria */}
                                  <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] overflow-hidden shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => setRoleAlignmentOpen(!roleAlignmentOpen)}
                                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                                    >
                                      <div className="space-y-1.5">
                                        <h4 className="text-xs md:text-sm font-bold text-white">Role Alignment Criteria</h4>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[11px] font-bold">
                                          2 Role Alignment Criteria Not Met
                                        </span>
                                      </div>
                                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", roleAlignmentOpen ? "transform rotate-180" : "")} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-5 animate-in fade-in duration-300">
                              {/* Top Row: Back Button */}
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedJobId('');
                                    setSearchParams({ tab: 'optimize-for-job' });
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <span>←</span>
                                  <span>Back</span>
                                </button>
                              </div>

                              {/* Role Fit Headline (Matching User Screenshot 1 & 2) */}
                              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                                {match.score >= 65
                                  ? 'Strong fit for this role, few changes can make you standout.'
                                  : 'Good potential for this role, few changes can make you standout.'}
                              </h2>

                              {/* Card 1: Readiness Rating (Segmented horizontal bars + Apply Ready badge) */}
                              <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] p-5 space-y-3 shadow-xl">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-white tracking-wide">Readiness Rating</h3>
                                  <span className="text-xs text-slate-400 cursor-help" title="ATS Readiness Rating based on keyword and qualification coverage">ⓘ</span>
                                </div>

                                <div className="flex items-center justify-between gap-4 pt-1">
                                  <div className="flex items-center gap-1.5 flex-1 overflow-hidden py-1">
                                    {Array.from({ length: 28 }).map((_, i) => {
                                      const hue = Math.round((i / 27) * 125);
                                      const fillCount = Math.max(1, Math.round((match.score / 100) * 28));
                                      const isFilled = i < fillCount;
                                      return (
                                        <div
                                          key={i}
                                          className="h-8 md:h-9 flex-1 min-w-[5px] max-w-[10px] rounded-full transition-all duration-300"
                                          style={{
                                            backgroundColor: isFilled ? `hsl(${hue}, 95%, 52%)` : '#1e293b',
                                            boxShadow: isFilled ? `0 0 7px hsla(${hue}, 95%, 52%, 0.5)` : 'none'
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                  <div className="px-3.5 py-1.5 rounded-xl bg-[#143324] border border-emerald-500/40 text-emerald-400 font-bold text-xs shrink-0 tracking-wide">
                                    Apply Ready
                                  </div>
                                </div>
                              </div>

                              {/* Card 2: Overall Score & Speedometer (Left: Score, Right: Gauge - Screenshot 1 exact) */}
                              <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] p-5 shadow-xl">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-white">
                                      <h3 className="text-sm font-bold tracking-wide">Overall Score</h3>
                                      <span className="text-xs text-slate-400 cursor-help" title="ATS Overall Score based on role requirements">ⓘ</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5 pt-1">
                                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{match.score}</span>
                                      <span className="text-xs font-semibold text-slate-400">/ 100</span>
                                    </div>
                                  </div>

                                  <div className="w-[180px] sm:w-[210px] flex items-center justify-center shrink-0">
                                    <SpeedometerGauge score={match.score} isCard={false} />
                                  </div>
                                </div>
                              </div>

                              {/* Standalone Full-Width Action Button: Optimize with AI -> (Screenshot 1 & 2 exact) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAiWizardActive(true);
                                  setAiWizardStep(1);
                                }}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                              >
                                <span>Optimize with AI</span>
                                <span className="text-base font-bold">→</span>
                              </button>

                              {/* ── MISSING CRUMB ALERT: DISTRIBUTED SYSTEMS (Prompted from Job Description) ── */}
                              {match.hasDistributedSystemsMissing && (
                                <div className="rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-[#0a0f1e] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl relative overflow-hidden animate-in fade-in duration-300">
                                  <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                                      <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                                          Missing Crumb
                                        </span>
                                        <h4 className="text-xs sm:text-sm font-bold text-white">
                                          There is no distributed systems in your resume.
                                        </h4>
                                      </div>
                                      <p className="text-xs text-slate-300 leading-relaxed">
                                        American Express expects foundational knowledge in <strong>Distributed Systems</strong> for Engineer 1 payment architectures. Adding this keyword crumb to your skills or projects will significantly elevate your recruiter match ranking.
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddSkillKeyword('Distributed Systems');
                                      setIsAddSkillModalOpen(true);
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Optimize for Distributed Systems →</span>
                                  </button>
                                </div>
                              )}

                              {/* Section: Important Requirements for this role (Images 2, 3, 4, 5) */}
                              <div className="space-y-1 pt-2">
                                <h3 className="text-sm md:text-base font-bold text-white">Important requirements for this role</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  These skills and terms appear often in the job description and help recruiters quickly evaluate your resume.
                                </p>
                              </div>

                              {/* Sub-tabs: Job Keywords | Optimization History | Job Description (Pill Style - Exact Screenshot 1 & 2) */}
                              <div className="flex items-center gap-2 pt-1 pb-1">
                                <button
                                  type="button"
                                  onClick={() => setOptimizeSubTab('keywords')}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                    optimizeSubTab === 'keywords'
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                                  )}
                                >
                                  Job Keywords
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOptimizeSubTab('history')}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                    optimizeSubTab === 'history'
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                                  )}
                                >
                                  Optimization History
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOptimizeSubTab('description')}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                    optimizeSubTab === 'description'
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                                  )}
                                >
                                  Job Description
                                </button>
                              </div>

                              {/* Sub-Tab 1: Job Keywords (Image 3) */}
                              {optimizeSubTab === 'keywords' && (
                                <div className="space-y-3 pt-1">
                                  {/* Accordion 1: Strong Keywords (Must-Have) */}
                                  <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] overflow-hidden shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => setKeywordsStrongOpen(!keywordsStrongOpen)}
                                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                                    >
                                      <div className="space-y-1.5">
                                        <h4 className="text-xs md:text-sm font-bold text-white">Strong Keywords (Must-Have)</h4>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                                          {match.strongKeywords.length} Matched Keywords ✓
                                        </span>
                                      </div>
                                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", keywordsStrongOpen ? "transform rotate-180" : "")} />
                                    </button>

                                    {keywordsStrongOpen && (
                                      <div className="p-4 pt-0 border-t border-slate-800/60 overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                          <thead>
                                            <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 font-bold">
                                              <th className="py-2 pr-3">Keyword</th>
                                              <th className="py-2 px-3">Status</th>
                                              <th className="py-2 pl-3">Reason</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-800/50">
                                            {match.strongKeywords.map((item, idx) => (
                                              <tr key={idx}>
                                                <td className="py-2.5 pr-3 font-medium text-slate-200">
                                                  {item.keyword}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]">
                                                    {item.status}
                                                  </span>
                                                </td>
                                                <td className="py-2.5 pl-3 text-slate-400 text-[11px] leading-relaxed">
                                                  {item.reason}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>

                                  {/* Accordion 2: Good-to-Have Keywords / Missing Keywords */}
                                  <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] overflow-hidden shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => setKeywordsGoodOpen(!keywordsGoodOpen)}
                                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                                    >
                                      <div className="space-y-1.5">
                                        <h4 className="text-xs md:text-sm font-bold text-white">Good-to-Have Keywords (Role Requirements)</h4>
                                        {match.missingKeywords.length === 0 ? (
                                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                                            All Keywords Optimized ✓
                                          </span>
                                        ) : (
                                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[11px] font-bold">
                                            {match.missingKeywords.length} Missing Keyword{match.missingKeywords.length > 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>
                                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", keywordsGoodOpen ? "transform rotate-180" : "")} />
                                    </button>

                                    {keywordsGoodOpen && (
                                      <div className="p-4 pt-0 border-t border-slate-800/60 overflow-x-auto">
                                        {match.missingKeywords.length === 0 ? (
                                          <div className="py-4 text-center text-xs text-emerald-400 font-semibold">
                                            🎉 All key job keywords are present in your resume!
                                          </div>
                                        ) : (
                                          <table className="w-full text-left text-xs">
                                            <thead>
                                              <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 font-bold">
                                                <th className="py-2 pr-3">Keyword</th>
                                                <th className="py-2 px-3">Status</th>
                                                <th className="py-2 pl-3">Reason</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                              {match.missingKeywords.map((item, idx) => (
                                                <tr key={idx}>
                                                  <td className="py-2.5 pr-3 font-medium text-slate-200">
                                                    {item.keyword}
                                                  </td>
                                                  <td className="py-2.5 px-3">
                                                    <div className="flex items-center gap-2">
                                                      <span className="px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-300 font-bold text-[10px]">
                                                        Missing
                                                      </span>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setAddSkillKeyword(item.keyword);
                                                          setIsAddSkillModalOpen(true);
                                                        }}
                                                        className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-sm transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
                                                        title={`Add ${item.keyword} to resume`}
                                                      >
                                                        <span>+ Add</span>
                                                      </button>
                                                    </div>
                                                  </td>
                                                  <td className="py-2.5 pl-3 text-slate-400 text-[11px] leading-relaxed">
                                                    {item.reason}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Accordion 3: Role Alignment Criteria */}
                                  <div className="rounded-2xl border border-slate-800/80 bg-[#080d19] overflow-hidden shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => setRoleAlignmentOpen(!roleAlignmentOpen)}
                                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                                    >
                                      <div className="space-y-1.5">
                                        <h4 className="text-xs md:text-sm font-bold text-white">Role Alignment Criteria</h4>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[11px] font-bold">
                                          2 Role Alignment Criteria Not Met
                                        </span>
                                      </div>
                                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", roleAlignmentOpen ? "transform rotate-180" : "")} />
                                    </button>

                                    {roleAlignmentOpen && (
                                      <div className="p-4 pt-0 border-t border-slate-800/60 overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                          <thead>
                                            <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 font-bold">
                                              <th className="py-2 pr-3">Criteria</th>
                                              <th className="py-2 px-3">Status</th>
                                              <th className="py-2 pl-3">Reason</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-800/50">
                                            <tr>
                                              <td className="py-2.5 pr-3 font-medium text-slate-200">
                                                2 - 4 YOE Full-time Experience
                                              </td>
                                              <td className="py-2.5 px-3">
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-300 font-bold text-[10px]">
                                                  Review
                                                </span>
                                              </td>
                                              <td className="py-2.5 pl-3 text-slate-400 text-[11px] leading-relaxed">
                                                Pre-university & current undergraduate status (Expected 2027); emphasize hands-on project depth.
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="py-2.5 pr-3 font-medium text-slate-200">
                                                Production Cloud Deployment
                                              </td>
                                              <td className="py-2.5 px-3">
                                                <span className="px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-300 font-bold text-[10px]">
                                                  Missing
                                                </span>
                                              </td>
                                              <td className="py-2.5 pl-3 text-slate-400 text-[11px] leading-relaxed">
                                                Highlight AWS/Docker deployment in project summaries to pass recruiter filters.
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Sub-Tab 2: Optimization History (Exact Match to Image 2) */}
                              {optimizeSubTab === 'history' && (
                                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                                  {optimizationHistory.map((item, idx) => (
                                    <div
                                      key={item.id || idx}
                                      className="rounded-2xl border border-slate-800/90 bg-[#080d19] p-5 space-y-4 shadow-xl transition-all hover:border-slate-700/80"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <div className="flex items-baseline gap-0.5">
                                            <span className="text-3xl font-black text-white tracking-tight">{item.score}</span>
                                            <span className="text-sm font-semibold text-slate-400">/100</span>
                                          </div>
                                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mt-1">
                                            OVERALL SCORE
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                          <span>Completed • {formatOptimizationTime(item.timestamp)}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 pt-1">
                                        <button
                                          type="button"
                                          onClick={() => handleRestoreOptimization(item)}
                                          className="flex-1 py-2.5 rounded-xl bg-[#1c2333] hover:bg-[#263147] border border-slate-700/60 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center"
                                        >
                                          Restore
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleViewOptimizationDetails(item)}
                                          className="flex-1 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#5255e2] text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center"
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Sub-Tab 3: Job Description (Exact Match to User Screenshot 2) */}
                              {optimizeSubTab === 'description' && (
                                <div className="rounded-2xl border border-slate-800/90 bg-[#080d19] p-5 space-y-4 shadow-xl">
                                  {/* Title & View Job button */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                                        {selectedJob.title}
                                      </h4>
                                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        {selectedJob.company} • Job ID: {selectedJob.id?.replace(/^[a-z]+-/, '') || '400'}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setViewingJobInModal(selectedJob)}
                                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
                                    >
                                      <span>View Job</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Meta badges: Experience, Location, Job Type */}
                                  <div className="flex items-center gap-4 text-xs text-slate-300 font-medium flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{selectedJob.experienceRequiredYears ? `${selectedJob.experienceRequiredYears} - ${selectedJob.experienceRequiredYears + 2} years` : '2-4 years'}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{selectedJob.location || 'Bengaluru, Karnataka, India'}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="uppercase">{selectedJob.type?.replace('-', '_') || 'FULL_TIME'}</span>
                                    </span>
                                  </div>

                                  {/* Section Divider & Job Description Details */}
                                  <div className="border-t border-slate-800/80 pt-3.5 space-y-3.5">
                                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                      JOB DESCRIPTION
                                    </h5>

                                    {/* Qualifications */}
                                    <div className="space-y-1.5">
                                      <p className="text-xs font-bold text-slate-200">Qualifications:</p>
                                      <ul className="space-y-1.5 text-xs text-slate-300 list-none pl-0">
                                        {(selectedJob.requirements && selectedJob.requirements.length > 0
                                          ? selectedJob.requirements
                                          : [
                                              '2 - 4 YOE',
                                              'Bachelor level degree or equivalent in Computer Science, or related field of study.',
                                              'Technical or Professional Certification in Domain will be preferred'
                                            ]
                                        ).map((req, i) => (
                                          <li key={i} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                                            <span className="text-slate-400 select-none font-bold">•</span>
                                            <span>{req.replace(/^•\s*/, '')}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Responsibilities */}
                                    {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                                      <div className="space-y-1.5 pt-1">
                                        <p className="text-xs font-bold text-slate-200">Responsibilities:</p>
                                        <ul className="space-y-1.5 text-xs text-slate-300 list-none pl-0">
                                          {selectedJob.responsibilities.map((resp, i) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                                              <span className="text-slate-400 select-none font-bold">•</span>
                                              <span>{resp.replace(/^•\s*/, '')}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Overview Description */}
                                    {selectedJob.description && (
                                      <div className="space-y-1 pt-1">
                                        <p className="text-xs font-bold text-slate-200">About the Role:</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">{selectedJob.description}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── SPLITTER & RESIZER (Between Two Panes - Exact Image 1 Match) ── */}
            {viewMode !== 'preview' && (
              <div className="relative w-0 flex items-center justify-center z-20 select-none no-print">
                {/* Middle Draggable Grip Resizer */}
                {!isLeftPanelCollapsed && (
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDraggingResizer(true);
                    }}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#090d18] border border-slate-700/80 hover:border-indigo-500 rounded-md flex items-center justify-center cursor-col-resize shadow-md transition-colors group z-30"
                    title="Drag to resize editor and preview panes"
                  >
                    <GripVertical className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                )}
              </div>
            )}

            {/* ── RIGHT PANE: (TOP ACTION BAR + LIVE RESUME PREVIEW - Image 1 Match) ── */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#05080f] overflow-hidden relative">
              {/* Top Action Bar (Dedicated to right pane) */}
              <header className="h-14 bg-[#0d121f] border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0 no-print z-10">
                {/* Left: Expand button if collapsed + Mode Toggle */}
                <div className="flex items-center gap-3">
                  {isLeftPanelCollapsed && (
                    <button
                      type="button"
                      onClick={() => setIsLeftPanelCollapsed(false)}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Expand editor panel"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <path d="M14 9l3 3-3 3" />
                      </svg>
                    </button>
                  )}

                  {/* Mode Toggle (Editor Mode / Preview Mode) */}
                  <div className="flex p-0.5 rounded-xl bg-slate-900 border border-white/[0.08]">
                    <button
                      onClick={() => setViewMode('editor')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                        viewMode === 'editor'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                      <span>Editor Mode</span>
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                        viewMode === 'preview'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Mode</span>
                    </button>
                  </div>

                  {saveStatus === 'saving' && (
                    <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Saving...
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Saved
                    </span>
                  )}
                </div>

                {/* Right: Undo / Redo + Export PDF */}
                <div className="flex items-center gap-3">
                  {/* Undo / Redo (Image 1 match) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className={cn(
                        'p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-colors',
                        historyIndex > 0 ? 'hover:text-white hover:border-slate-700 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                      )}
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                      className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="Redo"
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Export PDF */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExportPDF}
                    leftIcon={<Download className="w-4 h-4" />}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    Export PDF
                  </Button>
                </div>
              </header>


              {/* ── SUGGESTED CHANGES FLOATING POPOVER (Exact Match to Image 3) ── */}
              {activeSuggestedChange && (
                <div className="absolute bottom-6 right-8 z-40 w-full max-w-lg rounded-2xl border border-purple-200 bg-white p-5 shadow-2xl shadow-indigo-950/40 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200 text-slate-900">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Suggested Changes</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSuggestedChange(null)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {activeSuggestedChange.title}
                  </p>

                  {/* Content comparison box */}
                  <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 space-y-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                      {activeSuggestedChange.category}
                    </span>
                    {activeSuggestedChange.bulletItems ? (
                      <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans list-disc pl-4">
                        {activeSuggestedChange.bulletItems.map((item, idx) => {
                          const isLast = idx === activeSuggestedChange.bulletItems!.length - 1;
                          return (
                            <li key={idx} className={isLast ? "text-emerald-600 font-bold" : ""}>
                              {item}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-xs leading-relaxed text-slate-700 font-sans">
                        <span>{activeSuggestedChange.existingText}</span>
                        <span className="text-emerald-600 font-bold ml-1 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          {activeSuggestedChange.newText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cancel & Accept buttons */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveSuggestedChange(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleAcceptSuggestedChange(activeSuggestedChange.id);
                      }}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              )}

              {/* ── CANVAS PREVIEW SCROLLABLE CONTAINER ── */}
              <div
                onScroll={(e) => {
                  const target = e.currentTarget;
                  if (target.scrollTop > 450) {
                    setCurrentPage(2);
                  } else {
                    setCurrentPage(1);
                  }
                }}
                className="flex-1 flex flex-col bg-[#05080f] overflow-y-auto items-center p-6 custom-scrollbar"
              >
                {(() => {
                  const typoConfig = resumeData.typography || DEFAULT_TYPOGRAPHY;

                  const getTypographyStyle = (level: keyof TypographyConfig) => {
                    const config = typoConfig[level] || DEFAULT_TYPOGRAPHY[level];
                    const fontObj = AVAILABLE_FONTS.find((f) => f.name === config.fontStyle || f.id === config.fontStyle);
                    const fontFamily = fontObj ? fontObj.family : "'Tinos', serif";

                    let fontSizePx = parseInt(config.fontSize, 10);
                    if (isNaN(fontSizePx)) fontSizePx = 16;

                    let renderFontSize = '12.5px';
                    let renderFontWeight = 500;
                    if (level === 'sectionHeader') {
                      renderFontSize = `${Math.max(fontSizePx * 0.95, 15.0).toFixed(1)}px`;
                      renderFontWeight = 800;
                    } else if (level === 'heading') {
                      renderFontSize = `${Math.max(fontSizePx * 0.88, 14.0).toFixed(1)}px`;
                      renderFontWeight = 750;
                    } else if (level === 'subheading') {
                      renderFontSize = `${Math.max(fontSizePx * 0.82, 13.0).toFixed(1)}px`;
                      renderFontWeight = 600;
                    } else {
                      renderFontSize = `${Math.max(fontSizePx * 0.78, 12.5).toFixed(1)}px`;
                      renderFontWeight = 500;
                    }

                    return {
                      fontFamily,
                      fontSize: renderFontSize,
                      lineHeight: config.lineHeight || '1.35',
                      color: config.fontColor || '#000000',
                      fontWeight: renderFontWeight
                    };
                  };

                  const sectionHeaderStyle = getTypographyStyle('sectionHeader');
                  const headingStyle = getTypographyStyle('heading');
                  const subheadingStyle = getTypographyStyle('subheading');
                  const descriptionStyle = getTypographyStyle('description');

                  const isLow = resumeData.template === 'low';
                  const isMedium = resumeData.template === 'medium';
                  const isBulky = resumeData.template === 'bulky';

                  const isBlueTheme = isLow || isBulky;
                  const isNameUppercase = isMedium || isBulky;
                  const headingColorClass = isBlueTheme
                    ? 'text-[#1d4ed8] border-[#1d4ed8]'
                    : 'text-black border-black';
                  const nameColorClass = isLow ? 'text-[#1d4ed8]' : 'text-black';
                  const isPreview = viewMode === 'preview';

                  const sectionOrder = (resumeData as any).layoutOrder || [
                    'summary',
                    'experience',
                    'education',
                    'projects',
                    'skills',
                    'certifications',
                    'awards',
                    'custom'
                  ];

                  const activeOrderedSections = sectionOrder.filter((id) =>
                    resumeData.activeSections.includes(id)
                  );

                  const estimateSectionHeight = (secId: string): number => {
                    const sectionGap = parseInt(resumeData.spacing?.sectionGap || '12', 10) || 12;
                    const itemGap = parseInt(resumeData.spacing?.itemGap || '6', 10) || 6;

                    if (secId === 'summary') {
                      const text = resumeData.summary?.trim() || '';
                      if (!text) return 0;
                      const lines = Math.max(1, Math.ceil(text.length / 95));
                      return sectionGap + 22 + lines * 16;
                    }

                    if (secId === 'experience') {
                      const items = (resumeData.experience || []).filter((e) => e.visible !== false);
                      if (items.length === 0) return 0;
                      return (
                        sectionGap +
                        22 +
                        items.reduce((acc, item) => {
                          const descLines = item.description ? item.description.split('\n').filter(Boolean).length : 1;
                          const techExtra = item.technologies ? 16 : 0;
                          return acc + 30 + descLines * 16 + techExtra + itemGap;
                        }, 0)
                      );
                    }

                    if (secId === 'education') {
                      const items = (resumeData.education || []).filter((edu) => edu.visible !== false);
                      if (items.length === 0) return 0;
                      if (isBulky) {
                        return sectionGap + 24 + (items.length + 1) * 24;
                      }
                      return (
                        sectionGap +
                        22 +
                        items.reduce((acc, edu) => {
                          const descLines = edu.description ? edu.description.split('\n').filter(Boolean).length : 0;
                          return acc + 26 + descLines * 15 + itemGap;
                        }, 0)
                      );
                    }

                    if (secId === 'projects') {
                      const items = (resumeData.projects || []).filter((p) => p.visible !== false);
                      if (items.length === 0) return 0;
                      return (
                        sectionGap +
                        22 +
                        items.reduce((acc, p) => {
                          const descLines = p.description ? p.description.split('\n').filter(Boolean).length : 1;
                          const techExtra = p.technologies ? 16 : 0;
                          return acc + 28 + descLines * 16 + techExtra + itemGap;
                        }, 0)
                      );
                    }

                    if (secId === 'skills') {
                      let filledCount = 0;
                      if (resumeData.skills?.programmingLanguages?.trim()) filledCount++;
                      if (resumeData.skills?.frameworksLibraries?.trim()) filledCount++;
                      if (resumeData.skills?.toolsPlatforms?.trim()) filledCount++;
                      if (resumeData.skills?.databases?.trim()) filledCount++;
                      if (resumeData.skills?.softSkills?.trim()) filledCount++;
                      if (resumeData.skills?.languages?.trim()) filledCount++;
                      const customCats = resumeData.skills?.customCategories || [];
                      filledCount += customCats.filter((c) => c.skills?.trim()).length;
                      if (filledCount === 0 && isPreview) return 0;
                      const rows = Math.max(1, filledCount || (isPreview ? 0 : 4));
                      return sectionGap + 22 + rows * 20;
                    }

                    if (secId === 'certifications') {
                      const items = (resumeData.certifications || []).filter((c: any) => c.visible !== false);
                      if (items.length === 0) return 0;
                      return (
                        sectionGap +
                        22 +
                        items.reduce((acc, c: any) => {
                          const descLines = c.description ? c.description.split('\n').filter((l: string) => l.trim()).length : 0;
                          return acc + 24 + descLines * 16 + itemGap;
                        }, 0)
                      );
                    }

                    if (secId === 'awards') {
                      const items = (resumeData.awards || []).filter((a: any) => a.visible !== false);
                      if (items.length === 0) return 0;
                      return sectionGap + 22 + items.length * 20;
                    }

                    if (secId === 'custom') {
                      const content = resumeData.customSection?.content?.trim() || '';
                      if (!content && isPreview) return 0;
                      const lines = Math.max(1, Math.ceil(content.length / 90));
                      return sectionGap + 22 + lines * 16;
                    }

                    return sectionGap + 40;
                  };

                  const headerHeight = (() => {
                    const hasName = Boolean(resumeData.name?.trim() || (resumeData.firstName && resumeData.lastName));
                    const hasHeadline = Boolean(resumeData.headline?.trim());
                    const hasContacts = Boolean(
                      resumeData.phone?.trim() ||
                      resumeData.email?.trim() ||
                      resumeData.location?.trim() ||
                      (resumeData.socialLinks && resumeData.socialLinks.length > 0)
                    );
                    if (!hasName && !hasHeadline && !hasContacts && isPreview) return 0;
                    let h = 45;
                    if (hasHeadline) h += 18;
                    if (hasContacts) h += 24;
                    return h;
                  })();

                  const totalEstimatedHeight =
                    headerHeight +
                    activeOrderedSections.reduce((acc, secId) => acc + estimateSectionHeight(secId), 0);

                  const page1MaxHeight = fitSinglePage ? 1150 : 1000;

                  let page1Sections: string[] = [];
                  let page2Sections: string[] = [];

                  if (fitSinglePage || totalEstimatedHeight <= page1MaxHeight) {
                    page1Sections = activeOrderedSections;
                    page2Sections = [];
                  } else {
                    let currentHeight = headerHeight;
                    activeOrderedSections.forEach((secId) => {
                      const secHeight = estimateSectionHeight(secId);
                      if (currentHeight + secHeight <= page1MaxHeight || page1Sections.length === 0) {
                        page1Sections.push(secId);
                        currentHeight += secHeight;
                      } else {
                        page2Sections.push(secId);
                      }
                    });
                  }

                  const totalPages = page2Sections.length > 0 ? 2 : 1;

                  const handleCreateFirstExperience = (field: string, val: string) => {
                    const newExp: ResumeExperienceItem = {
                      id: `exp-${Date.now()}`,
                      role: field === 'role' ? val : '',
                      employmentType: field === 'employmentType' ? val : '',
                      company: field === 'company' ? val : '',
                      location: field === 'location' ? val : '',
                      locationType: field === 'locationType' ? val : '',
                      startDate: field === 'startDate' ? val : '',
                      endDate: field === 'endDate' ? val : '',
                      current: false,
                      description: field === 'description' ? val : '',
                      technologies: field === 'technologies' ? val : '',
                      visible: true
                    };
                    handleUpdate((prev) => ({
                      ...prev,
                      experience: [newExp]
                    }));
                  };

                  const handleCreateFirstEducation = (field: string, val: string) => {
                    const newEdu: ResumeEducationItem = {
                      id: `edu-${Date.now()}`,
                      institution: field === 'institution' ? val : '',
                      location: field === 'location' ? val : '',
                      degree: field === 'degree' ? val : '',
                      fieldOfStudy: field === 'fieldOfStudy' ? val : '',
                      startDate: field === 'startDate' ? val : '',
                      endDate: field === 'endDate' ? val : '',
                      cgpa: field === 'cgpa' ? val : '',
                      cgpaLabel: 'CGPA',
                      description: field === 'description' ? val : '',
                      visible: true
                    };
                    handleUpdate((prev) => ({
                      ...prev,
                      education: [newEdu]
                    }));
                  };

                  const handleCreateFirstProject = (field: string, val: string) => {
                    const newProj: ResumeProjectItem = {
                      id: `proj-${Date.now()}`,
                      title: field === 'title' ? val : '',
                      role: field === 'role' ? val : '',
                      startDate: field === 'startDate' ? val : '',
                      endDate: field === 'endDate' ? val : '',
                      description: field === 'description' ? val : '',
                      technologies: field === 'technologies' ? val : '',
                      link: '',
                      visible: true
                    };
                    handleUpdate((prev) => ({
                      ...prev,
                      projects: [newProj]
                    }));
                  };

                  const handleUpdateSkillCategory = (key: string, val: string) => {
                    handleUpdate((prev) => ({
                      ...prev,
                      skills: {
                        ...prev.skills,
                        [key]: val
                      }
                    }));
                  };

                  const renderHeader = () => {
                    const isPreview = viewMode === 'preview';
                    const firstName = resumeData.firstName?.trim() || '';
                    const lastName = resumeData.lastName?.trim() || '';
                    let fullName = [firstName, lastName].filter(Boolean).join(' ') || resumeData.name?.trim() || '';

                    if (!fullName || ['UNTITLED RESUME', 'UNTITLED', 'RESUME'].includes(fullName.toUpperCase())) {
                      const rawTitle = titleInput || (resume?.title ? resume.title : (resume?.fileName ? resume.fileName.replace(/\.(pdf|docx|txt)$/i, '') : ''));
                      const clean = rawTitle.replace(/\.(pdf|docx|txt)$/i, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
                      if (clean && !['UNTITLED', 'RESUME', 'UNTITLED RESUME'].includes(clean.toUpperCase())) {
                        fullName = clean;
                      } else {
                        fullName = '';
                      }
                    }

                    const isMockAlexName = fullName.toLowerCase() === 'alex rivera' || fullName.toLowerCase() === 'alex';
                    if (!fullName || isMockAlexName) {
                      fullName = '';
                    }

                    const isNameFilled = Boolean(fullName && fullName.trim());

                    let headline = resumeData.headline?.trim() || '';
                    if (!isNameFilled && headline.toLowerCase().includes('senior full stack & cloud application engineer')) {
                      headline = '';
                    }
                    const isHeadlineFilled = Boolean(headline && headline.trim());

                    let phone = resumeData.phone?.trim() || '';
                    if (!isNameFilled && (phone === '+1 (555) 234-5678' || phone.includes('234-5678'))) {
                      phone = '';
                    }
                    let email = resumeData.email?.trim() || '';
                    if (!isNameFilled && email === 'alex.rivera@example.com') {
                      email = '';
                    }
                    let locationText = [resumeData.city, resumeData.state, resumeData.country]
                      .filter(Boolean)
                      .join(', ') || resumeData.location?.trim() || '';
                    if (!isNameFilled && locationText.toLowerCase().includes('san francisco, ca (open to remote)')) {
                      locationText = '';
                    }

                    const validSocialLinks = (resumeData.socialLinks || []).filter(
                      (l) => l.url && l.url.trim().length > 0
                    );

                    const handleUpdatePersonalInfoField = (field: string, val: string) => {
                      handleUpdate((prev) => {
                        if (field === 'fullName') {
                          const parts = val.trim().split(' ');
                          const fName = parts[0] || '';
                          const lName = parts.slice(1).join(' ') || '';
                          return {
                            ...prev,
                            name: val,
                            firstName: fName,
                            lastName: lName
                          };
                        }
                        if (field === 'city' || field === 'location') {
                          return {
                            ...prev,
                            city: val,
                            location: val
                          };
                        }
                        return {
                          ...prev,
                          [field]: val
                        };
                      });
                    };

                    return (
                      <div className="resume-candidate-header text-center pb-2 font-serif" data-section="candidate-header">
                        {isPreview ? (
                          isNameFilled && (
                            <h1
                              className={cn(
                                'text-[28px] font-extrabold leading-tight font-serif tracking-[0.03em]',
                                isNameUppercase ? 'uppercase text-black' : 'text-black'
                              )}
                              style={{
                                fontFamily: headingStyle.fontFamily,
                                fontWeight: 800,
                                color: isLow ? '#1d4ed8' : '#000000'
                              }}
                            >
                              {isNameUppercase ? fullName.toUpperCase() : fullName}
                            </h1>
                          )
                        ) : (
                          <div className="flex justify-center">
                            <DirectEditableText
                              value={isNameFilled ? (isNameUppercase ? fullName.toUpperCase() : fullName) : ''}
                              placeholder="[FIRST NAME] [LAST NAME]"
                              onChange={(val) => handleUpdatePersonalInfoField('fullName', val)}
                              viewMode={viewMode}
                              className={cn(
                                'text-[28px] font-extrabold leading-tight font-serif tracking-[0.03em]',
                                isNameUppercase ? 'uppercase' : ''
                              )}
                              style={{
                                fontFamily: headingStyle.fontFamily,
                                fontWeight: 800,
                                color: isNameFilled ? (isLow ? '#1d4ed8' : '#000000') : '#64748b'
                              }}
                            />
                          </div>
                        )}

                        {isPreview ? (
                          isHeadlineFilled && (
                            <p
                              className="text-[13px] italic mt-0.5 font-serif font-semibold text-black"
                              style={{
                                fontFamily: subheadingStyle.fontFamily,
                                color: '#000000',
                                fontWeight: 600
                              }}
                            >
                              {headline}
                            </p>
                          )
                        ) : (
                          <div className="flex justify-center mt-0.5">
                            <DirectEditableText
                              value={headline}
                              placeholder="[Your one-line professional headline]"
                              onChange={(val) => handleUpdatePersonalInfoField('headline', val)}
                              viewMode={viewMode}
                              className="text-[13px] italic font-serif font-semibold"
                              style={{
                                fontFamily: subheadingStyle.fontFamily,
                                color: isHeadlineFilled ? '#000000' : '#64748b',
                                fontWeight: 600
                              }}
                            />
                          </div>
                        )}

                        {/* Contact Information Row (Images 1, 2, 3 Match) */}
                        {(phone || email || locationText || validSocialLinks.length > 0 || !isPreview) && (
                          <div
                            className={cn(
                              "flex flex-wrap items-center justify-center text-[12px] font-medium mt-1.5 font-serif text-black",
                              isBulky ? "gap-x-1 gap-y-1" : "gap-x-5 gap-y-1"
                            )}
                            style={{ color: '#000000', fontWeight: 500 }}
                          >
                            {/* Phone (No icon for Bulky per Image 3, with icon for Low/Medium per Images 1 & 2) */}
                            {(phone || !isPreview) && (
                              <span className="inline-flex items-center gap-1.5">
                                {!isBulky && (
                                  <svg className={cn("w-3.5 h-3.5 shrink-0 inline", phone ? "fill-black text-black" : "fill-[#64748b] text-[#64748b]")} viewBox="0 0 24 24">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                )}
                                {isPreview && phone ? (
                                  <a
                                    href={`tel:${phone.replace(/\s/g, '')}`}
                                    className="text-black font-medium"
                                    style={{ color: '#000000', fontWeight: 500, textDecoration: 'none' }}
                                  >
                                    {phone}
                                  </a>
                                ) : (
                                  <DirectEditableText
                                    value={phone}
                                    placeholder="[Phone Number]"
                                    onChange={(val) => handleUpdatePersonalInfoField('phone', val)}
                                    viewMode={viewMode}
                                    className={phone ? "text-black font-medium" : "text-[#64748b] font-medium"}
                                    style={{ color: phone ? '#000000' : '#64748b', fontWeight: 500 }}
                                  />
                                )}
                              </span>
                            )}

                            {/* Bulky separator after phone */}
                            {isBulky && (phone || !isPreview) && (email || locationText || validSocialLinks.length > 0 || !isPreview) && (
                              <span className="text-black font-normal px-2.5 select-none">|</span>
                            )}

                            {/* Email */}
                            {(email || !isPreview) && (
                              <span className="inline-flex items-center gap-1.5">
                                <svg
                                  className={cn("w-3.5 h-3.5 shrink-0 inline", email ? "stroke-black text-black" : "stroke-[#64748b] text-[#64748b]")}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect width="20" height="16" x="2" y="4" rx="2" />
                                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                {isPreview && email ? (
                                  <a
                                    href={`mailto:${email}`}
                                    className="text-black font-medium"
                                    style={{ color: '#000000', fontWeight: 500, textDecoration: 'none' }}
                                  >
                                    {email}
                                  </a>
                                ) : (
                                  <DirectEditableText
                                    value={email}
                                    placeholder="[Email]"
                                    onChange={(val) => handleUpdatePersonalInfoField('email', val)}
                                    viewMode={viewMode}
                                    className={email ? "text-black font-medium hover:underline cursor-pointer" : "text-[#64748b] font-medium"}
                                    style={{ color: email ? '#000000' : '#64748b', fontWeight: 500 }}
                                  />
                                )}
                              </span>
                            )}

                            {/* Social Links (Render only if user actually added them) */}
                            {validSocialLinks.map((l, idx) => {
                              const label =
                                (l.customLabel && l.customLabel.trim() && l.customLabel !== 'LinkedIn' && l.customLabel !== 'GitHub')
                                  ? l.customLabel.trim()
                                  : l.platform.toLowerCase().includes('linkedin')
                                    ? (l.url.trim().split('/').filter(Boolean).pop() || 'linkedin')
                                    : l.platform.toLowerCase().includes('github')
                                      ? (l.url.trim().split('/').filter(Boolean).pop() || 'github')
                                      : l.platform;
                              const rawUrl = l.url.trim();
                              const href = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;

                              const pLower = (l.platform || '').toLowerCase();
                              const uLower = rawUrl.toLowerCase();
                              const cLower = (l.customLabel || '').toLowerCase();
                              const idLower = (l.id || '').toLowerCase();

                              const isGitHub =
                                pLower.includes('github') ||
                                uLower.includes('github') ||
                                cLower.includes('github') ||
                                idLower.endsWith('-gh') ||
                                idLower === 'gh';
                              const isLinkedIn =
                                !isGitHub &&
                                (pLower.includes('linkedin') ||
                                  uLower.includes('linkedin') ||
                                  cLower.includes('linkedin') ||
                                  idLower.endsWith('-li') ||
                                  idLower === 'li');
                              const isTwitter =
                                !isGitHub &&
                                !isLinkedIn &&
                                (pLower.includes('twitter') ||
                                  pLower === 'x' ||
                                  uLower.includes('twitter.com') ||
                                  uLower.includes('x.com') ||
                                  idLower.endsWith('-tw'));

                              return (
                                <React.Fragment key={l.id || `social-${idx}`}>
                                  {isBulky && <span className="text-black font-normal px-2.5 select-none">|</span>}
                                  <span className="inline-flex items-center gap-1">
                                    {isLinkedIn ? (
                                      <svg className="w-3.5 h-3.5 text-black fill-current inline shrink-0" viewBox="0 0 24 24">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
                                      </svg>
                                    ) : isGitHub ? (
                                      <svg className="w-3.5 h-3.5 text-black fill-current inline shrink-0" viewBox="0 0 24 24">
                                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                                      </svg>
                                    ) : isTwitter ? (
                                      <svg className="w-3.5 h-3.5 text-black fill-current inline shrink-0" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                      </svg>
                                    ) : (
                                      <Link2 className="w-3.5 h-3.5 text-black shrink-0" />
                                    )}
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-black hover:underline cursor-pointer font-medium" style={{ fontWeight: 500 }}>
                                      {label}
                                    </a>
                                  </span>
                                </React.Fragment>
                              );
                            })}

                            {/* Bulky separator before location */}
                            {isBulky && (locationText || !isPreview) && (email || phone || validSocialLinks.length > 0 || !isPreview) && (
                              <span className="text-black font-normal px-2.5 select-none">|</span>
                            )}

                            {/* Location */}
                            {(locationText || !isPreview) && (
                              <span className="inline-flex items-center gap-1.5">
                                <svg className={cn("w-3.5 h-3.5 shrink-0 inline", locationText ? "fill-black text-black" : "fill-[#64748b] text-[#64748b]")} viewBox="0 0 24 24">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <DirectEditableText
                                  value={locationText}
                                  placeholder="[City, State/Country]"
                                  onChange={(val) => handleUpdatePersonalInfoField('city', val)}
                                  viewMode={viewMode}
                                  className={locationText ? "text-black font-medium" : "text-[#64748b] font-medium"}
                                  style={{ color: locationText ? '#000000' : '#64748b', fontWeight: 500 }}
                                />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  };

                  // Helper to render markdown bold (**text** or <b>text</b>), italic (*text* or <i>text</i>), and bullets
                  const renderFormattedContent = (content: string | undefined, defaultText?: string, isParagraphOnly: boolean = false) => {
                    let raw = content?.trim() ? content : defaultText;
                    if (!raw) return null;

                    if (isParagraphOnly) {
                      raw = raw.replace(/^[•\-*]\s*/, '').trim();
                    }

                    const lines = raw.split('\n');
                    const isBulletList = !isParagraphOnly && lines.some((l) => {
                      const t = l.trim();
                      return t.startsWith('•') || t.startsWith('-') || t.startsWith('*');
                    });

                    const parseInlineStyles = (str: string) => {
                      let cleanStr = isBulletList ? str.replace(/^[•\-*]\s*/, '') : str;
                      cleanStr = cleanStr.replace(/^\*+/, '').replace(/\*+$/, '').trim();
                      cleanStr = cleanStr.replace(/\*\*([^*]+)\*\*/g, '«BOLD»$1«/BOLD»');
                      cleanStr = cleanStr.replace(/\*([^*]+)\*/g, '«ITALIC»$1«/ITALIC»');
                      cleanStr = cleanStr.replace(/\*/g, '');
                      cleanStr = cleanStr.replace(/«BOLD»/g, '**').replace(/«\/BOLD»/g, '**');
                      cleanStr = cleanStr.replace(/«ITALIC»/g, '*').replace(/«\/ITALIC»/g, '*');

                      const boldTokens = cleanStr.split(/(\*\*[^*]+\*\*|<b>[^<]+<\/b>|<strong>[^<]+<\/strong>)/g);

                      return boldTokens.map((boldTok, bIdx) => {
                        if (!boldTok) return null;
                        if (boldTok.startsWith('**') && boldTok.endsWith('**')) {
                          return (
                            <strong key={bIdx} className="font-bold text-black font-serif" style={{ fontWeight: 800, color: '#000000' }}>
                              {boldTok.slice(2, -2)}
                            </strong>
                          );
                        }
                        if (boldTok.startsWith('<b>') && boldTok.endsWith('</b>')) {
                          return (
                            <strong key={bIdx} className="font-bold text-black font-serif" style={{ fontWeight: 800, color: '#000000' }}>
                              {boldTok.slice(3, -4)}
                            </strong>
                          );
                        }
                        if (boldTok.startsWith('<strong>') && boldTok.endsWith('</strong>')) {
                          return (
                            <strong key={bIdx} className="font-bold text-black font-serif" style={{ fontWeight: 800, color: '#000000' }}>
                              {boldTok.slice(8, -9)}
                            </strong>
                          );
                        }

                        const italicTokens = boldTok.split(/(\*[^*]+\*|<i>[^<]+<\/i>|<em>[^<]+<\/em>)/g);
                        return (
                          <React.Fragment key={bIdx}>
                            {italicTokens.map((itTok, iIdx) => {
                              if (!itTok) return null;
                              if (itTok.startsWith('*') && itTok.endsWith('*')) {
                                return (
                                  <em key={iIdx} className="italic text-black font-serif font-semibold" style={{ color: '#000000', fontWeight: 600 }}>
                                    {itTok.slice(1, -1)}
                                  </em>
                                );
                              }
                              if (itTok.startsWith('<i>') && itTok.endsWith('</i>')) {
                                return (
                                  <em key={iIdx} className="italic text-black font-serif font-semibold" style={{ color: '#000000', fontWeight: 600 }}>
                                    {itTok.slice(3, -4)}
                                  </em>
                                );
                              }
                              if (itTok.startsWith('<em>') && itTok.endsWith('</em>')) {
                                return (
                                  <em key={iIdx} className="italic text-black font-serif font-semibold" style={{ color: '#000000', fontWeight: 600 }}>
                                    {itTok.slice(4, -5)}
                                  </em>
                                );
                              }
                              return <span key={iIdx} className="text-black font-serif font-medium" style={{ color: '#000000', fontWeight: 500 }}>{itTok}</span>;
                            })}
                          </React.Fragment>
                        );
                      });
                    };

                    if (isBulletList) {
                      return (
                        <ul className="mt-1 space-y-0.5 list-disc ml-5 text-[12.5px] leading-relaxed text-black font-serif font-medium" style={{ color: '#000000', fontWeight: 500 }}>
                          {lines
                            .map((l) => l.trim())
                            .filter((l) => l.length > 0)
                            .map((line, idx) => (
                              <li key={idx} className="text-black font-serif font-medium text-[12.5px]" style={{ color: '#000000', fontWeight: 500 }}>
                                {parseInlineStyles(line)}
                              </li>
                            ))}
                        </ul>
                      );
                    }

                    return (
                      <div className="text-[12.5px] leading-relaxed text-black font-serif space-y-1 font-medium" style={{ color: '#000000', fontWeight: 500 }}>
                        {lines
                          .map((l) => l.trim())
                          .filter((l) => l.length > 0)
                          .map((line, idx) => (
                            <p key={idx} className="text-black font-serif font-medium" style={{ color: '#000000', fontWeight: 500 }}>
                              {parseInlineStyles(line)}
                            </p>
                          ))}
                      </div>
                    );
                  };

                  // Interactive Paper Item Wrapper with Floating Toolbar (Image 1 Exact Match)
                  const renderPaperItemWrapper = (
                    itemId: string,
                    sectionKey: string,
                    itemNode: React.ReactNode,
                    onMoveUp?: () => void,
                    onMoveDown?: () => void,
                    onToggleVisibility?: () => void,
                    onDelete?: () => void
                  ) => {
                    if (viewMode === 'preview') {
                      return (
                        <div key={itemId} className="relative">
                          {itemNode}
                        </div>
                      );
                    }

                    const isHovered = activePaperItemId === itemId;

                    return (
                      <div
                        key={itemId}
                        onMouseEnter={() => setActivePaperItemId(itemId)}
                        onMouseLeave={() => setActivePaperItemId((curr) => (curr === itemId ? null : curr))}
                        className={cn(
                          'relative rounded transition-all duration-150 p-1 -m-1',
                          isHovered ? 'border border-dashed border-indigo-400 bg-indigo-500/[0.03]' : 'border border-transparent'
                        )}
                      >
                        {itemNode}

                        {/* Floating Action Pill Bar (Image 1 Exact Match) */}
                        {isHovered && (
                          <div
                            className="absolute -bottom-3.5 right-3 bg-[#0a0f1d] border border-slate-700/90 rounded-full px-2.5 py-1 flex items-center gap-2 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100 no-print select-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setSearchParams({ tab: 'job-optimize' })}
                              className="flex items-center gap-1 text-[10px] font-bold text-purple-300 hover:text-white bg-purple-900/50 hover:bg-purple-900/80 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                              <span>Improve with AI</span>
                            </button>

                            <div className="w-[1px] h-3 bg-slate-700" />

                            <button
                              type="button"
                              onClick={onMoveUp || (() => showToast({ type: 'info', title: 'Reorder', message: 'Reorder available in edit content.' }))}
                              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer text-xs font-bold leading-none"
                              title="Move Up"
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              onClick={onMoveDown || (() => showToast({ type: 'info', title: 'Reorder', message: 'Reorder available in edit content.' }))}
                              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer text-xs font-bold leading-none"
                              title="Move Down"
                            >
                              ↓
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSearchParams({ tab: 'editor' });
                                setExpandedSections((prev) => ({ ...prev, [sectionKey]: true }));
                              }}
                              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer text-xs leading-none"
                              title="Edit"
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              onClick={onToggleVisibility || (() => showToast({ type: 'info', title: 'Visibility', message: 'Toggled item visibility.' }))}
                              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                              title="Toggle Visibility"
                            >
                              <Eye className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={onDelete || (() => showToast({ type: 'info', title: 'Delete', message: 'Deleted item from resume.' }))}
                              className="text-rose-400 hover:text-rose-300 p-0.5 rounded transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  };

                  const renderSection = (sectionId: string) => {
                    const isPreview = viewMode === 'preview';

                    // 1. PROFESSIONAL SUMMARY (Image 1, 2, 3, 4 Match)
                    if (sectionId === 'summary') {
                      const hasSummary = Boolean(resumeData.summary?.trim());

                      return (
                        <section key="summary" style={{ marginTop: resumeData.spacing.sectionGap }}>
                          <h2
                            className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                            style={{
                              fontFamily: sectionHeaderStyle.fontFamily,
                              fontSize: '15px',
                              fontWeight: 800,
                              letterSpacing: '0.03em',
                              borderBottom: isBlueTheme ? '1.75px solid #1d4ed8' : '1.75px solid #000000',
                              color: isBlueTheme ? '#1d4ed8' : '#000000'
                            }}
                          >
                            PROFESSIONAL SUMMARY
                          </h2>
                          {isPreview ? (
                            hasSummary ? renderFormattedContent(resumeData.summary, undefined, true) : null
                          ) : (
                            <DirectEditableText
                              value={resumeData.summary}
                              placeholder="[Summarize your career in 2-3 sentences. Focus on your years of experience and core strengths]"
                              onChange={(val) => handleUpdate((prev) => ({ ...prev, summary: val }))}
                              viewMode={viewMode}
                              multiline
                              defaultShowBox={!hasSummary}
                              className="w-full text-[12.5px] leading-relaxed font-serif font-medium"
                              style={{ fontFamily: descriptionStyle.fontFamily, color: hasSummary ? '#000000' : '#64748b', fontWeight: 500 }}
                            />
                          )}
                        </section>
                      );
                    }

                    // 2. WORK EXPERIENCE (Images 1, 2, 3, 4 Match)
                    if (sectionId === 'experience') {
                      const visibleExperience = (resumeData.experience || []).filter((exp) => exp.visible !== false);

                      return (
                        <section key="experience" style={{ marginTop: resumeData.spacing.sectionGap }}>
                          <h2
                            className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                            style={{
                              fontFamily: sectionHeaderStyle.fontFamily,
                              fontSize: '15px',
                              fontWeight: 800,
                              letterSpacing: '0.03em',
                              borderBottom: isBlueTheme ? '1.75px solid #1d4ed8' : '1.75px solid #000000',
                              color: isBlueTheme ? '#1d4ed8' : '#000000'
                            }}
                          >
                            WORK EXPERIENCE
                          </h2>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: resumeData.spacing.itemGap }}>
                            {visibleExperience.length > 0 ? (
                              visibleExperience.map((exp, idx) =>
                                renderPaperItemWrapper(
                                  exp.id,
                                  'experience',
                                  <div className="text-left font-serif">
                                    <div className="flex justify-between items-baseline text-[13.5px] leading-tight">
                                      <div className="flex items-center gap-1">
                                        <DirectEditableText
                                          value={exp.role}
                                          placeholder="[Job Title]"
                                          onChange={(val) => handleUpdateExpField(exp.id, 'role', val)}
                                          viewMode={viewMode}
                                          className="font-bold text-black text-[13.5px]"
                                          style={{ color: '#000000', fontWeight: 750 }}
                                        />
                                        {(exp.employmentType || !isPreview) && (
                                          <span className="text-black font-semibold text-[12.5px]" style={{ color: '#000000', fontWeight: 600 }}>
                                            {' '}| <DirectEditableText
                                              value={exp.employmentType}
                                              placeholder="[Employment Type]"
                                              onChange={(val) => handleUpdateExpField(exp.id, 'employmentType', val)}
                                              viewMode={viewMode}
                                              className="font-semibold text-black text-[12.5px]"
                                              style={{ color: exp.employmentType ? '#000000' : '#64748b', fontWeight: 600 }}
                                            />
                                          </span>
                                        )}
                                      </div>
                                      {(exp.startDate || !isPreview) && (
                                        <DirectEditableText
                                          value={exp.startDate ? `${exp.startDate} - ${exp.endDate || 'Present'}` : ''}
                                          placeholder="[Mention work tenure]"
                                          onChange={(val) => handleUpdateExpField(exp.id, 'startDate', val)}
                                          viewMode={viewMode}
                                          className="italic text-black text-[12px] font-semibold"
                                          style={{ color: '#000000', fontWeight: 600 }}
                                        />
                                      )}
                                    </div>
                                    {(exp.company || exp.location || exp.locationType || !isPreview) && (
                                      <div className="flex justify-between items-baseline text-[12.5px] italic text-black font-semibold leading-tight mt-0.5" style={{ fontWeight: 600 }}>
                                        <DirectEditableText
                                          value={exp.company}
                                          placeholder="[Organization Name]"
                                          onChange={(val) => handleUpdateExpField(exp.id, 'company', val)}
                                          viewMode={viewMode}
                                          style={{ color: '#000000', fontWeight: 600 }}
                                        />
                                        <DirectEditableText
                                          value={exp.locationType && exp.location ? `${exp.locationType} • ${exp.location}` : (exp.location || exp.locationType || '')}
                                          placeholder="[Location Type] • [Location]"
                                          onChange={(val) => handleUpdateExpField(exp.id, 'location', val)}
                                          viewMode={viewMode}
                                          style={{ color: '#000000', fontWeight: 600 }}
                                        />
                                      </div>
                                    )}
                                    {(exp.description || !isPreview) && (
                                      <div className="mt-1">
                                        {isPreview ? (
                                          renderFormattedContent(exp.description)
                                        ) : (
                                          <DirectEditableText
                                            value={exp.description}
                                            placeholder="[Mention your work role and responsibilities]"
                                            onChange={(val) => handleUpdateExpField(exp.id, 'description', val)}
                                            viewMode={viewMode}
                                            multiline
                                            className="w-full text-[12.5px] leading-relaxed font-serif font-medium"
                                            style={{ color: '#000000', fontWeight: 500 }}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {(exp.technologies || !isPreview) && (
                                      <p className="text-[12px] text-black font-medium mt-0.5 font-serif" style={{ color: '#000000', fontWeight: 500 }}>
                                        <strong className="font-bold italic text-black" style={{ color: '#000000', fontWeight: 800 }}>Technologies / Skills Used :</strong>{' '}
                                        <DirectEditableText
                                          value={exp.technologies}
                                          placeholder="[List 3-5 key tools/skills used in this specific role]"
                                          onChange={(val) => handleUpdateExpField(exp.id, 'technologies', val)}
                                          viewMode={viewMode}
                                          className="italic text-black font-medium"
                                          style={{ color: '#000000', fontWeight: 500 }}
                                        />
                                      </p>
                                    )}
                                  </div>,
                                  idx > 0 ? () => handleMoveExperience(idx, 'up') : undefined,
                                  idx < visibleExperience.length - 1 ? () => handleMoveExperience(idx, 'down') : undefined,
                                  () => handleToggleExperienceVisibility(exp.id),
                                  () => handleDeleteExperience(exp.id)
                                )
                              )
                            ) : isPreview ? null : (
                              renderPaperItemWrapper(
                                'placeholder-experience',
                                'experience',
                                <div className="text-left font-serif">
                                  <div className="flex justify-between items-baseline text-[11.5px] leading-tight">
                                    <DirectEditableText
                                      placeholder="[Job Title] | [Employment Type]"
                                      onChange={(val) => handleCreateFirstExperience('role', val)}
                                      viewMode={viewMode}
                                      className="font-bold text-[#64748b]"
                                      style={{ color: '#64748b', fontWeight: 700 }}
                                    />
                                    <DirectEditableText
                                      placeholder="[Mention work tenure]"
                                      onChange={(val) => handleCreateFirstExperience('startDate', val)}
                                      viewMode={viewMode}
                                      className="italic text-[#64748b] text-[11px]"
                                      style={{ color: '#64748b' }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-baseline text-[11px] italic text-[#64748b] leading-tight mt-0.5">
                                    <DirectEditableText
                                      placeholder="[Organization Name]"
                                      onChange={(val) => handleCreateFirstExperience('company', val)}
                                      viewMode={viewMode}
                                      style={{ color: '#64748b' }}
                                    />
                                    <DirectEditableText
                                      placeholder="[Location Type] • [Location]"
                                      onChange={(val) => handleCreateFirstExperience('location', val)}
                                      viewMode={viewMode}
                                      style={{ color: '#64748b' }}
                                    />
                                  </div>
                                  <p className="text-[11px] italic text-[#64748b] mt-0.5 font-serif" style={{ color: '#64748b' }}>
                                    <DirectEditableText
                                      placeholder="[Mention your work role and responsibilities]"
                                      onChange={(val) => handleCreateFirstExperience('description', val)}
                                      viewMode={viewMode}
                                      multiline
                                      style={{ color: '#64748b' }}
                                    />
                                  </p>
                                  <p className="text-[11px] text-black mt-0.5 font-serif" style={{ color: '#000000' }}>
                                    <strong className="font-bold italic text-black" style={{ color: '#000000', fontWeight: 700 }}>Technologies / Skills Used :</strong>{' '}
                                    <DirectEditableText
                                      placeholder="[List 3-5 key tools/skills used in this specific role]"
                                      onChange={(val) => handleCreateFirstExperience('technologies', val)}
                                      viewMode={viewMode}
                                      className="italic text-[#64748b]"
                                      style={{ color: '#64748b' }}
                                    />
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </section>
                      );
                    }

                    // 3. EDUCATION (Images 1, 2, 3, 4 Match)
                    if (sectionId === 'education') {
                      const visibleEducation = (resumeData.education || []).filter((edu) => edu.visible !== false);

                      if (isBulky) {
                        return (
                          <section key="education" style={{ marginTop: resumeData.spacing.sectionGap }}>
                            <h2
                              className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                              style={{
                                fontFamily: sectionHeaderStyle.fontFamily,
                                fontSize: '15px',
                                fontWeight: 800,
                                letterSpacing: '0.03em',
                                borderBottom: '1.75px solid #1d4ed8',
                                color: '#1d4ed8'
                              }}
                            >
                              EDUCATION
                            </h2>
                            <div className="w-full mt-1.5">
                              <table className="w-full border-collapse border border-black text-black font-serif text-[12px]">
                                <thead>
                                  <tr className="border-b border-black">
                                    <th className="border-r border-black py-1 px-2 font-bold text-center w-[20%] text-[12px]" style={{ fontWeight: 800 }}>
                                      Year
                                    </th>
                                    <th className="border-r border-black py-1 px-2 font-bold text-center w-[30%] text-[12px]" style={{ fontWeight: 800 }}>
                                      Degree
                                    </th>
                                    <th className="border-r border-black py-1 px-2 font-bold text-center w-[30%] text-[12px]" style={{ fontWeight: 800 }}>
                                      Institute
                                    </th>
                                    <th className="py-1 px-2 font-bold text-center w-[20%] text-[12px]" style={{ fontWeight: 800 }}>
                                      CGPA/MARKS
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {visibleEducation.length > 0 ? (
                                    visibleEducation.map((edu) => (
                                      <tr key={edu.id} className="border-b border-black last:border-b-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="border-r border-black py-1 px-2 text-center text-[12px] font-medium align-middle" style={{ color: '#000000', fontWeight: 500 }}>
                                          {isPreview ? (
                                            edu.startDate && edu.endDate
                                              ? `${edu.startDate} - ${edu.endDate}`
                                              : (edu.endDate || edu.startDate || '')
                                          ) : (
                                            <DirectEditableText
                                              value={
                                                edu.startDate && edu.endDate
                                                  ? `${edu.startDate} - ${edu.endDate}`
                                                  : (edu.endDate || edu.startDate || '')
                                              }
                                              placeholder="[Education tenure]"
                                              onChange={(val) => handleUpdateEduField(edu.id, edu.startDate ? 'startDate' : 'endDate', val)}
                                              viewMode={viewMode}
                                              className="text-center w-full"
                                              style={{ color: (edu.startDate || edu.endDate) ? '#000000' : '#64748b' }}
                                            />
                                          )}
                                        </td>
                                        <td className="border-r border-black py-1 px-2 text-center text-[12px] font-medium align-middle" style={{ color: '#000000', fontWeight: 500 }}>
                                          {isPreview ? (
                                            edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '')
                                          ) : (
                                            <DirectEditableText
                                              value={edu.degree}
                                              placeholder="[Degree]"
                                              onChange={(val) => handleUpdateEduField(edu.id, 'degree', val)}
                                              viewMode={viewMode}
                                              className="text-center w-full"
                                              style={{ color: edu.degree ? '#000000' : '#64748b' }}
                                            />
                                          )}
                                        </td>
                                        <td className="border-r border-black py-1 px-2 text-center text-[12px] font-medium align-middle" style={{ color: '#000000', fontWeight: 500 }}>
                                          {isPreview ? (
                                            edu.institution + (edu.location ? ` | ${edu.location}` : '')
                                          ) : (
                                            <DirectEditableText
                                              value={edu.institution}
                                              placeholder="[Institution Name]"
                                              onChange={(val) => handleUpdateEduField(edu.id, 'institution', val)}
                                              viewMode={viewMode}
                                              className="text-center w-full"
                                              style={{ color: edu.institution ? '#000000' : '#64748b' }}
                                            />
                                          )}
                                        </td>
                                        <td className="py-1 px-2 text-center text-[12px] font-medium align-middle" style={{ color: '#000000', fontWeight: 500 }}>
                                          {isPreview ? (
                                            edu.cgpa
                                          ) : (
                                            <DirectEditableText
                                              value={edu.cgpa}
                                              placeholder="[Mention your score]"
                                              onChange={(val) => handleUpdateEduField(edu.id, 'cgpa', val)}
                                              viewMode={viewMode}
                                              className="text-center w-full"
                                              style={{ color: edu.cgpa ? '#000000' : '#64748b' }}
                                            />
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  ) : isPreview ? null : (
                                    <tr className="border-b border-black last:border-b-0">
                                      <td className="border-r border-black py-1 px-2 text-center text-[12px] font-medium text-[#64748b] align-middle">
                                        <DirectEditableText
                                          placeholder="[Education tenure]"
                                          onChange={(val) => handleCreateFirstEducation('startDate', val)}
                                          viewMode={viewMode}
                                          className="text-center w-full text-[#64748b]"
                                          style={{ color: '#64748b' }}
                                        />
                                      </td>
                                      <td className="border-r border-black py-1 px-2 text-center text-[12px] font-medium text-[#64748b] align-middle">
                                        <DirectEditableText
                                          placeholder="[Degree]"
                                          onChange={(val) => handleCreateFirstEducation('degree', val)}
                                          viewMode={viewMode}
                                          className="text-center w-full text-[#64748b]"
                                          style={{ color: '#64748b' }}
                                        />
                                      </td>
                                      <td className="border-r border-black py-1 px-2 text-center text-[12px] font-medium text-[#64748b] align-middle">
                                        <DirectEditableText
                                          placeholder="[Institution Name]"
                                          onChange={(val) => handleCreateFirstEducation('institution', val)}
                                          viewMode={viewMode}
                                          className="text-center w-full text-[#64748b]"
                                          style={{ color: '#64748b' }}
                                        />
                                      </td>
                                      <td className="py-1 px-2 text-center text-[12px] font-medium text-[#64748b] align-middle">
                                        <DirectEditableText
                                          placeholder="[Mention your score]"
                                          onChange={(val) => handleCreateFirstEducation('cgpa', val)}
                                          viewMode={viewMode}
                                          className="text-center w-full text-[#64748b]"
                                          style={{ color: '#64748b' }}
                                        />
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                              {!isPreview && (
                                <div className="flex items-center justify-end mt-1 gap-2 no-print">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newEdu: ResumeEducationItem = {
                                        id: `edu-${Date.now()}`,
                                        institution: '',
                                        location: '',
                                        degree: '',
                                        fieldOfStudy: '',
                                        startDate: '',
                                        endDate: '',
                                        cgpa: '',
                                        cgpaLabel: 'CGPA',
                                        description: '',
                                        visible: true
                                      };
                                      handleUpdate((prev) => ({
                                        ...prev,
                                        education: [...(prev.education || []), newEdu]
                                      }));
                                    }}
                                    className="text-[11px] text-blue-600 hover:text-blue-800 font-sans font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    + Add row
                                  </button>
                                </div>
                              )}
                            </div>
                          </section>
                        );
                      }

                      return (
                        <section key="education" style={{ marginTop: resumeData.spacing.sectionGap }}>
                          <h2
                            className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                            style={{
                              fontFamily: sectionHeaderStyle.fontFamily,
                              fontSize: '15px',
                              fontWeight: 800,
                              letterSpacing: '0.03em',
                              borderBottom: isBlueTheme ? '1.75px solid #1d4ed8' : '1.75px solid #000000',
                              color: isBlueTheme ? '#1d4ed8' : '#000000'
                            }}
                          >
                            EDUCATION
                          </h2>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: resumeData.spacing.itemGap }}>
                            {visibleEducation.length > 0 ? (
                              visibleEducation.map((edu, idx) =>
                                renderPaperItemWrapper(
                                  edu.id,
                                  'education',
                                  <div className="text-left font-serif text-[12.5px]">
                                    <div className="flex justify-between items-baseline leading-tight">
                                      <div className="flex items-center gap-1">
                                        <DirectEditableText
                                          value={edu.institution}
                                          placeholder="[Institution Name]"
                                          onChange={(val) => handleUpdateEduField(edu.id, 'institution', val)}
                                          viewMode={viewMode}
                                          className="font-bold text-black text-[13.5px]"
                                          style={{ color: '#000000', fontWeight: 750 }}
                                        />
                                        {(edu.location || edu.city || !isPreview) && (
                                          <span className="text-black font-semibold text-[12.5px]" style={{ color: '#000000', fontWeight: 600 }}>
                                            {' '}| <DirectEditableText
                                              value={edu.location || edu.city}
                                              placeholder="[Location]"
                                              onChange={(val) => {
                                                handleUpdateEduField(edu.id, 'location', val);
                                                handleUpdateEduField(edu.id, 'city', val);
                                              }}
                                              viewMode={viewMode}
                                              className="font-semibold text-black text-[12.5px]"
                                              style={{ color: (edu.location || edu.city) ? '#000000' : '#64748b', fontWeight: 600 }}
                                            />
                                          </span>
                                        )}
                                      </div>
                                      {((edu.startDate || edu.endDate) || !isPreview) && (
                                        <DirectEditableText
                                          value={
                                            edu.startDate && edu.endDate
                                              ? `${edu.startDate} - ${edu.endDate}`
                                              : (edu.endDate || edu.startDate || '')
                                          }
                                          placeholder="[Mention education tenure]"
                                          onChange={(val) => handleUpdateEduField(edu.id, edu.startDate ? 'startDate' : 'endDate', val)}
                                          viewMode={viewMode}
                                          className="text-black text-[12px] font-semibold"
                                          style={{ color: '#000000', fontWeight: 600 }}
                                        />
                                      )}
                                    </div>
                                    <div className="flex justify-between items-baseline text-[12.5px] leading-tight mt-0.5">
                                      <div className="flex items-center gap-1">
                                        <DirectEditableText
                                          value={edu.degree}
                                          placeholder="[Degree]"
                                          onChange={(val) => handleUpdateEduField(edu.id, 'degree', val)}
                                          viewMode={viewMode}
                                          className="italic text-black font-semibold text-[12.5px]"
                                          style={{ color: '#000000', fontWeight: 600 }}
                                        />
                                        {edu.fieldOfStudy && (
                                          <span className="italic text-black font-semibold text-[12.5px]" style={{ color: '#000000', fontWeight: 600 }}>
                                            {' '}in {edu.fieldOfStudy}
                                          </span>
                                        )}
                                      </div>
                                      {(edu.cgpa || !isPreview) && (
                                        <span className="text-black font-serif text-[12px]" style={{ color: '#000000' }}>
                                          <strong className="font-bold text-black" style={{ color: '#000000', fontWeight: 800 }}>{edu.cgpaLabel || 'CGPA'} :</strong>{' '}
                                          <DirectEditableText
                                            value={edu.cgpa}
                                            placeholder="[Mention your academic score]"
                                            onChange={(val) => handleUpdateEduField(edu.id, 'cgpa', val)}
                                            viewMode={viewMode}
                                            className="italic text-black font-semibold text-[12px]"
                                            style={{ color: '#000000', fontWeight: 600 }}
                                          />
                                        </span>
                                      )}
                                    </div>
                                    {(edu.description || !isPreview) && (
                                      <div className="mt-0.5">
                                        {isPreview ? (
                                          renderFormattedContent(edu.description)
                                        ) : (
                                          <DirectEditableText
                                            value={edu.description}
                                            placeholder="[(Optional) Add Education details like achievements, coursework, leadership roles etc]"
                                            onChange={(val) => handleUpdateEduField(edu.id, 'description', val)}
                                            viewMode={viewMode}
                                            multiline
                                            className="text-[12px] italic text-black font-serif font-medium"
                                            style={{ color: '#000000', fontWeight: 500 }}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>,
                                  idx > 0 ? () => handleMoveEducation(idx, 'up') : undefined,
                                  idx < visibleEducation.length - 1 ? () => handleMoveEducation(idx, 'down') : undefined,
                                  () => handleToggleEducationVisibility(edu.id),
                                  () => handleDeleteEducation(edu.id)
                                )
                              )
                            ) : isPreview ? null : (
                              renderPaperItemWrapper(
                                'placeholder-education',
                                'education',
                                <div className="text-left font-serif text-[12.5px]">
                                  <div className="flex justify-between items-baseline leading-tight">
                                    <DirectEditableText
                                      placeholder="[Institution Name] | [Location]"
                                      onChange={(val) => handleCreateFirstEducation('institution', val)}
                                      viewMode={viewMode}
                                      className="font-bold text-[#64748b] text-[13.5px]"
                                      style={{ color: '#64748b', fontWeight: 750 }}
                                    />
                                    <DirectEditableText
                                      placeholder="[Mention education tenure]"
                                      onChange={(val) => handleCreateFirstEducation('startDate', val)}
                                      viewMode={viewMode}
                                      className="text-[#64748b] text-[12px] font-semibold"
                                      style={{ color: '#64748b', fontWeight: 600 }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-baseline text-[12.5px] leading-tight mt-0.5">
                                    <DirectEditableText
                                      placeholder="[Degree]"
                                      onChange={(val) => handleCreateFirstEducation('degree', val)}
                                      viewMode={viewMode}
                                      className="italic text-[#64748b] font-semibold text-[12.5px]"
                                      style={{ color: '#64748b', fontWeight: 600 }}
                                    />
                                    <span className="text-black font-serif text-[12px]" style={{ color: '#000000' }}>
                                      <strong className="font-bold text-black" style={{ color: '#000000', fontWeight: 800 }}>CGPA :</strong>{' '}
                                      <DirectEditableText
                                        placeholder="[Mention your academic score]"
                                        onChange={(val) => handleCreateFirstEducation('cgpa', val)}
                                        viewMode={viewMode}
                                        className="italic text-[#64748b] font-semibold text-[12px]"
                                        style={{ color: '#64748b', fontWeight: 600 }}
                                      />
                                    </span>
                                  </div>
                                  <p className="text-[12px] italic text-[#64748b] mt-0.5 font-serif font-medium" style={{ color: '#64748b', fontWeight: 500 }}>
                                    <DirectEditableText
                                      placeholder="[(Optional) Add Education details like achievements, coursework, leadership roles etc]"
                                      onChange={(val) => handleCreateFirstEducation('description', val)}
                                      viewMode={viewMode}
                                      multiline
                                      style={{ color: '#64748b' }}
                                    />
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </section>
                      );
                    }

                    // 4. PROJECTS (Images 1, 2, 3, 4 Match)
                    if (sectionId === 'projects') {
                      const visibleProjects = (resumeData.projects || []).filter((p) => p.visible !== false);

                      return (
                        <section key="projects" style={{ marginTop: resumeData.spacing.sectionGap }}>
                          <h2
                            className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                            style={{
                              fontFamily: sectionHeaderStyle.fontFamily,
                              fontSize: '15px',
                              fontWeight: 800,
                              letterSpacing: '0.03em',
                              borderBottom: isBlueTheme ? '1.75px solid #1d4ed8' : '1.75px solid #000000',
                              color: isBlueTheme ? '#1d4ed8' : '#000000'
                            }}
                          >
                            PROJECTS
                          </h2>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: resumeData.spacing.itemGap }}>
                            {visibleProjects.length > 0 ? (
                              visibleProjects.map((p, idx) =>
                                renderPaperItemWrapper(
                                  p.id,
                                  'projects',
                                  <div className="text-left font-serif">
                                    <div className="flex justify-between items-baseline text-[12.5px] leading-tight">
                                      <div className="flex items-center gap-1.5">
                                        <DirectEditableText
                                          value={p.title}
                                          placeholder="[Project Name]"
                                          onChange={(val) => handleUpdateProjectField(p.id, 'title', val)}
                                          viewMode={viewMode}
                                          className="font-bold text-black text-[13.5px]"
                                          style={{ color: '#000000', fontWeight: 750 }}
                                        />
                                        {(() => {
                                          const projectLinks = (p.links && p.links.length > 0)
                                            ? p.links.filter((l: any) => l.url && l.url.trim())
                                            : (p.link ? [{ id: 'pl-1', url: p.link, platform: p.link.toLowerCase().includes('github') ? 'GitHub' : 'Website', customLabel: p.link.toLowerCase().includes('github') ? 'GitHub' : 'Live Demo' }] : []);

                                          return projectLinks.map((pl: any, plIdx: number) => {
                                            const plUrl = pl.url.trim();
                                            const plHref = plUrl.startsWith('http://') || plUrl.startsWith('https://') ? plUrl : `https://${plUrl}`;
                                            const isGh = pl.platform === 'GitHub' || plUrl.toLowerCase().includes('github');
                                            const plLabel = pl.customLabel || (isGh ? 'GitHub' : (plUrl.toLowerCase().includes('http') ? 'Live Demo' : 'Link'));

                                            return (
                                              <span key={pl.id || plIdx} className="text-black flex items-center gap-1 font-serif text-[11px] font-semibold">
                                                | {isGh ? (
                                                  <svg className="w-3.5 h-3.5 inline text-black fill-current" viewBox="0 0 24 24">
                                                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                                                  </svg>
                                                ) : (
                                                  <svg className="w-3.5 h-3.5 inline text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                  </svg>
                                                )}
                                                <a
                                                   href={plHref}
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     window.open(plHref, '_blank', 'noopener,noreferrer');
                                                   }}
                                                   className="text-blue-600 hover:underline font-semibold cursor-pointer resume-project-link"
                                                   style={{ color: '#1d4ed8' }}
                                                 >
                                                  {plLabel}
                                                </a>
                                              </span>
                                            );
                                          });
                                        })()}
                                      </div>
                                      {(p.dates || p.startDate || p.endDate || !isPreview) && (
                                        <DirectEditableText
                                          value={p.dates || (p.startDate && p.endDate ? `${p.startDate} - ${p.endDate}` : (p.endDate || p.startDate || ''))}
                                          placeholder="[Mention project tenure]"
                                          onChange={(val) => handleUpdateProjectField(p.id, 'dates', val)}
                                          viewMode={viewMode}
                                          className="text-black text-[12px] font-semibold"
                                          style={{ color: (p.dates || p.startDate || p.endDate) ? '#000000' : '#64748b', fontWeight: 600 }}
                                        />
                                      )}
                                    </div>
                                    {(p.role || !isPreview) && (
                                      <div className="text-[12.5px] italic text-black font-semibold leading-tight mt-0.5">
                                        <DirectEditableText
                                          value={p.role}
                                          placeholder="[Your Role: e.g., Lead Developer / UX Designer / Individual Project]"
                                          onChange={(val) => handleUpdateProjectField(p.id, 'role', val)}
                                          viewMode={viewMode}
                                          className="text-[12.5px] italic text-black font-semibold"
                                          style={{ color: p.role ? '#000000' : '#64748b', fontWeight: 600 }}
                                        />
                                      </div>
                                    )}
                                    {(p.description || !isPreview) && (
                                      <div className="mt-1">
                                        {isPreview ? (
                                          renderFormattedContent(p.description)
                                        ) : (
                                          <DirectEditableText
                                            value={p.description}
                                            placeholder="[Add Project Description]"
                                            onChange={(val) => handleUpdateProjectField(p.id, 'description', val)}
                                            viewMode={viewMode}
                                            multiline
                                            className="w-full text-[12.5px] leading-relaxed font-serif font-medium"
                                            style={{ color: p.description ? '#000000' : '#64748b', fontWeight: 500 }}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {(p.technologies || !isPreview) && (
                                      <p className="text-[12px] text-black font-medium mt-0.5 font-serif" style={{ color: '#000000', fontWeight: 500 }}>
                                        <strong className="font-bold italic text-black" style={{ color: '#000000', fontWeight: 800 }}>Technologies / Tools Used :</strong>{' '}
                                        <DirectEditableText
                                          value={p.technologies}
                                          placeholder="[List 3-5 key technologies/skills used in this project]"
                                          onChange={(val) => handleUpdateProjectField(p.id, 'technologies', val)}
                                          viewMode={viewMode}
                                          className="italic text-black font-medium"
                                          style={{ color: p.technologies ? '#000000' : '#64748b', fontWeight: 500 }}
                                        />
                                      </p>
                                    )}
                                  </div>,
                                  idx > 0 ? () => handleMoveProject(idx, 'up') : undefined,
                                  idx < visibleProjects.length - 1 ? () => handleMoveProject(idx, 'down') : undefined,
                                  () => handleToggleProjectVisibility(p.id),
                                  () => handleDeleteProject(p.id)
                                )
                              )
                            ) : isPreview ? null : (
                              renderPaperItemWrapper(
                                'placeholder-projects',
                                'projects',
                                <div className="text-left font-serif text-[12.5px]">
                                  <div className="flex justify-between items-baseline leading-tight">
                                    <DirectEditableText
                                      placeholder="[Project Name]"
                                      onChange={(val) => handleCreateFirstProject('title', val)}
                                      viewMode={viewMode}
                                      className="font-bold text-[#64748b] text-[13.5px]"
                                      style={{ color: '#64748b', fontWeight: 750 }}
                                    />
                                    <DirectEditableText
                                      placeholder="[Mention project tenure]"
                                      onChange={(val) => handleCreateFirstProject('startDate', val)}
                                      viewMode={viewMode}
                                      className="text-[#64748b] text-[12px] font-semibold"
                                      style={{ color: '#64748b', fontWeight: 600 }}
                                    />
                                  </div>
                                  <div className="text-[12.5px] italic text-[#64748b] leading-tight mt-0.5 font-semibold">
                                    <DirectEditableText
                                      placeholder="[Your Role: e.g., Lead Developer / UX Designer/ Individual Project]"
                                      onChange={(val) => handleCreateFirstProject('role', val)}
                                      viewMode={viewMode}
                                      style={{ color: '#64748b' }}
                                    />
                                  </div>
                                  <p className="mt-0.5 text-[12px] italic text-[#64748b] font-medium" style={{ color: '#64748b', fontWeight: 500 }}>
                                    <DirectEditableText
                                      placeholder="[Add Project Description]"
                                      onChange={(val) => handleCreateFirstProject('description', val)}
                                      viewMode={viewMode}
                                      multiline
                                      style={{ color: '#64748b' }}
                                    />
                                  </p>
                                  <p className="text-[12px] text-black font-medium mt-0.5 font-serif" style={{ color: '#000000', fontWeight: 500 }}>
                                    <strong className="font-bold italic text-black" style={{ color: '#000000', fontWeight: 800 }}>Technologies / Tools Used :</strong>{' '}
                                    <DirectEditableText
                                      placeholder="[List 3-5 key technologies/skills used in this project]"
                                      onChange={(val) => handleCreateFirstProject('technologies', val)}
                                      viewMode={viewMode}
                                      className="italic text-[#64748b]"
                                      style={{ color: '#64748b' }}
                                    />
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </section>
                      );
                    }

                    // 5. SKILLS (Images 1, 2, 3, 4 Match)
                    if (sectionId === 'skills') {
                      const skillPlaceholder = (name: string) => isMedium ? `[Add ${name}]` : `[${name}]`;

                      const skillCategories = [
                        { key: 'programmingLanguages', label: 'Programming Languages :', value: resumeData.skills?.programmingLanguages, placeholder: skillPlaceholder('Programming Languages') },
                        { key: 'frameworksLibraries', label: 'Frameworks & Libraries :', value: resumeData.skills?.frameworksLibraries, placeholder: skillPlaceholder('Frameworks & Libraries') },
                        { key: 'toolsPlatforms', label: 'Tools & Platforms :', value: resumeData.skills?.toolsPlatforms, placeholder: skillPlaceholder('Tools & Platforms') },
                        { key: 'databases', label: 'Databases :', value: resumeData.skills?.databases, placeholder: skillPlaceholder('Databases') },
                        { key: 'softSkills', label: 'Soft Skills :', value: resumeData.skills?.softSkills, placeholder: skillPlaceholder('Soft Skills') },
                        { key: 'languages', label: 'Languages :', value: resumeData.skills?.languages, placeholder: skillPlaceholder('Languages') }
                      ];

                      const filledSkillCategories = skillCategories.filter(
                        (cat) => cat.value && cat.value.trim() && !cat.value.trim().startsWith('[')
                      );
                      const customCategories = (resumeData.skills?.customCategories || []).filter(
                        (cc) => cc.skills && cc.skills.trim() && !cc.skills.trim().startsWith('[')
                      );

                      return (
                        <section key="skills" style={{ marginTop: resumeData.spacing.sectionGap }}>
                          <h2
                            className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                            style={{
                              fontFamily: sectionHeaderStyle.fontFamily,
                              fontSize: '15px',
                              fontWeight: 800,
                              letterSpacing: '0.03em',
                              borderBottom: isBlueTheme ? '1.75px solid #1d4ed8' : '1.75px solid #000000',
                              color: isBlueTheme ? '#1d4ed8' : '#000000'
                            }}
                          >
                            SKILLS
                          </h2>
                          <div className="space-y-1 text-left text-[12.5px] font-serif leading-snug font-medium text-black" style={{ color: '#000000' }}>
                            {(isPreview ? filledSkillCategories : skillCategories).map((cat) => (
                              <div key={cat.label} className="flex items-baseline">
                                <span className="w-56 font-bold text-black shrink-0 text-[12.5px]" style={{ fontWeight: 800, color: '#000000' }}>
                                  {cat.label}
                                </span>
                                <DirectEditableText
                                  value={cat.value}
                                  placeholder={cat.placeholder}
                                  onChange={(val) => handleUpdateSkillCategory(cat.key, val)}
                                  viewMode={viewMode}
                                  className="flex-1 text-black font-medium text-[12.5px]"
                                  style={{ color: '#000000', fontWeight: 500 }}
                                />
                              </div>
                            ))}
                            {Array.isArray(resumeData.skills?.customCategories) &&
                              (isPreview ? customCategories : resumeData.skills.customCategories).map((cc) => (
                                <div key={cc.id} className="flex items-baseline">
                                  <span className="w-56 font-bold text-black shrink-0 text-[12.5px]" style={{ fontWeight: 800, color: '#000000' }}>
                                    {cc.name} :
                                  </span>
                                  <DirectEditableText
                                    value={cc.skills}
                                    placeholder="[Add Skills]"
                                    onChange={(val) => {
                                      handleUpdate((prev) => ({
                                        ...prev,
                                        skills: {
                                          ...prev.skills,
                                          customCategories: (prev.skills.customCategories || []).map((c) =>
                                            c.id === cc.id ? { ...c, skills: val } : c
                                          )
                                        }
                                      }));
                                    }}
                                    viewMode={viewMode}
                                    className="flex-1 text-black font-medium text-[12.5px]"
                                    style={{ color: '#000000', fontWeight: 500 }}
                                  />
                                </div>
                              ))}
                          </div>
                        </section>
                      );
                    }

                    // 6. CERTIFICATIONS
                    if (sectionId === 'certifications') {
                      return (
                        <section key="certifications" style={{ marginTop: resumeData.spacing.sectionGap }}>
                          <h2
                            className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                            style={{
                              fontFamily: sectionHeaderStyle.fontFamily,
                              fontSize: '15px',
                              fontWeight: 800,
                              letterSpacing: '0.03em',
                              borderBottom: isBlueTheme ? '1.75px solid #1d4ed8' : '1.75px solid #000000',
                              color: isBlueTheme ? '#1d4ed8' : '#000000'
                            }}
                          >
                            CERTIFICATIONS
                          </h2>
                          <div className="text-left text-[12.5px] text-black space-y-2 font-serif font-medium" style={{ color: '#000000' }}>
                            {resumeData.certifications.filter((c: any) => c.visible !== false).map((c: any) => (
                              <div key={c.id} className="space-y-0.5">
                                <div className="flex justify-between items-baseline leading-tight">
                                  <p className="text-[12.5px] font-serif text-black flex items-start font-medium">
                                    <span className="mr-1.5 font-bold text-black" style={{ fontWeight: 800 }}>•</span>
                                    <span>
                                      <strong className="font-bold text-black" style={{ color: '#000000', fontWeight: 750 }}>{c.title}</strong>
                                      {c.issuer && !c.title.toUpperCase().includes(c.issuer.toUpperCase()) && ` — ${c.issuer}`}
                                      {c.issueDate && ` (${c.issueDate})`}
                                    </span>
                                  </p>
                                  {c.link && (
                                    <span className="inline-flex items-center gap-1 text-[11.5px] text-blue-600 font-sans font-semibold shrink-0 ml-2">
                                      <svg className="w-3.5 h-3.5 inline text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                      </svg>
                                      {(() => {
                                        const rawLink = (c.link || '').trim();
                                        const certHref = rawLink.startsWith('http://') || rawLink.startsWith('https://')
                                          ? rawLink
                                          : (rawLink ? 'https://' + rawLink : '#');
                                        return (
                                          <a
                                            href={certHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (certHref && certHref !== '#') {
                                                window.open(certHref, '_blank', 'noopener,noreferrer');
                                              }
                                            }}
                                            className="text-blue-600 hover:underline font-semibold cursor-pointer resume-cert-link"
                                            style={{ color: '#1d4ed8' }}
                                          >
                                            {c.linkLabel || 'View Certificate'}
                                          </a>
                                        );
                                      })()}
                                    </span>
                                  )}
                                </div>
                                {c.description && (
                                  <div className="mt-0.5">
                                    {renderFormattedContent(c.description)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    }

                    // 7. AWARDS & ACHIEVEMENTS
                    if (sectionId === 'awards') {
                      if (isPreview && resumeData.awards.length === 0) {
                        return null;
                      }
                      return (
                        <section key="awards" style={{ marginTop: resumeData.spacing.sectionGap }}>
                          <h2
                            className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                            style={{
                              fontFamily: sectionHeaderStyle.fontFamily,
                              fontSize: '15px',
                              fontWeight: 800,
                              letterSpacing: '0.03em',
                              borderBottom: isBlueTheme ? '1.75px solid #1d4ed8' : '1.75px solid #000000',
                              color: isBlueTheme ? '#1d4ed8' : '#000000'
                            }}
                          >
                            AWARDS & ACHIEVEMENTS
                          </h2>
                          <div className="text-left text-[12.5px] text-black space-y-1 font-serif font-medium" style={{ color: '#000000' }}>
                            {resumeData.awards.map((a) => (
                              <p key={a.id}>
                                <strong className="font-bold text-black" style={{ color: '#000000', fontWeight: 750 }}>{a.title}</strong> {a.issuer && `— ${a.issuer}`} {a.year && `(${a.year})`}
                              </p>
                            ))}
                          </div>
                        </section>
                      );
                    }

                    // 8. CUSTOM SECTION
                    if (sectionId === 'custom') {
                      const hasCustomContent = Boolean(resumeData.customSection?.content?.trim());
                      if (isPreview && !hasCustomContent) {
                        return null;
                      }
                      return (
                        <section key="custom" style={{ marginTop: resumeData.spacing.sectionGap }}>
                          <h2
                            className={cn('font-extrabold uppercase tracking-wide border-b pb-0.5 mb-1.5 font-serif', headingColorClass)}
                            style={{
                              fontFamily: sectionHeaderStyle.fontFamily,
                              fontSize: '15px',
                              fontWeight: 800,
                              letterSpacing: '0.03em',
                              borderBottom: isBlueTheme ? '1.75px solid #1d4ed8' : '1.75px solid #000000',
                              color: isBlueTheme ? '#1d4ed8' : '#000000'
                            }}
                          >
                            {resumeData.customSection.title.toUpperCase()}
                          </h2>
                          {isPreview ? (
                            renderFormattedContent(resumeData.customSection.content)
                          ) : (
                            <DirectEditableText
                              value={resumeData.customSection.content}
                              placeholder="[Mention your details...]"
                              onChange={(val) =>
                                handleUpdate((prev) => ({
                                  ...prev,
                                  customSection: { ...prev.customSection, content: val }
                                }))
                              }
                              viewMode={viewMode}
                              multiline
                              className="w-full text-[12.5px] leading-relaxed font-serif font-medium"
                              style={{ fontFamily: descriptionStyle.fontFamily, color: '#000000', fontWeight: 500 }}
                            />
                          )}
                        </section>
                      );
                    }

                    return null;
                  };

                  const renderPaperSheet = (pageSections: string[], includeHeader: boolean, pageNum: number) => (
                    <div
                      key={`resume-page-${pageNum}`}
                      id={`print-resume-page-${pageNum}`}
                      className="w-full max-w-[800px] bg-white text-black shadow-2xl rounded-b-xl rounded-t-none transition-all duration-200 border border-slate-300 border-t-0 antialiased mb-8 relative print:shadow-none print:border-none print:m-0 print:max-w-none print:w-full print:p-[10mm_14mm]"
                      style={{
                        padding: resumeData.spacing.padding,
                        fontSize: resumeData.spacing.fontSize,
                        lineHeight: resumeData.spacing.lineHeight,
                        fontFamily: descriptionStyle.fontFamily,
                        color: '#000000',
                        fontWeight: 500,
                        minHeight: '1080px',
                        boxSizing: 'border-box',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility',
                        pageBreakAfter: pageNum < totalPages ? 'always' : 'auto'
                      }}
                    >
                      {includeHeader && renderHeader()}
                      <div>
                        {pageSections.map((sectionId) => renderSection(sectionId))}
                      </div>
                    </div>
                  );

                  return (
                    <div className="w-full flex flex-col items-center">
                      {/* Preview Controls Bar (Stretch Bar from Image 1) */}
                      <div className="w-full max-w-[800px] bg-[#0d1122] border border-slate-800 border-b-0 rounded-t-xl px-4 py-2.5 flex items-center justify-between no-print shadow-md select-none">
                        {/* Left: Resume Title with Pencil */}
                        <div className="flex items-center gap-2">
                          {isEditingTitle ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={titleInput}
                                onChange={(e) => setTitleInput(e.target.value)}
                                onBlur={handleSaveTitle}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                                autoFocus
                                className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white"
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsEditingTitle(true)}
                              className="flex items-center gap-2 text-white hover:text-indigo-400 transition-colors group cursor-pointer"
                              title="Click to rename"
                            >
                              <span className="font-semibold text-sm tracking-wide text-slate-200 group-hover:text-white">
                                {titleInput || (resume?.title ? resume.title : (resume?.fileName ? resume.fileName.replace(/\.(pdf|docx|txt)$/i, '') : 'Untitled - Resume'))}
                              </span>
                              <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                            </button>
                          )}
                        </div>

                        {/* Right: Page Counter + Fit to Single Page */}
                        <div className="flex items-center gap-3">
                          <span className="text-slate-300 font-mono text-[11px] font-semibold bg-[#070a14] border border-slate-800/90 px-2.5 py-1 rounded-md shadow-inner">
                            {currentPage} / {totalPages}
                          </span>
                          <div className="h-4 w-px bg-slate-800/80 mx-0.5" />
                          <button
                            onClick={() => {
                              setFitSinglePage(!fitSinglePage);
                              if (!fitSinglePage) {
                                handleUpdate((p) => ({
                                  ...p,
                                  spacing: {
                                    ...p.spacing,
                                    fontSize: '12px',
                                    sectionGap: '8px',
                                    itemGap: '4px',
                                    padding: '16px'
                                  }
                                }));
                              } else {
                                applyLayoutPreset('balanced');
                              }
                            }}
                            className={cn(
                              'px-3 py-1 rounded-md border text-[11.5px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm',
                              fitSinglePage
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-indigo-500 text-white shadow-indigo-600/30'
                                : 'bg-[#070a14] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                            )}
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Fit to Single Page</span>
                          </button>
                        </div>
                      </div>

                      {/* Printable Resume Container */}
                      <div id="print-resume-area" className="w-full flex flex-col items-center">
                        {/* Page 1 Sheet */}
                        {renderPaperSheet(page1Sections, true, 1)}

                        {/* Page 2 Sheet (if multi-page extended) */}
                        {page2Sections.length > 0 && (
                          <div className="w-full flex flex-col items-center">
                            {renderPaperSheet(page2Sections, false, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD SECTION MODAL (Exact Image 1 Match) ──────────────── */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0c0f1d] border border-slate-800/90 rounded-3xl p-6 sm:p-7 max-w-[1140px] w-full shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header (Image 1) */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Add Section</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {resumeData.activeSections.length} Sections selected
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 9 Section Cards Grid (4 Columns, Image 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {SECTION_CATALOG.map((sec) => {
                const isSelected = resumeData.activeSections.includes(sec.id);
                return (
                  <div
                    key={sec.id}
                    onClick={() => toggleSection(sec.id)}
                    className={cn(
                      'flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left group relative min-h-[148px]',
                      isSelected
                        ? 'border-slate-800/60 bg-gradient-to-b from-[#151930]/90 to-[#0e1122]/95 shadow-md hover:border-slate-700'
                        : 'border-slate-800/80 bg-gradient-to-b from-[#101426]/90 to-[#0a0d1a] hover:border-slate-700 hover:bg-[#12162a]'
                    )}
                  >
                    <div>
                      {/* Top Row: Squircle Icon + Title + Selected Checkmark / Plus Indicator */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-400/20 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
                            {sec.icon}
                          </div>
                          <h4 className="text-[13.5px] font-bold text-white tracking-tight truncate">
                            {sec.name}
                          </h4>
                        </div>

                        {isSelected ? (
                          <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border border-slate-700 text-slate-500 flex items-center justify-center shrink-0 group-hover:border-slate-500 group-hover:text-slate-400">
                            <Plus className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-400 leading-snug mt-2.5 line-clamp-3">
                        {sec.description}
                      </p>
                    </div>

                    {/* Bottom Boost Stat / Tip with Sparkle Icon (Image 1) */}
                    {sec.boostHighlight && (
                      <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-start gap-1.5 text-[10px] text-slate-300 leading-tight">
                        <span className="text-purple-400 text-[11px] shrink-0 leading-none mt-0.5">✦</span>
                        <span>
                          {sec.boostPrefix}
                          <span className="text-emerald-400 font-bold">{sec.boostHighlight}</span>
                          {sec.boostSuffix}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── QUICK TIPS MODAL DIALOG ────────────────────────────────── */}
      {isQuickTipsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#090d18] border border-white/[0.1] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">💡</span>
                <h3 className="text-base font-bold text-white tracking-tight">Quick Tips</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickTipsOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2-Column Visual Guide */}
            <div className="grid grid-cols-5 gap-4 items-center">
              {/* Left Column: 3 Feature Icons (2 cols) */}
              <div className="col-span-2 space-y-3.5">
                {/* 1. Font Style */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-14 rounded-lg border border-sky-500/50 bg-[#060a14] flex items-center justify-center relative font-serif text-base text-white font-bold tracking-widest shadow-inner">
                    <div className="w-1.5 h-1.5 bg-sky-400 absolute -top-1 -left-1" />
                    <div className="w-1.5 h-1.5 bg-sky-400 absolute -top-1 -right-1" />
                    <div className="w-1.5 h-1.5 bg-sky-400 absolute -bottom-1 -left-1" />
                    <div className="w-1.5 h-1.5 bg-sky-400 absolute -bottom-1 -right-1" />
                    A A
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium mt-1.5">Font Style</span>
                </div>

                {/* 2. Font Size */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-14 rounded-lg border border-sky-500/50 bg-[#060a14] flex items-center justify-center gap-1 relative font-serif text-white font-bold shadow-inner">
                    <div className="w-1.5 h-1.5 bg-sky-400 absolute -top-1 -left-1" />
                    <div className="w-1.5 h-1.5 bg-sky-400 absolute -bottom-1 -right-1" />
                    <span className="text-lg">A</span>
                    <span className="text-xs">A</span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium mt-1.5">Font Size</span>
                </div>

                {/* 3. Line Height */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-14 rounded-lg border border-sky-500/50 bg-[#060a14] flex items-center justify-center relative shadow-inner">
                    <div className="w-16 border-t border-b border-dashed border-sky-400/70 py-1 flex items-center justify-center">
                      <span className="text-xs font-serif font-bold text-white">Aa</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium mt-1.5">Line Height</span>
                </div>
              </div>

              {/* Right Column: Blueprint Document Diagram (3 cols) */}
              <div className="col-span-3 rounded-2xl border border-white/[0.08] bg-[#050811] p-4 flex flex-col justify-between relative overflow-hidden h-[240px]">
                {/* Blueprint sheet representation matching Image 4 */}
                <div className="w-full h-full space-y-3 relative">
                  {/* Top Avatar Circle + Header Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-5 h-5 rounded-full bg-slate-700/60 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="h-1.5 w-3/4 bg-slate-700/60 rounded-xs" />
                    </div>
                  </div>
                  {/* Handwritten arrow & label: Header */}
                  <div className="absolute top-1 left-24 text-[10px] text-slate-300 font-sans italic flex items-center gap-1">
                    <span>↖ Header</span>
                  </div>

                  {/* Section Title Banner */}
                  <div className="pt-2">
                    <div className="h-3 w-4/5 bg-indigo-600/40 rounded-xs" />
                  </div>
                  {/* Handwritten arrow & label: Title */}
                  <div className="text-right text-[10px] text-slate-300 font-sans italic -mt-1 pr-1">
                    <span>Title ↖</span>
                  </div>

                  {/* Subtitle Line */}
                  <div className="h-2 w-3/5 bg-slate-700/60 rounded-xs" />
                  {/* Handwritten arrow & label: Subtitle */}
                  <div className="text-[10px] text-slate-300 font-sans italic -mt-1">
                    <span>↖ Subtitle</span>
                  </div>

                  {/* Body Content Paragraph */}
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-full bg-slate-800 rounded-xs" />
                    <div className="h-1.5 w-full bg-slate-800 rounded-xs" />
                    <div className="h-1.5 w-4/5 bg-slate-800 rounded-xs" />
                  </div>
                  {/* Handwritten arrow & label: Content */}
                  <div className="text-right text-[10px] text-slate-300 font-sans italic pr-2">
                    <span>Content ⤴</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESUME READINESS GATE MODAL (Image 2 exact match) ─────────────────────── */}
      {isReadinessGateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-sm bg-[#0e1324] border border-slate-700/60 rounded-3xl p-8 shadow-2xl text-center space-y-5 animate-in slide-in-from-bottom-4 duration-300"
            style={{ background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.12) 0%, #0e1324 70%)' }}
          >
            {/* Resume with warning icon illustration */}
            <div className="flex justify-center">
              <div className="relative w-20 h-20">
                {/* Document lines illustration */}
                <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
                  {/* Document background */}
                  <rect x="10" y="6" width="48" height="60" rx="4" fill="#1e2a44" stroke="#334155" strokeWidth="1.5"/>
                  {/* Text lines */}
                  <rect x="18" y="18" width="32" height="3" rx="1.5" fill="#4f6589" opacity="0.7"/>
                  <rect x="18" y="25" width="28" height="3" rx="1.5" fill="#4f6589" opacity="0.5"/>
                  <rect x="18" y="32" width="32" height="3" rx="1.5" fill="#4f6589" opacity="0.5"/>
                  <rect x="18" y="39" width="20" height="3" rx="1.5" fill="#4f6589" opacity="0.4"/>
                  <rect x="18" y="46" width="26" height="3" rx="1.5" fill="#4f6589" opacity="0.3"/>
                  {/* Warning triangle overlay */}
                  <circle cx="52" cy="52" r="18" fill="#0e1324"/>
                  <path d="M52 36 L66 60 L38 60 Z" fill="#f59e0b" opacity="0.95"/>
                  <rect x="50.5" y="44" width="3" height="10" rx="1.5" fill="#1a0f00"/>
                  <circle cx="52" cy="57" r="1.5" fill="#1a0f00"/>
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-white leading-snug tracking-tight">
                Oh no! Your resume isn't ready<br />for job optimisation yet
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                Before optimizing your resume for jobs, it needs to reach at least a <span className="text-white font-semibold">"Good"</span> Resume Readiness score.
              </p>
            </div>

            {/* Improve Resume Score button */}
            <button
              type="button"
              onClick={() => {
                setIsReadinessGateOpen(false);
                setSearchParams({ tab: 'ats-score' });
              }}
              className="w-full max-w-[220px] mx-auto py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Improve Resume Score</span>
              <span>→</span>
            </button>

            {/* Close button top-right */}
            <button
              type="button"
              onClick={() => setIsReadinessGateOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ─── JOB DISCOVERY & MATCH MODAL (Exact match to Image 1) ─────────────────────── */}
      {isJobDiscoveryOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div
            className="w-full max-w-6xl bg-[#090d1c] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-5 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar"
            style={{
              background: 'radial-gradient(circle at 85% 15%, rgba(45, 60, 135, 0.45) 0%, rgba(9, 13, 28, 0.98) 70%)'
            }}
          >
            {/* Header with Title & Close (X) button */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Discover your ideal career right here
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Discover opportunities that suit your interests to achieve the career you want.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsJobDiscoveryOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0e1426] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Primary Discovery Tabs: [Job Board] & [Add Manual Job Description] (Image 1 clean text tabs) */}
            <div className="flex items-center gap-6 border-b border-slate-800/80 pb-2.5">
              <button
                type="button"
                onClick={() => setActiveDiscoveryTab('job-board')}
                className={cn(
                  'text-xs transition-colors cursor-pointer pb-1 font-semibold tracking-wide',
                  activeDiscoveryTab === 'job-board'
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Job Board
              </button>
              <button
                type="button"
                onClick={() => setActiveDiscoveryTab('manual')}
                className={cn(
                  'text-xs transition-colors cursor-pointer pb-1 font-semibold tracking-wide',
                  activeDiscoveryTab === 'manual'
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Add Manual Job Description
              </button>
            </div>

            {activeDiscoveryTab === 'job-board' ? (
              viewingJobInModal ? (
                /* ── Selected Job Detail View Inside Modal ── */
                <div className="space-y-4 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => setViewingJobInModal(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to jobs</span>
                  </button>

                  <div className="rounded-2xl border border-slate-800 bg-[#080d19] p-6 shadow-2xl space-y-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                      {/* Left: Job Role Details */}
                      <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shrink-0 shadow-md">
                            {viewingJobInModal.company.toLowerCase() === 'ada' ? (
                              <span className="text-xl font-black lowercase text-black tracking-tighter">ada</span>
                            ) : viewingJobInModal.companyLogo ? (
                              <img src={viewingJobInModal.companyLogo} alt={viewingJobInModal.company} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-sm font-bold text-slate-900">{viewingJobInModal.company.slice(0, 3)}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                              {viewingJobInModal.title}
                            </h3>
                            <p className="text-xs font-medium text-slate-400">{viewingJobInModal.company}</p>
                          </div>
                        </div>

                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#052e16] border border-[#166534] text-[#4ade80] text-xs font-medium">
                            {viewingJobInModal.type || 'Full Time'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 flex items-center flex-wrap gap-x-4 gap-y-1.5">
                          <span>💼 {viewingJobInModal.experienceRequiredYears ? `${viewingJobInModal.experienceRequiredYears} - ${viewingJobInModal.experienceRequiredYears + 2} years` : '2 - 4 years'}</span>
                          <span>•</span>
                          <span>💵 Not disclosed</span>
                          <span>•</span>
                          <span>📍 {viewingJobInModal.location || 'Bengaluru, Karnataka, India'}</span>
                        </div>

                        {/* About the role */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          <h4 className="text-xs font-bold text-white">About the role</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {viewingJobInModal.description || 'We are seeking an experienced engineer to build high-performance services and intuitive user interfaces.'}
                          </p>
                        </div>

                        {/* Qualifications */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-300">Qualifications:</h4>
                          <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                            {(viewingJobInModal.requirements && viewingJobInModal.requirements.length > 0
                              ? viewingJobInModal.requirements
                              : [
                                '2 - 4 YOE',
                                'Bachelor level degree or equivalent in Computer Science, or related field of study.',
                                'Technical or Professional Certification in Domain will be preferred.'
                              ]
                            ).map((req, idx) => (
                              <li key={idx} className="leading-relaxed">{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: Match Card */}
                      {(() => {
                        const match = calculateJobMatch(resumeData, viewingJobInModal);
                        return (
                          <div
                            className="w-full lg:w-48 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-3 shrink-0 border border-white/15 relative overflow-hidden shadow-2xl"
                            style={{
                              background: match.score >= 80
                                ? 'linear-gradient(180deg, #131728 0%, #151e28 35%, #065f46 78%, #059669 100%)'
                                : match.score >= 50
                                ? 'linear-gradient(180deg, #141829 0%, #171b2d 38%, #853707 78%, #d97706 100%)'
                                : 'linear-gradient(180deg, #141829 0%, #19172b 38%, #9f1239 78%, #e11d48 100%)',
                              boxShadow: match.score >= 80
                                ? 'inset 0 -28px 35px rgba(16, 185, 129, 0.45), 0 8px 25px rgba(0, 0, 0, 0.4)'
                                : match.score >= 50
                                ? 'inset 0 -28px 35px rgba(245, 158, 11, 0.45), 0 8px 25px rgba(0, 0, 0, 0.4)'
                                : 'inset 0 -28px 35px rgba(244, 63, 94, 0.45), 0 8px 25px rgba(0, 0, 0, 0.4)'
                            }}
                          >
                            <div className="relative w-20 h-20 flex items-center justify-center mt-1">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  strokeWidth="3.5"
                                  stroke="#1c223c"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  strokeDasharray={`${match.score}, 100`}
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  stroke={match.score >= 80 ? '#10b981' : match.score >= 50 ? '#f97316' : '#f43f5e'}
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <span className="absolute text-sm font-black text-white">{match.score}%</span>
                            </div>
                            <span className="text-xs font-bold text-white tracking-wide">{match.label}</span>
                            <button
                              type="button"
                              onClick={() => handleSelectJobForOptimization(viewingJobInModal)}
                              className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-lg transition-all cursor-pointer hover:scale-105"
                            >
                              Optimize Resume for this Role →
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sub-buttons: [All Job] & [Saved Jobs] (Exact match to Image 1) */}
                  <div className="flex items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setDiscoverySubTab('all')}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md',
                        discoverySubTab === 'all'
                          ? 'bg-[#6366f1] text-white shadow-indigo-600/30'
                          : 'border border-slate-800 text-slate-300 hover:border-slate-700 bg-[#0e1326]'
                      )}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>All Job</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscoverySubTab('saved')}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer',
                        discoverySubTab === 'saved'
                          ? 'bg-[#6366f1] text-white shadow-md shadow-indigo-600/30'
                          : 'border border-slate-800 text-slate-300 hover:border-slate-700 bg-transparent hover:bg-slate-800/40'
                      )}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Saved Jobs</span>
                    </button>
                  </div>

                  {/* Filters & Search Row (Exact match to Image 1) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* Search Bar */}
                    <div className="md:col-span-5 relative">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Search</label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={jobSearchQuery}
                          onChange={(e) => setJobSearchQuery(e.target.value)}
                          placeholder="Search your next job"
                          className="w-full bg-[#0e1428] border border-slate-800/90 rounded-xl pl-10 pr-20 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-[#6366f1] hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {/* Experience Dropdown */}
                    <div className="md:col-span-2 relative">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Experience</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsExpDropdownOpen(!isExpDropdownOpen);
                            setIsJobTypeDropdownOpen(false);
                            setIsSortDropdownOpen(false);
                          }}
                          className="w-full bg-[#0e1428] border border-slate-800/90 rounded-xl px-3 py-2.5 text-xs text-slate-200 flex items-center justify-between hover:border-slate-700 cursor-pointer"
                        >
                          <span className="truncate">{jobExpFilter}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                        </button>
                        {isExpDropdownOpen && (
                          <div className="absolute top-full mt-1 left-0 right-0 bg-[#0c1222] border border-slate-800 rounded-xl py-1 shadow-2xl z-30">
                            {['All Levels', 'Entry Level', '1 - 2 years', '2 - 4 years', '4+ years'].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => {
                                  setJobExpFilter(lvl);
                                  setIsExpDropdownOpen(false);
                                }}
                                className={cn(
                                  'w-full text-left px-3 py-2 text-xs hover:bg-slate-800 cursor-pointer transition-colors',
                                  jobExpFilter === lvl ? 'text-indigo-400 font-bold' : 'text-slate-300'
                                )}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Type Dropdown */}
                    <div className="md:col-span-2 relative">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Job Type</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsJobTypeDropdownOpen(!isJobTypeDropdownOpen);
                            setIsExpDropdownOpen(false);
                            setIsSortDropdownOpen(false);
                          }}
                          className="w-full bg-[#0e1428] border border-slate-800/90 rounded-xl px-3 py-2.5 text-xs text-slate-200 flex items-center justify-between hover:border-slate-700 cursor-pointer"
                        >
                          <span className="truncate">
                            {jobTypeFilter.size === 0 ? 'Job Type' : `${jobTypeFilter.size} selected`}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                        </button>
                        {isJobTypeDropdownOpen && (
                          <div className="absolute top-full mt-1 left-0 w-48 bg-[#0c1222] border border-slate-800 rounded-xl p-2 shadow-2xl z-30 space-y-1">
                            {[
                              'Full Time',
                              'Part Time',
                              'Internship',
                              'Hackathon',
                              'Contest',
                              'Hiring Challenges'
                            ].map((type) => {
                              const checked = jobTypeFilter.has(type);
                              return (
                                <label
                                  key={type}
                                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs text-slate-300"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      setJobTypeFilter((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(type)) next.delete(type);
                                        else next.add(type);
                                        return next;
                                      });
                                    }}
                                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                                  />
                                  <span>{type}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="md:col-span-3 relative">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Sort By</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSortDropdownOpen(!isSortDropdownOpen);
                            setIsExpDropdownOpen(false);
                            setIsJobTypeDropdownOpen(false);
                          }}
                          className="w-full bg-[#0e1428] border border-slate-800/90 rounded-xl px-3 py-2.5 text-xs text-slate-200 flex items-center justify-between hover:border-slate-700 cursor-pointer"
                        >
                          <span className="truncate">
                            {jobSortBy === 'newest' ? 'Newest First' : 'High Score Match'}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                        </button>
                        {isSortDropdownOpen && (
                          <div className="absolute top-full mt-1 right-0 w-48 bg-[#0c1222] border border-slate-800 rounded-xl py-1 shadow-2xl z-30">
                            {[
                              { id: 'newest', label: 'Newest First' },
                              { id: 'high-score', label: 'High Score Match' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setJobSortBy(opt.id as any);
                                  setIsSortDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 cursor-pointer text-slate-300 transition-colors"
                              >
                                <span>{opt.label}</span>
                                {jobSortBy === opt.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Job Cards Grid with Shining Radiant Glow (Exact match to Image 1) */}
                  {(() => {
                    const filtered = jobs
                      .filter((job) => {
                        if (discoverySubTab === 'saved' && !savedJobIds.has(job.id)) {
                          return false;
                        }
                        if (jobSearchQuery.trim()) {
                          const q = jobSearchQuery.toLowerCase();
                          const matchTitle = job.title.toLowerCase().includes(q);
                          const matchComp = job.company.toLowerCase().includes(q);
                          const matchLoc = (job.location || '').toLowerCase().includes(q);
                          const matchSkills = (job.skills || []).some((s) => s.toLowerCase().includes(q));
                          if (!matchTitle && !matchComp && !matchLoc && !matchSkills) return false;
                        }
                        if (jobExpFilter !== 'All Levels') {
                          if (jobExpFilter === 'Entry Level' && job.experienceRequiredYears > 2) return false;
                          if (jobExpFilter === '1 - 2 years' && (job.experienceRequiredYears < 1 || job.experienceRequiredYears > 2)) return false;
                          if (jobExpFilter === '2 - 4 years' && (job.experienceRequiredYears < 2 || job.experienceRequiredYears > 4)) return false;
                          if (jobExpFilter === '4+ years' && job.experienceRequiredYears < 4) return false;
                        }
                        if (jobTypeFilter.size > 0) {
                          const jType = (job.type || 'Full Time').toLowerCase().replace('-', ' ');
                          const matchType = Array.from(jobTypeFilter).some((t) => jType.includes(t.toLowerCase().replace('-', ' ')));
                          if (!matchType) return false;
                        }
                        return true;
                      })
                      .sort((a, b) => {
                        if (jobSortBy === 'high-score') {
                          const scoreA = calculateJobMatch(resumeData, a).score;
                          const scoreB = calculateJobMatch(resumeData, b).score;
                          return scoreB - scoreA;
                        }
                        return (b.postedDate || '').localeCompare(a.postedDate || '');
                      });

                    if (discoverySubTab === 'saved' && filtered.length === 0) {
                      return (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-[#0c1020] border border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                            <Briefcase className="w-6 h-6 text-slate-400" />
                          </div>
                          <h3 className="text-base font-bold text-white tracking-tight">No saved jobs found</h3>
                          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                            You haven't saved any jobs yet. Browse jobs and save them to view here later.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {filtered.map((job) => {
                          const match = calculateJobMatch(resumeData, job);
                          const isSaved = savedJobIds.has(job.id);
                          const isHighlighted = selectedJobId === job.id || (!selectedJobId && match.score >= 70);

                          return (
                            <div
                              key={job.id}
                              onClick={() => setSelectedJobId(job.id)}
                              className={cn(
                                "rounded-2xl bg-[#0a0f1e] p-5 sm:p-6 min-h-[220px] flex flex-col sm:flex-row gap-5 transition-all duration-300 relative group cursor-pointer",
                                isHighlighted
                                  ? "border-2 border-[#2563eb] shadow-[0_0_28px_rgba(37,99,235,0.35)] ring-1 ring-blue-500/50"
                                  : "border border-slate-800/90 hover:border-blue-500/80 hover:shadow-[0_0_20px_rgba(37,99,235,0.25)]"
                              )}
                            >
                              {/* Left Section: Job Details */}
                              <div className="flex-1 space-y-3 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    {/* Company Avatar / Logo */}
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-md shrink-0 overflow-hidden">
                                      {job.companyLogo ? (
                                        <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain" />
                                      ) : (
                                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase tracking-wider">
                                          {(job.company || 'EP').slice(0, 2).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-base font-bold text-white tracking-tight truncate group-hover:text-indigo-200 transition-colors">
                                        {job.title}
                                      </h4>
                                      <p className="text-xs font-semibold text-indigo-400 truncate mt-0.5">
                                        {job.company || 'Enterprise Partner'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                                      title="Options"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSaveJob(job.id);
                                      }}
                                      className={cn(
                                        'p-1.5 rounded-lg border transition-colors cursor-pointer',
                                        isSaved
                                          ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                                          : 'bg-[#0e1426] border-slate-800 text-slate-400 hover:text-white'
                                      )}
                                      title={isSaved ? 'Remove from saved' : 'Save job'}
                                    >
                                      <Bookmark className={cn('w-3.5 h-3.5', isSaved ? 'fill-current' : '')} />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-md bg-[#052e16] border border-[#166534] text-[#4ade80] text-[11px] font-semibold">
                                    {job.type || 'Full Time'}
                                  </span>
                                  {job.experienceLevel && (
                                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-[11px] font-medium">
                                      {job.experienceLevel}
                                    </span>
                                  )}
                                </div>

                                {/* Details Line */}
                                <div className="text-[11px] text-slate-400 flex items-center flex-wrap gap-x-2.5 gap-y-1">
                                  <span>💼 {job.experienceRequiredYears ? `${job.experienceRequiredYears}+ years` : (job.experienceLevel || '2+ years')}</span>
                                  <span>•</span>
                                  <span>💵 {job.salary && job.salary.min ? `${job.salary.currency === 'INR' ? '₹' : '$'}${job.salary.min.toLocaleString()} - ${job.salary.currency === 'INR' ? '₹' : '$'}${job.salary.max.toLocaleString()}` : 'Not disclosed'}</span>
                                  <span>•</span>
                                  <span>📍 {job.location || 'Remote / Hybrid'}</span>
                                </div>

                                {/* Qualifications / Required Skills */}
                                <div className="space-y-1.5 pt-1.5 border-t border-slate-800/60">
                                  <p className="text-[11px] font-bold text-slate-300">
                                    {job.requirements && job.requirements.length > 0 ? 'Requirements:' : 'Required Skills:'}
                                  </p>
                                  <ul className="text-[11px] text-slate-300 space-y-1">
                                    {job.requirements && job.requirements.length > 0 ? (
                                      job.requirements.slice(0, 2).map((req, idx) => (
                                        <li key={idx} className="line-clamp-1 leading-relaxed">• {req}</li>
                                      ))
                                    ) : job.skills && job.skills.length > 0 ? (
                                      <li className="line-clamp-1 leading-relaxed">• {job.skills.join(', ')}</li>
                                    ) : (
                                      <li className="line-clamp-1 leading-relaxed">• Strong hands-on software development experience.</li>
                                    )}
                                  </ul>
                                </div>

                                <p className="text-[11px] text-slate-400 italic pt-0.5">
                                  {job.postedDate ? `Posted ${job.postedDate}` : 'Posted recently'}
                                </p>
                              </div>

                              {/* Right Section: Radiant Shining Glowing Match Card */}
                              <div
                                className="w-full sm:w-44 lg:w-48 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between text-center space-y-3 shrink-0 border border-white/10 relative overflow-hidden transition-all duration-300 shadow-xl"
                                style={{
                                  background: (match as any).isEmpty
                                    ? 'linear-gradient(180deg, #141829 0%, #19172b 38%, #1e1b4b 78%, #312e81 100%)'
                                    : match.score >= 75
                                    ? 'linear-gradient(180deg, #131728 0%, #151e28 35%, #065f46 78%, #059669 100%)'
                                    : match.score >= 45
                                    ? 'linear-gradient(180deg, #141829 0%, #171b2d 38%, #853707 78%, #d97706 100%)'
                                    : 'linear-gradient(180deg, #141829 0%, #19172b 38%, #9f1239 78%, #e11d48 100%)',
                                  boxShadow: (match as any).isEmpty
                                    ? 'inset 0 -28px 35px rgba(99,102,241,0.3), 0 8px 20px rgba(0,0,0,0.4)'
                                    : match.score >= 75
                                    ? 'inset 0 -28px 35px rgba(16, 185, 129, 0.45), 0 8px 20px rgba(0, 0, 0, 0.4)'
                                    : match.score >= 45
                                    ? 'inset 0 -28px 35px rgba(245, 158, 11, 0.45), 0 8px 20px rgba(0, 0, 0, 0.4)'
                                    : 'inset 0 -28px 35px rgba(244, 63, 94, 0.45), 0 8px 20px rgba(0, 0, 0, 0.4)'
                                }}
                              >
                                {(match as any).isEmpty ? (
                                  /* Empty resume — show "Resume Not Ready" state */
                                  <>
                                    <div className="flex flex-col items-center gap-2 flex-1 justify-center">
                                      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
                                        <rect x="6" y="4" width="24" height="30" rx="3" fill="#1e2a44" stroke="#334155" strokeWidth="1.5"/>
                                        <rect x="10" y="10" width="16" height="2" rx="1" fill="#4f6589" opacity="0.6"/>
                                        <rect x="10" y="15" width="12" height="2" rx="1" fill="#4f6589" opacity="0.4"/>
                                        <rect x="10" y="20" width="16" height="2" rx="1" fill="#4f6589" opacity="0.3"/>
                                        <circle cx="30" cy="30" r="9" fill="#0e1324"/>
                                        <path d="M30 22 L36 33 L24 33 Z" fill="#f59e0b" opacity="0.9"/>
                                        <rect x="29.2" y="26" width="1.6" height="5" rx="0.8" fill="#1a0f00"/>
                                        <circle cx="30" cy="32" r="0.8" fill="#1a0f00"/>
                                      </svg>
                                      <span className="text-[11px] font-bold text-slate-300 leading-tight">Resume Not Ready</span>
                                      <span className="text-[10px] text-slate-400 leading-snug">Fill in your resume first</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsJobDiscoveryOpen(false);
                                        setIsReadinessGateOpen(true);
                                      }}
                                      className="w-full py-2 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-500/40 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                                    >
                                      Improve First
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {/* Donut Progress Ring */}
                                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center mt-1">
                                      <svg className="w-18 h-18 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                          strokeWidth="3.5"
                                          stroke="#1c223c"
                                          fill="none"
                                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                          strokeDasharray={`${match.score}, 100`}
                                          strokeWidth="3.5"
                                          strokeLinecap="round"
                                          stroke={match.score >= 75 ? '#22c55e' : match.score >= 45 ? '#f97316' : '#ef4444'}
                                          fill="none"
                                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                      </svg>
                                      <span className="absolute text-sm font-black text-white">{match.score}%</span>
                                    </div>

                                    <span className="text-xs font-bold text-slate-200 tracking-wide">{match.label}</span>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectJobForOptimization(job);
                                      }}
                                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer hover:scale-105 shadow-md"
                                    >
                                      Optimise
                                    </button>
                                  </>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )) : (
              /* Add Manual Job Description View */
              <div className="space-y-4 p-4 rounded-2xl border border-slate-800 bg-[#080d19]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Job Title</label>
                    <input
                      type="text"
                      value={manualJobTitle}
                      onChange={(e) => setManualJobTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={manualJobCompany}
                      onChange={(e) => setManualJobCompany(e.target.value)}
                      placeholder="e.g. Google, Microsoft"
                      className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Job Description / Requirements</label>
                  <textarea
                    rows={6}
                    value={manualJobDescription}
                    onChange={(e) => setManualJobDescription(e.target.value)}
                    placeholder="Paste the full job description or key requirements here to optimize your resume..."
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!manualJobTitle.trim()) {
                        showToast({ type: 'warning', title: 'Job Title Required', message: 'Please enter a target job title.' });
                        return;
                      }
                      const newJob: Job = {
                        id: `custom-job-${Date.now()}`,
                        title: manualJobTitle,
                        company: manualJobCompany || 'Target Employer',
                        companyId: 'custom-comp',
                        companyLogo: '',
                        department: 'Engineering',
                        location: 'Remote',
                        type: 'Full-time',
                        experienceLevel: 'Mid Level',
                        salary: { min: 0, max: 0, currency: 'USD', period: 'yearly' },
                        description: manualJobDescription,
                        responsibilities: [],
                        requirements: [manualJobDescription.slice(0, 100)],
                        skills: manualJobDescription
                          .split(/[\s,.;\n]+/)
                          .filter((w) => w.length >= 3 && /^[A-Za-z+#]+$/.test(w))
                          .slice(0, 8),
                        educationRequired: "Bachelor's Degree",
                        experienceRequiredYears: 2,
                        deadline: '2026-12-31',
                        postedDate: new Date().toISOString().split('T')[0],
                        status: 'active',
                        applicantCount: 1,
                        recruiterId: 'usr-custom',
                        matchScore: 75
                      };
                      setJobs((prev) => [newJob, ...prev]);
                      handleSelectJobForOptimization(newJob);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    Analyze & Optimize Resume →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── GLOBAL REPORT ISSUE MODAL ─────────────────────────────── */}
      <ReportIssue
        isOpen={isReportIssueModalOpen}
        onClose={() => setIsReportIssueModalOpen(false)}
        hideFloatingButton={true}
      />

      {/* ─── ADD SKILL / CERTIFICATION MODAL (Exact match to Screenshots 2, 3, 4) ─── */}
      {isAddSkillModalOpen && (() => {
        const sectionOptions = [
          { id: 'personal_info', label: 'Personal Information', icon: User },
          { id: 'summary', label: 'Professional Summary', icon: FileText },
          { id: 'education', label: 'Educations', icon: GraduationCap },
          { id: 'projects', label: 'Projects', icon: Rocket },
          { id: 'skills', label: 'Skills', icon: Zap },
        ];
        const activeSectionObj = sectionOptions.find(s => s.id === addSkillSection) || sectionOptions[4];

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-white">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-[#0a0f20] p-7 md:p-8 shadow-2xl shadow-black/80 space-y-6 relative">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg sm:text-xl md:text-[22px] font-bold text-white tracking-tight leading-snug">
                  Add <span className="text-purple-400 font-bold">'{addSkillKeyword || 'Technical Certification / Professional Certification'}'</span> to your resume?
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddSkillModalOpen(false)}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-white bg-[#10172e] border border-slate-700/80 flex items-center justify-center transition-colors cursor-pointer shrink-0 hover:bg-[#152040]"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed -mt-2">
                We found this skill in job description. Choose how you want it added.
              </p>

              {/* 3 Choice Cards (Image 1 Exact Match: wide, spacious, clear) */}
              <div className="grid grid-cols-3 gap-3.5">
                {/* Card 1: Add to a specific place */}
                <button
                  type="button"
                  onClick={() => setAddSkillOption('add-specific')}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer min-h-[155px]",
                    addSkillOption === 'add-specific'
                      ? "border-2 border-purple-500 bg-[#16122e] shadow-lg shadow-purple-950/60 ring-1 ring-purple-500/30"
                      : "border border-slate-800/90 bg-[#0d1426] hover:border-slate-700 hover:bg-[#111930]"
                  )}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="w-7 h-7 rounded-full border border-purple-400/40 flex items-center justify-center text-purple-400">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    {addSkillOption === 'add-specific' ? (
                      <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-600/80 bg-transparent" />
                    )}
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">Add to a specific place</h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">Pick the resume section and item yourself.</p>
                  </div>
                </button>

                {/* Card 2: Let AI Choose */}
                <button
                  type="button"
                  onClick={() => setAddSkillOption('let-ai')}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer min-h-[155px]",
                    addSkillOption === 'let-ai'
                      ? "border-2 border-purple-500 bg-[#16122e] shadow-lg shadow-purple-950/60 ring-1 ring-purple-500/30"
                      : "border border-slate-800/90 bg-[#0d1426] hover:border-slate-700 hover:bg-[#111930]"
                  )}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="w-7 h-7 rounded-full border border-purple-400/40 flex items-center justify-center text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    {addSkillOption === 'let-ai' ? (
                      <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-600/80 bg-transparent" />
                    )}
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">Let AI Choose</h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">AI selects the most relevant section and item for this job.</p>
                  </div>
                </button>

                {/* Card 3: Do Not Add */}
                <button
                  type="button"
                  onClick={() => setAddSkillOption('do-not-add')}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer min-h-[155px]",
                    addSkillOption === 'do-not-add'
                      ? "border-2 border-purple-500 bg-[#16122e] shadow-lg shadow-purple-950/60 ring-1 ring-purple-500/30"
                      : "border border-slate-800/90 bg-[#0d1426] hover:border-slate-700 hover:bg-[#111930]"
                  )}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="w-7 h-7 rounded-full border border-purple-400/40 flex items-center justify-center text-purple-400">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    {addSkillOption === 'do-not-add' ? (
                      <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-600/80 bg-transparent" />
                    )}
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">Do Not Add</h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">Skip this skill and keep reviewing suggestions for other skills.</p>
                  </div>
                </button>
              </div>

              {/* Option 1 Sub-inputs: Select Section with Custom Dropdown */}
              {addSkillOption === 'add-specific' && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <label className="text-xs sm:text-[13px] font-semibold text-slate-200">
                    Select the section <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSectionDropdownOpen(prev => !prev)}
                      className="w-full px-4.5 py-3.5 rounded-2xl bg-[#0d1426] border border-slate-700/80 text-white text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer hover:border-slate-600 transition-colors shadow-inner"
                    >
                      <div className="flex items-center gap-2.5">
                        <activeSectionObj.icon className="w-4 h-4 text-purple-400" />
                        <span>{activeSectionObj.label}</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isSectionDropdownOpen && "rotate-180")} />
                    </button>

                    {isSectionDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border border-slate-700/90 bg-[#0c1224] p-2 shadow-2xl space-y-1 backdrop-blur-xl">
                        {sectionOptions.map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = addSkillSection === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setAddSkillSection(opt.id);
                                setIsSectionDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full px-4 py-3 rounded-xl text-left text-xs sm:text-sm flex items-center gap-3 transition-colors cursor-pointer",
                                isSelected
                                  ? "bg-[#182038] text-white font-semibold border border-purple-500/30"
                                  : "text-slate-300 hover:bg-[#141c30] hover:text-white"
                              )}
                            >
                              <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Context for the AI input */}
              {addSkillOption !== 'do-not-add' && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <label className="text-xs sm:text-[13px] font-semibold text-slate-200">Context for the AI</label>
                  <textarea
                    value={addSkillContext}
                    onChange={(e) => setAddSkillContext(e.target.value)}
                    placeholder="Tell the AI how you applied this skill, or share specific metrics and details to include."
                    rows={3}
                    className="w-full px-4.5 py-3 rounded-2xl bg-[#0d1426] border border-slate-700/80 text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Continue Button */}
              <button
                type="button"
                onClick={handleContinueFromAddSkillModal}
                className="w-full py-4 px-6 rounded-2xl bg-[#6366f1] hover:bg-[#5255e2] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/35 hover:scale-[1.008] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Continue</span>
                <span className="text-lg font-bold">→</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* ─── AI PROGRESS MODAL (Image 1: Keywords & Image 2: Summary) ─── */}
      {aiProgressModalType !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#182348] via-[#101732] to-[#0c1022] p-7 shadow-2xl shadow-blue-950/80 space-y-6 text-white relative">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setAiProgressModalType(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base md:text-lg font-bold text-white tracking-wide pr-6">
              {aiProgressModalType === 'keywords' ? 'Incorporating Selected Keywords' : 'Generating Professional Summary'}
            </h3>

            {/* Progress Bar & Label */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 shadow-md shadow-blue-500/50"
                  style={{ width: `${aiProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>
                  {aiProgressPercent}% {aiProgressModalType === 'keywords' ? 'Keywords Incorporated' : 'Summary Generated'}
                </span>
              </div>
            </div>

            {/* 3 Step Checklist */}
            <div className="space-y-4 pt-1">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {aiProgressStep === 1 && aiProgressPercent < 35 ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">
                    {aiProgressModalType === 'keywords' ? 'Preparing Resume Update' : 'Analyzing Profile'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {aiProgressModalType === 'keywords' ? 'Analyzing target sections for context...' : 'Extracting key skills and experiences...'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {aiProgressStep < 2 ? (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  ) : aiProgressStep === 2 && aiProgressPercent < 85 ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className={cn("text-xs font-semibold", aiProgressStep >= 2 ? "text-white font-bold" : "text-slate-500")}>
                    {aiProgressModalType === 'keywords' ? 'Rephrasing Content' : 'Drafting Summary'}
                  </h4>
                  {aiProgressStep >= 2 && (
                    <p className="text-[11px] text-slate-400">
                      {aiProgressModalType === 'keywords' ? 'Analyzing resume content for next section...' : 'Crafting role-aligned impact statement...'}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {aiProgressStep < 3 ? (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  ) : aiProgressPercent < 100 ? (
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className={cn("text-xs font-semibold", aiProgressStep >= 3 ? "text-white font-bold" : "text-slate-500")}>
                    {aiProgressModalType === 'keywords' ? 'Finalizing Updates' : 'Finalizing Content'}
                  </h4>
                  {aiProgressStep >= 3 && (
                    <p className="text-[11px] text-slate-400">
                      {aiProgressModalType === 'keywords' ? 'Preparing optimization recommendations...' : 'Polishing summary and highlighting strengths...'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
{/* ─── ENVELOPE CELEBRATION MODAL (Exact match to Image 3 with motion) ─── */}
      {isEnvelopeCelebrationOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#1b1236] via-[#100a24] to-[#070512] p-7 md:p-8 text-white relative shadow-2xl shadow-purple-950/90 text-center overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsEnvelopeCelebrationOpen(false);
                setIsAiWizardActive(false);
                setIsPostOptimizationView(true);
              }}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer z-20"
              title="Close and view optimized result"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Continuous Floating Purple & Magenta Confetti & Stars Background (Exact Image 5 Match) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <style>{`
                @keyframes envConfettiFall {
                  0% { transform: translateY(-20px) rotate(0deg) scale(0.8); opacity: 0; }
                  15% { opacity: 0.9; }
                  85% { opacity: 0.85; }
                  100% { transform: translateY(320px) rotate(360deg) scale(0.6); opacity: 0; }
                }
              `}</style>
              {[
                { char: '✦', color: 'text-purple-300', left: '10%', top: '5%', dur: '3.5s', delay: '0.2s', size: 'text-xs' },
                { char: '★', color: 'text-pink-300', left: '85%', top: '8%', dur: '4.0s', delay: '0.8s', size: 'text-sm' },
                { char: '♦', color: 'text-indigo-300', left: '22%', top: '15%', dur: '3.2s', delay: '1.2s', size: 'text-[11px]' },
                { char: '●', color: 'text-fuchsia-400', left: '78%', top: '22%', dur: '3.8s', delay: '0.5s', size: 'text-[9px]' },
                { char: '★', color: 'text-purple-200', left: '8%', top: '35%', dur: '4.2s', delay: '1.8s', size: 'text-xs' },
                { char: '✦', color: 'text-pink-400', left: '90%', top: '40%', dur: '3.6s', delay: '2.1s', size: 'text-xs' },
                { char: '♦', color: 'text-violet-300', left: '15%', top: '65%', dur: '3.4s', delay: '0.7s', size: 'text-[10px]' },
                { char: '✦', color: 'text-purple-300', left: '82%', top: '70%', dur: '3.9s', delay: '1.5s', size: 'text-sm' },
                { char: '★', color: 'text-amber-200', left: '88%', top: '60%', dur: '3.3s', delay: '2.4s', size: 'text-[11px]' },
              ].map((p, idx) => (
                <span
                  key={idx}
                  className={cn("absolute font-bold opacity-80", p.color, p.size)}
                  style={{
                    left: p.left,
                    top: p.top,
                    animation: `envConfettiFall ${p.dur} linear infinite`,
                    animationDelay: p.delay,
                  }}
                >
                  {p.char}
                </span>
              ))}
            </div>

            {/* Animated Envelope with Emerging Rainbow Postcard (Exact Image 5 match) */}
            <div className="relative w-56 h-48 mx-auto my-3 flex items-center justify-center animate-envelope-hover">
              {/* Soft purple radial back-glow */}
              <div
                className="absolute inset-0 rounded-full blur-2xl pointer-events-none opacity-80"
                style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(99, 102, 241, 0) 70%)' }}
              />

              {/* Emerging Letter Card with rainbow sheen (Clear and fully readable) */}
              <div
                className="absolute z-10 w-44 py-3.5 px-3 rounded-2xl bg-gradient-to-tr from-[#6b21a8] via-[#a855f7] to-[#ec4899] border border-pink-300/60 text-center shadow-2xl animate-letter-rise"
                style={{ top: '-6px' }}
              >
                <p className="text-xs sm:text-[13px] font-serif font-bold text-white leading-snug tracking-tight drop-shadow-lg">
                  Congrats! You've<br />
                  just taken the first<br />
                  step towards your<br />
                  <span className="text-amber-200 drop-shadow">dream job.</span>
                </p>
              </div>

              {/* Envelope Body (Brown / Dark Slate 3D Envelope with open V flap) */}
              <svg className="w-52 h-36 relative z-20 drop-shadow-2xl overflow-visible" viewBox="0 0 160 120" fill="none">
                <rect x="10" y="35" width="140" height="80" rx="8" fill="#1c162b" stroke="#4c3968" strokeWidth="1.5" />
                <path d="M 10 35 L 75 80 L 10 115 Z" fill="#251e38" opacity="0.9" />
                <path d="M 150 35 L 85 80 L 150 115 Z" fill="#29213e" opacity="0.9" />
                <path d="M 10 115 L 80 68 L 150 115 Z" fill="#1f1830" stroke="#3d2c55" strokeWidth="1" />
                <path d="M 10 35 L 80 5 L 150 35 Z" fill="#2d2244" stroke="#5b457c" strokeWidth="1.5" opacity="0.95" />
                {/* Rainbow Prismatic Light Beam across envelope */}
                <path d="M 28 115 L 80 35 L 98 35 L 46 115 Z" fill="url(#envelopeRainbowSheen)" opacity="0.6" />
                <defs>
                  <linearGradient id="envelopeRainbowSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                    <stop offset="35%" stopColor="#a855f7" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Title and Subtitle (Exact Image 5 Match) */}
            <div className="space-y-2 pt-2 relative z-20">
              <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug">
                Your resume is now<br />optimized for the job.
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed max-w-sm mx-auto">
                Your resume is now better aligned with this job description, giving you a stronger chance to stand out.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── EXPORT PDF CLICKABLE HYPERLINKS GUIDANCE MODAL ────────── */}
      {showExportGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0b0f19] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Export PDF with Clickable Links</h3>
                  <p className="text-xs text-slate-400">Ensure your GitHub, certificates, and social links are clickable</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportGuideModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Critical Callout Box */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <span className="text-base">⚠️</span>
                <span>CRITICAL STEP: Check Your "Destination" Setting</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                Windows defaults to <strong className="text-rose-400 font-semibold">"Microsoft Print to PDF"</strong>, which <strong className="text-rose-400 underline">strips all hyperlinks</strong> and flattens them into plain text.
              </p>
              <div className="bg-[#070b14] border border-slate-700/80 rounded-xl p-3 space-y-1.5 font-sans">
                <div className="text-slate-400 text-[11px] font-medium">In the Print window that opens:</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-bold">✅ SELECT THIS:</span>
                  <span className="bg-emerald-950/90 border border-emerald-500/50 px-2.5 py-1 rounded-lg text-emerald-200 font-bold font-mono text-[11px] shadow-sm">
                    Save as PDF
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-medium">(Preserves 100% clickable links)</span>
                </div>
                <div className="flex items-center gap-2 text-xs pt-1">
                  <span className="text-rose-400 font-bold">❌ AVOID THIS:</span>
                  <span className="bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-lg text-slate-400 line-through font-mono text-[11px]">
                    Microsoft Print to PDF
                  </span>
                  <span className="text-[10px] text-rose-400/80 font-medium">(Removes all links!)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3.5 text-xs leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">1</span>
                <div>
                  <span className="font-semibold text-white">Change Destination to "Save as PDF"</span>
                  <p className="text-slate-400 text-[11.5px] mt-0.5">
                    Click the Destination dropdown at the top right of the print dialog and pick <strong className="text-emerald-400 font-semibold">Save as PDF</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">2</span>
                <div>
                  <span className="font-semibold text-white">Enable Background Graphics</span>
                  <p className="text-slate-400 text-[11.5px] mt-0.5">
                    Under <strong>More settings</strong>, ensure <strong>Background graphics</strong> is checked so colors and badges render properly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">3</span>
                <div>
                  <span className="font-semibold text-white">Click Save</span>
                  <p className="text-slate-400 text-[11.5px] mt-0.5">
                    Your downloaded PDF will have razor-sharp styling and <strong className="text-indigo-400">100% active, clickable links</strong> for GitHub, LinkedIn, and certificates!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExportGuideModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExportGuideModal(false);
                  startBrowserPrint();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Open Print Dialog (Select "Save as PDF")</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ATS SUGGESTION REASON MODAL (Image 1 Reason Popup) ────────── */}
      {selectedReasonSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-[#0c1020] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  selectedReasonSuggestion.passing
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                )}>
                  {selectedReasonSuggestion.passing ? (
                    <Check className="w-5 h-5 text-indigo-400 stroke-[2.5]" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedReasonSuggestion.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-400 font-medium">{selectedReasonSuggestion.category}</span>
                    <span className="text-slate-600">•</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                      selectedReasonSuggestion.passing
                        ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-950/50 text-amber-300 border-amber-500/30"
                    )}>
                      {selectedReasonSuggestion.passing ? `Completed (+${selectedReasonSuggestion.weight}pts)` : `Action Required (-${selectedReasonSuggestion.weight}pts)`}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReasonSuggestion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#141b30] border border-slate-700/60 space-y-1.5">
                <h4 className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                  <span>🎯</span> What ATS Systems Look For
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {selectedReasonSuggestion.detailedReason || selectedReasonSuggestion.reason}
                </p>
              </div>

              {selectedReasonSuggestion.recruiterImpact && (
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                    <span>👥</span> Recruiter & Hiring Impact
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    {selectedReasonSuggestion.recruiterImpact}
                  </p>
                </div>
              )}

              {selectedReasonSuggestion.proTip && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
                  <h4 className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                    <span>💡</span> ATS Best Practice & Pro Tip
                  </h4>
                  <p className="text-purple-200 leading-relaxed">
                    {selectedReasonSuggestion.proTip}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReasonSuggestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
              {!selectedReasonSuggestion.passing && selectedReasonSuggestion.navigateTo && (
                <button
                  type="button"
                  onClick={() => {
                    const nav = selectedReasonSuggestion.navigateTo;
                    setSelectedReasonSuggestion(null);
                    setSearchParams({ tab: 'editor' });
                    if (nav === 'personal-info') setIsEditingPersonalInfo(true);
                    else if (nav === 'summary') setIsEditingSummary(true);
                    else if (nav === 'experience') {
                      if (resumeData && resumeData.experience.length > 0) handleStartEditExperience(resumeData.experience[0].id);
                      else handleAddNewExperience();
                    } else if (nav === 'education') {
                      if (resumeData && resumeData.education.length > 0) handleStartEditEducation(resumeData.education[0].id);
                      else handleAddNewEducation();
                    } else if (nav === 'projects') {
                      if (resumeData && resumeData.projects.length > 0) handleStartEditProject(resumeData.projects[0].id);
                      else handleAddNewProject();
                    } else if (nav === 'skills') handleStartEditSkills();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Fix This Section</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── CUSTOM SCROLLBAR & PRINT CSS STYLES ──────────────────── */}
      <style>{`
        /* Slim Custom Scrollbar matching screenshots */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.6);
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print, aside, nav, button, [role="dialog"], .fixed, header.no-print {
            display: none !important;
          }
          #root, #root > div, main, .flex-1, .overflow-y-auto, .custom-scrollbar {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            border: none !important;
          }
          body * {
            visibility: hidden;
          }
          #print-resume-area,
          #print-resume-area *,
          .resume-candidate-header,
          .resume-candidate-header * {
            visibility: visible !important;
          }
          #print-resume-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            display: block !important;
          }
          #print-resume-area > div {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .resume-candidate-header {
            display: block !important;
            visibility: visible !important;
            margin-bottom: 6px !important;
          }
          [id^="print-resume-page-"] {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 296mm !important;
            height: auto !important;
            padding: 8mm 12mm !important;
            background: #ffffff !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }
          [id^="print-resume-page-"]:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Preserve all anchor tags as real clickable links in PDF */
          a {
            color: inherit !important;
            text-decoration: none !important;
          }
          /* Contact header links: phone, email, social — keep black */
          .resume-candidate-header a {
            color: #000000 !important;
          }
          /* Cert and project links: keep blue so they stand out as clickable */
          #print-resume-area a[href^="http"],
          #print-resume-area a[href^="https"] {
            color: #1d4ed8 !important;
          }
          #print-resume-area a[href^="mailto:"],
          #print-resume-area a[href^="tel:"] {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};
