import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">AI ATS Platform</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Enterprise applicant tracking system & intelligent recruitment orchestration powered by resume parsing and semantic ATS scoring.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold">
              <Cpu className="w-3 h-3" /> Phase 1: Frontend Architecture
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Candidate Portal</h4>
          <ul className="space-y-2">
            <li><Link to="/candidate" className="hover:text-white transition-colors">Candidate Dashboard</Link></li>
            <li><Link to="/candidate/profile" className="hover:text-white transition-colors">Profile Management</Link></li>
            <li><Link to="/candidate/resume-parser" className="hover:text-white transition-colors">AI Resume Parser</Link></li>
            <li><Link to="/candidate/resume-analysis" className="hover:text-white transition-colors">ATS Score Analysis</Link></li>
            <li><Link to="/candidate/jobs" className="hover:text-white transition-colors">Recommended Jobs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Recruiter & Admin</h4>
          <ul className="space-y-2">
            <li><Link to="/recruiter" className="hover:text-white transition-colors">Recruiter Dashboard</Link></li>
            <li><Link to="/recruiter/jobs/new" className="hover:text-white transition-colors">Post Job Opening</Link></li>
            <li><Link to="/recruiter/applicants" className="hover:text-white transition-colors">Applicant Pipeline</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">Admin Governance</Link></li>
            <li><Link to="/admin/analytics" className="hover:text-white transition-colors">Platform Analytics</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Architecture & Security</h4>
          <p className="text-slate-400 leading-relaxed mb-3">
            Built with strict separation of concerns, ready for Spring Boot REST API integration and PostgreSQL storage in Phase 2.
          </p>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Role-Based Access Control Mocked</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <p>© 2026 AI ATS Intelligent Recruitment Platform. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-slate-300">Privacy Policy</Link>
          <Link to="/" className="hover:text-slate-300">Terms of Service</Link>
          <Link to="/" className="hover:text-slate-300">Security Whitepaper</Link>
        </div>
      </div>
    </footer>
  );
};
