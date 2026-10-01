import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Scoring Engine',
    question: 'How does the AI ATS scoring engine calculate candidate match percentages?',
    answer:
      'The ATS engine evaluates resumes across five core vectors: semantic technical skills matching (NLP taxonomy of 4,000+ technical terms), chronological experience depth, accredited education alignment, keyword density against specific Job Descriptions (JDs), and formatting readability (eliminating parsing traps like invisible tables or nested graphics).',
  },
  {
    category: 'Recruiter Workflow',
    question: 'Can recruiters manage multiple job requisitions and candidate pipelines simultaneously?',
    answer:
      'Yes. Recruiters get a dedicated Kanban and list-based pipeline with 1-click status transitions (Applied, Under Review, Shortlisted, Interview, Selected, Rejected) and automated ATS ranking so top applicants always rise to the top of every requisition.',
  },
  {
    category: 'Architecture',
    question: 'How is data persisted in this Phase 1 frontend version?',
    answer:
      'All candidate profiles, resume parses, ATS scores, job postings, and recruiter pipeline transitions are maintained via a modular mock service layer with localStorage persistence, preparing the exact interfaces for Spring Boot REST endpoints in Phase 2.',
  },
  {
    category: 'Role Switcher',
    question: 'Is there a public demo of all three personas (Candidate, Recruiter, Admin)?',
    answer:
      'Yes! Use the Role Switcher pill in the top navigation bar to seamlessly toggle between Candidate, Recruiter, and Admin dashboards without having to log in and out repeatedly.',
  },
  {
    category: 'Format Support',
    question: 'What document formats are supported for resume parsing?',
    answer:
      'The platform supports standard PDF, Microsoft Word (.docx), and plain text (.txt) documents. Our parser normalizes document layout and extracts contact information, work timelines, skills, and educational milestones.',
  },
];

export const FAQ: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setActiveIdx(activeIdx === idx ? null : idx);
  };

  return (
    <section className="py-16 space-y-10 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="primary" className="shadow-glow">
          <HelpCircle className="w-3.5 h-3.5 mr-1 text-indigo-400" />
          Clear Answers
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Everything you need to know about the AI ATS engine, scoring mechanics, and platform workflows.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = activeIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`rounded-2xl transition-all border ${
                isOpen
                  ? 'glass-card-elevated border-indigo-500/50 shadow-glow'
                  : 'glass-card border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 hidden sm:inline-block">
                    {faq.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-indigo-400 border-indigo-500/40 bg-indigo-500/10' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
