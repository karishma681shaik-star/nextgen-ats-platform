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
import { useToast } from '../../context/ToastContext';
import { Roaming3DBackground } from '../../components/ui/Roaming3DBackground';
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

const SUGGESTED_TECH_SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Next.js',
  'Java',
  'Spring Boot',
  'Python',
  'PostgreSQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Kafka',
  'GraphQL',
  'Tailwind CSS'
];

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
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'overview' | 'personal' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications'>('all');
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
        title: 'Basic Info & Headline',
        points: 20,
        completed: Boolean(p.name && p.title && p.title.trim().length > 2),
        action: () => setAboutModalOpen(true),
        actionLabel: 'Edit'
      },
      {
        id: 'bio',
        title: 'Summary / Bio',
        points: 15,
        completed: Boolean(p.bio && p.bio.trim().length > 15),
        action: () => setAboutModalOpen(true),
        actionLabel: '+ Add Bio'
      },
      {
        id: 'skills',
        title: 'Core Skills (Min 3)',
        points: 20,
        completed: (p.skills?.technical?.length || 0) + (p.skills?.tools?.length || 0) >= 3,
        action: () => setActiveTab('skills'),
        actionLabel: '+ Add Skills'
      },
      {
        id: 'experience',
        title: 'Work Experience',
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
        title: 'Education & Degree',
        points: 15,
        completed: (p.education?.length || 0) > 0,
        action: () => {
          setEditingEdu(null);
          setEduModalOpen(true);
        },
        actionLabel: '+ Add Education'
      },
      {
        id: 'projects',
        title: 'Featured Projects',
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
  const profileCompletionRate = Math.min(100, Math.max(10, calculatedCompletion));

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
      const updated: CandidateProfile = {
        ...profile,
        name: aboutFormData.name.trim() || profile.name,
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

  const handleAddSkill = (e?: React.FormEvent, customSkill?: string) => {
    if (e) e.preventDefault();
    const skillToAdd = (customSkill || newSkillInput).trim();
    if (!skillToAdd || !profile) return;

    const currentList = profile.skills[newSkillCategory] || [];
    if (currentList.some((s) => s.toLowerCase() === skillToAdd.toLowerCase())) {
      showToast({ type: 'info', title: 'Skill Exists', message: `"${skillToAdd}" is already in your stack.` });
      return;
    }

    const updatedProfile: CandidateProfile = {
      ...profile,
      skills: {
        ...profile.skills,
        [newSkillCategory]: [...currentList, skillToAdd]
      }
    };
    setProfile(updatedProfile);
    candidateService.updateProfile(updatedProfile);
    if (!customSkill) setNewSkillInput('');
    showToast({ type: 'success', title: 'Skill Added', message: `Added "${skillToAdd}" to verified stack.` });
  };

  const handleRemoveSkill = (category: keyof typeof profile.skills, skillName: string) => {
    if (!profile) return;
    const updatedProfile: CandidateProfile = {
      ...profile,
      skills: {
        ...profile.skills,
        [category]: profile.skills[category].filter((s) => s !== skillName)
      }
    };
    setProfile(updatedProfile);
    candidateService.updateProfile(updatedProfile);
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
      <div className="space-y-6">
        <Skeleton className="h-12 w-80 rounded-2xl bg-slate-800/60" />
        <Skeleton className="h-72 w-full rounded-3xl bg-slate-800/40" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl bg-slate-800/40" />
          <Skeleton className="h-28 rounded-2xl bg-slate-800/40" />
          <Skeleton className="h-28 rounded-2xl bg-slate-800/40" />
          <Skeleton className="h-28 rounded-2xl bg-slate-800/40" />
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
    { id: 'overview', label: '🌟 Executive Dossier', icon: <Star className="w-4 h-4 text-amber-400" /> },
    { id: 'personal', label: 'About & Details', icon: <User className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills & Stack', icon: <Code2 className="w-4 h-4" />, count: totalSkillsCount },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" />, count: profile.experience?.length || 0 },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, count: profile.education?.length || 0 },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" />, count: profile.projects?.length || 0 },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" />, count: profile.certifications?.length || 0 }
  ];

  return (
    <div className="relative min-h-screen pb-20 space-y-8 select-none">
      {/* ============================================================
          1. 3D ROAMING CANVAS ANIMATION & SPATIAL BACKGROUND
          ============================================================ */}
      <Roaming3DBackground />

      {/* Cyber Grid Horizon Ground with interactive mouse tilt */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div
          className="absolute inset-x-0 bottom-[-150px] h-[750px] origin-bottom transition-transform duration-300 ease-out"
          style={{
            perspective: '1000px',
            transform: `perspective(1000px) rotateX(${64 + mousePos.y * 5}deg) rotateY(${mousePos.x * 4}deg) translateY(60px)`
          }}
        >
          <div
            className="w-full h-full animate-grid-3d opacity-35"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(99, 102, 241, 0.25) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99, 102, 241, 0.25) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              maskImage: 'radial-gradient(ellipse 90% 70% at 50% 10%, #000 30%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 10%, #000 30%, transparent 85%)'
            }}
          />
        </div>

        {/* Ambient 3D Volumetric Beacons */}
        <div
          className="absolute top-16 left-1/4 w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none opacity-30 transition-transform duration-700 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 80%)',
            transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 30}px)`
          }}
        />
      </div>

      {/* ============================================================
          2. HEADER COMMAND BAR
          ============================================================ */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
              Verified Job Portal Profile
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Open to Opportunities
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2 flex items-center gap-3">
            Candidate Profile
            <span className="text-xs font-mono font-medium text-slate-400 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800">
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
              className="border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 font-bold backdrop-blur-md shadow-lg shadow-amber-950/30 hover:scale-[1.02] transition-transform"
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
                className="bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold shadow-lg shadow-indigo-600/20"
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
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold backdrop-blur-md"
          >
            Recruiter Live View
          </Button>

          <Button
            onClick={handleOpenAIPitchModal}
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold backdrop-blur-md"
          >
            AI Fast Pitch
          </Button>

          <Button
            onClick={copyProfileLink}
            variant="secondary"
            size="sm"
            leftIcon={<Share2 className="w-4 h-4 text-indigo-400" />}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold backdrop-blur-md"
          >
            Share
          </Button>
        </div>
      </div>

      {/* ============================================================
          3. JOB PORTAL HERO COVER & TALENT SHOWCASE CARD
          ============================================================ */}
      <div
        ref={heroCardRef}
        onMouseEnter={() => setIsHeroTilt(true)}
        onMouseLeave={() => setIsHeroTilt(false)}
        className="relative z-10 rounded-3xl overflow-hidden backdrop-blur-2xl border border-white/10 bg-[#090e21]/90 shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-300"
        style={{
          perspective: '1200px',
          transform: isHeroTilt
            ? `rotateY(${mousePos.x * 3}deg) rotateX(${-mousePos.y * 2.5}deg)`
            : 'rotateY(0deg) rotateX(0deg)'
        }}
      >
        {/* Cover Graphic Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950">
          <div
            className="absolute inset-0 opacity-40 animate-grid-3d"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(99, 102, 241, 0.4) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99, 102, 241, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090e21] via-transparent to-transparent" />

          {/* Top Right Live Stats Pill */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/70 border border-slate-700/80 text-indigo-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              184 Recruiter Views this week
            </span>
          </div>
        </div>

        {/* Profile Details Container (Overlapping Cover) */}
        <div className="relative px-6 sm:px-10 pb-8 -mt-16 sm:-mt-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            {/* Left: Avatar & Names */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Avatar Frame with Camera Edit */}
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => {
                  setUploadedPreview(null);
                  setAvatarModalOpen(true);
                }}
              >
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-holo-spin" />

                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-[#090e21] bg-slate-950 shadow-2xl">
                  <img
                    src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-indigo-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-bold gap-1">
                    <Camera className="w-5 h-5 text-indigo-300" />
                    <span>Change Photo</span>
                  </div>
                </div>

                {/* Permanent Camera Button Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedPreview(null);
                    setAvatarModalOpen(true);
                  }}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-[#090e21] shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center z-10"
                  title="Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity & Presence */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {profile.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Verified Candidate
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Open to Work
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold text-indigo-200">
                  {profile.title || 'Software Engineer'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-0.5">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {profile.location || 'San Francisco, CA'}
                  </span>
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                  >
                    Contact Info
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Immediate Start
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-300 hover:text-white border border-blue-800/60 flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                      <ArrowUpRight className="w-3 h-3 text-blue-400" />
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 hover:text-white border border-indigo-800/60 flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Portfolio
                      <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick KPI Badges - ONLY SHOW IF CONTAINS DATA */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">

              {/* EXPERIENCE: Only show if candidate has 1 or more experience records! */}
              {profile.experience && profile.experience.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex-1 lg:flex-initial text-center shadow-lg min-w-[90px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Experience</span>
                  <p className="text-xl font-black text-purple-300 mt-0.5">
                    {profile.experience.length} {profile.experience.length === 1 ? 'Role' : 'Roles'}
                  </p>
                  <span className="text-[9px] text-slate-400">Industry Logged</span>
                </div>
              )}

              {/* SKILLS: Only show if candidate has 1 or more skills! */}
              {totalSkillsCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex-1 lg:flex-initial text-center shadow-lg min-w-[90px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Skills</span>
                  <p className="text-xl font-black text-cyan-300 mt-0.5">{totalSkillsCount}</p>
                  <span className="text-[9px] text-cyan-400/80 font-medium">Validated</span>
                </div>
              )}

              {/* EDUCATION: Only show if candidate has education records! */}
              {profile.education && profile.education.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex-1 lg:flex-initial text-center shadow-lg min-w-[90px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Education</span>
                  <p className="text-xl font-black text-amber-300 mt-0.5">{profile.education.length}</p>
                  <span className="text-[9px] text-slate-400">{profile.education.length === 1 ? 'Degree' : 'Degrees'}</span>
                </div>
              )}

              {/* PROJECTS: Only show if candidate has project records! */}
              {profile.projects && profile.projects.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex-1 lg:flex-initial text-center shadow-lg min-w-[90px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Projects</span>
                  <p className="text-xl font-black text-indigo-300 mt-0.5">{profile.projects.length}</p>
                  <span className="text-[9px] text-slate-400">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          4. JOB PORTAL PROFILE STRENGTH & COMPLETION METER
          ============================================================ */}
      <div className="relative z-10 rounded-3xl p-6 sm:p-7 bg-[#0b1026]/90 border border-indigo-500/25 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Star className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-black text-white">Profile Strength</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${strengthInfo.badgeColor}`}>
                  {strengthInfo.label} ({profileCompletionRate}%)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{strengthInfo.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-800/60">
              ⚡ 4x More Recruiter Inquiries
            </span>
          </div>
        </div>

        {/* Dynamic Multi-Step Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 transition-all duration-700 ease-out shadow-glow"
              style={{ width: `${profileCompletionRate}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
            <span className={profileCompletionRate >= 20 ? 'text-amber-400' : ''}>Beginner (20%)</span>
            <span className={profileCompletionRate >= 45 ? 'text-indigo-400' : ''}>Intermediate (45%)</span>
            <span className={profileCompletionRate >= 75 ? 'text-purple-400' : ''}>Advanced (75%)</span>
            <span className={profileCompletionRate >= 90 ? 'text-emerald-400' : ''}>All-Star (100%)</span>
          </div>
        </div>

        {/* Actionable Recommendations Checklist */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Complete profile checklist to reach 100% All-Star ranking:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  item.completed
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      item.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.completed ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px]">•</span>}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <span className="text-[10px] text-slate-400">+{item.points}% completion value</span>
                  </div>
                </div>

                {item.completed ? (
                  <span className="text-[10px] font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Done
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={item.action}
                    className="text-[11px] font-bold text-indigo-400 hover:text-white px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/30 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {item.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1026]/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
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
              <form onSubmit={handleSaveAboutDetails} className="space-y-5 pt-2">
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
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                    {profile.bio ||
                      `${profile.name} is a focused ${profile.title || 'Software Engineer'} based in ${profile.location || 'Remote'}. Click "Edit Details" or "AI Enhance" to personalize your professional executive bio.`}
                  </p>
                </div>

                {/* Information Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90">
                    <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      Target Role
                    </span>
                    <p className="text-sm font-bold text-white mt-1.5">{profile.title || 'Software Engineer'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Open to Full-Time & Hybrid</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90">
                    <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Location & Work
                    </span>
                    <p className="text-sm font-bold text-white mt-1.5">{profile.location || 'San Francisco, CA'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Authorized to Work</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90">
                    <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Web Footprint
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Github className="w-3 h-3" /> GitHub
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 text-blue-300 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Linkedin className="w-3 h-3" /> LinkedIn
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a
                          href={profile.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 text-[10px] font-bold flex items-center gap-1"
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

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90">
                    <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      Technical Focus
                    </span>
                    <p className="text-sm font-bold text-white mt-1.5">
                      {profile.skills?.technical && profile.skills.technical.length > 0
                        ? profile.skills.technical.slice(0, 3).join(', ')
                        : 'Core Software Development'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
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
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1026]/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  Skills & Technical Competencies ({totalSkillsCount})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Industry validated engineering skills for AI search ranking.</p>
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
            <form onSubmit={(e) => handleAddSkill(e)} className="flex flex-col sm:flex-row items-end gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Type a skill (e.g. Next.js, Docker, Kafka, Microservices, Python)"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-52">
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="technical">Technical Stack</option>
                  <option value="tools">Tools & DevOps</option>
                  <option value="soft">Leadership & Soft</option>
                  <option value="languages">Languages</option>
                </select>
              </div>
              <Button type="submit" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Add Skill
              </Button>
            </form>

            {/* Suggested Skills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400">Quick add:</span>
              {SUGGESTED_TECH_SKILLS.filter((s) => !profile.skills?.technical?.includes(s) && !profile.skills?.tools?.includes(s))
                .slice(0, 8)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(undefined, s)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
            </div>

            {/* Skill Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-indigo-500/20">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                  <span>Core Engineering Stack ({profile.skills.technical.length})</span>
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase">Primary</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.technical.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 text-xs font-semibold"
                    >
                      {s}
                      <button onClick={() => handleRemoveSkill('technical', s)} className="text-indigo-400 hover:text-rose-400 font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                  {profile.skills.technical.length === 0 && (
                    <p className="text-xs text-slate-500 py-2">No technical skills added yet.</p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/50 border border-purple-500/20">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                  <span>Cloud, DevOps & Tools ({profile.skills.tools.length})</span>
                  <span className="text-[10px] text-purple-400 font-extrabold uppercase">Infra</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.tools.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/25 text-xs font-semibold"
                    >
                      {s}
                      <button onClick={() => handleRemoveSkill('tools', s)} className="text-purple-400 hover:text-rose-400 font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                  {profile.skills.tools.length === 0 && (
                    <p className="text-xs text-slate-500 py-2">No tools added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: WORK EXPERIENCE */}
        {(activeTab === 'all' || activeTab === 'experience') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1026]/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Work Experience & Track Record
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Positions, engineering delivery, and business achievements.</p>
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

            <div className="space-y-4">
              {profile.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-2xl p-5 sm:p-6 bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{exp.role}</h4>
                        <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                          {exp.company} • <span className="text-slate-400 font-normal">{exp.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                        {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                      </span>
                      <button
                        onClick={() => {
                          setEditingExp(exp);
                          setExpModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white"
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed whitespace-pre-line">{exp.description}</p>

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
                      {exp.technologies.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {profile.experience.length === 0 && (
                <div className="py-10 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
                  <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No work positions listed yet.</p>
                  <Button
                    onClick={() => {
                      setEditingExp(null);
                      setExpModalOpen(true);
                    }}
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Position
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: EDUCATION */}
        {(activeTab === 'all' || activeTab === 'education') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1026]/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  Education & Academic Qualifications
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Degrees, institutions, and graduation records.</p>
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

            <div className="space-y-4">
              {profile.education.map((edu) => (
                <div
                  key={edu.id}
                  className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div>
                    <h4 className="text-base font-black text-white">{edu.degree}</h4>
                    <p className="text-xs text-indigo-400 font-bold mt-0.5">{edu.institution}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{edu.fieldOfStudy}</p>
                    {edu.grade && (
                      <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {edu.grade}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                      {edu.startYear} — {edu.endYear}
                    </span>
                    <button onClick={() => { setEditingEdu(edu); setEduModalOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'edu', id: edu.id, title: edu.degree })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {profile.education.length === 0 && (
                <div className="py-10 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
                  <GraduationCap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No educational credentials added.</p>
                  <Button
                    onClick={() => { setEditingEdu(null); setEduModalOpen(true); }}
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Education
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: FEATURED PROJECTS */}
        {(activeTab === 'all' || activeTab === 'projects') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1026]/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-400" />
                  Featured Technical Projects ({profile.projects?.length || 0})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Production deployments and engineering repositories.</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.projects.map((proj) => (
                <div key={proj.id} className="rounded-2xl p-6 bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <h4 className="text-base font-black text-white">{proj.title}</h4>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingProj(proj); setProjModalOpen(true); }} className="p-1 rounded text-slate-400 hover:text-white">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ type: 'proj', id: proj.id, title: proj.title })} className="p-1 rounded text-slate-400 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">{proj.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs pt-1">
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold">
                          <Globe className="w-3 h-3" /> Live App <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white inline-flex items-center gap-1 font-semibold">
                          <Github className="w-3 h-3" /> Repo <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: CERTIFICATIONS */}
        {(activeTab === 'all' || activeTab === 'certifications') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1026]/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Licenses & Professional Certifications ({profile.certifications?.length || 0})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Verified third-party credential badges (AWS, GCP, Meta, etc.).</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.certifications.map((cert) => (
                <div key={cert.id} className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/25 shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cert.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{cert.issuer}</p>
                      <p className="text-[11px] text-indigo-400 mt-1">Issued: {cert.issueDate}</p>
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline mt-2 font-semibold">
                          Verify Credential <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingCert(cert); setCertModalOpen(true); }} className="p-1 rounded text-slate-400 hover:text-white">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'cert', id: cert.id, title: cert.title })} className="p-1 rounded text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
