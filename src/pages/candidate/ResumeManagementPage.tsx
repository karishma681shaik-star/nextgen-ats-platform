import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Gauge
} from 'lucide-react';
import { candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Resume } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const ResumeManagementPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Resume preview modal
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);

  // Delete confirm dialog
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadResumes();
  }, []);

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

  const handleFileUpload = async (file: File) => {
    const validExtensions = ['.pdf', '.docx'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      showToast({
        type: 'error',
        title: 'Unsupported Format',
        message: 'Please upload a PDF or DOCX resume document.'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Resume file size should not exceed 10MB.'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 25;
        });
      }, 100);

      const uploaded = await candidateService.uploadResume(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setResumes((prev) => [uploaded, ...prev]);
      showToast({
        type: 'success',
        title: 'Resume Uploaded Successfully',
        message: `${file.name} is ready for ATS analysis.`
      });
    } catch {
      showToast({ type: 'error', title: 'Upload Failed', message: 'Could not upload resume.' });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 400);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    try {
      const updated = await candidateService.setPrimaryResume(resumeId);
      setResumes(updated);
      showToast({
        type: 'success',
        title: 'Primary Resume Updated',
        message: 'This document will now be used by default for 1-click job applications.'
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Resume Management</h1>
        <p className="text-xs text-slate-400">
          Upload, preview, and parse your resume documents for automated ATS ranking and applicant matching.
        </p>
      </div>

      {/* Upload Zone */}
      <Card glass className="p-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/30'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.docx"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-glow">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-sm font-bold text-white mb-1">
            Drag and drop your resume here, or <span className="text-indigo-400 underline">browse</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Supported Formats: <span className="font-semibold text-slate-300">PDF, DOCX</span> (Max 10MB)
          </p>

          {isUploading && (
            <div className="w-full max-w-xs mt-6 space-y-2">
              <ProgressBar value={uploadProgress} label="Uploading document..." size="sm" />
            </div>
          )}
        </div>
      </Card>

      {/* Resume Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Your Uploaded Resumes ({resumes.length})</h3>
          <Link to="/candidate/resume-parser">
            <Button variant="glow" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Launch AI Resume Parser
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : resumes.length === 0 ? (
          <Card glass className="p-8 text-center text-xs text-slate-400">
            No resume uploaded yet. Upload a PDF or DOCX document to unlock automated ATS evaluation.
          </Card>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <Card key={resume.id} glass hoverEffect className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 shrink-0">
                      {resume.fileType === 'pdf' ? <FileText className="w-6 h-6" /> : <FileCode className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{resume.fileName}</h4>
                        {resume.isPrimary && (
                          <Badge variant="primary" size="sm">Primary Active</Badge>
                        )}
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {resume.fileType}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                        <span>{resume.fileSize}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Uploaded on {new Date(resume.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setPreviewResume(resume)}
                    >
                      Preview
                    </Button>

                    <Link to="/candidate/resume-parser">
                      <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                        Parse
                      </Button>
                    </Link>

                    <Link to="/candidate/resume-analysis">
                      <Button variant="secondary" size="sm" leftIcon={<Gauge className="w-3.5 h-3.5" />}>
                        ATS Score
                      </Button>
                    </Link>

                    {!resume.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Star className="w-3.5 h-3.5 text-amber-400" />}
                        onClick={() => handleSetPrimary(resume.id)}
                      >
                        Set Primary
                      </Button>
                    )}

                    <button
                      onClick={() => setDeleteResumeId(resume.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      <Modal
        isOpen={!!previewResume}
        onClose={() => setPreviewResume(null)}
        title={previewResume?.fileName || 'Resume Document Preview'}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-sans">ALEX RIVERA</h2>
              <p className="text-indigo-400 text-xs">Senior Full Stack Software Engineer | San Francisco, CA</p>
              <p className="text-slate-400 text-[11px]">alex.rivera@example.com • +1 (555) 234-5678 • alexrivera.dev</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 font-sans">Professional Summary</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Senior Full Stack Engineer with 5+ years of experience architecting distributed cloud systems, React/TypeScript frontends, and Spring Boot REST microservices handling 50M+ daily events.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 font-sans">Technical Skills</h4>
              <p className="text-slate-400 text-[11px]">
                React, TypeScript, Java, Spring Boot, PostgreSQL, Docker, AWS, GraphQL, Tailwind CSS, Redis
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 font-sans">Experience</h4>
              <p className="text-white font-semibold">Senior Software Engineer — Aether Cloud Systems (2023 - Present)</p>
              <p className="text-slate-400 text-[11px]">Reduced dashboard telemetry latency by 45% using reactive web state and Java event pipelines.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">Status: <span className="text-emerald-400 font-semibold">Parsed & Ready</span></span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPreviewResume(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => {
                  showToast({ type: 'info', title: 'Download Started', message: 'Downloading resume file...' });
                }}
              >
                Download File
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDialog
        isOpen={!!deleteResumeId}
        onClose={() => setDeleteResumeId(null)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to permanently delete this resume from your vault? This cannot be undone."
        confirmText="Delete Document"
      />
    </div>
  );
};
