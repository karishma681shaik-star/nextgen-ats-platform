import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Save, Edit3, PlusCircle, Loader2,
  Briefcase, MapPin, DollarSign, FileText, Star, GraduationCap,
  Check, X, Zap, Building2, Clock, Users, ChevronDown,
  Sparkles, Target, Award, Eye, Calendar, Tag
} from 'lucide-react';

import { jobService, recruiterService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { EmploymentType, ExperienceLevel } from '../../types';

// ─── TYPE COLORS ────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  'Full-time':  'from-emerald-500 to-teal-500',
  'Part-time':  'from-amber-500 to-orange-500',
  'Contract':   'from-violet-500 to-purple-500',
  'Remote':     'from-cyan-500 to-blue-500',
  'Hybrid':     'from-pink-500 to-rose-500',
  'Internship': 'from-indigo-500 to-blue-500',
};

// ─── STEP CONFIG ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Role Overview',   icon: Briefcase,     color: 'from-cyan-500 to-blue-600' },
  { id: 2, label: 'Compensation',    icon: DollarSign,    color: 'from-emerald-500 to-teal-600' },
  { id: 3, label: 'Job Details',     icon: FileText,      color: 'from-violet-500 to-purple-600' },
  { id: 4, label: 'Requirements',    icon: Star,          color: 'from-rose-500 to-pink-600' },
  { id: 5, label: 'Review & Publish',icon: Eye,           color: 'from-amber-500 to-orange-600' },
];

// ─── SKILL TAG COMPONENT ─────────────────────────────────────────────────────────
const SkillTag: React.FC<{ skill: string; onRemove: () => void }> = ({ skill, onRemove }) => (
  <span
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '999px',
      background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.15))',
      border: '1px solid rgba(96,165,250,0.3)',
      color: '#93c5fd', fontSize: '12px', fontWeight: 600,
      animation: 'tagPop 0.2s ease-out',
    }}
  >
    <Tag style={{ width: 10, height: 10 }} />
    {skill}
    <button
      type="button"
      onClick={onRemove}
      style={{ color: '#f87171', display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
    >
      <X style={{ width: 12, height: 12 }} />
    </button>
  </span>
);

// ─── PREMIUM INPUT ───────────────────────────────────────────────────────────────
const PremiumInput: React.FC<{
  label: string; placeholder?: string; value: string;
  onChange: (v: string) => void; type?: string; required?: boolean;
  icon?: React.ReactNode; hint?: string;
}> = ({ label, placeholder, value, onChange, type = 'text', required, icon, hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}{required && <span style={{ color: '#f472b6', marginLeft: 4 }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focused ? '#67e8f9' : '#475569', transition: 'color 0.2s', pointerEvents: 'none'
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: icon ? '11px 14px 11px 42px' : '11px 14px',
            background: focused ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.6)',
            border: `1px solid ${focused ? 'rgba(103,232,249,0.5)' : 'rgba(71,85,105,0.5)'}`,
            borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none',
            boxShadow: focused ? '0 0 0 3px rgba(103,232,249,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
            transition: 'all 0.25s ease',
            boxSizing: 'border-box',
          }}
        />
      </div>
      {hint && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{hint}</p>}
    </div>
  );
};

// ─── PREMIUM SELECT ──────────────────────────────────────────────────────────────
const PremiumSelect: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; icon?: React.ReactNode;
}> = ({ label, value, onChange, options, icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focused ? '#67e8f9' : '#475569', transition: 'color 0.2s', pointerEvents: 'none', zIndex: 1
          }}>
            {icon}
          </span>
        )}
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: icon ? '11px 36px 11px 42px' : '11px 36px 11px 14px',
            background: focused ? 'rgba(15,23,42,0.9)' : 'rgba(15,23,42,0.7)',
            border: `1px solid ${focused ? 'rgba(103,232,249,0.5)' : 'rgba(71,85,105,0.5)'}`,
            borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', appearance: 'none',
            boxShadow: focused ? '0 0 0 3px rgba(103,232,249,0.08)' : 'none',
            cursor: 'pointer', transition: 'all 0.25s ease', boxSizing: 'border-box',
          }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          width: 16, height: 16, color: '#475569', pointerEvents: 'none'
        }} />
      </div>
    </div>
  );
};

// ─── PREMIUM TEXTAREA ────────────────────────────────────────────────────────────
const PremiumTextarea: React.FC<{
  label: string; placeholder?: string; value: string;
  onChange: (v: string) => void; rows?: number; hint?: string; required?: boolean;
}> = ({ label, placeholder, value, onChange, rows = 4, hint, required }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}{required && <span style={{ color: '#f472b6', marginLeft: 4 }}>*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        required={required}
        rows={rows}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '12px 14px', resize: 'vertical',
          background: focused ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.6)',
          border: `1px solid ${focused ? 'rgba(103,232,249,0.5)' : 'rgba(71,85,105,0.5)'}`,
          borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', lineHeight: 1.7,
          boxShadow: focused ? '0 0 0 3px rgba(103,232,249,0.08)' : 'none',
          transition: 'all 0.25s ease', fontFamily: 'inherit', boxSizing: 'border-box',
        }}
      />
      {hint && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{hint}</p>}
    </div>
  );
};

// ─── STEP PROGRESS BAR ───────────────────────────────────────────────────────────
const StepProgress: React.FC<{ current: number; steps: typeof STEPS }> = ({ current, steps }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
    {steps.map((step, idx) => {
      const done = current > step.id;
      const active = current === step.id;
      const Icon = step.icon;
      return (
        <React.Fragment key={step.id}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : active
                  ? `linear-gradient(135deg, ${step.color.replace('from-', '').replace(' to-', ', ')})`
                  : 'rgba(30,41,59,0.8)',
                border: active ? '2px solid rgba(255,255,255,0.4)' : done ? '2px solid rgba(34,197,94,0.5)' : '2px solid rgba(71,85,105,0.4)',
                boxShadow: active ? `0 0 20px rgba(103,232,249,0.3), 0 0 40px rgba(103,232,249,0.15)` : done ? '0 0 12px rgba(34,197,94,0.2)' : 'none',
                transition: 'all 0.4s ease',
                cursor: 'default',
              }}
            >
              {done ? <Check style={{ width: 18, height: 18, color: 'white' }} /> : <Icon style={{ width: 18, height: 18, color: active ? 'white' : '#475569' }} />}
            </div>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500, marginTop: 6,
              color: active ? '#e2e8f0' : done ? '#22c55e' : '#475569',
              textAlign: 'center', whiteSpace: 'nowrap', transition: 'color 0.3s',
              letterSpacing: '0.02em',
            }}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div style={{
              height: 2, flex: 1, marginBottom: 22, marginTop: -6,
              background: done ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'rgba(71,85,105,0.3)',
              transition: 'background 0.4s ease',
              borderRadius: 2,
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── LIVE PREVIEW CARD ───────────────────────────────────────────────────────────
const LivePreviewCard: React.FC<{
  title: string; department: string; location: string; type: string;
  experienceLevel: string; minSalary: string; maxSalary: string; skills: string[];
  deadline: string;
}> = ({ title, department, location, type, experienceLevel, minSalary, maxSalary, skills, deadline }) => {
  const typeColor = TYPE_COLORS[type] || 'from-cyan-500 to-blue-500';
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(10,15,50,0.92), rgba(18,8,55,0.88), rgba(8,20,60,0.9))',
      border: '1px solid rgba(120,150,255,0.35)',
      borderRadius: 22,
      padding: 24,
      boxShadow: [
        '0 0 0 1px rgba(100,120,255,0.1)',
        '0 8px 40px rgba(60,40,200,0.35)',
        '0 20px 60px rgba(0,0,0,0.5)',
        'inset 0 1px 0 rgba(180,200,255,0.2)',
      ].join(', '),
      backdropFilter: 'blur(32px) saturate(180%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top rainbow shimmer border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #f43f5e, #f59e0b, #06b6d4)',
        backgroundSize: '200% 100%',
      }} />
      {/* Neon glow orb top-right */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        background: 'radial-gradient(circle, rgba(99,102,241,0.25), rgba(6,182,212,0.12), transparent)',
        borderRadius: '50%',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          ✦ Live Preview
        </span>
        <span style={{
          fontSize: 10, padding: '4px 12px', borderRadius: 999,
          background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.15))',
          color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)',
          fontWeight: 700, boxShadow: '0 0 12px rgba(34,197,94,0.25)',
        }}>● LIVE DRAFT</span>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px', lineHeight: 1.3 }}>
        {title || 'Job Title'}
      </h3>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
        {department || 'Department'} · {location || 'Location'}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <span style={{
          padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: `linear-gradient(135deg, ${typeColor.replace('from-', '').replace(' to-', ', ')})`,
          color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>{type}</span>
        <span style={{
          padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
          background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
          border: '1px solid rgba(99,102,241,0.25)',
        }}>{experienceLevel}</span>
        {(minSalary || maxSalary) && (
          <span style={{
            padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: 'rgba(34,197,94,0.1)', color: '#4ade80',
            border: '1px solid rgba(34,197,94,0.2)',
          }}>
            ₹{minSalary && parseInt(minSalary).toLocaleString()} – ₹{maxSalary && parseInt(maxSalary).toLocaleString()}/yr
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {skills.slice(0, 6).map(s => (
            <span key={s} style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 11,
              background: 'rgba(96,165,250,0.1)', color: '#93c5fd',
              border: '1px solid rgba(96,165,250,0.2)',
            }}>{s}</span>
          ))}
          {skills.length > 6 && (
            <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, color: '#64748b', border: '1px solid rgba(71,85,105,0.3)' }}>
              +{skills.length - 6} more
            </span>
          )}
        </div>
      )}

      {deadline && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginTop: 8 }}>
          <Calendar style={{ width: 12, height: 12 }} />
          <span>Deadline: {new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────────
export const CreateJobPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id && id !== 'new';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);

  // FORM STATE
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<EmploymentType>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Mid Level');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [educationRequired, setEducationRequired] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(isEditMode);

  // LOAD EXISTING JOB (Edit Mode)
  useEffect(() => {
    if (!isEditMode) return;
    const fetchJob = async () => {
      try {
        setIsLoadingJob(true);
        const job = await jobService.getJobById(id!);
        if (!job) {
          showToast({ type: 'error', title: 'Job Not Found', message: 'This job posting could not be loaded.' });
          navigate('/recruiter/jobs');
          return;
        }
        setTitle(job.title || '');
        setDepartment(job.department || '');
        setLocation(job.location || '');
        setType((job.type as EmploymentType) || 'Full-time');
        setExperienceLevel((job.experienceLevel as ExperienceLevel) || 'Mid Level');
        setMinSalary(String(job.salary?.min || ''));
        setMaxSalary(String(job.salary?.max || ''));
        setDeadline(job.deadline || '');
        setDescription(job.description || '');
        setResponsibilities(
          Array.isArray(job.responsibilities)
            ? job.responsibilities.join('\n')
            : job.responsibilities || ''
        );
        setRequirements(
          Array.isArray(job.requirements)
            ? job.requirements.join('\n')
            : job.requirements || ''
        );
        setSkills(
          Array.isArray(job.skills) ? job.skills :
          typeof job.skills === 'string' ? (job.skills as string).split(',').map((s: string) => s.trim()).filter(Boolean) : []
        );
        setEducationRequired(job.educationRequired || '');
      } catch {
        showToast({ type: 'error', title: 'Error', message: 'Failed to load job details.' });
        navigate('/recruiter/jobs');
      } finally {
        setIsLoadingJob(false);
      }
    };
    fetchJob();
  }, [id, isEditMode]);

  // SKILL TAG HANDLER
  const addSkill = useCallback(() => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills(prev => [...prev, s]);
    }
    setSkillInput('');
  }, [skillInput, skills]);

  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  // STEP VALIDATION
  const canNext = (): boolean => {
    if (step === 1) return !!title.trim() && !!department.trim() && !!location.trim();
    if (step === 3) return !!description.trim();
    return true;
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast({ type: 'warning', title: 'Missing Information', message: 'Please fill in the job title and description.' });
      return;
    }
    const jobData = {
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      type,
      experienceLevel,
      salary: {
        min: parseInt(minSalary, 10) || 0,
        max: parseInt(maxSalary, 10) || 0,
        currency: 'INR',
        period: 'yearly' as const,
      },
      description: description.trim(),
      responsibilities: responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
      requirements: requirements.split('\n').map(s => s.trim()).filter(Boolean),
      skills,
      educationRequired: educationRequired.trim(),
      experienceRequiredYears:
        experienceLevel === 'Senior Level' ? 5 :
        experienceLevel === 'Lead' ? 7 :
        experienceLevel === 'Mid Level' ? 3 : 1,
      deadline,
      status: 'active' as const,
    };
    try {
      setIsSubmitting(true);
      if (isEditMode) {
        await jobService.updateJob(id!, jobData);
        showToast({ type: 'success', title: 'Job Updated ✅', message: `"${title}" has been saved successfully.` });
      } else {
        const company = await recruiterService.getCompanyProfile();
        await jobService.createJob({ ...jobData, company: company.name, companyId: company.id, companyLogo: company.logo });
        showToast({ type: 'success', title: 'Job Published! 🎉', message: `"${title}" is now live and accepting applicants.` });
      }
      navigate('/recruiter/jobs');
    } catch (err: any) {
      showToast({ type: 'error', title: isEditMode ? 'Failed to Update' : 'Failed to Publish', message: err?.message || 'Something went wrong.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOADING STATE
  if (isLoadingJob) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(103,232,249,0.2), rgba(167,139,250,0.2))',
            border: '2px solid rgba(103,232,249,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'spin 1s linear infinite',
          }}>
            <Loader2 style={{ width: 28, height: 28, color: '#67e8f9' }} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Loading job details...</p>
        </div>
      </div>
    );
  }

  // Ultra-bright glassmorphism card style
  const SECTION_STYLE: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(15,23,60,0.82), rgba(20,12,60,0.78), rgba(8,20,50,0.85))',
    backdropFilter: 'blur(32px) saturate(180%)',
    border: '1px solid rgba(120,150,255,0.28)',
    borderRadius: 24,
    padding: 32,
    boxShadow: [
      '0 0 0 1px rgba(100,120,255,0.08)',
      '0 8px 40px rgba(80,60,200,0.3)',
      '0 20px 80px rgba(0,0,0,0.5)',
      'inset 0 1px 0 rgba(160,180,255,0.15)',
      'inset 0 -1px 0 rgba(100,60,200,0.1)',
    ].join(', '),
  };

  const currentStepCfg = STEPS[step - 1];
  const StepIcon = currentStepCfg.icon;

  return (
    <>
      <style>{`
        @keyframes tagPop { from { transform: scale(0.7) rotate(-5deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(100,120,255,0.08), 0 8px 40px rgba(80,60,200,0.3), 0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(160,180,255,0.15); }
          50%       { box-shadow: 0 0 0 1px rgba(120,160,255,0.2), 0 12px 60px rgba(80,60,220,0.45), 0 24px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(180,200,255,0.25); }
        }
        @keyframes borderShimmer {
          0%   { border-color: rgba(120,150,255,0.28); }
          50%  { border-color: rgba(160,200,255,0.5); }
          100% { border-color: rgba(120,150,255,0.28); }
        }
        .step-panel { animation: fadeSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .premium-card { animation: cardGlow 4s ease-in-out infinite; }
        .premium-card:hover { transform: translateY(-2px) !important; transition: transform 0.3s ease !important; }
        .btn-next:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 40px rgba(103,232,249,0.5) !important; }
        .btn-next { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .btn-prev:hover { background: rgba(71,85,105,0.5) !important; transform: translateY(-1px); }
        .btn-prev { transition: all 0.2s ease; }
        .publish-btn:hover { transform: translateY(-4px) scale(1.02); filter: brightness(1.2); box-shadow: 0 16px 50px rgba(139,92,246,0.6) !important; }
        .publish-btn { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        input[type='date']::-webkit-calendar-picker-indicator { filter: invert(0.5) brightness(1.5); }
        select option { background: #0a0f2e; color: #f1f5f9; }
        .neon-section { animation: borderShimmer 6s ease-in-out infinite; }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '24px 16px 48px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>

          {/* HEADER */}
          <div style={{ marginBottom: 32 }}>
            <Link
              to="/recruiter/jobs"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: '#64748b', fontSize: 13, fontWeight: 500, textDecoration: 'none',
                padding: '6px 12px', borderRadius: 10,
                background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(71,85,105,0.3)',
                transition: 'all 0.2s', marginBottom: 24,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              Back to Job Postings
            </Link>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              {/* Icon */}
              <div style={{
                width: 56, height: 56, flexShrink: 0, borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(103,232,249,0.2), rgba(167,139,250,0.2))',
                border: '1px solid rgba(103,232,249,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(103,232,249,0.15)',
              }}>
                {isEditMode
                  ? <Edit3 style={{ width: 26, height: 26, color: '#67e8f9' }} />
                  : <Sparkles style={{ width: 26, height: 26, color: '#67e8f9' }} />
                }
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em' }}>
                    {isEditMode ? 'Edit Job Posting' : 'Post a New Job Opening'}
                  </h1>
                  <span style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                    background: 'linear-gradient(135deg, rgba(103,232,249,0.15), rgba(167,139,250,0.15))',
                    color: '#a5b4fc', border: '1px solid rgba(167,139,250,0.3)',
                    letterSpacing: '0.06em',
                  }}>RECRUITER</span>
                </div>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                  {isEditMode
                    ? 'Update the details of this requisition — all fields are manually editable.'
                    : 'Complete the 5-step form to publish this opening. All fields are set by you — no AI defaults.'}
                </p>
              </div>
            </div>
          </div>

          {/* MAIN LAYOUT: left = steps + form | right = preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* PROGRESS */}
              <div className="premium-card neon-section" style={{ ...SECTION_STYLE, padding: 24 }}>
                <StepProgress current={step} steps={STEPS} />
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit}>

                {/* STEP 1: ROLE OVERVIEW */}
                {step === 1 && (
                  <div className="step-panel premium-card neon-section" style={SECTION_STYLE}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 14,
                        background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(6,182,212,0.7), 0 4px 14px rgba(6,182,212,0.5)',
                      }}>
                        <Briefcase style={{ width: 18, height: 18, color: 'white' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Role &amp; Placement</h2>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Basic identification of this opening</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <PremiumInput
                        label="Job Title" placeholder="e.g. Senior Full Stack Engineer" value={title}
                        onChange={setTitle} required icon={<Briefcase style={{ width: 16, height: 16 }} />}
                        hint="Be specific — good titles attract better candidates."
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <PremiumInput
                          label="Department / Team" placeholder="e.g. Engineering" value={department}
                          onChange={setDepartment} required icon={<Building2 style={{ width: 16, height: 16 }} />}
                        />
                        <PremiumInput
                          label="Location" placeholder="e.g. Bangalore / Remote" value={location}
                          onChange={setLocation} required icon={<MapPin style={{ width: 16, height: 16 }} />}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <PremiumSelect
                          label="Employment Type" value={type} onChange={v => setType(v as EmploymentType)}
                          icon={<Clock style={{ width: 16, height: 16 }} />}
                          options={[
                            { value: 'Full-time', label: '🕐 Full-time' },
                            { value: 'Part-time', label: '⏱ Part-time' },
                            { value: 'Contract', label: '📋 Contract' },
                            { value: 'Remote', label: '🌐 Remote' },
                            { value: 'Hybrid', label: '🏢 Hybrid' },
                            { value: 'Internship', label: '🎓 Internship' },
                          ]}
                        />
                        <PremiumSelect
                          label="Seniority Level" value={experienceLevel} onChange={v => setExperienceLevel(v as ExperienceLevel)}
                          icon={<Users style={{ width: 16, height: 16 }} />}
                          options={[
                            { value: 'Entry Level', label: '🌱 Entry Level' },
                            { value: 'Mid Level', label: '⚡ Mid Level' },
                            { value: 'Senior Level', label: '🚀 Senior Level' },
                            { value: 'Lead', label: '👑 Lead / Staff' },
                            { value: 'Executive', label: '🏆 Executive' },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: COMPENSATION */}
                {step === 2 && (
                  <div className="step-panel premium-card neon-section" style={SECTION_STYLE}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 14,
                        background: 'linear-gradient(135deg, #10b981, #0d9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(16,185,129,0.7), 0 4px 14px rgba(16,185,129,0.5)',
                      }}>
                        <DollarSign style={{ width: 18, height: 18, color: 'white' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Compensation &amp; Deadline</h2>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Salary range and application window</p>
                      </div>
                    </div>

                    {/* Salary visual */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(13,148,136,0.08))',
                      border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 20, marginBottom: 20,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Salary Range Preview</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#4ade80' }}>
                          {minSalary && maxSalary
                            ? `₹${parseInt(minSalary).toLocaleString()} – ₹${parseInt(maxSalary).toLocaleString()}/yr`
                            : 'Not set yet'}
                        </span>
                      </div>
                      <div style={{
                        height: 6, background: 'rgba(30,41,59,0.8)', borderRadius: 3, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: minSalary && maxSalary
                            ? `${Math.min((parseInt(maxSalary) / 3000000) * 100, 100)}%` : '0%',
                          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                          borderRadius: 3, transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: '#475569' }}>₹0</span>
                        <span style={{ fontSize: 10, color: '#475569' }}>₹30L+</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <PremiumInput
                        label="Min Salary (₹/yr)" placeholder="e.g. 600000" type="number"
                        value={minSalary} onChange={setMinSalary}
                        icon={<DollarSign style={{ width: 16, height: 16 }} />}
                      />
                      <PremiumInput
                        label="Max Salary (₹/yr)" placeholder="e.g. 1200000" type="number"
                        value={maxSalary} onChange={setMaxSalary}
                        icon={<DollarSign style={{ width: 16, height: 16 }} />}
                      />
                      <PremiumInput
                        label="Application Deadline" type="date" value={deadline}
                        onChange={setDeadline}
                        icon={<Calendar style={{ width: 16, height: 16 }} />}
                        hint="Recommended: 2–4 weeks from today"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: JOB DETAILS */}
                {step === 3 && (
                  <div className="step-panel premium-card neon-section" style={SECTION_STYLE}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 14,
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(139,92,246,0.7), 0 4px 14px rgba(139,92,246,0.5)',
                      }}>
                        <FileText style={{ width: 18, height: 18, color: 'white' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Job Description</h2>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>What does this role do day-to-day?</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <PremiumTextarea
                        label="Job Description" rows={5} required
                        placeholder="Describe the role, the team mission, what success looks like, and why this is a great opportunity..."
                        value={description} onChange={setDescription}
                        hint="Write as if you're speaking directly to your ideal candidate."
                      />
                      <PremiumTextarea
                        label="Key Responsibilities (one per line)" rows={5}
                        placeholder={`Design and implement scalable backend APIs\nCollaborate cross-functionally with Product & Design\nReview code and mentor junior engineers\nDrive architecture decisions for new features`}
                        value={responsibilities} onChange={setResponsibilities}
                        hint="Each line becomes a bullet point on the job listing."
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: REQUIREMENTS */}
                {step === 4 && (
                  <div className="step-panel premium-card neon-section" style={SECTION_STYLE}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 14,
                        background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(244,63,94,0.7), 0 4px 14px rgba(244,63,94,0.5)',
                      }}>
                        <Star style={{ width: 18, height: 18, color: 'white' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Qualifications &amp; Skills</h2>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>What should candidates bring to the table?</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <PremiumTextarea
                        label="Required Qualifications (one per line)" rows={4}
                        placeholder={`3+ years of experience with React and TypeScript\nStrong understanding of REST APIs & GraphQL\nExperience with cloud platforms (AWS / GCP)`}
                        value={requirements} onChange={setRequirements}
                        hint="Be precise — vague requirements lead to poor applicant quality."
                      />

                      {/* Skills tag input */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Required Skills (press Enter or comma to add)
                        </label>
                      <div style={{
                          minHeight: 56, padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
                          background: 'linear-gradient(135deg, rgba(10,15,50,0.8), rgba(15,10,50,0.75))',
                          border: '1px solid rgba(96,165,250,0.45)',
                          borderRadius: 14, cursor: 'text',
                          boxShadow: '0 0 0 1px rgba(96,165,250,0.1), inset 0 1px 0 rgba(150,200,255,0.1)',
                        }}
                          onClick={() => document.getElementById('skill-inp')?.focus()}
                        >
                          {skills.map(s => <SkillTag key={s} skill={s} onRemove={() => removeSkill(s)} />)}
                          <input
                            id="skill-inp"
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            onBlur={addSkill}
                            placeholder={skills.length === 0 ? 'React, TypeScript, Node.js...' : ''}
                            style={{
                              background: 'none', border: 'none', outline: 'none',
                              color: '#f1f5f9', fontSize: 14, minWidth: 140, flex: 1,
                            }}
                          />
                        </div>
                        <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Type a skill and press Enter or comma to add it as a tag.</p>
                      </div>

                      <PremiumInput
                        label="Education Requirement" placeholder="e.g. B.Tech in CS or equivalent experience"
                        value={educationRequired} onChange={setEducationRequired}
                        icon={<GraduationCap style={{ width: 16, height: 16 }} />}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW & PUBLISH */}
                {step === 5 && (
                  <div className="step-panel premium-card neon-section" style={SECTION_STYLE}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 14,
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(245,158,11,0.7), 0 4px 14px rgba(245,158,11,0.5)',
                      }}>
                        <Target style={{ width: 18, height: 18, color: 'white' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Review &amp; Publish</h2>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Confirm everything looks correct before going live</p>
                      </div>
                    </div>

                    {/* Summary grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                      {[
                        { label: 'Job Title', value: title, icon: <Briefcase style={{ width: 14, height: 14 }} /> },
                        { label: 'Department', value: department, icon: <Building2 style={{ width: 14, height: 14 }} /> },
                        { label: 'Location', value: location, icon: <MapPin style={{ width: 14, height: 14 }} /> },
                        { label: 'Type', value: type, icon: <Clock style={{ width: 14, height: 14 }} /> },
                        { label: 'Seniority', value: experienceLevel, icon: <Award style={{ width: 14, height: 14 }} /> },
                        { label: 'Salary', value: minSalary && maxSalary ? `₹${parseInt(minSalary).toLocaleString()} – ₹${parseInt(maxSalary).toLocaleString()}/yr` : 'Not specified', icon: <DollarSign style={{ width: 14, height: 14 }} /> },
                        { label: 'Deadline', value: deadline ? new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open', icon: <Calendar style={{ width: 14, height: 14 }} /> },
                        { label: 'Education', value: educationRequired || 'Not specified', icon: <GraduationCap style={{ width: 14, height: 14 }} /> },
                      ].map(item => (
                        <div key={item.label} style={{
                          padding: '12px 16px', borderRadius: 14,
                          background: 'linear-gradient(135deg, rgba(12,20,55,0.8), rgba(20,10,50,0.7))',
                          border: '1px solid rgba(100,130,255,0.2)',
                          boxShadow: '0 2px 12px rgba(80,60,200,0.15), inset 0 1px 0 rgba(160,180,255,0.08)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#64748b' }}>
                            {item.icon}
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span>
                          </div>
                          <p style={{ fontSize: 14, color: item.value ? '#f1f5f9' : '#475569', margin: 0, fontWeight: 600 }}>
                            {item.value || 'Not provided'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Skills preview */}
                    {skills.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Skills Required</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {skills.map(s => (
                            <span key={s} style={{
                              padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                              background: 'rgba(96,165,250,0.1)', color: '#93c5fd',
                              border: '1px solid rgba(96,165,250,0.25)',
                            }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completeness check */}
                    {(() => {
                      const checks = [
                        { label: 'Job Title', ok: !!title.trim() },
                        { label: 'Department', ok: !!department.trim() },
                        { label: 'Location', ok: !!location.trim() },
                        { label: 'Description', ok: !!description.trim() },
                        { label: 'Responsibilities', ok: !!responsibilities.trim() },
                        { label: 'Requirements', ok: !!requirements.trim() },
                        { label: 'Skills', ok: skills.length > 0 },
                        { label: 'Salary Range', ok: !!(minSalary && maxSalary) },
                      ];
                      const done = checks.filter(c => c.ok).length;
                      const pct = Math.round((done / checks.length) * 100);
                      return (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.1))',
                          border: '1px solid rgba(245,158,11,0.35)', borderRadius: 16, padding: 20,
                          boxShadow: '0 4px 20px rgba(245,158,11,0.12), inset 0 1px 0 rgba(255,220,100,0.1)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Listing Completeness</span>
                            <span style={{ fontSize: 18, fontWeight: 900, color: pct >= 80 ? '#4ade80' : '#f59e0b' }}>{pct}%</span>
                          </div>
                          <div style={{ height: 6, background: 'rgba(30,41,59,0.8)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                            <div style={{
                              height: '100%', width: `${pct}%`,
                              background: pct >= 80 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                              borderRadius: 3, transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {checks.map(c => (
                              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {c.ok
                                  ? <Check style={{ width: 13, height: 13, color: '#4ade80', flexShrink: 0 }} />
                                  : <X style={{ width: 13, height: 13, color: '#f87171', flexShrink: 0 }} />
                                }
                                <span style={{ fontSize: 11, color: c.ok ? '#94a3b8' : '#f87171', fontWeight: 500 }}>{c.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link
                      to="/recruiter/jobs"
                      style={{
                        padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                        background: 'rgba(30,41,59,0.6)', color: '#64748b',
                        border: '1px solid rgba(71,85,105,0.4)', textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                    >
                      Cancel
                    </Link>
                    {step > 1 && (
                      <button
                        type="button"
                        className="btn-prev"
                        onClick={() => setStep(s => s - 1)}
                        style={{
                          padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                          background: 'rgba(30,41,59,0.6)', color: '#94a3b8',
                          border: '1px solid rgba(71,85,105,0.4)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <ArrowLeft style={{ width: 14, height: 14 }} /> Back
                      </button>
                    )}
                  </div>

                  {step < 5 ? (
                    <button
                      type="button"
                      className="btn-next"
                      disabled={!canNext()}
                      onClick={() => canNext() && setStep(s => s + 1)}
                      style={{
                        padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                        background: canNext()
                          ? 'linear-gradient(135deg, #06b6d4, #2563eb)'
                          : 'rgba(30,41,59,0.6)',
                        color: canNext() ? 'white' : '#475569',
                        border: canNext() ? '1px solid rgba(103,232,249,0.5)' : '1px solid rgba(71,85,105,0.3)',
                        cursor: canNext() ? 'pointer' : 'not-allowed',
                        boxShadow: canNext() ? '0 0 0 1px rgba(103,232,249,0.2), 0 8px 30px rgba(6,182,212,0.45)' : 'none',
                        display: 'flex', alignItems: 'center', gap: 8,
                        letterSpacing: '0.02em',
                      }}
                    >
                      Continue <ArrowRight style={{ width: 16, height: 16 }} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="publish-btn"
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                      style={{
                        padding: '14px 36px', borderRadius: 14, fontSize: 15, fontWeight: 800,
                        background: isSubmitting
                          ? 'rgba(30,41,59,0.6)'
                          : 'linear-gradient(135deg, #7c3aed, #06b6d4, #6d28d9)',
                        color: 'white', border: isSubmitting ? 'none' : '1px solid rgba(167,139,250,0.4)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: isSubmitting ? 'none' : '0 0 0 1px rgba(139,92,246,0.25), 0 8px 40px rgba(139,92,246,0.5)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {isSubmitting
                        ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Publishing...</>
                        : isEditMode
                        ? <><Save style={{ width: 18, height: 18 }} /> Save Changes</>
                        : <><Zap style={{ width: 18, height: 18 }} /> {isEditMode ? 'Save Changes' : 'Publish Job Opening'}</>
                      }
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN — LIVE PREVIEW */}
            <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <LivePreviewCard
                title={title} department={department} location={location}
                type={type} experienceLevel={experienceLevel}
                minSalary={minSalary} maxSalary={maxSalary}
                skills={skills} deadline={deadline}
              />

              {/* Quick tips */}
              <div className="premium-card neon-section" style={{
                ...SECTION_STYLE, padding: 20,
                background: 'linear-gradient(135deg, rgba(80,40,180,0.2), rgba(6,90,160,0.18), rgba(60,20,150,0.22))',
                border: '1px solid rgba(167,139,250,0.35)',
                boxShadow: '0 0 0 1px rgba(139,92,246,0.1), 0 8px 40px rgba(80,40,200,0.3), inset 0 1px 0 rgba(200,180,255,0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Zap style={{ width: 16, height: 16, color: '#c4b5fd' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Pro Tips
                  </span>
                </div>
                {[
                  { tip: 'Use specific job titles — "Senior React Engineer" outperforms "Developer"', icon: '🎯' },
                  { tip: 'Salary transparency increases apply rates by 40%', icon: '💰' },
                  { tip: 'List 5–10 skills maximum for best ATS matching', icon: '🔖' },
                  { tip: 'Set a deadline 2–4 weeks out for optimal candidate flow', icon: '📅' },
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{t.tip}</p>
                  </div>
                ))}
              </div>

              {/* Step progress text */}
              <div className="premium-card neon-section" style={{
                ...SECTION_STYLE, padding: 16,
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'linear-gradient(135deg, rgba(10,15,60,0.9), rgba(20,8,50,0.85))',
                border: '1px solid rgba(120,150,255,0.35)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(103,232,249,0.5), 0 4px 14px rgba(139,92,246,0.4)',
                }}>
                  <StepIcon style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px' }}>
                    Step {step} of {STEPS.length}: {currentStepCfg.label}
                  </p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                    {step < STEPS.length ? `${STEPS.length - step} step${STEPS.length - step > 1 ? 's' : ''} remaining` : 'Ready to publish!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};