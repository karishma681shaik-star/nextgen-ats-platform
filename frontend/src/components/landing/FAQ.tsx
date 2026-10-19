import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    id: 1,
    category: 'About Platform',
    question: 'What is AI ATS?',
    answer:
      'AI ATS is a recruitment platform that helps job seekers improve their resumes and helps recruiters manage job openings and candidate applications in one place.',
  },
  {
    id: 2,
    category: 'Resume Upload',
    question: 'Can I upload my existing resume?',
    answer:
      'Yes, you can upload your existing resume in supported PDF, DOC, or DOCX formats (up to 2 MB). The system processes your document, extracts candidate profile details, and lets you review and optimize it.',
  },
  {
    id: 3,
    category: 'ATS Score',
    question: 'What is an ATS score?',
    answer:
      'An ATS score indicates how well your resume matches the criteria evaluated by the platform, including skills alignment, formatting, and keyword relevance. It is an optimization tool, not a guarantee of selection.',
  },
  {
    id: 4,
    category: 'Resume Improvement',
    question: 'Can I improve my resume using AI ATS?',
    answer:
      'The platform provides resume-building and improvement tools to help you present your skills, education, and experience more clearly and format your resume for modern applicant tracking systems.',
  },
  {
    id: 5,
    category: 'Job Search',
    question: 'Can I explore jobs and apply through the platform?',
    answer:
      'Yes, candidates can search and explore active job postings, view role requirements, and submit applications directly through the candidate portal using their saved resume profile.',
  },
  {
    id: 6,
    category: 'For Recruiters',
    question: 'How do recruiters use AI ATS?',
    answer:
      'Recruiters use the platform to manage job postings, review incoming candidate applications, and organize their hiring pipeline efficiently within a dedicated recruiter dashboard.',
  },
  {
    id: 7,
    category: 'Resume Studio',
    question: 'How do I create a new resume?',
    answer:
      'You can create a new resume from scratch using our built-in Resume Studio, choosing an ATS-optimized template and filling out your personal details, experience, education, and skills step by step.',
  },
  {
    id: 8,
    category: 'Resume Editor',
    question: 'Can I edit my resume after saving it?',
    answer:
      'Yes, all saved resumes in your candidate workspace can be reopened, edited, and updated at any time in the interactive resume editor.',
  },
  {
    id: 9,
    category: 'Resume Export',
    question: 'Can I download my resume?',
    answer:
      'Yes, you can export and download your finalized resumes in standard PDF format for job applications.',
  },
  {
    id: 10,
    category: 'Recruiter Registration',
    question: 'How do I register as a recruiter?',
    answer:
      'You can register via the Recruiter portal with your company information and professional credentials to begin setting up your organization\'s recruitment workspace.',
  },
  {
    id: 11,
    category: 'Verification',
    question: 'Why does a recruiter account need verification?',
    answer:
      'Recruiter verification ensures only legitimate employers and talent acquisition teams can publish job openings and review candidate applications, protecting our community from unauthorized postings.',
  },
  {
    id: 12,
    category: 'Application Tracking',
    question: 'How can I track my job applications?',
    answer:
      'In your Candidate Dashboard under Applications, you can monitor the live review status of every position you have applied for, from submission to shortlisting.',
  },
  {
    id: 13,
    category: 'Job Application',
    question: 'How do I apply for a job?',
    answer:
      'Browse the Explore Jobs page, select any active job listing, review the job requirements, and click Apply Now using your active primary resume.',
  },
  {
    id: 14,
    category: 'Job Management',
    question: 'Can I manage multiple job postings?',
    answer:
      'Yes, verified recruiters can create, publish, edit, monitor, and close multiple job postings simultaneously from their Recruiter Dashboard.',
  },
  {
    id: 15,
    category: 'Candidate Portal',
    question: 'How do I access my candidate dashboard?',
    answer:
      'Sign in with your candidate account credentials and click Dashboard in the navigation or switch to Candidate view to access your resumes, applications, and saved jobs.',
  },
  {
    id: 16,
    category: 'Troubleshooting',
    question: 'What should I do if I cannot upload my resume?',
    answer:
      'Ensure your file is in a supported format (.pdf, .doc, or .docx) and does not exceed the 2 MB size limit. If the issue persists, verify your internet connection or report the issue using our Feedback widget.',
  },
  {
    id: 17,
    category: 'Support & Feedback',
    question: 'How can I contact support or report a problem?',
    answer:
      'You can click the floating Report Issue / Feedback button located in the bottom-right corner of any page to submit bug reports, suggestions, or questions directly to our team.',
  },
];

const INITIAL_VISIBLE_COUNT = 6;
const STEP_COUNT = 6;

export const FAQ: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  const toggleQuestion = (idx: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + STEP_COUNT, faqs.length));
  };

  const handleShowFewer = () => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    // Reset expansion state for questions that become hidden beyond initial six
    setExpandedIds((prev) => {
      const next = new Set<number>();
      prev.forEach((id) => {
        if (id < INITIAL_VISIBLE_COUNT) {
          next.add(id);
        }
      });
      return next;
    });
    // Smooth scroll back to FAQ heading
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const visibleFaqs = faqs.slice(0, visibleCount);
  const hasMore = visibleCount < faqs.length;
  const isExpandedBeyondInitial = visibleCount > INITIAL_VISIBLE_COUNT;

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-20 space-y-10 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
      aria-label="Frequently Asked Questions"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="primary" className="shadow-glow uppercase font-mono tracking-wider text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 mr-1 text-indigo-400" />
          NEED HELP?
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
          Simple answers to help you get started with AI ATS.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {visibleFaqs.map((faq, idx) => {
          const isOpen = expandedIds.has(idx);
          const questionId = `faq-question-${faq.id}`;
          const answerId = `faq-answer-${faq.id}`;

          return (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min((idx % STEP_COUNT) * 0.04, 0.25) }}
              className={`rounded-2xl transition-all border ${
                isOpen
                  ? 'glass-card-elevated border-indigo-500/50 shadow-glow bg-slate-900/90'
                  : 'glass-card border-slate-800/80 hover:border-slate-700/80 bg-slate-900/60'
              }`}
            >
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggleQuestion(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 rounded-2xl cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 min-w-0 pr-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 w-fit shrink-0">
                    {faq.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-snug group-hover:text-indigo-200 transition-colors">
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isOpen
                      ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-800 bg-slate-900/90 text-slate-400 group-hover:text-white group-hover:border-slate-700'
                  }`}
                  aria-hidden="true"
                >
                  {isOpen ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Show more / Show fewer Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
        {hasMore && (
          <button
            type="button"
            id="faq-show-more-btn"
            onClick={handleShowMore}
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full border border-indigo-500/40 bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/25 transition-transform">
              <Plus className="w-3.5 h-3.5" />
            </span>
            <span>Show more questions</span>
          </button>
        )}

        {isExpandedBeyondInitial && (
          <button
            type="button"
            id="faq-show-fewer-btn"
            onClick={handleShowFewer}
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-slate-300 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:text-slate-200 transition-transform">
              <Minus className="w-3.5 h-3.5" />
            </span>
            <span>Show fewer questions</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default FAQ;
