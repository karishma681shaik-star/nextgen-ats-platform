import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  ExternalLink,
  Globe,
  Github,
  Linkedin,
  Sparkles,
  Eye,
  Share2,
  Copy,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Mail,
  Phone,
  Layers,
  Camera,
  Upload,
  RefreshCw,
  Link as LinkIcon,
  RotateCcw,
  Star,
  Check,
  Building
} from 'lucide-react';
import { candidateService } from '../../services';
import { sendCopilotMessage } from '../../services/api/copilotApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSearchParams } from 'react-router-dom';
import {
  CandidateProfile,
  Education,
  Experience,
  Project,
  Certification
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { CandidateProfileHero } from '../../components/candidate/CandidateProfileHero';
import { CandidateProfileStrengthCard } from '../../components/candidate/CandidateProfileStrengthCard';
import { CardReflectiveShine } from '../../components/common/CardReflectiveShine';

// Preset sample data for 1-click profile booster if user has empty profile
const SAMPLE_BOOSTER_DATA: Partial<CandidateProfile> = {
  title: 'Senior Full-Stack & Distributed Systems Engineer',
  location: 'San Francisco, CA (Open to Remote / Hybrid)',
  bio: 'High-impact software engineer with 4+ years of experience designing mission-critical distributed services, cloud-native microservices, and reactive web applications. Passionate about AI integration, sub-millisecond API latency, and clean scalable architecture.',
  githubUrl: 'https://github.com/developer',
  linkedinUrl: 'https://linkedin.com/in/techlead',
  websiteUrl: 'https://portfolio.dev',
  skills: {
    technical: [
      'React 19',
      'TypeScript',
      'Node.js',
      'Java 21',
      'Spring Boot',
      'Python',
      'Next.js',
      'PostgreSQL',
      'Redis',
      'Kafka',
      'GraphQL',
      'Docker',
      'Kubernetes',
      'AWS Cloud'
    ],
    tools: [
      'Git / GitHub Actions',
      'Terraform',
      'Elasticsearch',
      'Datadog',
      'Prometheus',
      'Postman',
      'Vite',
      'Tailwind CSS'
    ],
    soft: [
      'Technical Architecture Design',
      'Engineering Mentorship',
      'Agile / Scrum Sprint Leadership',
      'Cross-functional Execution'
    ],
    languages: ['English (Fluent / Professional)', 'Hindi (Native)']
  },
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Software Engineer',
      company: 'CloudScale AI & Systems',
      location: 'San Francisco, CA (Hybrid)',
      startDate: '2023-01',
      endDate: '',
      current: true,
      description:
        'Architected high-throughput asynchronous processing pipeline handling 15M+ daily requests with 99.99% uptime. Led migration of monolithic services to event-driven microservices on AWS EKS, reducing p99 latency by 42%. Mentored junior engineers in distributed systems design.',
      technologies: ['TypeScript', 'Node.js', 'Java', 'AWS EKS', 'Kafka', 'PostgreSQL', 'Redis']
    },
    {
      id: 'exp-2',
      role: 'Full-Stack Software Engineer',
      company: 'Apex Data Labs',
      location: 'San Jose, CA',
      startDate: '2021-06',
      endDate: '2022-12',
      current: false,
      description:
        'Engineered real-time analytics dashboard used by 120k+ enterprise users with sub-second query speeds. Implemented automated CI/CD deployment pipelines using GitHub Actions, cutting release cycles from 2 days to 18 minutes.',
      technologies: ['React', 'TypeScript', 'Python FastAPI', 'Docker', 'GraphQL', 'TailwindCSS']
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Technology in Computer Science & Engineering',
      institution: 'RGUKT RK Valley (IIIT)',
      fieldOfStudy: 'Computer Science and Artificial Intelligence',
      startYear: '2019',
      endYear: '2023',
      grade: '8.85 CGPA (First Class with Distinction)'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'TalentPilot ATS & AI Recruitment Engine',
      description:
        'Next-generation automated recruitment platform featuring instant ATS resume score analysis, semantic skill matching, and candidate-recruiter interactive matching workflows.',
      technologies: ['React', 'TypeScript', 'Java Spring Boot', 'PostgreSQL', 'Tailwind CSS'],
      link: 'https://ai-ats.dev',
      githubUrl: 'https://github.com/developer/ai-ats-platform'
    },
    {
      id: 'proj-2',
      title: 'HyperStream - Realtime Event Broker',
      description:
        'Lightweight, high-performance distributed publish-subscribe message broker written in Go and Java with zero-copy network serialization and Raft consensus.',
      technologies: ['Java', 'Netty', 'Distributed Systems', 'Docker', 'gRPC'],
      link: 'https://hyperstream.io',
      githubUrl: 'https://github.com/developer/hyperstream'
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services (AWS)',
      issueDate: '2024-03',
      credentialUrl: 'https://aws.amazon.com/verification'
    },
    {
      id: 'cert-2',
      title: 'Meta Certified Professional Frontend Developer',
      issuer: 'Meta / Coursera',
      issueDate: '2023-08',
      credentialUrl: 'https://coursera.org/verify'
    }
  ]
};

const SUGGESTED_SKILLS_BY_CATEGORY: Record<'technical' | 'tools' | 'soft' | 'languages', string[]> = {
  technical: [
    'Java',
    'JavaScript',
    'TypeScript',
    'Python',
    'C',
    'C++',
    'React',
    'React.js',
    'Node.js',
    'Next.js',
    'Spring Boot',
    'Hibernate',
    'REST APIs',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'SQL',
    'Microservices',
    'Data Structures & Algorithms'
  ],
  tools: [
    'Git',
    'GitHub',
    'Docker',
    'Kubernetes',
    'AWS',
    'Microsoft Azure',
    'Google Cloud',
    'Jenkins',
    'GitHub Actions',
    'Linux',
    'Terraform',
    'CI/CD',
    'Postman',
    'Maven',
    'Gradle',
    'VS Code',
    'Jira',
    'Prometheus',
    'Grafana'
  ],
  soft: [
    'Communication',
    'Teamwork',
    'Problem Solving',
    'Leadership',
    'Critical Thinking',
    'Adaptability',
    'Time Management',
    'Collaboration',
    'Decision Making',
    'Conflict Resolution',
    'Mentoring',
    'Presentation Skills',
    'Creativity',
    'Analytical Thinking',
    'Attention to Detail',
    'Accountability',
    'Emotional Intelligence',
    'Negotiation'
  ],
  languages: [
    'English',
    'Telugu',
    'Hindi',
    'Urdu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Bengali',
    'Marathi',
    'Spanish',
    'French',
    'German',
    'Japanese',
    'Arabic'
  ]
};

const SKILL_CATEGORY_PLACEHOLDERS: Record<'technical' | 'tools' | 'soft' | 'languages', string> = {
  technical: 'Type a skill (e.g. Next.js, Microservices, Python, React)',
  tools: 'Type a tool or platform (e.g. Docker, Kubernetes, AWS, Terraform)',
  soft: 'Type a competency (e.g. Problem Solving, Leadership, Mentoring)',
  languages: 'Type a language (e.g. English, Telugu, Hindi, Spanish)'
};

const AVATAR_PRESETS = [
  { id: 'p1', label: 'Tech Lead Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
  { id: 'p2', label: 'Executive Female', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: 'p3', label: 'Software Eng Female', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { id: 'p4', label: 'Platform Eng Female', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80' },
  { id: 'p5', label: 'Senior Architect Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { id: 'p6', label: 'Full-Stack Male', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { id: 'p7', label: 'Distributed Systems', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
  { id: 'p8', label: 'AI Engineer Male', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
  { id: 'p9', label: 'Cyber 3D Dev', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80' },
  { id: 'p10', label: 'Modern Abstract', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80' }
];

export const CandidateProfilePage: React.FC = () => {
  const { updateProfile: updateAuthProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  // 3D Mouse Parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHeroTilt, setIsHeroTilt] = useState(false);
  const heroCardRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAIPitchModalOpen, setIsAIPitchModalOpen] = useState(false);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [aiPitchContent, setAiPitchContent] = useState<string | null>(null);

  // Pre-boost Backup & Undo State
  const [preBoostBackup, setPreBoostBackup] = useState<CandidateProfile | null>(() => {
    try {
      const saved = localStorage.getItem('pre_boost_backup');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verified ATS score set after 1-click profile boost
  const [verifiedAtsScore, setVerifiedAtsScore] = useState<number | null>(null);

  // About & Personal Details Modal & Inline Edit State
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [isEditingAboutInline, setIsEditingAboutInline] = useState(false);
  const [aboutFormData, setAboutFormData] = useState({
    name: '',
    title: '',
    location: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    phone: '',
    email: ''
  });

  // Section Clear Confirm Modal State
  const [clearSectionConfirm, setClearSectionConfirm] = useState<'skills' | 'experience' | 'education' | 'projects' | 'certifications' | null>(null);

  // Avatar edit modal & multi-option state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarOptionTab, setAvatarOptionTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Item Modals
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  const [projModalOpen, setProjModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<Project | null>(null);

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  // Skill input state
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'technical' | 'soft' | 'tools' | 'languages'>('technical');

  // Deletion confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'edu' | 'exp' | 'proj' | 'cert';
    id: string;
    title: string;
  } | null>(null);


  // Initial profile load — inlined directly so the linter doesn't warn about setState-in-effect
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    candidateService.getProfile().then((data) => {
      if (cancelled) return;
      setProfile(data);
      if (data) {
        setAboutFormData({
          name: data.name || '',
          title: data.title || '',
          location: data.location || '',
          bio: data.bio || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          websiteUrl: data.websiteUrl || '',
          phone: data.phone || '',
          email: data.email || ''
        });
      }
    }).catch((err) => {
      if (!cancelled) console.error('Failed to load profile', err);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-linking to incomplete profile sections via ?action=...
  useEffect(() => {
    const action = searchParams.get('action');
    if (!action) return;
    if (action === 'about' || action === 'headline' || action === 'bio') {
      setActiveTab('personal');
      setAboutModalOpen(true);
    } else if (action === 'education') {
      setActiveTab('education');
      setEditingEdu(null);
      setEduModalOpen(true);
    } else if (action === 'experience') {
      setActiveTab('experience');
      setEditingExp(null);
      setExpModalOpen(true);
    } else if (action === 'skills') {
      setActiveTab('skills');
    } else if (action === 'project' || action === 'projects') {
      setActiveTab('projects');
      setEditingProj(null);
      setProjModalOpen(true);
    } else if (action === 'certification' || action === 'certifications') {
      setActiveTab('certifications');
      setEditingCert(null);
      setCertModalOpen(true);
    }
  }, [searchParams]);

  // 3D Parallax Tracking
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Job Portal App Profile Completion Checklist
  const getProfileChecklist = (p: CandidateProfile | null) => {
    if (!p) return [];
    return [
      {
        id: 'headline',
        title: 'Basic Information & Headline',
        points: 20,
        completed: Boolean(p.name && p.title && p.title.trim().length > 2),
        action: () => setAboutModalOpen(true),
        actionLabel: 'Edit Details'
      },
      {
        id: 'bio',
        title: 'Executive Summary & Bio',
        points: 15,
        completed: Boolean(p.bio && p.bio.trim().length > 15),
        action: () => setAboutModalOpen(true),
        actionLabel: '+ Add Bio'
      },
      {
        id: 'skills',
        title: 'Core Technical Skills',
        points: 20,
        completed: (p.skills?.technical?.length || 0) + (p.skills?.tools?.length || 0) >= 3,
        action: () => setActiveTab('skills'),
        actionLabel: '+ Add Skills'
      },
      {
        id: 'experience',
        title: 'Industry Work Experience',
        points: 20,
        completed: (p.experience?.length || 0) > 0,
        action: () => {
          setEditingExp(null);
          setExpModalOpen(true);
        },
        actionLabel: '+ Add Position'
      },
      {
        id: 'education',
        title: 'Academic Education & Degree',
        points: 15,
        completed: (p.education?.length || 0) > 0,
        action: () => {
          setEditingEdu(null);
          setEduModalOpen(true);
        },
        actionLabel: '+ Add Degree'
      },
      {
        id: 'projects',
        title: 'Featured Portfolio Projects',
        points: 10,
        completed: (p.projects?.length || 0) > 0,
        action: () => {
          setEditingProj(null);
          setProjModalOpen(true);
        },
        actionLabel: '+ Add Project'
      }
    ];
  };

  const checklist = getProfileChecklist(profile);
  const calculatedCompletion = checklist.reduce((acc, item) => acc + (item.completed ? item.points : 0), 0);
  const profileCompletionRate = Math.min(
    100,
    Math.max(0, typeof profile?.profileCompletion === 'number' ? profile.profileCompletion : calculatedCompletion)
  );

  const getProfileStrengthInfo = (score: number) => {
    if (score >= 90) {
      return {
        label: 'All-Star Profile',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        textColor: 'text-emerald-400',
        message: 'Top-tier candidate profile. Highly optimized for ATS matching and recruiter shortlisting.'
      };
    }
    if (score >= 65) {
      return {
        label: 'Advanced Profile',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        textColor: 'text-indigo-400',
        message: 'Strong profile. Complete remaining items to achieve All-Star visibility with enterprise recruiters.'
      };
    }
    if (score >= 40) {
      return {
        label: 'Intermediate Profile',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        textColor: 'text-amber-400',
        message: 'Good foundation. Adding work experience and 3+ skills will increase recruiter views by 3.5x.'
      };
    }
    return {
      label: 'Beginner Profile',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      textColor: 'text-slate-300',
      message: 'Complete your profile sections to unlock AI ATS job recommendations and recruiter discoverability.'
    };
  };

  const strengthInfo = getProfileStrengthInfo(profileCompletionRate);

  // Check if profile currently has boosted sample data or pre-boost backup
  const canUndoBoost = Boolean(
    preBoostBackup ||
    profile?.title === SAMPLE_BOOSTER_DATA.title ||
    profile?.experience?.some((e) => e.company === 'CloudScale AI & Systems') ||
    profile?.projects?.some((p) => p.title.includes('TalentPilot ATS')) ||
    profile?.skills?.technical?.includes('React 19')
  );

  // 1-Click Profile Booster (with Pre-Boost Backup Saved!)
  const handleBoostProfile = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      const currentBackup = JSON.parse(JSON.stringify(profile));
      setPreBoostBackup(currentBackup);
      localStorage.setItem('pre_boost_backup', JSON.stringify(currentBackup));

      const boostedProfile: CandidateProfile = {
        ...profile,
        title: profile.title && profile.title !== 'Software Engineer' ? profile.title : SAMPLE_BOOSTER_DATA.title || profile.title,
        location: profile.location || SAMPLE_BOOSTER_DATA.location || 'San Francisco, CA',
        bio: profile.bio && profile.bio.length > 30 ? profile.bio : SAMPLE_BOOSTER_DATA.bio || profile.bio,
        githubUrl: profile.githubUrl || SAMPLE_BOOSTER_DATA.githubUrl,
        linkedinUrl: profile.linkedinUrl || SAMPLE_BOOSTER_DATA.linkedinUrl,
        websiteUrl: profile.websiteUrl || SAMPLE_BOOSTER_DATA.websiteUrl,
        skills: {
          technical: profile.skills.technical.length > 0 ? profile.skills.technical : SAMPLE_BOOSTER_DATA.skills!.technical,
          tools: profile.skills.tools.length > 0 ? profile.skills.tools : SAMPLE_BOOSTER_DATA.skills!.tools,
          soft: profile.skills.soft.length > 0 ? profile.skills.soft : SAMPLE_BOOSTER_DATA.skills!.soft,
          languages: profile.skills.languages.length > 0 ? profile.skills.languages : SAMPLE_BOOSTER_DATA.skills!.languages
        },
        experience: profile.experience.length > 0 ? profile.experience : SAMPLE_BOOSTER_DATA.experience!,
        education: profile.education.length > 0 ? profile.education : SAMPLE_BOOSTER_DATA.education!,
        projects: profile.projects.length > 0 ? profile.projects : SAMPLE_BOOSTER_DATA.projects!,
        certifications: profile.certifications.length > 0 ? profile.certifications : SAMPLE_BOOSTER_DATA.certifications!,
        profileCompletion: 96
      };

      const updated = await candidateService.updateProfile(boostedProfile);
      setProfile(updated);
      setVerifiedAtsScore(92);
      showToast({
        type: 'success',
        title: '⚡ Profile Boosted to 96%!',
        message: 'Credentials boosted. You can click "Undo Boost" anytime to restore your original profile.'
      });
    } catch {
      showToast({ type: 'error', title: 'Boost Failed', message: 'Could not auto-boost profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Undo Boost & Restore Original Profile
  const handleUndoBoost = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      let targetProfile: CandidateProfile;

      if (preBoostBackup) {
        targetProfile = { ...preBoostBackup };
      } else {
        targetProfile = {
          ...profile,
          title: profile.title === SAMPLE_BOOSTER_DATA.title ? 'Software Engineer' : profile.title,
          bio: profile.bio === SAMPLE_BOOSTER_DATA.bio ? 'Java developer' : (profile.bio || 'Java developer'),
          location: profile.location === SAMPLE_BOOSTER_DATA.location ? 'Nandyal' : profile.location,
          githubUrl: profile.githubUrl === SAMPLE_BOOSTER_DATA.githubUrl ? '' : (profile.githubUrl || ''),
          linkedinUrl: profile.linkedinUrl === SAMPLE_BOOSTER_DATA.linkedinUrl ? '' : (profile.linkedinUrl || ''),
          websiteUrl: profile.websiteUrl === SAMPLE_BOOSTER_DATA.websiteUrl ? '' : (profile.websiteUrl || ''),
          skills: {
            technical: profile.skills.technical.filter((s) => !SAMPLE_BOOSTER_DATA.skills!.technical.includes(s)),
            tools: profile.skills.tools.filter((s) => !SAMPLE_BOOSTER_DATA.skills!.tools.includes(s)),
            soft: profile.skills.soft.filter((s) => !SAMPLE_BOOSTER_DATA.skills!.soft.includes(s)),
            languages: profile.skills.languages.filter((s) => !SAMPLE_BOOSTER_DATA.skills!.languages.includes(s))
          },
          experience: profile.experience.filter((e) => e.company !== 'CloudScale AI & Systems' && e.company !== 'Apex Data Labs'),
          education: profile.education.filter((e) => !e.degree?.includes('RGUKT RK Valley (IIIT)') || e.id !== 'edu-1'),
          projects: profile.projects.filter((p) => !p.title?.includes('TalentPilot ATS') && !p.title?.includes('HyperStream')),
          certifications: profile.certifications.filter((c) => !c.title?.includes('AWS Certified Solutions') && !c.title?.includes('Meta Certified'))
        };
      }

      targetProfile.profileCompletion = 43;
      const updated = await candidateService.updateProfile(targetProfile);
      setProfile(updated);
      setPreBoostBackup(null);
      localStorage.removeItem('pre_boost_backup');
      setVerifiedAtsScore(null);
      showToast({
        type: 'info',
        title: 'Boost Reverted ↺',
        message: 'Your original profile has been restored and boosted sample data removed.'
      });
    } catch {
      showToast({ type: 'error', title: 'Revert Failed', message: 'Could not revert profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Clear Individual Section
  const handleClearSection = async (section: 'skills' | 'experience' | 'education' | 'projects' | 'certifications') => {
    if (!profile) return;
    try {
      setIsSaving(true);
      let updated: CandidateProfile = { ...profile };
      if (section === 'skills') {
        updated.skills = { technical: [], tools: [], soft: [], languages: [] };
      } else if (section === 'experience') {
        updated.experience = [];
      } else if (section === 'education') {
        updated.education = [];
      } else if (section === 'projects') {
        updated.projects = [];
      } else if (section === 'certifications') {
        updated.certifications = [];
      }

      const saved = await candidateService.updateProfile(updated);
      setProfile(saved);
      setClearSectionConfirm(null);
      showToast({ type: 'info', title: 'Section Cleared', message: `All ${section} records cleared successfully.` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: `Failed to clear ${section}.` });
    } finally {
      setIsSaving(false);
    }
  };

  // AI Fast Pitch Generator (Real AI Analysis based on Candidate's Actual Data!)
  const handleGenerateAIPitch = async () => {
    if (!profile) return;
    setIsGeneratingPitch(true);
    try {
      const skillsList = [
        ...(profile.skills?.technical || []),
        ...(profile.skills?.tools || [])
      ].slice(0, 10).join(', ');

      const expList = profile.experience?.map((e) => `${e.role} at ${e.company} (${e.description.slice(0, 80)})`).join('; ') || '';
      const eduList = profile.education?.map((e) => `${e.degree} from ${e.institution}`).join('; ') || '';

      const prompt = [
        `You are an elite executive tech recruiter writing a punchy 30-second elevator pitch for candidate "${profile.name}".`,
        `Candidate Real Details:`,
        `- Role / Headline: ${profile.title || 'Software Engineer'}`,
        `- Location: ${profile.location || 'Remote'}`,
        `- Bio / Summary: ${profile.bio || 'Software Developer'}`,
        `- Validated Tech Skills: ${skillsList || 'Software Development, Problem Solving'}`,
        `- Work History: ${expList || 'Industry Engineering Experience'}`,
        `- Education: ${eduList || 'Engineering Background'}`,
        `STRICT RULES:`,
        `1. Tailor the pitch SPECIFICALLY and ACCURATELY to this candidate's actual role (${profile.title}) and skills (${skillsList}).`,
        `2. Do NOT use generic canned placeholder text or invent unrelated tech stacks.`,
        `3. Provide exactly 3 short bullet points starting with strong action verbs.`,
        `4. Format with bullet points (•) and no markdown asterisks (**).`,
        `5. Maximum 3 sentences total.`
      ].join('\n');

      const response = await sendCopilotMessage(prompt, {
        candidateName: profile.name,
        role: profile.title || 'Software Engineer',
        skills: skillsList
      });

      if (response && response.message && response.message.trim()) {
        const cleaned = response.message
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/^here (is|are).*?:\s*/i, '')
          .replace(/^sure[,!].*?:\s*/i, '')
          .replace(/^recruiter pitch:?\s*/i, '')
          .trim();
        setAiPitchContent(cleaned);
      } else {
        throw new Error('No AI response');
      }
    } catch {
      const role = profile.title || 'Software Engineer';
      const topSkills = profile.skills?.technical?.slice(0, 5).join(', ') || 'core engineering and modern software practices';
      const loc = profile.location || 'Remote';
      const bioText = profile.bio ? ` Specialized in ${profile.bio.slice(0, 100)}.` : '';

      const fallback = [
        `• Candidate Profile: ${profile.name} is a dedicated ${role} based in ${loc}.${bioText}`,
        `• Technical Depth: Verified capability in ${topSkills} with strong analytical problem-solving and rapid delivery focus.`,
        `• Recruiter Recommendation: High interview readiness for ${role} roles; strong team fit for engineering orgs.`
      ].join('\n');
      setAiPitchContent(fallback);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleOpenAIPitchModal = () => {
    setIsAIPitchModalOpen(true);
    if (!aiPitchContent) {
      handleGenerateAIPitch();
    }
  };

  const handleApplyPitchToBio = async () => {
    if (!profile || !aiPitchContent) return;
    try {
      setIsSaving(true);
      const updated = {
        ...profile,
        bio: aiPitchContent
      };
      setProfile(updated);
      await candidateService.updateProfile(updated);
      setIsAIPitchModalOpen(false);
      showToast({
        type: 'success',
        title: 'Bio Updated With AI Pitch! ✨',
        message: 'Your profile bio has been updated with your customized AI recruiter pitch.'
      });
    } catch {
      showToast({ type: 'error', title: 'Update Failed', message: 'Could not update profile bio.' });
    } finally {
      setIsSaving(false);
    }
  };


  const handleSaveAboutDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    try {
      setIsSaving(true);
      const newName = aboutFormData.name.trim() || profile.name;
      const updated: CandidateProfile = {
        ...profile,
        name: newName,
        title: aboutFormData.title.trim() || profile.title,
        location: aboutFormData.location.trim() || profile.location,
        bio: aboutFormData.bio.trim() || profile.bio,
        githubUrl: aboutFormData.githubUrl.trim(),
        linkedinUrl: aboutFormData.linkedinUrl.trim(),
        websiteUrl: aboutFormData.websiteUrl.trim(),
        phone: aboutFormData.phone.trim() || profile.phone,
        email: aboutFormData.email.trim() || profile.email
      };
      setProfile(updated);
      await candidateService.updateProfile(updated);
      if (newName && updateAuthProfile) {
        try {
          await updateAuthProfile({ name: newName });
        } catch (authErr) {
          console.warn('Could not sync auth profile name:', authErr);
        }
      }
      setAboutModalOpen(false);
      setIsEditingAboutInline(false);
      showToast({
        type: 'success',
        title: 'Profile Details Saved! ✨',
        message: 'Your personal summary, headline, and web presence have been updated.'
      });
    } catch {
      showToast({ type: 'error', title: 'Save Failed', message: 'Could not save profile details.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAIEnhanceBio = async () => {
    if (!profile) return;
    setIsGeneratingPitch(true);
    try {
      const skills = [
        ...(profile.skills?.technical || []),
        ...(profile.skills?.tools || [])
      ].slice(0, 8).join(', ') || 'Software Engineering';
      const prompt = `Write a high-impact, professional 2-3 sentence executive bio for software candidate ${aboutFormData.name || profile.name} targeting roles in ${aboutFormData.title || profile.title}. Key skills: ${skills}. Location: ${aboutFormData.location || profile.location}. Keep it punchy, authentic, and direct with no buzzword fluff.`;
      const res = await sendCopilotMessage(prompt, {
        candidateName: profile.name,
        role: aboutFormData.title || profile.title
      });
      if (res && res.message) {
        const cleaned = res.message.replace(/\*\*/g, '').replace(/^here (is|are).*?:\s*/i, '').trim();
        setAboutFormData((prev) => ({ ...prev, bio: cleaned }));
        showToast({ type: 'success', title: 'AI Bio Generated', message: 'Applied AI generated professional summary!' });
      }
    } catch {
      const fallback = `${aboutFormData.name || profile.name} is a results-driven ${aboutFormData.title || profile.title || 'Software Engineer'} based in ${aboutFormData.location || 'Remote'}. Experienced in designing resilient software solutions, core problem-solving, and cross-functional engineering delivery.`;
      setAboutFormData((prev) => ({ ...prev, bio: fallback }));
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleAddSkill = async (e?: React.FormEvent, customSkill?: string) => {
    if (e) e.preventDefault();
    const skillToAdd = (customSkill || newSkillInput).trim();
    if (!skillToAdd || !profile) return;

    const currentList = profile.skills?.[newSkillCategory] || [];
    if (currentList.some((s) => s.toLowerCase() === skillToAdd.toLowerCase())) {
      showToast({ type: 'info', title: 'Skill Exists', message: `"${skillToAdd}" is already in your stack.` });
      return;
    }

    const updatedProfile: CandidateProfile = {
      ...profile,
      skills: {
        technical: profile.skills?.technical || [],
        tools: profile.skills?.tools || [],
        soft: profile.skills?.soft || [],
        languages: profile.skills?.languages || [],
        [newSkillCategory]: [...currentList, skillToAdd]
      }
    };
    setProfile(updatedProfile);
    setNewSkillInput('');
    try {
      await candidateService.updateProfile(updatedProfile);
      showToast({ type: 'success', title: 'Skill Added', message: `Added "${skillToAdd}" to verified stack.` });
    } catch (err) {
      console.error('Failed to persist skill addition', err);
    }
  };

  const handleRemoveSkill = async (category: keyof typeof profile.skills, skillName: string) => {
    if (!profile) return;
    const currentCategoryList = profile.skills?.[category] || [];
    const updatedProfile: CandidateProfile = {
      ...profile,
      skills: {
        technical: profile.skills?.technical || [],
        tools: profile.skills?.tools || [],
        soft: profile.skills?.soft || [],
        languages: profile.skills?.languages || [],
        [category]: currentCategoryList.filter((s) => s !== skillName)
      }
    };
    setProfile(updatedProfile);
    try {
      await candidateService.updateProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to persist skill removal', err);
    }
  };

  // Education Handlers
  const handleSaveEducation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    const formData = new FormData(e.currentTarget);
    const eduData: Education = {
      id: editingEdu ? editingEdu.id : `edu-${Date.now()}`,
      degree: formData.get('degree') as string,
      institution: formData.get('institution') as string,
      fieldOfStudy: formData.get('fieldOfStudy') as string,
      startYear: formData.get('startYear') as string,
      endYear: formData.get('endYear') as string,
      grade: formData.get('grade') as string
    };

    let updatedList = [...profile.education];
    if (editingEdu) {
      updatedList = updatedList.map((item) => (item.id === editingEdu.id ? eduData : item));
    } else {
      updatedList.push(eduData);
    }

    const updated = {
      ...profile,
      education: updatedList
    };
    setProfile(updated);
    candidateService.updateProfile(updated);
    setEduModalOpen(false);
    setEditingEdu(null);
    showToast({ type: 'success', title: 'Education Saved', message: eduData.degree });
  };

  // Experience Handlers
  const handleSaveExperience = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    const formData = new FormData(e.currentTarget);
    const isCurrent = formData.get('current') === 'on';
    const techString = formData.get('technologies') as string;

    const expData: Experience = {
      id: editingExp ? editingExp.id : `exp-${Date.now()}`,
      role: formData.get('role') as string,
      company: formData.get('company') as string,
      location: (formData.get('location') as string) || 'Remote',
      startDate: formData.get('startDate') as string,
      endDate: isCurrent ? '' : (formData.get('endDate') as string),
      current: isCurrent,
      description: formData.get('description') as string,
      technologies: techString ? techString.split(',').map((t) => t.trim()).filter(Boolean) : []
    };

    let updatedList = [...profile.experience];
    if (editingExp) {
      updatedList = updatedList.map((item) => (item.id === editingExp.id ? expData : item));
    } else {
      updatedList.push(expData);
    }

    const updated = {
      ...profile,
      experience: updatedList
    };
    setProfile(updated);
    candidateService.updateProfile(updated);
    setExpModalOpen(false);
    setEditingExp(null);
    showToast({ type: 'success', title: 'Experience Saved', message: `${expData.role} at ${expData.company}` });
  };

  // Project Handlers
  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    const formData = new FormData(e.currentTarget);
    const projData: Project = {
      id: editingProj ? editingProj.id : `proj-${Date.now()}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      technologies: (formData.get('technologies') as string)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      link: formData.get('link') as string,
      githubUrl: formData.get('githubUrl') as string
    };

    let updatedList = [...profile.projects];
    if (editingProj) {
      updatedList = updatedList.map((item) => (item.id === editingProj.id ? projData : item));
    } else {
      updatedList.push(projData);
    }

    const updated = {
      ...profile,
      projects: updatedList
    };
    setProfile(updated);
    candidateService.updateProfile(updated);
    setProjModalOpen(false);
    setEditingProj(null);
    showToast({ type: 'success', title: 'Project Saved', message: projData.title });
  };

  // Certification Handlers
  const handleSaveCertification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    const formData = new FormData(e.currentTarget);
    const certData: Certification = {
      id: editingCert ? editingCert.id : `cert-${Date.now()}`,
      title: formData.get('title') as string,
      issuer: formData.get('issuer') as string,
      issueDate: formData.get('issueDate') as string,
      credentialUrl: formData.get('credentialUrl') as string
    };

    let updatedList = [...profile.certifications];
    if (editingCert) {
      updatedList = updatedList.map((item) => (item.id === editingCert.id ? certData : item));
    } else {
      updatedList.push(certData);
    }

    const updated = {
      ...profile,
      certifications: updatedList
    };
    setProfile(updated);
    candidateService.updateProfile(updated);
    setCertModalOpen(false);
    setEditingCert(null);
    showToast({ type: 'success', title: 'Certification Saved', message: certData.title });
  };

  // Delete Confirmation Handler
  const confirmDeleteItem = () => {
    if (!deleteConfirm || !profile) return;
    const { type, id } = deleteConfirm;

    let updated = { ...profile };
    if (type === 'edu') {
      updated.education = updated.education.filter((item) => item.id !== id);
    } else if (type === 'exp') {
      updated.experience = updated.experience.filter((item) => item.id !== id);
    } else if (type === 'proj') {
      updated.projects = updated.projects.filter((item) => item.id !== id);
    } else if (type === 'cert') {
      updated.certifications = updated.certifications.filter((item) => item.id !== id);
    }

    setProfile(updated);
    candidateService.updateProfile(updated);
    setDeleteConfirm(null);
    showToast({ type: 'info', title: 'Item Removed', message: 'Record deleted from profile.' });
  };

  // Avatar update
  const handleUpdateAvatar = (url: string) => {
    if (!profile) return;
    const updated = { ...profile, avatar: url };
    setProfile(updated);
    candidateService.updateProfile(updated);
    setAvatarModalOpen(false);
    setUploadedPreview(null);
    setCustomAvatarUrl('');
    showToast({ type: 'success', title: 'Avatar Updated', message: 'Profile photo updated successfully across your profile.' });
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', title: 'Invalid File', message: 'Please select an image file (PNG, JPG, WEBP, GIF).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', title: 'File Too Large', message: 'Maximum file size is 5MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setUploadedPreview(dataUrl);
        setAvatarOptionTab('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSyncGithubAvatar = () => {
    if (!profile) return;
    let username = '';
    if (profile.githubUrl) {
      const match = profile.githubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/);
      if (match) username = match[1];
    }
    if (!username && profile.name) {
      username = profile.name.trim().replace(/\s+/g, '');
    }
    if (username) {
      const ghUrl = `https://github.com/${username}.png`;
      setUploadedPreview(ghUrl);
      setCustomAvatarUrl(ghUrl);
      setAvatarOptionTab('url');
      showToast({ type: 'info', title: 'GitHub Avatar Fetched', message: `Found GitHub photo for @${username}` });
    } else {
      showToast({ type: 'error', title: 'No GitHub Handle', message: 'Please enter your GitHub profile URL in Personal Information first.' });
    }
  };

  const handleGenerateDicebear = () => {
    const seed = profile?.name ? encodeURIComponent(profile.name) : 'developer';
    const dicebearUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=0f172a`;
    setUploadedPreview(dicebearUrl);
    setCustomAvatarUrl(dicebearUrl);
    setAvatarOptionTab('url');
    showToast({ type: 'info', title: 'AI Avatar Generated', message: 'Unique cyber avatar generated from your profile name!' });
  };

  const copyProfileLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast({
      type: 'success',
      title: 'Link Copied',
      message: 'Verified Candidate Showcase link copied to clipboard!'
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="space-y-6 select-none" aria-busy="true" aria-live="polite">
        {/* Profile Header Card */}
        <div className="card-upper-edge-luminous rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-white/[0.08]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <Skeleton className="h-7 w-56 rounded-xl mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-72 rounded-md mx-auto sm:mx-0" />
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
                <Skeleton className="h-5 w-28 rounded-lg" />
                <Skeleton className="h-5 w-36 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-xl shrink-0" />
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-upper-edge-luminous rounded-2xl p-5 bg-slate-900/70 border border-white/[0.06] space-y-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Count stats
  const totalSkillsCount =
    (profile.skills?.technical?.length || 0) +
    (profile.skills?.tools?.length || 0) +
    (profile.skills?.soft?.length || 0) +
    (profile.skills?.languages?.length || 0);

  const tabsConfig = [
    { id: 'all', label: '📄 All Sections (Full View)', icon: <Layers className="w-4 h-4" /> },
    { id: 'personal', label: 'About & Details', icon: <User className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills & Stack', icon: <Code2 className="w-4 h-4" />, count: totalSkillsCount },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" />, count: profile.experience?.length || 0 },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, count: profile.education?.length || 0 },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" />, count: profile.projects?.length || 0 },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" />, count: profile.certifications?.length || 0 }
  ];

  return (
    <div className="relative min-h-screen pb-20 space-y-8 select-none">

      {/* Subtle Dimly Lit Studio Ambient Depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-950/15 via-blue-950/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.04] blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/[0.03] blur-[130px] pointer-events-none" />
      </div>

      {/* ============================================================
          2. HEADER COMMAND BAR
          ============================================================ */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Verified Job Portal Profile
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open to Opportunities
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-3">
            Candidate Profile
            <span className="text-xs font-mono font-medium text-slate-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08]">
              {strengthInfo.label}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Your public tech identity and verified dossier seen by enterprise engineering recruiters.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canUndoBoost ? (
            <Button
              onClick={handleUndoBoost}
              variant="secondary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<RotateCcw className="w-4 h-4 text-amber-400" />}
              className="border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/40 text-amber-200 font-bold backdrop-blur-md shadow-md"
            >
              Undo Boost (Restore Original)
            </Button>
          ) : (
            profileCompletionRate < 85 && (
              <Button
                onClick={handleBoostProfile}
                variant="glow"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Zap className="w-4 h-4 text-amber-300 animate-bounce" />}
                className="bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold shadow-md shadow-indigo-600/20"
              >
                Boost Profile to 96%
              </Button>
            )
          )}

          <Button
            onClick={() => setIsRecruiterModalOpen(true)}
            variant="secondary"
            size="sm"
            leftIcon={<Eye className="w-4 h-4 text-cyan-400" />}
            className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold backdrop-blur-md"
          >
            Recruiter Live View
          </Button>

          <Button
            onClick={handleOpenAIPitchModal}
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
            className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold backdrop-blur-md"
          >
            AI Fast Pitch
          </Button>

          <Button
            onClick={copyProfileLink}
            variant="secondary"
            size="sm"
            leftIcon={<Share2 className="w-4 h-4 text-indigo-400" />}
            className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold backdrop-blur-md"
          >
            Share
          </Button>
        </div>
      </div>

      {/* ============================================================
          3. REALISTIC 3D CANDIDATE PROFILE HERO (Level 1, Level 2, Level 3)
          ============================================================ */}
      <CandidateProfileHero
        profile={profile}
        strengthLabel={strengthInfo.label}
        totalSkillsCount={totalSkillsCount}
        mousePos={mousePos}
        onAvatarClick={() => {
          setUploadedPreview(null);
          setAvatarModalOpen(true);
        }}
        onContactClick={() => setIsContactModalOpen(true)}
        onEditAbout={() => setAboutModalOpen(true)}
        onAIEnhance={handleOpenAIPitchModal}
      />

      {/* ============================================================
          4. PROFILE STRENGTH & CAREER READINESS (With 3D Growth Object)
          ============================================================ */}
      <CandidateProfileStrengthCard
        profileCompletionRate={profileCompletionRate}
        strengthInfo={strengthInfo}
        checklist={checklist}
      />

      {/* ============================================================
          5. STICKY QUICK-NAV SECTION PILLS
          ============================================================ */}
      <div className="relative z-10 sticky top-20">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#070b1c]/90 border border-slate-800/90 backdrop-blur-2xl overflow-x-auto no-scrollbar shadow-2xl">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-indigo-900/90 text-white border border-indigo-300/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          6. PROFILE CONTENT SECTIONS (FULL VIEW OR SINGLE TAB)
          ============================================================ */}
      <div className="relative z-10 space-y-8">
        {/* SECTION: ABOUT / PROFESSIONAL SUMMARY */}
        {(activeTab === 'all' || activeTab === 'personal') && (
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0c132c]/85 via-[#080d20]/90 to-[#060918]/95 border border-indigo-500/15 hover:border-indigo-400/25 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] space-y-6 transition-all duration-300 overflow-hidden group">
            <CardReflectiveShine variant="indigo" rounded="rounded-3xl" topIllumination={true} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-500/20 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">About & Professional Summary</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Your core candidate positioning seen by recruiters and matching algorithms.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'personal' && (
                  <Button
                    type="button"
                    onClick={() => setIsEditingAboutInline(!isEditingAboutInline)}
                    variant={isEditingAboutInline ? 'primary' : 'secondary'}
                    size="sm"
                    leftIcon={isEditingAboutInline ? <Eye className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                  >
                    {isEditingAboutInline ? 'View Dossier' : 'Edit Details'}
                  </Button>
                )}
                {activeTab === 'all' && (
                  <Button
                    type="button"
                    onClick={() => setAboutModalOpen(true)}
                    variant="secondary"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleOpenAIPitchModal}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                >
                  AI Enhance
                </Button>
              </div>
            </div>

            {/* If in Inline Edit Mode (available on About & Details tab) */}
            {activeTab === 'personal' && isEditingAboutInline ? (
              <form onSubmit={handleSaveAboutDetails} className="space-y-5 pt-2 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    label="Full Name"
                    value={aboutFormData.name}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    required
                  />
                  <Input
                    name="title"
                    label="Professional Headline / Current Role"
                    value={aboutFormData.title}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, title: e.target.value })}
                    placeholder="e.g. Senior Java Backend Engineer"
                    required
                  />
                </div>

                {/* Quick Role Suggestions */}
                <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Quick Role Presets:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      'Senior Software Engineer',
                      'Java Backend Specialist',
                      'Full-Stack Developer',
                      'Frontend & UI Specialist',
                      'Cloud / DevOps Engineer'
                    ].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setAboutFormData({ ...aboutFormData, title: role })}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
                      >
                        +{role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    name="location"
                    label="Location (City, State / Country)"
                    value={aboutFormData.location}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA (or Remote)"
                  />
                  <Input
                    name="phone"
                    label="Contact Phone"
                    value={aboutFormData.phone}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2834"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Professional Summary / Bio</label>
                    <button
                      type="button"
                      onClick={handleQuickAIEnhanceBio}
                      disabled={isGeneratingPitch}
                      className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1.5 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                      {isGeneratingPitch ? 'Generating Bio...' : 'AI Auto-Enhance Bio'}
                    </button>
                  </div>
                  <Textarea
                    name="bio"
                    value={aboutFormData.bio}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, bio: e.target.value })}
                    rows={4}
                    placeholder="Provide an authentic summary of your technical background, accomplishments, and career aspirations..."
                    required
                  />

                  {/* Quick Bio Starters */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setAboutFormData((prev) => ({
                          ...prev,
                          bio: 'High-impact software engineer with expertise in architecting resilient backend microservices, clean code, and scalable data pipelines for enterprise platforms.'
                        }))
                      }
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
                    >
                      ⚡ High-Impact Engineer
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAboutFormData((prev) => ({
                          ...prev,
                          bio: 'Dedicated Java & Spring Boot engineer specializing in distributed systems, RESTful microservices, and database optimization with a strong focus on high-throughput architectures.'
                        }))
                      }
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
                    >
                      ☕ Java & Spring Expert
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAboutFormData((prev) => ({
                          ...prev,
                          bio: 'Full-stack software developer proficient in modern React, TypeScript, and cloud-native services, committed to clean UI design and sub-second application performance.'
                        }))
                      }
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
                    >
                      🚀 Full-Stack Specialist
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Web Presence & Social Profiles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      name="githubUrl"
                      label="GitHub Profile URL"
                      value={aboutFormData.githubUrl}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                    <Input
                      name="linkedinUrl"
                      label="LinkedIn Profile URL"
                      value={aboutFormData.linkedinUrl}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                    <Input
                      name="websiteUrl"
                      label="Portfolio Website URL"
                      value={aboutFormData.websiteUrl}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, websiteUrl: e.target.value })}
                      placeholder="https://portfolio.dev"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditingAboutInline(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="glow"
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <>
                <div className="relative p-5 sm:p-6 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm">
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-normal relative z-10">
                    {profile.bio ||
                      `${profile.name} is a focused ${profile.title || 'Software Engineer'} based in ${profile.location || 'Remote'}. Click "Edit Details" or "AI Enhance" to personalize your professional executive bio.`}
                  </p>
                </div>

                {/* Information Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="relative p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm">
                    <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5 relative z-10">
                      <Briefcase className="w-3.5 h-3.5" />
                      Target Role
                    </span>
                    <p className="text-sm font-bold text-white mt-1.5 relative z-10">{profile.title || 'Software Engineer'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 relative z-10">Open to Full-Time & Hybrid</p>
                  </div>

                  <div className="relative p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm">
                    <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 relative z-10">
                      <MapPin className="w-3.5 h-3.5" />
                      Location & Work
                    </span>
                    <p className="text-sm font-bold text-white mt-1.5 relative z-10">{profile.location || 'San Francisco, CA'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 relative z-10">Authorized to Work</p>
                  </div>

                  <div className="relative p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm">
                    <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5 relative z-10">
                      <Globe className="w-3.5 h-3.5" />
                      Web Footprint
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 relative z-10">
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-[10px] font-bold border border-slate-700/80 flex items-center gap-1 shadow-sm"
                        >
                          <Github className="w-3 h-3" /> GitHub
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 text-[10px] font-bold border border-blue-800/60 flex items-center gap-1 shadow-sm"
                        >
                          <Linkedin className="w-3 h-3" /> LinkedIn
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a
                          href={profile.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-[10px] font-bold border border-indigo-800/60 flex items-center gap-1 shadow-sm"
                        >
                          <Globe className="w-3 h-3" /> Portfolio
                        </a>
                      )}
                      {!profile.githubUrl && !profile.linkedinUrl && !profile.websiteUrl && (
                        <button
                          type="button"
                          onClick={() => setAboutModalOpen(true)}
                          className="text-[11px] text-indigo-400 hover:underline font-medium"
                        >
                          + Add Social Links
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm">
                    <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5 relative z-10">
                      <Code2 className="w-3.5 h-3.5" />
                      Technical Focus
                    </span>
                    <p className="text-sm font-bold text-white mt-1.5 relative z-10">
                      {profile.skills?.technical && profile.skills.technical.length > 0
                        ? profile.skills.technical.slice(0, 3).join(', ')
                        : 'Core Software Development'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 relative z-10">
                      {profile.skills?.technical && profile.skills.technical.length > 0
                        ? `${profile.skills.technical.length} verified technical skills`
                        : 'Add skills in Skills tab'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* SECTION: SKILLS & COMPETENCIES */}
        {(activeTab === 'all' || activeTab === 'skills') && (
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0c132c]/85 via-[#080d20]/90 to-[#060918]/95 border border-indigo-500/15 hover:border-indigo-400/25 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] space-y-6 transition-all duration-300 overflow-hidden group">
            <CardReflectiveShine variant="indigo" rounded="rounded-3xl" topIllumination={true} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-500/20 relative z-10">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  Skills & Technical Competencies ({totalSkillsCount})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Industry validated engineering skills for AI search and recruiter ranking.</p>
              </div>

              <div className="flex items-center gap-2">
                {totalSkillsCount > 0 && (
                  <Button
                    type="button"
                    onClick={() => setClearSectionConfirm('skills')}
                    variant="secondary"
                    size="sm"
                    className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 text-xs"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Clear All ({totalSkillsCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Quick-Add Skill Bar */}
            <form onSubmit={(e) => handleAddSkill(e)} className="flex flex-col sm:flex-row items-end gap-3 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] hover:border-white/[0.12] transition-all duration-200 group relative overflow-hidden shadow-inner z-10">
              <div className="flex-1 w-full relative z-10">
                <Input
                  id="skill-input-field"
                  placeholder={SKILL_CATEGORY_PLACEHOLDERS[newSkillCategory] || 'Type a skill...'}
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-52 relative z-10">
                <select
                  id="skill-category-select"
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl border border-indigo-500/30 px-3.5 py-2.5 focus:border-indigo-400 focus:outline-none cursor-pointer"
                >
                  <option value="technical">Technical Stack</option>
                  <option value="tools">Tools & DevOps</option>
                  <option value="soft">Leadership & Soft</option>
                  <option value="languages">Languages</option>
                </select>
              </div>
              <div className="relative z-10">
                <Button id="add-skill-button" type="submit" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Add Skill
                </Button>
              </div>
            </form>

            {/* Category-Aware Dynamic Quick Suggestions */}
            {(() => {
              const currentCategorySkills = profile.skills?.[newSkillCategory] || [];
              const normalizedInput = newSkillInput.trim().toLowerCase();
              const categorySuggestions = SUGGESTED_SKILLS_BY_CATEGORY[newSkillCategory] || [];

              const availableSuggestions = categorySuggestions.filter((s) => {
                // 1. Exclude skills already added in this category (case-insensitive)
                const alreadyAdded = currentCategorySkills.some(
                  (existing) => existing.toLowerCase() === s.toLowerCase()
                );
                if (alreadyAdded) return false;

                // 2. Filter by search input (case-insensitive substring)
                if (normalizedInput) {
                  return s.toLowerCase().includes(normalizedInput);
                }
                return true;
              });

              const displayedSuggestions = availableSuggestions.slice(0, 10);

              return (
                <div className="flex flex-wrap items-center gap-2 text-xs relative z-10 min-h-[32px]">
                  <span className="font-bold text-slate-300">Quick suggestions:</span>
                  {displayedSuggestions.length > 0 ? (
                    displayedSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSkill(undefined, s)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-400/35 transition-all shadow-sm cursor-pointer"
                      >
                        + {s}
                      </button>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      No matching suggestions in this category. You can add a custom skill.
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Skill Cards Grid (All 4 Categories) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 relative z-10">
              {/* Category 1: Technical Stack */}
              <div className="group relative p-5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] overflow-hidden shadow-sm transition-all duration-200">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    Core Engineering Stack ({(profile.skills?.technical || []).length})
                  </span>
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30 font-extrabold uppercase">Primary</span>
                </h4>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {(profile.skills?.technical || []).map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-200 border border-indigo-400/35 hover:border-indigo-300/70 text-xs font-semibold shadow-sm transition-all"
                    >
                      {s}
                      <button onClick={() => handleRemoveSkill('technical', s)} className="text-indigo-400 hover:text-rose-400 font-bold ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                  {(profile.skills?.technical || []).length === 0 && (
                    <p className="text-xs text-slate-400 py-2">No technical stack skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Category 2: Tools & DevOps */}
              <div className="group relative p-5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] overflow-hidden shadow-sm transition-all duration-200">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-purple-400" />
                    Cloud, DevOps & Tools ({(profile.skills?.tools || []).length})
                  </span>
                  <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30 font-extrabold uppercase">Infra</span>
                </h4>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {(profile.skills?.tools || []).map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-200 border border-purple-400/35 hover:border-purple-300/70 text-xs font-semibold shadow-sm transition-all"
                    >
                      {s}
                      <button onClick={() => handleRemoveSkill('tools', s)} className="text-purple-400 hover:text-rose-400 font-bold ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                  {(profile.skills?.tools || []).length === 0 && (
                    <p className="text-xs text-slate-400 py-2">No tools or DevOps tools added yet.</p>
                  )}
                </div>
              </div>

              {/* Category 3: Soft & Leadership */}
              <div className="group relative p-5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] overflow-hidden shadow-sm transition-all duration-200">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-400" />
                    Leadership & Core Strengths ({profile.skills.soft?.length || 0})
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 font-extrabold uppercase">Culture</span>
                </h4>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {(profile.skills.soft || []).map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-200 border border-emerald-400/35 hover:border-emerald-300/70 text-xs font-semibold shadow-sm transition-all"
                    >
                      {s}
                      <button onClick={() => handleRemoveSkill('soft', s)} className="text-emerald-400 hover:text-rose-400 font-bold ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                  {(!profile.skills.soft || profile.skills.soft.length === 0) && (
                    <p className="text-xs text-slate-400 py-2">Add leadership, mentoring, or communication competencies.</p>
                  )}
                </div>
              </div>

              {/* Category 4: Languages & Frameworks */}
              <div className="group relative p-5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] overflow-hidden shadow-sm transition-all duration-200">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Languages & Spoken ({profile.skills.languages?.length || 0})
                  </span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30 font-extrabold uppercase">Global</span>
                </h4>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {(profile.skills.languages || []).map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-200 border border-cyan-400/35 hover:border-cyan-300/70 text-xs font-semibold shadow-sm transition-all"
                    >
                      {s}
                      <button onClick={() => handleRemoveSkill('languages', s)} className="text-cyan-400 hover:text-rose-400 font-bold ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                  {(!profile.skills.languages || profile.skills.languages.length === 0) && (
                    <p className="text-xs text-slate-400 py-2">Add languages (e.g. English - Professional, Spanish).</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: WORK EXPERIENCE */}
        {(activeTab === 'all' || activeTab === 'experience') && (
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0c132c]/85 via-[#080d20]/90 to-[#060918]/95 border border-purple-500/15 hover:border-purple-400/25 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] space-y-6 transition-all duration-300 overflow-hidden group">
            <CardReflectiveShine variant="purple" rounded="rounded-3xl" topIllumination={true} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20 relative z-10">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Work Experience & Track Record ({profile.experience?.length || 0})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Positions, engineering delivery, and business achievements.</p>
              </div>
              <div className="flex items-center gap-2">
                {profile.experience?.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setClearSectionConfirm('experience')}
                    className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 text-xs"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Clear All ({profile.experience.length})
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingExp(null);
                    setExpModalOpen(true);
                  }}
                >
                  Add Position
                </Button>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {profile.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="group relative rounded-2xl p-5 sm:p-6 bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-500/20 relative z-10">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/35 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)] flex items-center justify-center font-bold text-sm shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{exp.role}</h4>
                        <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                          {exp.company} • <span className="text-slate-400 font-normal">{exp.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-medium text-slate-300 bg-slate-950/80 px-3 py-1 rounded-xl border border-indigo-500/30 shadow-sm">
                        {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                      </span>
                      <button
                        onClick={() => {
                          setEditingExp(exp);
                          setExpModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'exp',
                            id: exp.id,
                            title: `${exp.role} at ${exp.company}`
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed whitespace-pre-line relative z-10">{exp.description}</p>

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-indigo-500/15 relative z-10">
                      {exp.technologies.map((t) => (
                        <span key={t} className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-200 border border-indigo-400/35 font-semibold shadow-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {profile.experience.length === 0 && (
                <div className="relative py-10 text-center rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] overflow-hidden">
                  <Briefcase className="w-8 h-8 text-indigo-400/60 mx-auto mb-2 relative z-10" />
                  <p className="text-xs text-slate-300 relative z-10">No work positions listed yet.</p>
                  <div className="pt-3 relative z-10">
                    <Button
                      onClick={() => {
                        setEditingExp(null);
                        setExpModalOpen(true);
                      }}
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Position
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: EDUCATION */}
        {(activeTab === 'all' || activeTab === 'education') && (
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0c132c]/85 via-[#080d20]/90 to-[#060918]/95 border border-blue-500/15 hover:border-blue-400/25 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] space-y-6 transition-all duration-300 overflow-hidden group">
            <CardReflectiveShine variant="blue" rounded="rounded-3xl" topIllumination={true} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-500/20 relative z-10">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  Education & Academic Qualifications ({profile.education?.length || 0})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Degrees, institutions, and graduation records.</p>
              </div>
              <div className="flex items-center gap-2">
                {profile.education?.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setClearSectionConfirm('education')}
                    className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 text-xs"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Clear All ({profile.education.length})
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingEdu(null);
                    setEduModalOpen(true);
                  }}
                >
                  Add Education
                </Button>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {profile.education.map((edu) => (
                <div
                  key={edu.id}
                  className="group relative rounded-2xl p-5 sm:p-6 bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="relative z-10">
                    <h4 className="text-base font-black text-white">{edu.degree}</h4>
                    <p className="text-xs text-indigo-300 font-bold mt-0.5">{edu.institution}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{edu.fieldOfStudy}</p>
                    {edu.grade && (
                      <span className="inline-block mt-2 text-[11px] font-bold px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                        {edu.grade}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <span className="text-xs font-mono font-medium text-slate-300 bg-slate-950/80 px-3 py-1 rounded-xl border border-indigo-500/30 shadow-sm">
                      {edu.startYear} — {edu.endYear}
                    </span>
                    <button onClick={() => { setEditingEdu(edu); setEduModalOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'edu', id: edu.id, title: edu.degree })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {profile.education.length === 0 && (
                <div className="relative py-10 text-center rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] overflow-hidden">
                  <GraduationCap className="w-8 h-8 text-indigo-400/60 mx-auto mb-2 relative z-10" />
                  <p className="text-xs text-slate-300 relative z-10">No educational credentials added.</p>
                  <div className="pt-3 relative z-10">
                    <Button
                      onClick={() => { setEditingEdu(null); setEduModalOpen(true); }}
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Education
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: FEATURED PROJECTS */}
        {(activeTab === 'all' || activeTab === 'projects') && (
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0c132c]/85 via-[#080d20]/90 to-[#060918]/95 border border-cyan-500/15 hover:border-cyan-400/25 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] space-y-6 transition-all duration-300 overflow-hidden group">
            <CardReflectiveShine variant="cyan" rounded="rounded-3xl" topIllumination={true} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20 relative z-10">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-cyan-400" />
                  Featured Technical Projects ({profile.projects?.length || 0})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Production deployments and engineering repositories.</p>
              </div>
              <div className="flex items-center gap-2">
                {profile.projects?.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setClearSectionConfirm('projects')}
                    className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 text-xs"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Clear All ({profile.projects.length})
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => { setEditingProj(null); setProjModalOpen(true); }}
                >
                  Add Project
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              {profile.projects.map((proj) => (
                <div key={proj.id} className="group relative rounded-2xl p-6 bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-indigo-500/20">
                      <h4 className="text-base font-black text-white">{proj.title}</h4>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingProj(proj); setProjModalOpen(true); }} className="p-1 rounded text-slate-400 hover:text-white transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ type: 'proj', id: proj.id, title: proj.title })} className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed">{proj.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-indigo-500/15 space-y-3 relative z-10">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t) => (
                        <span key={t} className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-200 border border-cyan-400/35 font-semibold shadow-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs pt-1">
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-white inline-flex items-center gap-1 font-bold transition-colors">
                          <Globe className="w-3.5 h-3.5" /> Live App <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white inline-flex items-center gap-1 font-bold transition-colors">
                          <Github className="w-3.5 h-3.5" /> Repo <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {profile.projects.length === 0 && (
                <div className="col-span-full relative py-10 text-center rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] overflow-hidden">
                  <FolderGit2 className="w-8 h-8 text-cyan-400/60 mx-auto mb-2 relative z-10" />
                  <p className="text-xs text-slate-300 relative z-10">No featured technical projects added yet.</p>
                  <div className="pt-3 relative z-10">
                    <Button
                      onClick={() => { setEditingProj(null); setProjModalOpen(true); }}
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Project
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: CERTIFICATIONS (NO 3D IMAGES • PURE NATURAL SHINE) */}
        {(activeTab === 'all' || activeTab === 'certifications') && (
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0c132c]/85 via-[#080d20]/90 to-[#060918]/95 border border-emerald-500/15 hover:border-emerald-400/25 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] space-y-6 transition-all duration-300 overflow-hidden group">
            <CardReflectiveShine variant="emerald" rounded="rounded-3xl" topIllumination={true} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Licenses & Professional Certifications ({profile.certifications?.length || 0})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Verified third-party credential badges (AWS, GCP, Meta, Spring, etc.).</p>
              </div>
              <div className="flex items-center gap-2">
                {profile.certifications?.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setClearSectionConfirm('certifications')}
                    className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 text-xs"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Clear All ({profile.certifications.length})
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => { setEditingCert(null); setCertModalOpen(true); }}
                >
                  Add Certification
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
              {/* Credentials List (8 cols if compliance card shown, or full 8 cols) */}
              <div className={profile.certifications?.length > 0 ? "lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4" : "lg:col-span-8 relative p-6 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2 overflow-hidden flex flex-col justify-center"}>
                {profile.certifications?.length > 0 ? (
                  profile.certifications.map((cert) => (
                    <div key={cert.id} className="group relative rounded-2xl p-5 bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 relative z-10">
                        <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{cert.title}</h4>
                          <p className="text-xs text-slate-300 mt-0.5">{cert.issuer}</p>
                          <p className="text-[11px] font-semibold text-indigo-300 mt-1">Issued: {cert.issueDate}</p>
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:underline mt-2 font-bold">
                              Verify Credential <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 relative z-10">
                        <button onClick={() => { setEditingCert(cert); setCertModalOpen(true); }} className="p-1 rounded text-slate-400 hover:text-white transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ type: 'cert', id: cert.id, title: cert.title })} className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <p className="text-sm font-bold text-white relative z-10">No Certifications Recorded Yet</p>
                    <p className="text-xs text-slate-300 max-w-md mx-auto relative z-10 leading-relaxed">
                      Add cloud, backend, systems, or architecture certifications to showcase verified domain expertise to hiring managers.
                    </p>
                    <div className="pt-2 relative z-10">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => { setEditingCert(null); setCertModalOpen(true); }}
                      >
                        Add First Certification
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Verified Technical Security & Compliance Card (Replaces 3D Trophy Image!) */}
              <div className="lg:col-span-4 group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-[#0d142b]/85 via-[#080d20]/90 to-[#060918]/95 border border-emerald-500/15 hover:border-emerald-400/25 text-center overflow-hidden shadow-sm transition-all duration-200">
                <CardReflectiveShine variant="emerald" rounded="rounded-2xl" topIllumination={true} />
                {/* Animated Verified Security Badge */}
                <div className="relative mb-3 z-10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    <ShieldCheck className="w-7 h-7 text-amber-300" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300" />
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white tracking-wide uppercase relative z-10">
                  Verified Technical Credentials
                </h5>
                <p className="text-[11px] text-slate-300 max-w-[220px] mt-1 leading-relaxed relative z-10">
                  Third-party verified credentials are cryptographically highlighted on your executive recruiter dossier.
                </p>

                <div className="mt-4 pt-3 border-t border-emerald-500/20 w-full flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-emerald-300 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ATS CRYPTOGRAPHIC ASSURANCE
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          7. CONTACT INFO MODAL
          ============================================================ */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Candidate Contact Information"
      >
        <div className="space-y-4 text-slate-100">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-slate-400 font-semibold block">Email Address</span>
                <span className="text-white font-medium">{profile.email}</span>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 font-semibold block">Phone</span>
                  <span className="text-white font-medium">{profile.phone}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-slate-400 font-semibold block">Location</span>
                <span className="text-white font-medium">{profile.location || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsContactModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          8. RECRUITER LIVE VIEW MODAL
          ============================================================ */}
      <Modal
        isOpen={isRecruiterModalOpen}
        onClose={() => setIsRecruiterModalOpen(false)}
        title="Recruiter Executive Dossier • Live Presentation View"
        size="xl"
      >
        <div className="space-y-6 text-slate-100">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-glow"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{profile.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MATCH: {profileCompletionRate}%
                  </span>
                </div>
                <p className="text-xs text-indigo-300 font-semibold">{profile.title}</p>
                <p className="text-[11px] text-slate-400">{profile.location} • Immediate Availability</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                showToast({
                  type: 'success',
                  title: 'Contact Request Logged',
                  message: 'Recruiter connection ping sent to candidate!'
                });
                setIsRecruiterModalOpen(false);
              }}
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Request Tech Screen
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">ATS Match Rank</span>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{verifiedAtsScore ?? profileCompletionRate}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Verified Stack</span>
              <p className="text-lg font-black text-indigo-400 mt-0.5">{totalSkillsCount} Skills</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Work History</span>
              <p className="text-lg font-black text-purple-400 mt-0.5">{profile.experience?.length || 0} Positions</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Executive Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {profile.bio || 'High-caliber software engineer with demonstrated delivery velocity across modern web architectures and distributed backends.'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setIsRecruiterModalOpen(false)}>
              Close Preview
            </Button>
            <Button variant="glow" onClick={copyProfileLink} leftIcon={<Copy className="w-4 h-4" />}>
              Copy Recruiter Dossier Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          9. AI RECRUITER FAST PITCH MODAL
          ============================================================ */}
      <Modal
        isOpen={isAIPitchModalOpen}
        onClose={() => setIsAIPitchModalOpen(false)}
        title="AI Recruiter Fast Pitch • 30-Second Candidate Pitch"
        size="lg"
      >
        <div className="space-y-4 text-slate-100">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Customized for {profile.name}</h4>
                <p className="text-[11px] text-indigo-300 font-medium">
                  {profile.title || 'Software Engineer'} • {profile.location || 'Remote'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGenerateAIPitch}
              variant="secondary"
              size="sm"
              isLoading={isGeneratingPitch}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Regenerate
            </Button>
          </div>

          {isGeneratingPitch ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-300">
                Analyzing your real skills, headline, and background with AI...
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/25 space-y-3">
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                {aiPitchContent || (
                  <p className="text-slate-400 italic">Click generate to build your tailored AI pitch.</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (aiPitchContent) {
                    navigator.clipboard.writeText(aiPitchContent);
                    showToast({ type: 'success', title: 'Pitch Copied', message: 'Copied recruiter pitch to clipboard.' });
                  }
                }}
                disabled={!aiPitchContent || isGeneratingPitch}
                leftIcon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy Pitch
              </Button>
              <Button
                variant="glow"
                size="sm"
                onClick={handleApplyPitchToBio}
                disabled={!aiPitchContent || isGeneratingPitch}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Apply to My Bio
              </Button>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setIsAIPitchModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          10. AVATAR CHANGE MODAL
          ============================================================ */}
      <Modal
        isOpen={avatarModalOpen}
        onClose={() => {
          setAvatarModalOpen(false);
          setUploadedPreview(null);
        }}
        title="Update Profile Photo"
        size="lg"
      >
        <div className="space-y-5 text-slate-100">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setAvatarOptionTab('upload')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                avatarOptionTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setAvatarOptionTab('preset')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                avatarOptionTab === 'preset' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tech Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setAvatarOptionTab('url')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                avatarOptionTab === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>URL & GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="relative">
              <img
                src={uploadedPreview || customAvatarUrl || profile.avatar}
                alt="Avatar Preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-glow"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                PREVIEW
              </span>
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-white text-sm">
                {uploadedPreview ? 'Selected Photo Ready' : 'Current Active Profile Photo'}
              </p>
              <p className="text-slate-400 mt-0.5">
                {uploadedPreview
                  ? 'Click "Save Photo" below to apply this image to your profile.'
                  : 'Select an option below to update your photo.'}
              </p>
            </div>
          </div>

          {avatarOptionTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={modalFileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => modalFileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-400 bg-indigo-950/30'
                    : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Drag and drop your photo here, or <span className="text-indigo-400 underline">browse files</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP (Max 5MB)</p>
              </div>

              {uploadedPreview && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    New photo selected!
                  </span>
                  <button type="button" onClick={() => setUploadedPreview(null)} className="text-slate-400 hover:text-rose-400 font-semibold">
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {avatarOptionTab === 'preset' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Choose from curated tech presets:</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-1">
                {AVATAR_PRESETS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setUploadedPreview(p.url)}
                    className="p-2 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500 cursor-pointer flex flex-col items-center text-center group"
                  >
                    <img src={p.url} alt={p.label} className="w-16 h-16 rounded-xl object-cover mb-2 group-hover:scale-105 transition-transform" />
                    <span className="text-[10px] font-semibold text-slate-300 line-clamp-1">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {avatarOptionTab === 'url' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleSyncGithubAvatar} variant="secondary" size="sm" leftIcon={<Github className="w-4 h-4" />}>
                  Import GitHub Avatar
                </Button>
                <Button type="button" onClick={handleGenerateDicebear} variant="secondary" size="sm" leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />} >
                  Generate AI Cyber Avatar
                </Button>
              </div>

              <Input
                label="Direct Image URL"
                placeholder="https://..."
                value={customAvatarUrl}
                onChange={(e) => {
                  setCustomAvatarUrl(e.target.value);
                  if (e.target.value.trim()) setUploadedPreview(e.target.value.trim());
                }}
                leftIcon={<LinkIcon className="w-4 h-4" />}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button variant="secondary" onClick={() => { setAvatarModalOpen(false); setUploadedPreview(null); }}>
              Cancel
            </Button>
            <Button
              variant="glow"
              onClick={() => {
                const targetUrl = uploadedPreview || customAvatarUrl.trim();
                if (targetUrl) handleUpdateAvatar(targetUrl);
              }}
              disabled={!uploadedPreview && !customAvatarUrl.trim()}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Photo
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          11. ABOUT & PROFILE DETAILS MODAL
          ============================================================ */}
      <Modal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} title="Edit About & Profile Details">
        <form onSubmit={handleSaveAboutDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="name"
              label="Full Name"
              value={aboutFormData.name}
              onChange={(e) => setAboutFormData({ ...aboutFormData, name: e.target.value })}
              placeholder="e.g. Alex Morgan"
              required
            />
            <Input
              name="title"
              label="Professional Headline / Current Role"
              value={aboutFormData.title}
              onChange={(e) => setAboutFormData({ ...aboutFormData, title: e.target.value })}
              placeholder="e.g. Senior Java Backend Engineer"
              required
            />
          </div>

          {/* Quick role suggestions */}
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Quick Role Suggestions:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {[
                'Senior Software Engineer',
                'Java Backend Specialist',
                'Full-Stack Developer',
                'Frontend & UI Specialist',
                'Cloud / DevOps Engineer'
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setAboutFormData({ ...aboutFormData, title: role })}
                  className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-500/25 transition-all cursor-pointer"
                >
                  +{role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="location"
              label="Location (City, State / Country)"
              value={aboutFormData.location}
              onChange={(e) => setAboutFormData({ ...aboutFormData, location: e.target.value })}
              placeholder="e.g. San Francisco, CA (or Remote)"
            />
            <Input
              name="phone"
              label="Contact Phone"
              value={aboutFormData.phone}
              onChange={(e) => setAboutFormData({ ...aboutFormData, phone: e.target.value })}
              placeholder="e.g. +1 (555) 019-2834"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Professional Summary / Bio</label>
              <button
                type="button"
                onClick={handleQuickAIEnhanceBio}
                disabled={isGeneratingPitch}
                className="text-[11px] font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                {isGeneratingPitch ? 'Generating Bio...' : 'AI Auto-Enhance'}
              </button>
            </div>
            <Textarea
              name="bio"
              value={aboutFormData.bio}
              onChange={(e) => setAboutFormData({ ...aboutFormData, bio: e.target.value })}
              rows={4}
              placeholder="Provide an authentic summary of your technical background, accomplishments, and career aspirations..."
              required
            />
            {/* Quick bio starter templates */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  setAboutFormData((prev) => ({
                    ...prev,
                    bio: 'High-impact software engineer specializing in scalable distributed services, clean code architecture, and high-performance APIs with a proven record of reliable delivery.'
                  }))
                }
                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
              >
                ⚡ High-Impact Engineer
              </button>
              <button
                type="button"
                onClick={() =>
                  setAboutFormData((prev) => ({
                    ...prev,
                    bio: 'Dedicated Java & Spring Boot engineer experienced in building microservices, database optimizations, and mission-critical cloud backends with high uptime.'
                  }))
                }
                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
              >
                ☕ Java & Spring Expert
              </button>
              <button
                type="button"
                onClick={() =>
                  setAboutFormData((prev) => ({
                    ...prev,
                    bio: 'Full-stack software developer proficient in React, modern TypeScript, and backend cloud systems, passionate about intuitive interfaces and sub-second performance.'
                  }))
                }
                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer"
              >
                🚀 Full-Stack Creator
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Web Footprint & Social Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                name="githubUrl"
                label="GitHub URL"
                value={aboutFormData.githubUrl}
                onChange={(e) => setAboutFormData({ ...aboutFormData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
              />
              <Input
                name="linkedinUrl"
                label="LinkedIn URL"
                value={aboutFormData.linkedinUrl}
                onChange={(e) => setAboutFormData({ ...aboutFormData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
              <Input
                name="websiteUrl"
                label="Portfolio / Site"
                value={aboutFormData.websiteUrl}
                onChange={(e) => setAboutFormData({ ...aboutFormData, websiteUrl: e.target.value })}
                placeholder="https://portfolio.dev"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setAboutModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          12. ITEM CRUD MODALS
          ============================================================ */}
      {/* Education Modal */}
      <Modal isOpen={eduModalOpen} onClose={() => setEduModalOpen(false)} title={editingEdu ? 'Edit Education Record' : 'Add Educational Degree'}>
        <form onSubmit={handleSaveEducation} className="space-y-4">
          <Input name="degree" label="Degree Title" defaultValue={editingEdu?.degree} placeholder="e.g. Bachelor of Technology in Computer Science" required />
          <Input name="institution" label="University / College" defaultValue={editingEdu?.institution} placeholder="e.g. RGUKT RK Valley (IIIT)" required />
          <Input name="fieldOfStudy" label="Field of Study" defaultValue={editingEdu?.fieldOfStudy} placeholder="e.g. Computer Science & AI" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="startYear" label="Start Year" defaultValue={editingEdu?.startYear} placeholder="2019" required />
            <Input name="endYear" label="End Year" defaultValue={editingEdu?.endYear} placeholder="2023" required />
          </div>
          <Input name="grade" label="Grade / GPA" defaultValue={editingEdu?.grade} placeholder="e.g. 8.85 CGPA / First Class with Distinction" />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setEduModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Record</Button>
          </div>
        </form>
      </Modal>

      {/* Experience Modal */}
      <Modal isOpen={expModalOpen} onClose={() => setExpModalOpen(false)} title={editingExp ? 'Edit Experience Record' : 'Add Work Position'}>
        <form onSubmit={handleSaveExperience} className="space-y-4">
          <Input name="company" label="Company Name" defaultValue={editingExp?.company} placeholder="e.g. CloudScale AI Systems" required />
          <Input name="role" label="Job Title" defaultValue={editingExp?.role} placeholder="e.g. Senior Software Engineer" required />
          <Input name="location" label="Location" defaultValue={editingExp?.location} placeholder="e.g. San Francisco, CA (Remote)" />
          <div className="grid grid-cols-2 gap-4">
            <Input name="startDate" label="Start Date" defaultValue={editingExp?.startDate} placeholder="2023-01" required />
            <Input name="endDate" label="End Date" defaultValue={editingExp?.endDate} placeholder="2026-01" />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" name="current" defaultChecked={editingExp?.current} className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500" />
            <span>I currently work in this role</span>
          </label>
          <Textarea name="description" label="Key Responsibilities & Impact" defaultValue={editingExp?.description} rows={3} placeholder="Architected distributed event pipeline handling 15M+ daily requests..." required />
          <Input name="technologies" label="Technologies (Comma Separated)" defaultValue={editingExp?.technologies?.join(', ')} placeholder="React, TypeScript, Java, Kafka, AWS" />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setExpModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Position</Button>
          </div>
        </form>
      </Modal>

      {/* Project Modal */}
      <Modal isOpen={projModalOpen} onClose={() => setProjModalOpen(false)} title={editingProj ? 'Edit Project' : 'Add Technical Project'}>
        <form onSubmit={handleSaveProject} className="space-y-4">
          <Input name="title" label="Project Title" defaultValue={editingProj?.title} placeholder="e.g. AI ATS Platform" required />
          <Textarea name="description" label="Description & Key Features" defaultValue={editingProj?.description} rows={3} placeholder="Designed and built automated recruitment engine..." required />
          <Input name="technologies" label="Technologies (Comma separated)" defaultValue={editingProj?.technologies?.join(', ')} placeholder="React, TypeScript, Node.js, Tailwind" required />
          <Input name="link" label="Live Application URL" defaultValue={editingProj?.link} placeholder="https://..." />
          <Input name="githubUrl" label="GitHub Repository URL" defaultValue={editingProj?.githubUrl} placeholder="https://github.com/..." />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setProjModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Project</Button>
          </div>
        </form>
      </Modal>

      {/* Certification Modal */}
      <Modal isOpen={certModalOpen} onClose={() => setCertModalOpen(false)} title={editingCert ? 'Edit Certification' : 'Add Certification'}>
        <form onSubmit={handleSaveCertification} className="space-y-4">
          <Input name="title" label="Certification Name" defaultValue={editingCert?.title} placeholder="e.g. AWS Certified Solutions Architect" required />
          <Input name="issuer" label="Issuing Organization" defaultValue={editingCert?.issuer} placeholder="e.g. Amazon Web Services (AWS)" required />
          <Input name="issueDate" label="Issue Date" defaultValue={editingCert?.issueDate} placeholder="e.g. 2024-03" required />
          <Input name="credentialUrl" label="Credential URL" defaultValue={editingCert?.credentialUrl} placeholder="https://..." />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setCertModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Certification</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteItem}
        title="Confirm Removal"
        message={`Are you sure you want to remove "${deleteConfirm?.title}" from your profile?`}
        confirmText="Remove Record"
      />

      {/* Section Clear Confirm */}
      <ConfirmDialog
        isOpen={!!clearSectionConfirm}
        onClose={() => setClearSectionConfirm(null)}
        onConfirm={() => clearSectionConfirm && handleClearSection(clearSectionConfirm)}
        title={`Clear All ${clearSectionConfirm ? clearSectionConfirm.toUpperCase() : ''}?`}
        message={`Are you sure you want to remove all items in your ${clearSectionConfirm} section? This will clear this specific section without affecting your other profile details.`}
        confirmText="Yes, Clear All"
      />
    </div>
  );
};
