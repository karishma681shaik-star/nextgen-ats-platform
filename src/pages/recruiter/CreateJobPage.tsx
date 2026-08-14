import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  DollarSign,
  Calendar,
  Save,
  CheckCircle2
} from 'lucide-react';
import { jobService, recruiterService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Job, EmploymentType, ExperienceLevel } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

export const CreateJobPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Core Platform Engineering');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid / Remote)');
  const [type, setType] = useState<EmploymentType>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Senior Level');
  const [minSalary, setMinSalary] = useState('140000');
  const [maxSalary, setMaxSalary] = useState('180000');
  const [deadline, setDeadline] = useState('2026-04-30');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skills, setSkills] = useState('');
  const [educationRequired, setEducationRequired] = useState("Bachelor's or Master's in Computer Science or equivalent.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      showToast({ type: 'warning', title: 'Missing Information', message: 'Please fill in the job title and description.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const company = await recruiterService.getCompanyProfile();

      const newJob = await jobService.createJob({
        title,
        company: company.name,
        companyId: company.id,
        companyLogo: company.logo,
        department,
        location,
        type,
        experienceLevel,
        salary: {
          min: parseInt(minSalary, 10) || 120000,
          max: parseInt(maxSalary, 10) || 160000,
          currency: 'USD',
          period: 'yearly'
        },
        description,
        responsibilities: responsibilities.split('\n').filter(Boolean),
        requirements: requirements.split('\n').filter(Boolean),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        educationRequired,
        experienceRequiredYears: experienceLevel === 'Senior Level' ? 5 : experienceLevel === 'Lead' ? 7 : 3,
        deadline,
        status: 'active'
      });

      showToast({
        type: 'success',
        title: 'Job Published Successfully! 🎉',
        message: `${newJob.title} is now active and accepting applicants.`
      });

      navigate('/recruiter/jobs');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to create job', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Postings</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Post a New Job Opening</h1>
        <p className="text-xs text-slate-400">
          Create a targeted requisition to match qualified engineering candidates via the AI ATS scoring engine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card glass className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Role & Placement Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Requisition Title"
              placeholder="e.g. Senior Full Stack Engineer (React + Spring Boot)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="sm:col-span-2"
            />

            <Input
              label="Department / Team"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />

            <Input
              label="Location (City, State / Remote Options)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EmploymentType)}
                className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700/80 p-2.5"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Seniority / Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700/80 p-2.5"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead">Lead / Staff</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 2: Compensation & Application Timeline */}
        <Card glass className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Compensation Range & Deadline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Minimum Base Salary (USD / yr)"
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              required
            />
            <Input
              label="Maximum Base Salary (USD / yr)"
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              required
            />
            <Input
              label="Application Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Section 3: Description & Responsibilities */}
        <Card glass className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Job Description & Technical Requirements
          </h3>

          <Textarea
            label="Job Description Summary"
            rows={4}
            placeholder="Describe the mission of this role and high-level architectural goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Textarea
            label="Key Responsibilities (One item per line)"
            rows={4}
            placeholder="Architect distributed event streams...&#10;Lead code reviews and system RFCs...&#10;Maintain 99.99% service uptime..."
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            helperText="Enter each responsibility on a separate line."
          />

          <Textarea
            label="Required Qualifications & Experience (One item per line)"
            rows={4}
            placeholder="5+ years of experience with React & Spring Boot...&#10;Deep understanding of PostgreSQL indexing and Kafka...&#10;Experience mentoring junior engineers..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            helperText="Enter each qualification on a separate line."
          />

          <Input
            label="Target Technical Skills (Comma-separated for ATS Matching)"
            placeholder="React, TypeScript, Java, Spring Boot, PostgreSQL, Docker, AWS, Kafka"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            required
          />

          <Input
            label="Educational Degree Requirement"
            value={educationRequired}
            onChange={(e) => setEducationRequired(e.target.value)}
          />
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/recruiter/jobs">
            <Button type="button" variant="secondary" size="lg">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Publish Job Requisition
          </Button>
        </div>
      </form>
    </div>
  );
};
