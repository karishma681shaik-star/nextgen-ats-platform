import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Phone,
  Mail,
  Sparkles,
  CheckCircle2,
  Share2,
  Eye,
  Camera,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Code2,
  Layers,
  HeartHandshake,
  TrendingUp,
  Award,
  Zap,
  Check,
  Clock,
  Briefcase,
  X,
  Edit2
} from 'lucide-react';
import { recruiterService } from '../../services';
import { sendCopilotMessage } from '../../services/api/copilotApi';
import { useToast } from '../../context/ToastContext';
import { Company, Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

const LOGO_PRESETS = [
  { id: 'l1', label: 'Tech Nova', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80' },
  { id: 'l2', label: 'Cyber Matrix', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80' },
  { id: 'l3', label: 'Apex Labs', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80' },
  { id: 'l4', label: 'CloudScale', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&auto=format&fit=crop&q=80' },
  { id: 'l5', label: 'AI Pulse', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=80' },
  { id: 'l6', label: 'Quantum Soft', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80' }
];

const PRESET_PERKS = [
  '100% Employer-Covered Medical & Dental',
  'Competitive Equity & Stock Options',
  'Flexible Remote & Hybrid First Policy',
  '$2,500 Annual Learning & Upskilling Budget',
  'Home Office Ergonomic Setup Stipend',
  'Unlimited Paid Time Off & Mental Health Days',
  '401(k) Matching up to 5%',
  'Annual Global Company Retreats'
];

const DEFAULT_TECH_STACK = [
  'React 19',
  'TypeScript',
  'Java 21',
  'Spring Boot',
  'Python',
  'AWS Cloud',
  'Kubernetes',
  'Docker',
  'PostgreSQL',
  'Kafka',
  'Redis',
  'GraphQL'
];

const DEFAULT_COMPANY: Company = {
  id: 'comp-karishma',
  name: 'karishma',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
  tagline: 'Leading innovation in software and technology',
  industry: 'Technology',
  website: 'https://example.com',
  location: 'San Francisco, CA',
  size: '100–500 employees',
  description:
    'At karishma, we engineer high-impact technology and intelligent cloud software that solves complex global challenges. Our engineering culture values high autonomy, rapid shipping, and continuous learning.',
  foundedYear: '2020',
  benefits: [
    'Comprehensive Medical, Dental & Vision (100% Covered)',
    'Competitive Equity & Performance Stock Grants',
    'Flexible Remote & Hybrid First Policy',
    '$2,500 Annual Learning & Upskilling Budget',
    'Home Office Ergonomic Setup Stipend',
    'Unlimited Paid Time Off & Mental Health Days'
  ],
  contactEmail: 'talent@karishma.ai',
  contactPhone: '+1 (415) 890-4321',
  verified: true
};

const cleanCompanyDescription = (text?: string, compName: string = 'Our team', industry: string = 'technology') => {
  if (!text) {
    return `At ${compName}, we build high-impact technology and innovative software solutions in ${industry}. We are driven by engineering excellence, autonomy, and continuous learning.`;
  }
  let cleaned = text
    .replace(/\(Mission\)/gi, '')
    .replace(/\* Sentence \d+[:.]?/gi, '')
    .replace(/Sentence \d+[:.]?/gi, '')
    .replace(/\(Vision\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (!cleaned || cleaned === 'Company description' || cleaned.length < 15) {
    return `At ${compName}, we build high-impact technology and innovative software solutions in ${industry}. We are driven by engineering excellence, autonomy, and continuous learning.`;
  }
  return cleaned;
};
// ─── LUXURY EXECUTIVE STUDIO BACKGROUND (Linear / Vercel Tier-1 Luxury) ───────
const CompanyStudioBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: width * 0.5, y: height * 0.35, targetX: width * 0.5, targetY: height * 0.35, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => { mouse.active = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Fine, non-distracting ambient stardust
    const dustParticles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 1.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -0.15 - Math.random() * 0.25,
      alpha: 0.2 + Math.random() * 0.45,
      hue: [215, 235, 260][Math.floor(Math.random() * 3)],
    }));

    let t = 0;

    const render = () => {
      t += 0.006;
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Deep obsidian executive backdrop
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0,   '#080a10');
      baseGrad.addColorStop(0.5, '#0b0f19');
      baseGrad.addColorStop(1,   '#06080e');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Precision Dot-Matrix Grid with Mouse Spotlight
      const dotSpacing = 36;
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          const dist = mouse.active ? Math.hypot(x - mouse.x, y - mouse.y) : 999;
          const spotlight = dist < 260 ? (1 - dist / 260) : 0;
          const baseAlpha = 0.05;
          const totalAlpha = baseAlpha + spotlight * 0.35;

          if (totalAlpha > 0.04) {
            ctx.beginPath();
            ctx.arc(x, y, 0.9 + spotlight * 1.1, 0, Math.PI * 2);
            ctx.fillStyle = spotlight > 0.08
              ? `rgba(129, 140, 248, ${totalAlpha})`
              : `rgba(148, 163, 184, ${totalAlpha})`;
            ctx.fill();
          }
        }
      }

      // Soft Organic Studio Light Blooms
      const blooms = [
        { cx: width * 0.22, cy: height * 0.18, r: 420, hue: 235, sat: 80, light: 55, alpha: 0.08, driftX: 35, driftY: 20, speed: 0.3 },
        { cx: width * 0.82, cy: height * 0.28, r: 440, hue: 265, sat: 75, light: 50, alpha: 0.07, driftX: -30, driftY: 30, speed: 0.25 },
        { cx: width * 0.50, cy: height * 0.82, r: 480, hue: 210, sat: 85, light: 48, alpha: 0.075, driftX: 30, driftY: -20, speed: 0.3 },
      ];

      blooms.forEach(b => {
        const ox = b.cx + Math.sin(t * b.speed) * b.driftX;
        const oy = b.cy + Math.cos(t * b.speed * 0.8) * b.driftY;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, b.r);
        grad.addColorStop(0, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${b.alpha})`);
        grad.addColorStop(0.5, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${b.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Fine Ambient Stardust
      dustParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.alpha * 0.5})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return null;
};

export const CompanyProfilePage: React.FC = () => {
  const [company, setCompany] = useState<Company>(DEFAULT_COMPANY);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'showcase' | 'edit' | 'perks' | 'tech' | 'contact'>('showcase');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 3D Mouse Parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Perks Input State
  const [newBenefitInput, setNewBenefitInput] = useState('');

  // Tech Stack State
  const [techStack, setTechStack] = useState<string[]>(DEFAULT_TECH_STACK);
  const [newTechInput, setNewTechInput] = useState('');

  // Modals
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoOptionTab, setLogoOptionTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [uploadedLogoPreview, setUploadedLogoPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadCompanyData();
  }, []);

  // Track Mouse for 3D Camera Tilt
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

  const loadCompanyData = async () => {
    try {
      setIsLoading(true);

      // 1. Check cached company profile / logo in localStorage
      let cachedCompany: Partial<Company> | null = null;
      try {
        const saved = localStorage.getItem('recruiter_company_profile');
        if (saved) cachedCompany = JSON.parse(saved);
        const savedLogo = localStorage.getItem('company_logo');
        if (savedLogo) {
          if (!cachedCompany) cachedCompany = {};
          cachedCompany.logo = savedLogo;
        }
      } catch {}

      const [compData, postedJobs] = await Promise.all([
        recruiterService.getCompanyProfile().catch(() => null),
        recruiterService.getPostedJobs().catch(() => [] as Job[])
      ]);

      const base = compData && compData.name ? compData : DEFAULT_COMPANY;
      const merged: Company = {
        ...DEFAULT_COMPANY,
        ...base,
        ...(cachedCompany || {}),
        logo: cachedCompany?.logo || base.logo || DEFAULT_COMPANY.logo,
        benefits: (cachedCompany?.benefits && cachedCompany.benefits.length > 0)
          ? cachedCompany.benefits
          : (base.benefits && base.benefits.length > 0 ? base.benefits : DEFAULT_COMPANY.benefits)
      };

      // Sanitize description to remove any AI formatting prompt artifacts
      merged.description = cleanCompanyDescription(merged.description, merged.name, merged.industry);

      const isDefaultJob = (title?: string) => {
        const t = (title || '').trim().toLowerCase();
        return (
          t === 'senior full stack engineer (java + react)' ||
          t === 'lead ai/ml platform architect' ||
          t === 'senior ai platform engineer' ||
          t === 'senior full stack software engineer' ||
          t === 'backend java / distributed systems engineer' ||
          t === 'ai / ml research scientist' ||
          t === 'devops & cloud infrastructure lead'
        );
      };
      setJobs((postedJobs || []).filter((j) => !isDefaultJob(j.title)));
    } catch (err) {
      console.error('Failed to load company profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!company) return;

    try {
      setIsSaving(true);
      // Persist to localStorage immediately
      try {
        localStorage.setItem('recruiter_company_profile', JSON.stringify(company));
        if (company.logo) localStorage.setItem('company_logo', company.logo);
      } catch {}

      const updated = await recruiterService.updateCompanyProfile(company).catch(() => company);
      setCompany(updated);
      showToast({
        type: 'success',
        title: 'Company Profile Updated! ✨',
        message: 'Employer brand, culture, and credentials successfully saved.'
      });
      setActiveTab('showcase');
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update company profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIEnhanceMission = async () => {
    if (!company) return;
    setIsGeneratingAI(true);
    try {
      const prompt = `You are a world-class Employer Branding and Talent Acquisition Strategist.
Write an inspiring, modern 3-sentence company mission and engineering culture overview for:
- Company Name: ${company.name}
- Industry: ${company.industry}
- Tagline: ${company.tagline}
- Headquarters: ${company.location}
STRICT REQUIREMENTS:
1. Highlight innovation, psychological safety, and high-impact technology.
2. Keep it inspiring to top 1% engineering candidates.
3. No buzzwords, format as 2 crisp paragraphs.`;

      const res = await sendCopilotMessage(prompt, {
        companyName: company.name,
        industry: company.industry
      });

      if (res && res.message && res.message.trim()) {
        const cleaned = res.message.replace(/\*\*/g, '').replace(/^here (is|are).*?:\s*/i, '').trim();
        setCompany({ ...company, description: cleaned });
        showToast({
          type: 'success',
          title: 'Mission Polished with AI ✨',
          message: 'AI enhanced your organization mission and engineering vision!'
        });
      }
    } catch {
      const fallback = `${company.name} is pioneering high-impact solutions in ${company.industry}. We empower autonomous engineering teams to solve mission-critical distributed challenges with modern cloud architecture and continuous learning.`;
      setCompany({ ...company, description: fallback });
      showToast({ type: 'info', title: 'Mission Updated', message: 'Applied enhanced company mission.' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddBenefit = (e?: React.FormEvent, customPerk?: string) => {
    if (e) e.preventDefault();
    const perkToAdd = (customPerk || newBenefitInput).trim();
    if (!perkToAdd || !company) return;
    if (company.benefits.includes(perkToAdd)) {
      showToast({ type: 'info', title: 'Perk Exists', message: 'This perk is already listed.' });
      return;
    }

    const updated = {
      ...company,
      benefits: [...company.benefits, perkToAdd]
    };
    setCompany(updated);
    if (!customPerk) setNewBenefitInput('');
    showToast({ type: 'success', title: 'Perk Added', message: perkToAdd });
  };

  const handleRemoveBenefit = (benefit: string) => {
    if (!company) return;
    const updated = {
      ...company,
      benefits: company.benefits.filter((b) => b !== benefit)
    };
    setCompany(updated);
  };

  const handleAddTech = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tech = newTechInput.trim();
    if (!tech || techStack.includes(tech)) return;
    setTechStack([...techStack, tech]);
    setNewTechInput('');
    showToast({ type: 'success', title: 'Tech Added', message: tech });
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  // Logo Changer Handlers
  const openLogoModal = () => {
    setUploadedLogoPreview(company.logo || '');
    setCustomLogoUrl(company.logo || '');
    setLogoOptionTab('upload');
    setLogoModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', title: 'Invalid File', message: 'Please upload an image file (PNG, JPG, SVG, WebP).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast({ type: 'error', title: 'File Too Large', message: 'Maximum file size is 10MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target?.result as string;
      if (!rawData) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/webp', 0.85);
          setUploadedLogoPreview(compressed);
          setCustomLogoUrl(compressed);
        } else {
          setUploadedLogoPreview(rawData);
          setCustomLogoUrl(rawData);
        }
        showToast({ type: 'success', title: 'Image Selected! 📸', message: 'Click "Save Logo" to apply changes.' });
      };
      img.onerror = () => {
        setUploadedLogoPreview(rawData);
        setCustomLogoUrl(rawData);
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateLogo = async (newUrl: string) => {
    if (!company) return;
    const finalLogo = newUrl.trim();
    if (!finalLogo) {
      showToast({ type: 'error', title: 'No Logo Selected', message: 'Please choose or upload a logo image first.' });
      return;
    }

    // 1. Instantly update React state
    const updated = { ...company, logo: finalLogo };
    setCompany(updated);

    // 2. Persist to localStorage for 100% reliability
    try {
      localStorage.setItem('recruiter_company_profile', JSON.stringify(updated));
      localStorage.setItem('company_logo', finalLogo);
    } catch (storageErr) {
      console.warn('localStorage save warning:', storageErr);
    }

    // 3. Close modal immediately
    setLogoModalOpen(false);
    setUploadedLogoPreview(null);
    setCustomLogoUrl('');

    showToast({
      type: 'success',
      title: 'Company Logo Saved! 🚀',
      message: 'Your logo has been successfully updated and applied.'
    });

    // 4. Background persist to backend
    try {
      setIsSaving(true);
      await recruiterService.updateCompanyProfile(updated);
    } catch (err) {
      console.warn('Backend updateCompanyProfile warning (persisted locally):', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast({
      type: 'success',
      title: 'Company Link Copied! 🔗',
      message: 'Verified recruiter & company showcase link copied to clipboard.'
    });
  };

  if (isLoading && !company) {
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

  const tabsConfig = [
    { id: 'showcase', label: 'Company Overview', icon: <Building2 className="w-4 h-4 text-purple-400" /> },
    { id: 'edit', label: 'Edit Info', icon: <Edit2 className="w-4 h-4 text-indigo-400" /> },
    { id: 'perks', label: 'Perks & Culture', icon: <HeartHandshake className="w-4 h-4 text-rose-400" />, count: company.benefits.length },
    { id: 'tech', label: 'Tech Stack', icon: <Code2 className="w-4 h-4 text-cyan-400" />, count: techStack.length },
    { id: 'contact', label: 'Hiring Channel', icon: <Mail className="w-4 h-4 text-emerald-400" /> }
  ];

  return (
    <div className="relative min-h-screen pb-20 space-y-8 select-none">
      {/* ============================================================
          1. LUXURY EXECUTIVE STUDIO BACKGROUND
          ============================================================ */}
      <CompanyStudioBackground />

      {/* ============================================================
          2. TOP COMMAND BAR
          ============================================================ */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Employer
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Public Candidate View
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Company Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Showcase your company mission, employee perks, and hiring presence to candidates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsPreviewModalOpen(true)}
            variant="secondary"
            size="sm"
            leftIcon={<Eye className="w-4 h-4 text-cyan-400" />}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold backdrop-blur-md"
          >
            Candidate Live View
          </Button>

          <Button
            onClick={handleAIEnhanceMission}
            disabled={isGeneratingAI}
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold backdrop-blur-md"
          >
            {isGeneratingAI ? 'Polishing Brand...' : 'AI Brand Polisher'}
          </Button>

          <Button
            onClick={copyShareLink}
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
          3. ENTERPRISE COVER & RECRUITER IDENTITY SHOWCASE
          ============================================================ */}
      <div className="relative z-10 rounded-3xl overflow-hidden backdrop-blur-2xl border border-white/[0.08] bg-slate-900/60 shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
        {/* Cover Graphic Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-[#0d1326] via-[#121936] to-[#0c1124] border-b border-white/[0.06]">
          {/* Subtle Ambient Studio Mesh Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Profile Details Container (Overlapping Cover) */}
        <div className="relative px-6 sm:px-10 pb-8 -mt-16 sm:-mt-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            {/* Left: Logo & Organization Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Logo Frame with Change Button */}
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={openLogoModal}
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-cyan-500/40 opacity-70 blur-sm group-hover:opacity-100 transition-opacity" />

                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-slate-950 bg-slate-950 shadow-2xl flex items-center justify-center p-1.5">
                  <img
                    src={company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80'}
                    alt={company.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-indigo-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-bold gap-1 rounded-xl">
                    <Camera className="w-5 h-5 text-indigo-300" />
                    <span>Change Logo</span>
                  </div>
                </div>

                {/* Permanent Camera Button Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLogoModal();
                  }}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-slate-950 shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center z-10 cursor-pointer"
                  title="Change Company Logo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Organization Metadata */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {company.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Verified Employer
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Actively Hiring
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold text-purple-200">
                  {company.tagline || 'Leading innovation in software & next-generation engineering'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-0.5">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {company.location || 'San Francisco, CA'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    {company.size || '100–500 employees'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Founded {company.foundedYear || '2020'}
                  </span>
                </div>

                {/* Company Links */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      Website
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                  {company.contactEmail && (
                    <a
                      href={`mailto:${company.contactEmail}`}
                      className="px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-300 hover:text-white border border-purple-800/60 flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      {company.contactEmail}
                    </a>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* ============================================================
          4. STICKY QUICK-NAV SECTION PILLS
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
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-[0_4px_20px_rgba(168,85,247,0.4)] scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-purple-900/90 text-white border border-purple-300/40' : 'bg-slate-800 text-slate-400'
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
          5. CONTENT SECTION: EXECUTIVE SHOWCASE VIEW
          ============================================================ */}
      <div className="relative z-10 space-y-8">
        {(activeTab === 'showcase' || activeTab === 'edit') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#070b1c]/70 border border-slate-800/80 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">About & Engineering Mission</h3>
                  <p className="text-xs text-slate-400 mt-0.5">What prospective candidates see when learning about your organization.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'showcase' ? (
                  <Button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    variant="secondary"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit Info
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setActiveTab('showcase')}
                    variant="secondary"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View Showcase
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleAIEnhanceMission}
                  disabled={isGeneratingAI}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                >
                  AI Polish Mission
                </Button>
              </div>
            </div>

            {/* Editable Form Mode */}
            {activeTab === 'edit' ? (
              <form onSubmit={handleSave} className="space-y-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Brand Tagline"
                    value={company.tagline}
                    onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Primary Industry"
                    value={company.industry}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    required
                  />
                  <Input
                    label="Headquarters Location"
                    value={company.location}
                    onChange={(e) => setCompany({ ...company, location: e.target.value })}
                    leftIcon={<MapPin className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Website URL (Optional)"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    leftIcon={<Globe className="w-4 h-4" />}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Size"
                    value={company.size}
                    onChange={(e) => setCompany({ ...company, size: e.target.value })}
                    placeholder="e.g. 100-500 employees"
                  />
                  <Input
                    label="Founded Year"
                    value={company.foundedYear}
                    onChange={(e) => setCompany({ ...company, foundedYear: e.target.value })}
                    placeholder="2020"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">About Company / Mission Statement</label>
                    <button
                      type="button"
                      onClick={handleAIEnhanceMission}
                      disabled={isGeneratingAI}
                      className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1.5 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                      {isGeneratingAI ? 'Generating...' : 'AI Auto-Enhance'}
                    </button>
                  </div>
                  <Textarea
                    rows={4}
                    value={company.description}
                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                    placeholder="Articulate what your organization builds, the technical engineering problems you solve, and what makes your culture unique..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab('showcase')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="glow"
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Company Profile
                  </Button>
                </div>
              </form>
            ) : (
              /* View Showcase Mode */
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-inner">
                  <p className="text-base text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                    {company.description ||
                      `At ${company.name}, we engineer high-impact software systems and innovative technology solutions in ${company.industry}. We empower our autonomous engineering teams to solve complex challenges with modern cloud architecture and continuous learning.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            6. CONTENT SECTION: PERKS & CULTURE SUITE
            ============================================================ */}
        {(activeTab === 'showcase' || activeTab === 'perks') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1026]/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Benefits & Employee Perks ({company.benefits.length})</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Verified compensation, wellness, and lifestyle perks offered to our team.</p>
                </div>
              </div>

              {activeTab === 'showcase' ? (
                <Button
                  type="button"
                  onClick={() => setActiveTab('perks')}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Perks
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setActiveTab('showcase')}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Showcase
                </Button>
              )}
            </div>

            {/* Editing Controls only when activeTab === 'perks' */}
            {activeTab === 'perks' && (
              <>
                {/* Quick Perk Add Presets */}
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Quick Perk Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PERKS.map((perk) => (
                      <button
                        key={perk}
                        type="button"
                        onClick={() => handleAddBenefit(undefined, perk)}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-purple-600 hover:text-white text-slate-300 border border-slate-700/80 transition-all cursor-pointer"
                      >
                        +{perk}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Perk Input */}
                <div className="flex gap-2.5">
                  <Input
                    placeholder="Type custom benefit (e.g. Annual $3000 Wellness Stipend, 16 Weeks Parental Leave)..."
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                  />
                  <Button type="button" variant="primary" onClick={() => handleAddBenefit()} leftIcon={<Plus className="w-4 h-4" />}>
                    Add Perk
                  </Button>
                </div>
              </>
            )}

            {/* Perks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {company.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 flex items-center justify-between gap-3 text-xs text-slate-200 transition-all"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{benefit}</span>
                  </span>
                  {activeTab === 'perks' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(benefit)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Remove Perk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            7. CONTENT SECTION: ENGINEERING & TECH STACK
            ============================================================ */}
        {(activeTab === 'showcase' || activeTab === 'tech') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0b1026]/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Engineering & Infrastructure Stack ({techStack.length})</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Core languages, cloud infrastructure, and frameworks used by our engineering team.</p>
                </div>
              </div>

              {activeTab === 'showcase' ? (
                <Button
                  type="button"
                  onClick={() => setActiveTab('tech')}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Stack
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setActiveTab('showcase')}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Showcase
                </Button>
              )}
            </div>

            {/* Add Tech Input only when on 'tech' edit tab */}
            {activeTab === 'tech' && (
              <div className="flex gap-2.5">
                <Input
                  placeholder="Add technology (e.g. Next.js, Go, Terraform, Elasticsearch, PyTorch)..."
                  value={newTechInput}
                  onChange={(e) => setNewTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTech();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddTech} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Stack
                </Button>
              </div>
            )}

            {/* Tech Stack Chips */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {techStack.map((tech) => (
                <div
                  key={tech}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <span>{tech}</span>
                  {activeTab === 'tech' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            8. CONTENT SECTION: TALENT ACQUISITION & HIRING CHANNEL
            ============================================================ */}
        {(activeTab === 'showcase' || activeTab === 'contact') && (
          <div className="rounded-3xl p-6 sm:p-8 bg-[#070b1c]/70 border border-slate-800/80 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Talent Acquisition & Hiring Channel</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Verified candidate touchpoints for incoming applications and interviews.</p>
                </div>
              </div>

              {activeTab === 'showcase' ? (
                <Button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Channels
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setActiveTab('showcase')}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Showcase
                </Button>
              )}
            </div>

            {activeTab === 'contact' ? (
              /* Editable Form Mode */
              <form onSubmit={handleSave} className="space-y-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Careers & Talent Email"
                      type="email"
                      value={company.contactEmail}
                      onChange={(e) => setCompany({ ...company, contactEmail: e.target.value })}
                      leftIcon={<Mail className="w-4 h-4 text-purple-400" />}
                      placeholder="e.g. careers@company.com"
                      required
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                      Candidates will use this email address to submit resumes and query recruitment status.
                    </p>
                  </div>

                  <div>
                    <Input
                      label="Talent Hotline / Direct Phone"
                      type="tel"
                      value={company.contactPhone}
                      onChange={(e) => setCompany({ ...company, contactPhone: e.target.value })}
                      leftIcon={<Phone className="w-4 h-4 text-emerald-400" />}
                      placeholder="e.g. +1 (555) 019-2834"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                      Direct recruiter phone or WhatsApp line for scheduling and urgent queries.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Channel Protection
                  </span>
                  <p className="text-xs text-slate-400">
                    These contact methods are verified and prominently displayed on your company profile and job postings.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab('showcase')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="glow"
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Hiring Channels
                  </Button>
                </div>
              </form>
            ) : (
              /* View Showcase Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    Careers & Talent Email
                  </span>
                  <p className="text-base font-bold text-white mt-1.5">{company.contactEmail || 'careers@company.com'}</p>
                  <p className="text-xs text-slate-400 mt-1">Receives candidate resume submissions and interview queries</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Talent Hotline / Phone
                  </span>
                  <p className="text-base font-bold text-white mt-1.5">{company.contactPhone || '+1 (555) 019-2834'}</p>
                  <p className="text-xs text-slate-400 mt-1">Direct recruiter phone line for executive candidate scheduling</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================
          9. CANDIDATE PUBLIC PREVIEW MODAL
          ============================================================ */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Candidate Live View"
        description="This is how prospective talent sees your company profile."
        maxWidth="2xl"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 flex items-center gap-4">
            <img src={company.logo} alt={company.name} className="w-14 h-14 rounded-xl object-cover border border-purple-500/40 bg-slate-950" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{company.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  Verified Employer
                </span>
              </div>
              <p className="text-xs text-purple-200 font-semibold">{company.tagline}</p>
              <p className="text-[11px] text-slate-400">{company.industry} • {company.location} • {company.size}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">About The Team</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {company.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Employee Perks ({company.benefits.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {company.benefits.map((b) => (
                <div key={b} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          10. LOGO CHANGER MODAL (CLEAR, CONCISE & CENTERED)
          ============================================================ */}
      <Modal
        isOpen={logoModalOpen}
        onClose={() => {
          setLogoModalOpen(false);
          setUploadedLogoPreview(null);
        }}
        title="Update Company Logo"
        description="Choose an image file, a curated preset, or a direct web URL."
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Option Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setLogoOptionTab('upload')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                logoOptionTab === 'upload' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setLogoOptionTab('preset')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                logoOptionTab === 'preset' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Tech Presets
            </button>
            <button
              type="button"
              onClick={() => setLogoOptionTab('url')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                logoOptionTab === 'url' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Web URL
            </button>
          </div>

          {/* Hidden File Input outside the dropzone to prevent bubble loops */}
          <input
            ref={modalFileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
            className="hidden"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
              e.target.value = '';
            }}
          />

          {/* Tab 1: Upload Image */}
          {logoOptionTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedLogoPreview ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
                  }}
                  onClick={() => modalFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver ? 'border-purple-500 bg-purple-500/15' : 'border-slate-700/80 bg-slate-900/40 hover:border-purple-500/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center mx-auto mb-2.5">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white">Click to select or drag logo here</p>
                  <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, SVG, WebP up to 10MB</p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      modalFileInputRef.current?.click();
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Browse From Device
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={uploadedLogoPreview}
                      alt="Selected preview"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-purple-400 bg-slate-950 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">New Logo Ready</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click "Save Logo" below to apply.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Tech Presets */}
          {logoOptionTab === 'preset' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Click a corporate brand preset to select:</p>
              <div className="grid grid-cols-3 gap-2.5">
                {LOGO_PRESETS.map((preset) => {
                  const isSelected = (uploadedLogoPreview || customLogoUrl) === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setUploadedLogoPreview(preset.url);
                        setCustomLogoUrl(preset.url);
                      }}
                      className={`relative p-2.5 rounded-xl border cursor-pointer transition-all text-center space-y-1.5 group ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/40 shadow-md'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-md">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <img src={preset.url} alt={preset.label} className="w-12 h-12 rounded-lg mx-auto object-cover" />
                      <p className="text-[11px] font-bold text-white truncate">{preset.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Web URL */}
          {logoOptionTab === 'url' && (
            <div className="space-y-3">
              <Input
                label="Direct Image Web URL"
                placeholder="https://company.com/logo.png"
                value={customLogoUrl}
                onChange={(e) => {
                  setCustomLogoUrl(e.target.value);
                  if (e.target.value.trim()) setUploadedLogoPreview(e.target.value.trim());
                }}
                leftIcon={<Globe className="w-4 h-4 text-purple-400" />}
              />

              {customLogoUrl.trim() && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <img
                    src={customLogoUrl}
                    alt="Web preview"
                    onError={() => showToast({ type: 'error', title: 'Invalid Image', message: 'Could not load image from this URL.' })}
                    className="w-12 h-12 rounded-lg object-cover border border-purple-500/40 bg-slate-950 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">Live URL Preview</p>
                    <p className="text-[10px] text-slate-400">Verify image appears correctly before saving</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Single, Concise Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setLogoModalOpen(false); setUploadedLogoPreview(null); }}
            >
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={() => {
                const targetUrl = uploadedLogoPreview || customLogoUrl.trim();
                if (targetUrl) handleUpdateLogo(targetUrl);
              }}
              disabled={!uploadedLogoPreview && !customLogoUrl.trim()}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Logo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
