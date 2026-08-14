import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ScanLine,
  CheckCircle2,
  Cpu,
  FileText,
  Code2,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  ArrowRight,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import { candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Resume, CandidateProfile } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const ResumeParsingPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsePhase, setParsePhase] = useState<number>(0);
  const [parsedData, setParsedData] = useState<Resume['parsedData'] | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const phases = [
    'Initializing Document Stream & Layout Parser...',
    'Extracting Named Entities (NER) & Technical Skills...',
    'Mapping Chronological Work Experience & Responsibilities...',
    'Structuring Educational Degrees & Validating Certifications...',
    'Entities Extracted & Structured Successfully'
  ];

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    const data = await candidateService.getResumes();
    setResumes(data);
    if (data.length > 0) {
      setSelectedResumeId(data[0].id);
      if (data[0].parsedData) {
        setParsedData(data[0].parsedData);
      }
    }
  };

  const handleRunParser = async () => {
    if (!selectedResumeId) return;

    try {
      setIsParsing(true);
      setParsePhase(0);

      // Simulate sequential phase transitions
      for (let i = 0; i < phases.length; i++) {
        setParsePhase(i);
        await new Promise((r) => setTimeout(r, 450));
      }

      const updated = await candidateService.parseResume(selectedResumeId);
      setParsedData(updated.parsedData);
      showToast({
        type: 'success',
        title: 'Parsing Complete',
        message: 'All technical entities, experience, and degrees extracted.'
      });
    } catch {
      showToast({ type: 'error', title: 'Parsing Error', message: 'Failed to process resume document.' });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSyncToProfile = async () => {
    if (!parsedData) return;
    try {
      setIsSyncing(true);
      const currentProfile = await candidateService.getProfile();

      const mergedSkills = Array.from(
        new Set([...currentProfile.skills.technical, ...parsedData.extractedSkills])
      );

      const updatedProfile: CandidateProfile = {
        ...currentProfile,
        skills: {
          ...currentProfile.skills,
          technical: mergedSkills
        },
        profileCompletion: Math.min(100, currentProfile.profileCompletion + 5)
      };

      await candidateService.updateProfile(updatedProfile);
      showToast({
        type: 'success',
        title: 'Profile Synchronized!',
        message: `${parsedData.extractedSkills.length} extracted skills merged into your active profile.`
      });
    } catch {
      showToast({ type: 'error', title: 'Sync Error', message: 'Could not sync profile.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Entity Extraction Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Resume Parser</h1>
          <p className="text-xs text-slate-400">
            Automatically transform unstructured PDF and DOCX documents into structured candidate profiles and ATS data.
          </p>
        </div>

        {parsedData && (
          <Button
            variant="glow"
            size="sm"
            onClick={handleSyncToProfile}
            isLoading={isSyncing}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Sync Extracted Data to Profile
          </Button>
        )}
      </div>

      {/* Parser Control Bar */}
      <Card glass className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <ScanLine className="w-6 h-6" />
            </div>
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Select Resume for Parsing
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => {
                  setSelectedResumeId(e.target.value);
                  const found = resumes.find((r) => r.id === e.target.value);
                  if (found?.parsedData) setParsedData(found.parsedData);
                }}
                className="w-full sm:w-80 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 p-2.5"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fileName} ({r.fileType.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleRunParser}
            isLoading={isParsing}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0"
          >
            {isParsing ? 'Extracting Entities...' : 'Run AI Extraction'}
          </Button>
        </div>

        {/* Parsing Progress / Scanner Animation */}
        {isParsing && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-indigo-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-spin" />
                {phases[parsePhase]}
              </span>
              <span className="text-slate-300 font-mono">{((parsePhase + 1) * 20)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${(parsePhase + 1) * 20}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Extracted Structured Data Display */}
      {parsedData ? (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Extracted Candidate Entities</h3>
            <Badge variant="success" dot size="sm">Extraction Complete (100% Accuracy)</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Skills */}
            <Card glass className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Extracted Technical Skills</h4>
                  <p className="text-xs text-slate-400">{parsedData.extractedSkills.length} skills identified in document</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {parsedData.extractedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>

            {/* Extracted Education */}
            <Card glass className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Extracted Education History</h4>
                  <p className="text-xs text-slate-400">Academic credentials verified</p>
                </div>
              </div>

              <div className="space-y-2">
                {parsedData.extractedEducation.map((edu, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 font-medium">
                    {edu}
                  </div>
                ))}
              </div>
            </Card>

            {/* Extracted Experience */}
            <Card glass className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Extracted Work Experience</h4>
                  <p className="text-xs text-slate-400">Chronological positions & responsibilities</p>
                </div>
              </div>

              <div className="space-y-2">
                {parsedData.extractedExperience.map((exp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 font-medium">
                    {exp}
                  </div>
                ))}
              </div>
            </Card>

            {/* Extracted Certifications & Projects */}
            <Card glass className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Extracted Projects & Certifications</h4>
                  <p className="text-xs text-slate-400">Verified licenses and technical highlights</p>
                </div>
              </div>

              <div className="space-y-2">
                {[...parsedData.extractedProjects, ...parsedData.extractedCertifications].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 font-medium flex items-center justify-between">
                    <span>{item}</span>
                    <Badge variant="primary" size="sm">Verified</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link to="/candidate/resume-analysis">
              <Button variant="glow" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to ATS Score Analysis
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <Card glass className="p-12 text-center text-xs text-slate-400 space-y-3">
          <ScanLine className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
          <p className="text-sm font-bold text-white">Ready for Entity Extraction</p>
          <p className="max-w-md mx-auto leading-relaxed">
            Click "Run AI Extraction" above to parse all technical skills, work experience, projects, and educational credentials from your resume.
          </p>
        </Card>
      )}
    </div>
  );
};
