import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

export const ResumeBannerGraphic: React.FC = () => {
  return (
    <div className="relative shrink-0 flex items-center justify-center select-none w-[285px] sm:w-[315px] h-[195px] sm:h-[210px]">
      {/* ── Left Resume Sheet (Behind, slightly tilted with AI Parsing Callout) ── */}
      <div
        className="absolute left-1 sm:left-2 top-2 sm:top-2.5 w-[160px] sm:w-[174px] h-[184px] sm:h-[198px] bg-white rounded-[2px] border border-slate-300 shadow-[0_6px_22px_rgba(0,0,0,0.48)] p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden"
        style={{ transform: 'rotate(-3deg)', transformOrigin: 'bottom left' }}
      >
        <div className="space-y-1.5 font-sans">
          {/* Header */}
          <div className="text-center pb-1 border-b border-black">
            <div className="text-[10px] sm:text-[11px] font-black tracking-widest text-black uppercase font-serif leading-none">
              JAMES CLARKE
            </div>
            <div className="text-[4.5px] sm:text-[5px] text-slate-600 tracking-tight mt-0.5 leading-none">
              Austin, TX • james.clarke@email.com • (512) 555-0198 • linkedin.com/in/jamesclarke
            </div>
          </div>

          {/* Profile / Summary Section */}
          <div>
            <div className="border-b border-black pb-0.5 mb-1">
              <span className="text-[5.5px] sm:text-[6px] font-bold text-black uppercase font-serif tracking-wide">
                SUMMARY
              </span>
            </div>
            <p className="text-[4.2px] sm:text-[4.6px] text-slate-700 leading-relaxed">
              Results-driven Senior Software Engineer with 6+ years of expertise in architecting high-throughput distributed systems, optimizing backend pipelines, and modernizing cloud infrastructure.
            </p>
          </div>

          {/* Skills Section */}
          <div>
            <div className="border-b border-black pb-0.5 mb-1">
              <span className="text-[5.5px] sm:text-[6px] font-bold text-black uppercase font-serif tracking-wide">
                TECHNICAL SKILLS
              </span>
            </div>
            <p className="text-[4.2px] sm:text-[4.6px] text-slate-700 leading-tight">
              <span className="font-semibold text-black">Languages:</span> Java, Python, TypeScript, SQL, Go<br />
              <span className="font-semibold text-black">Frameworks:</span> Spring Boot, React, Node.js, Next.js<br />
              <span className="font-semibold text-black">Cloud & DevOps:</span> AWS (ECS, S3, RDS), Docker, Kubernetes
            </p>
          </div>

          {/* Awards / Highlights Mini Box */}
          <div className="p-1 rounded bg-slate-50 border border-slate-200">
            <div className="text-[4.8px] font-bold text-slate-900 font-serif">HONORS & AWARDS</div>
            <div className="text-[4.2px] text-slate-600">AWS Certified Solutions Architect • Dean's Honors List</div>
          </div>
        </div>

        {/* ── Image 1 AI Parsing Callout Box (Bottom Left of Left Sheet) ── */}
        <div className="rounded-lg p-2 bg-gradient-to-br from-purple-100/95 via-violet-50/95 to-pink-100/95 border border-purple-300 shadow-[0_4px_14px_rgba(168,85,247,0.22)] space-y-1 mt-auto">
          <div className="flex items-center gap-1 text-purple-900">
            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
            <span className="text-[6px] sm:text-[6.5px] font-black uppercase tracking-wide">Parsing</span>
          </div>
          <p className="text-[4.2px] sm:text-[4.6px] text-purple-950/80 leading-snug">
            An ATS parser extracts text, skills, and work history. Well-structured headings and clean bullet points ensure 100% extraction accuracy with zero formatting errors.
          </p>
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-rose-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[4.5px] sm:text-[5px] font-bold text-rose-600 tracking-tight">Report missing information</span>
          </div>
        </div>
      </div>

      {/* ── Right Resume Sheet (Foreground: Harvard ATS Standard Gold Standard) ── */}
      <div
        className="absolute right-1 sm:right-2 top-0.5 sm:top-1 w-[172px] sm:w-[188px] h-[194px] sm:h-[208px] bg-white rounded-[2px] border border-slate-400 shadow-[-9px_0_26px_rgba(0,0,0,0.30),0_12px_36px_rgba(0,0,0,0.58)] p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden z-10"
      >
        <div className="space-y-1.5 font-serif text-black">
          {/* Header */}
          <div className="text-center pb-1">
            <div className="text-[11px] sm:text-[12px] font-black tracking-normal text-black leading-tight">
              Firstname Lastname
            </div>
            <div className="text-[4.4px] sm:text-[4.8px] text-slate-800 tracking-tight leading-none mt-0.5 font-sans">
              Street, City, State • (123) 456-7890 • email@example.com • linkedin.com/in/profile
            </div>
          </div>

          {/* ── Section: EDUCATION ── */}
          <div className="space-y-0.5">
            <div className="border-b border-black pb-0.5 flex items-baseline justify-between">
              <span className="text-[6.2px] sm:text-[6.8px] font-bold uppercase tracking-wide">
                EDUCATION
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[5.4px] sm:text-[5.8px] font-bold">
                <span>HARVARD UNIVERSITY</span>
                <span className="font-normal font-sans text-[4.6px]">Cambridge, MA</span>
              </div>
              <div className="flex items-center justify-between text-[4.8px] sm:text-[5.2px] italic">
                <span>Master of Engineering; GPA: 3.9/4.0 (Optional)</span>
                <span className="font-normal font-sans text-[4.5px]">Graduation Date</span>
              </div>
              <div className="text-[4.2px] sm:text-[4.5px] text-slate-700 font-sans leading-tight">
                Relevant Coursework: Advanced Algorithms, Distributed Systems, Machine Learning
              </div>
            </div>

            <div className="pt-0.5">
              <div className="flex items-center justify-between text-[5.2px] sm:text-[5.6px] font-bold">
                <span>STATE UNIVERSITY OF NEW YORK</span>
                <span className="font-normal font-sans text-[4.6px]">City, Country</span>
              </div>
              <div className="flex items-center justify-between text-[4.8px] sm:text-[5.2px] italic">
                <span>Bachelor of Science in Computer Science</span>
                <span className="font-normal font-sans text-[4.5px]">Month Year – Month Year</span>
              </div>
            </div>
          </div>

          {/* ── Section: EXPERIENCE ── */}
          <div className="space-y-0.5">
            <div className="border-b border-black pb-0.5 flex items-baseline justify-between">
              <span className="text-[6.2px] sm:text-[6.8px] font-bold uppercase tracking-wide">
                EXPERIENCE
              </span>
            </div>

            {/* Job 1 */}
            <div>
              <div className="flex items-center justify-between text-[5.4px] sm:text-[5.8px] font-bold">
                <span>ORGANIZATION</span>
                <span className="font-normal font-sans text-[4.6px]">City, State (or Remote)</span>
              </div>
              <div className="flex items-center justify-between text-[4.8px] sm:text-[5.2px] italic">
                <span>Position Title</span>
                <span className="font-normal font-sans text-[4.5px]">Month Year – Present</span>
              </div>
              <div className="pl-1.5 space-y-0.5 font-sans text-[4.2px] sm:text-[4.6px] text-slate-800 leading-tight mt-0.5">
                <div>• Beginning with action verb, describe what you did, the tools used and the impact of your work (e.g. leading to X% increase in efficiency).</div>
                <div>• Add metrics and numbers where possible to quantify results and demonstrate value.</div>
                <div>• Bullet point description of technical accomplishments...</div>
              </div>
            </div>

            {/* Job 2 */}
            <div className="pt-0.5">
              <div className="flex items-center justify-between text-[5.4px] sm:text-[5.8px] font-bold">
                <span>ORGANIZATION</span>
                <span className="font-normal font-sans text-[4.6px]">City, State (or Remote)</span>
              </div>
              <div className="flex items-center justify-between text-[4.8px] sm:text-[5.2px] italic">
                <span>Position Title</span>
                <span className="font-normal font-sans text-[4.5px]">Month Year – Month Year</span>
              </div>
              <div className="pl-1.5 space-y-0.5 font-sans text-[4.2px] sm:text-[4.6px] text-slate-800 leading-tight mt-0.5">
                <div>• Beginning with action verb, describe what you did, the tools used and the impact of your work.</div>
                <div>• Add metrics and numbers where possible to quantify results and demonstrate value.</div>
              </div>
            </div>
          </div>

          {/* ── Section: LEADERSHIP & ACTIVITIES ── */}
          <div className="space-y-0.5">
            <div className="border-b border-black pb-0.5 flex items-baseline justify-between">
              <span className="text-[6.2px] sm:text-[6.8px] font-bold uppercase tracking-wide">
                LEADERSHIP & ACTIVITIES
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between text-[5.4px] sm:text-[5.8px] font-bold">
                <span>ORGANIZATION</span>
                <span className="font-normal font-sans text-[4.6px]">City, State (or Remote)</span>
              </div>
              <div className="flex items-center justify-between text-[4.8px] sm:text-[5.2px] italic">
                <span>Role</span>
                <span className="font-normal font-sans text-[4.5px]">Month Year – Month Year</span>
              </div>
              <div className="pl-1.5 font-sans text-[4.2px] sm:text-[4.6px] text-slate-800 leading-tight">
                <div>• Description line highlighting team leadership and project delivery...</div>
              </div>
            </div>
          </div>

          {/* ── Section: SKILLS & INTERESTS ── */}
          <div className="space-y-0.5">
            <div className="border-b border-black pb-0.5">
              <span className="text-[6.2px] sm:text-[6.8px] font-bold uppercase tracking-wide">
                SKILLS & INTERESTS
              </span>
            </div>
            <div className="font-sans text-[4.2px] sm:text-[4.5px] text-slate-800 leading-tight">
              <span className="font-semibold text-black">Technical:</span> Python, Java, React, SQL, AWS, Kubernetes, Distributed Systems
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

