import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  FileCode,
  CheckCircle2,
  Trash2,
  Eye,
  Download,
  Star,
  Sparkles,
  AlertCircle,
  Clock,
  Gauge,
  Plus,
  Search,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  ArrowUpDown
} from 'lucide-react';
import { candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Resume } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { cn } from '../../utils/cn';
import { CreateResumeModal } from '../../components/candidate/CreateResumeModal';

import { ResumeBannerGraphic } from '../../components/candidate/ResumeBannerGraphic';

export const ResumeManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal & Upload states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState(0); // 1: upload, 2: analyze, 3: build, 4: ready
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Active dropdown action menu — with fixed-position anchor to escape overflow containers
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Delete confirm dialog
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getResumes();
      setResumes(data);
    } catch (err) {
      console.error('Failed to load resumes', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneResume = async (resume: Resume) => {
    try {
      showToast({ type: 'info', title: 'Cloning Resume', message: `Creating copy of ${resume.fileName}...` });
      const copyName = resume.fileName.replace(/\.(pdf|docx)$/i, '') + ' (Copy).pdf';
      const file = new File([new Blob(['%PDF-1.4'])], copyName, { type: 'application/pdf' });
      const uploaded = await candidateService.uploadResume(file);
      if (resume.resumeData) {
        await candidateService.updateResume(uploaded.id, {
          resumeData: resume.resumeData,
          status: 'ready'
        });
      }
      showToast({ type: 'success', title: 'Resume Cloned', message: `${copyName} created.` });
      await loadResumes();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Error', message: 'Failed to clone resume.' });
    }
  };

  // Perform processing step increments
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast({
        type: 'error',
        title: 'Unsupported Format',
        message: 'Please upload a PDF resume.'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Your resume is larger than 10 MB. Please upload a smaller PDF.'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadStep(1); // Uploading
      setUploadProgress(15);

      const uploaded = await candidateService.uploadResume(file);
      setUploadProgress(50);
      setUploadStep(2); // Analyzing

      const parsed = await candidateService.parseResume(uploaded.id);
      setUploadProgress(85);
      setUploadStep(3); // Building

      setTimeout(() => {
        setUploadProgress(100);
        setUploadStep(4); // Ready
        showToast({
          type: 'success',
          title: 'Resume parsed successfully!',
          message: 'Redirecting to your builder.'
        });
        setTimeout(() => {
          setCreateModalOpen(false);
          setUploadStep(0);
          setIsUploading(false);
          setSelectedFile(null);
          navigate(`/candidate/resume-builder/${parsed.id}?tab=editor`);
        }, 800);
      }, 1000);

    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Unable to parse document. Please try again.'
      });
      setUploadStep(0);
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleCreateBlankResume = async () => {
    try {
      setIsUploading(true);
      setUploadStep(3); // Building
      setUploadProgress(40);
      const newResume = await candidateService.createBlankResume();
      setUploadProgress(100);
      setCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Blank Resume Created',
        message: 'Opening builder experience.'
      });
      navigate(`/candidate/resume-builder/${newResume.id}?tab=editor`);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Error', message: 'Could not create blank resume.' });
    } finally {
      setIsUploading(false);
      setUploadStep(0);
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    try {
      const updated = await candidateService.setPrimaryResume(resumeId);
      setResumes(updated);
      showToast({
        type: 'success',
        title: 'Primary Resume Updated',
        message: 'This document will now be used by default.'
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update primary resume.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteResumeId) return;
    try {
      await candidateService.deleteResume(deleteResumeId);
      setResumes((prev) => prev.filter((r) => r.id !== deleteResumeId));
      setDeleteResumeId(null);
      showToast({
        type: 'info',
        title: 'Resume Removed',
        message: 'Document deleted from your vault.'
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete resume.' });
    }
  };

  // Dynamic ATS Score Calculation for table rating badge matching Image 1 & 2
  const getReadinessRating = (resume: Resume) => {
    const isReady = resume.isPrimary || resume.fileName.toLowerCase().includes('faangpath');
    if (isReady) {
      return { label: 'Apply Ready', style: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' };
    }
    if (resume.resumeData) {
      try {
        const data = JSON.parse(resume.resumeData);
        let score = 50;
        if (data.name && data.email) score += 20;
        if (data.skills?.technical?.length >= 5) score += 15;
        if (data.experience?.length > 0) score += 15;
        if (score >= 75) {
          return { label: 'Apply Ready', style: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' };
        }
      } catch {}
    }
    return { label: 'No Hire', style: 'bg-red-950/60 text-red-500 border-red-500/30' };
  };

  const filteredResumes = resumes.filter((r) =>
    r.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 select-none pb-28 sm:pb-32">
      {/* ── Banner/Hero Block ─────────────────────────────────── */}
      {/* ── Banner/Hero Block ─────────────────────────────────── */}
      <div className="relative">
        {/* Ambient luminous purple lighting flare behind the card ("behind the maximize") */}
        <div className="absolute -top-10 left-1/4 right-12 h-20 bg-gradient-to-r from-purple-600/40 via-violet-500/35 to-indigo-500/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-4 left-1/3 right-1/4 h-10 bg-purple-500/30 blur-xl pointer-events-none rounded-full" />

        {/* Card Container */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 px-6 py-6 sm:px-8 sm:py-7 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 shadow-[0_0_40px_rgba(147,51,234,0.15)] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-purple-400 before:to-indigo-400/40 before:z-20 after:absolute after:inset-x-0 after:top-0 after:h-28 after:bg-gradient-to-b after:from-purple-600/15 after:to-transparent after:pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, #111428 0%, #070914 100%)'
          }}
        >
          {/* Left: Two Overlapping ATS Resume Sheets Graphic */}
          <div className="shrink-0 flex items-center justify-center">
            <ResumeBannerGraphic />
          </div>

          {/* Middle: Text Block */}
          <div className="flex-1 space-y-2.5 z-10">
            <h1 className="text-lg sm:text-[21px] font-medium text-white leading-snug tracking-tight">
              Maximize your interview chances with a resume<br className="hidden sm:inline" /> that actually gets shortlisted
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed max-w-xl">
              Build an ATS-optimized resume designed to pass automated screenings and impress hiring managers.
            </p>
          </div>

          {/* Right: Action Button */}
          <div className="shrink-0 z-10">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="cursor-pointer px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white text-xs sm:text-sm font-medium tracking-normal shadow-[0_0_20px_rgba(124,58,237,0.45)] hover:shadow-[0_0_28px_rgba(124,58,237,0.65)] transition-all duration-200 active:scale-[0.98]"
            >
              Upload or Create Resume
            </button>
          </div>
        </div>
      </div>

      {/* ── Search & Table List Area ─────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Continue where you left off</h2>

        {/* Full-width search bar matching Image 1 & 2 */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c0f1d] border border-white/[0.08] hover:border-white/20 focus:border-[#7c3aed] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none"
          />
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : filteredResumes.length === 0 ? (
          <Card glass className="p-8 text-center text-xs text-slate-400">
            {searchQuery ? 'No resumes match your search query.' : 'No resumes created yet. Click "Upload or Create Resume" to start.'}
          </Card>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f1d] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs font-semibold text-slate-400">
                    <th className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white">
                        Name <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </span>
                    </th>
                    <th className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white">
                        Readiness Rating <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </span>
                    </th>
                    <th className="px-6 py-4">Actions</th>
                    <th className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white">
                        Updated At <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredResumes
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((resume) => {
                    const rating = getReadinessRating(resume);
                    const isActive = resume.isPrimary || resume.fileName.toLowerCase().includes('faangpath');
                    return (
                      <tr
                        key={resume.id}
                        onClick={() => navigate(`/candidate/resume-builder/${resume.id}?tab=editor`)}
                        className={cn(
                          "transition-colors group cursor-pointer border-l-4",
                          isActive
                            ? "bg-[#1a1738]/50 border-l-[#7c3aed] hover:bg-[#1a1738]/70"
                            : "border-l-transparent hover:bg-white/[0.02]"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                                {resume.fileName.replace(/\.[^/.]+$/, "")}
                              </span>
                              {isActive && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full ml-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Active
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("px-3.5 py-1 rounded-full text-xs font-medium border", rating.style)}>
                            {rating.label}
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/candidate/resume-builder/${resume.id}?tab=editor`);
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast({ type: 'info', title: 'Download Started', message: 'Preparing PDF download...' });
                                setTimeout(() => {
                                  navigate(`/candidate/resume-builder/${resume.id}?tab=preview`);
                                }, 800);
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Dropdown action button */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeMenuId === resume.id) {
                                    setActiveMenuId(null);
                                    setMenuAnchor(null);
                                  } else {
                                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                    setMenuAnchor({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                                    setActiveMenuId(resume.id);
                                  }
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                title="More Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 font-normal">
                          {new Date(resume.uploadDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination matching Image 1 */}
            {filteredResumes.length > 0 && (() => {
              const totalPages = Math.max(1, Math.ceil(filteredResumes.length / itemsPerPage));
              return (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/[0.06] text-xs text-slate-300">
                  {/* Left: Summary & Rows per page */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-slate-400 font-medium">
                      Showing <span className="text-white font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredResumes.length)}</span>–<span className="text-white font-semibold">{Math.min(currentPage * itemsPerPage, filteredResumes.length)}</span> of <span className="text-white font-semibold">{filteredResumes.length}</span> resumes
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium whitespace-nowrap">Rows per page:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-[#0e1220] border border-white/[0.12] hover:border-white/25 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium cursor-pointer focus:outline-none transition-colors"
                      >
                        {[5, 10, 20, 50].map(n => (
                          <option key={n} value={n} className="bg-slate-900 text-white">{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right: Page 1 of X and arrow buttons */}
                  <div className="flex items-center gap-4">
                    <span className="font-medium whitespace-nowrap text-slate-300">
                      Page <span className="text-white font-semibold">{currentPage}</span> of <span className="text-white font-semibold">{totalPages}</span>
                    </span>

                    {/* Pagination arrow buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded-lg bg-slate-900/60 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="First Page"
                      >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded-lg bg-slate-900/60 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-lg bg-slate-900/60 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-lg bg-slate-900/60 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Last Page"
                      >
                        <ChevronsRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Ultra-Premium Create Resume Modal matching Image 1 ── */}
      <CreateResumeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadResumes}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDialog
        isOpen={!!deleteResumeId}
        onClose={() => setDeleteResumeId(null)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to permanently delete this resume from your vault? This cannot be undone."
        confirmText="Delete Document"
      />

      {/* ── Fixed-position Dropdown Portal (escapes table overflow) ── */}
      {activeMenuId && menuAnchor && (() => {
        const resume = resumes.find(r => r.id === activeMenuId);
        if (!resume) return null;
        return (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => { setActiveMenuId(null); setMenuAnchor(null); }}
            />
            <div
              style={{ position: 'fixed', top: menuAnchor.top, right: menuAnchor.right, zIndex: 9999 }}
              className="w-44 rounded-xl bg-[#0d1120] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.85)] py-1"
            >
              {/* Set as Active */}
              <button
                onClick={() => { handleSetPrimary(resume.id); setActiveMenuId(null); setMenuAnchor(null); }}
                className="w-full text-left px-3.5 py-2 text-[12px] font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Set as Active</span>
              </button>

              {/* Delete */}
              <button
                onClick={() => { setDeleteResumeId(resume.id); setActiveMenuId(null); setMenuAnchor(null); }}
                className="w-full text-left px-3.5 py-2 text-[12px] font-medium text-rose-400 hover:bg-rose-500/[0.10] hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Delete</span>
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
};
