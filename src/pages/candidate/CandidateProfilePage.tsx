import React, { useState, useEffect } from 'react';
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
  Linkedin
} from 'lucide-react';
import { candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
  CandidateProfile,
  Education,
  Experience,
  Project,
  Certification
} from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs } from '../../components/ui/Tabs';

export const CandidateProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  // Modal states for adding/editing items
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  const [projModalOpen, setProjModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<Project | null>(null);

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  // Skill input helper
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'technical' | 'soft' | 'tools' | 'languages'>('technical');

  // Deletion confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'edu' | 'exp' | 'proj' | 'cert';
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setIsSaving(true);
      const updated = await candidateService.updateProfile(profile);
      setProfile(updated);
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Personal details and contact info saved.'
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim() || !profile) return;
    const currentList = profile.skills[newSkillCategory] || [];
    if (currentList.includes(newSkillInput.trim())) return;

    const updatedProfile = {
      ...profile,
      skills: {
        ...profile.skills,
        [newSkillCategory]: [...currentList, newSkillInput.trim()]
      }
    };
    setProfile(updatedProfile);
    candidateService.updateProfile(updatedProfile);
    setNewSkillInput('');
    showToast({ type: 'success', title: 'Skill Added', message: `Added "${newSkillInput.trim()}"` });
  };

  const handleRemoveSkill = (category: keyof typeof profile.skills, skillName: string) => {
    if (!profile) return;
    const updatedProfile = {
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

    const updated = { ...profile, education: updatedList };
    setProfile(updated);
    candidateService.updateProfile(updated);
    setEduModalOpen(false);
    setEditingEdu(null);
    showToast({ type: 'success', title: 'Education Saved', message: `${eduData.degree}` });
  };

  // Experience Handlers
  const handleSaveExperience = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    const formData = new FormData(e.currentTarget);
    const expData: Experience = {
      id: editingExp ? editingExp.id : `exp-${Date.now()}`,
      company: formData.get('company') as string,
      role: formData.get('role') as string,
      location: formData.get('location') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      current: formData.get('current') === 'on',
      description: formData.get('description') as string,
      technologies: (formData.get('technologies') as string)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    };

    let updatedList = [...profile.experience];
    if (editingExp) {
      updatedList = updatedList.map((item) => (item.id === editingExp.id ? expData : item));
    } else {
      updatedList.push(expData);
    }

    const updated = { ...profile, experience: updatedList };
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

    const updated = { ...profile, projects: updatedList };
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

    const updated = { ...profile, certifications: updatedList };
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

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const profileTabs = [
    { id: 'personal', label: 'Personal Information', icon: <User className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills & Tools', icon: <Code2 className="w-4 h-4" />, count: profile.skills.technical.length + profile.skills.tools.length },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" />, count: profile.experience.length },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, count: profile.education.length },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" />, count: profile.projects.length },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" />, count: profile.certifications.length }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Candidate Profile</h1>
          <p className="text-xs text-slate-400">
            Manage your verified credentials, skills, and work history for AI matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" dot size="md">
            {profile.profileCompletion}% Complete
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Personal Information */}
      {activeTab === 'personal' && (
        <Card glass className="p-6 sm:p-8">
          <form onSubmit={handleSavePersonalInfo} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-glow"
              />
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-white">{profile.name}</h3>
                <p className="text-xs text-slate-400">{profile.title}</p>
                <p className="text-[11px] text-indigo-400">{profile.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
              <Input
                label="Professional Headline"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
              <Input
                label="Location / Timezone"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="sm:col-span-2"
              />
            </div>

            <Textarea
              label="Professional Summary / Bio"
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              helperText="Brief summary highlighting your experience depth and engineering achievements."
            />

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Online Profiles & Portfolios
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="GitHub URL"
                  value={profile.githubUrl || ''}
                  onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  leftIcon={<Github className="w-4 h-4" />}
                />
                <Input
                  label="LinkedIn URL"
                  value={profile.linkedinUrl || ''}
                  onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  leftIcon={<Linkedin className="w-4 h-4" />}
                />
                <Input
                  label="Personal Website / Portfolio"
                  value={profile.websiteUrl || ''}
                  onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button type="submit" variant="glow" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: Skills & Tools */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Add Skill Form */}
          <Card glass className="p-6">
            <h3 className="text-sm font-bold text-white mb-4">Add New Skill</h3>
            <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <Input
                  placeholder="e.g. Docker, Kafka, Microservices, React"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as any)}
                  className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700/80 px-3.5 py-2.5"
                >
                  <option value="technical">Technical Skill</option>
                  <option value="soft">Soft Skill</option>
                  <option value="tools">Tool / Platform</option>
                  <option value="languages">Language</option>
                </select>
              </div>
              <Button type="submit" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Add
              </Button>
            </form>
          </Card>

          {/* Categorized Skills Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Technical Stack ({profile.skills.technical.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.technical.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium group"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveSkill('technical', s)}
                      className="text-indigo-400 hover:text-rose-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </Card>

            {/* Tools & Platforms */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-purple-400" />
                  Tools & Environments ({profile.skills.tools.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.tools.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-medium group"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveSkill('tools', s)}
                      className="text-purple-400 hover:text-rose-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </Card>

            {/* Soft Skills */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Soft & Leadership Skills ({profile.skills.soft.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.soft.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium group"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveSkill('soft', s)}
                      className="text-emerald-400 hover:text-rose-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </Card>

            {/* Languages */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  Spoken Languages ({profile.skills.languages.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.languages.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium group"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveSkill('languages', s)}
                      className="text-amber-400 hover:text-rose-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: Experience */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Work History</h3>
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

          <div className="space-y-4">
            {profile.experience.map((exp) => (
              <Card key={exp.id} glass className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white">{exp.role}</h4>
                    <p className="text-xs text-indigo-400 font-semibold">{exp.company} • <span className="text-slate-400 font-normal">{exp.location}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {exp.startDate} — {exp.current ? <span className="text-emerald-400 font-semibold">Present</span> : exp.endDate}
                    </span>
                    <button
                      onClick={() => {
                        setEditingExp(exp);
                        setExpModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">{exp.description}</p>
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {exp.technologies.map((tech) => (
                      <span key={tech} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Education */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Educational Background</h3>
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

          <div className="space-y-4">
            {profile.education.map((edu) => (
              <Card key={edu.id} glass className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">{edu.degree}</h4>
                    <p className="text-xs text-indigo-400 font-semibold">{edu.institution}</p>
                    <p className="text-xs text-slate-400">{edu.fieldOfStudy}</p>
                    {edu.grade && <p className="text-[11px] text-emerald-400 font-medium">{edu.grade}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{edu.startYear} — {edu.endYear}</span>
                    <button
                      onClick={() => {
                        setEditingEdu(edu);
                        setEduModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'edu',
                          id: edu.id,
                          title: edu.degree
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Featured Technical Projects</h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingProj(null);
                setProjModalOpen(true);
              }}
            >
              Add Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.projects.map((proj) => (
              <Card key={proj.id} glass className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2">
                    <h4 className="text-base font-bold text-white">{proj.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProj(proj);
                          setProjModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'proj',
                            id: proj.id,
                            title: proj.title
                          })
                        }
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{proj.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Live Demo
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white inline-flex items-center gap-1">
                        <Github className="w-3 h-3" /> Source Code
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Certifications */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Certifications & Licenses</h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingCert(null);
                setCertModalOpen(true);
              }}
            >
              Add Certification
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.certifications.map((cert) => (
              <Card key={cert.id} glass className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{cert.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{cert.issuer}</p>
                    <p className="text-[11px] text-indigo-400 mt-1">Issued {cert.issueDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingCert(cert);
                      setCertModalOpen(true);
                    }}
                    className="p-1.5 rounded text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        type: 'cert',
                        id: cert.id,
                        title: cert.title
                      })
                    }
                    className="p-1.5 rounded text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION MODAL */}
      <Modal
        isOpen={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        title={editingEdu ? 'Edit Education Record' : 'Add Educational Degree'}
      >
        <form onSubmit={handleSaveEducation} className="space-y-4">
          <Input name="degree" label="Degree Title" defaultValue={editingEdu?.degree} placeholder="e.g. Bachelor of Science in Computer Science" required />
          <Input name="institution" label="University / Institution" defaultValue={editingEdu?.institution} placeholder="e.g. UC Berkeley" required />
          <Input name="fieldOfStudy" label="Field of Study" defaultValue={editingEdu?.fieldOfStudy} placeholder="e.g. Software Engineering" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="startYear" label="Start Year" defaultValue={editingEdu?.startYear} placeholder="2017" required />
            <Input name="endYear" label="End Year" defaultValue={editingEdu?.endYear} placeholder="2021" required />
          </div>
          <Input name="grade" label="Grade / GPA" defaultValue={editingEdu?.grade} placeholder="e.g. 3.85 GPA / First Class" />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setEduModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Record</Button>
          </div>
        </form>
      </Modal>

      {/* EXPERIENCE MODAL */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title={editingExp ? 'Edit Experience Record' : 'Add Work Position'}
      >
        <form onSubmit={handleSaveExperience} className="space-y-4">
          <Input name="company" label="Company Name" defaultValue={editingExp?.company} placeholder="e.g. CloudScale AI" required />
          <Input name="role" label="Job Title" defaultValue={editingExp?.role} placeholder="e.g. Senior Software Engineer" required />
          <Input name="location" label="Location" defaultValue={editingExp?.location} placeholder="e.g. San Francisco, CA (Remote)" />
          <div className="grid grid-cols-2 gap-4">
            <Input name="startDate" label="Start Date" defaultValue={editingExp?.startDate} placeholder="2023-03" required />
            <Input name="endDate" label="End Date" defaultValue={editingExp?.endDate} placeholder="2026-01" />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" name="current" defaultChecked={editingExp?.current} />
            <span>I currently work in this role</span>
          </label>
          <Textarea name="description" label="Key Responsibilities & Impact" defaultValue={editingExp?.description} rows={3} required />
          <Input name="technologies" label="Technologies Used (Comma Separated)" defaultValue={editingExp?.technologies?.join(', ')} placeholder="React, TypeScript, Java, AWS" />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setExpModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Position</Button>
          </div>
        </form>
      </Modal>

      {/* PROJECT MODAL */}
      <Modal
        isOpen={projModalOpen}
        onClose={() => setProjModalOpen(false)}
        title={editingProj ? 'Edit Project' : 'Add Technical Project'}
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <Input name="title" label="Project Title" defaultValue={editingProj?.title} placeholder="e.g. DevPulse Analytics" required />
          <Textarea name="description" label="Description & Key Features" defaultValue={editingProj?.description} rows={3} required />
          <Input name="technologies" label="Technologies (Comma separated)" defaultValue={editingProj?.technologies?.join(', ')} placeholder="React, Tailwind, Node.js" required />
          <Input name="link" label="Live Application URL" defaultValue={editingProj?.link} placeholder="https://..." />
          <Input name="githubUrl" label="GitHub Repository URL" defaultValue={editingProj?.githubUrl} placeholder="https://github.com/..." />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setProjModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Project</Button>
          </div>
        </form>
      </Modal>

      {/* CERTIFICATION MODAL */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title={editingCert ? 'Edit Certification' : 'Add Certification'}
      >
        <form onSubmit={handleSaveCertification} className="space-y-4">
          <Input name="title" label="Certification Name" defaultValue={editingCert?.title} placeholder="e.g. AWS Certified Solutions Architect" required />
          <Input name="issuer" label="Issuing Organization" defaultValue={editingCert?.issuer} placeholder="e.g. Amazon Web Services" required />
          <Input name="issueDate" label="Issue Date" defaultValue={editingCert?.issueDate} placeholder="e.g. 2024-05" required />
          <Input name="credentialUrl" label="Credential Verification URL" defaultValue={editingCert?.credentialUrl} placeholder="https://..." />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setCertModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Certification</Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteItem}
        title="Confirm Removal"
        message={`Are you sure you want to remove "${deleteConfirm?.title}" from your profile?`}
        confirmText="Remove Record"
      />
    </div>
  );
};
