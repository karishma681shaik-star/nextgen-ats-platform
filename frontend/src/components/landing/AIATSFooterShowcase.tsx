import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Sparkles, CheckCircle2, ChevronRight, Download, Edit3, Sliders, MessageSquare, Phone, Mail, Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

export const AIATSFooterShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll progress for the entire 350vh section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ── SCROLL-LINKED TRANSFORMS ──

  // 1. Headline & Subtitle (Screenshots 2 & 3)
  const titleOpacity = useTransform(scrollYProgress, [0.0, 0.12, 0.48, 0.64], [1, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0.0, 0.4, 0.64], [0, -4, -10]);

  // 2. Daytime Blue Sky & Clouds Background (Cross-fade from soft lavender into sky)
  const skyOpacity = useTransform(scrollYProgress, [0.25, 0.54], [0, 1]);

  // 3. Laptop visual anchor (Screenshot 1 -> 2 -> 3)
  const laptopScale = useTransform(scrollYProgress, [0.0, 0.35, 0.55], [1, 0.98, 0.94]);
  const laptopY = useTransform(scrollYProgress, [0.0, 0.35, 0.55], [10, 25, 45]);
  const laptopOpacity = useTransform(scrollYProgress, [0.30, 0.54], [1, 0]);

  // 4. Emerging Resume Document (Screenshots 1 -> 2 -> 3 -> 4)
  const resumeX = useTransform(scrollYProgress, [0.15, 0.54], [48, 0]);
  const resumeY = useTransform(scrollYProgress, [0.15, 0.56], [-38, 30]);
  const resumeScale = useTransform(scrollYProgress, [0.15, 0.56], [0.29, 0.94]);
  const resumeShadow = useTransform(
    scrollYProgress,
    [0.15, 0.38, 0.60],
    [
      '0 2px 6px rgba(0, 0, 0, 0.15)',
      '0 18px 45px -10px rgba(0, 0, 0, 0.30), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      '0 32px 75px -15px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(0, 0, 0, 0.08)',
    ]
  );

  // 5. Realistic Human Hands (Screenshot 4)
  const handsY = useTransform(scrollYProgress, [0.54, 0.68], [90, 0]);
  const handsOpacity = useTransform(scrollYProgress, [0.54, 0.66], [0, 1]);

  // 6. "SHORTLISTED" Stamp Overlay (Screenshot 4)
  const stampOpacity = useTransform(scrollYProgress, [0.68, 0.76], [0, 1]);
  const stampScale = useTransform(scrollYProgress, [0.68, 0.75, 0.80], [0.3, 1.15, 1.0]);

  // Reduced motion fallback
  if (shouldReduceMotion) {
    return (
      <div className="relative py-20 bg-gradient-to-b from-slate-900 via-indigo-950 to-white text-slate-800 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Crafted with care, shared with confidence.
          </h2>
          <p className="text-lg text-slate-600 mt-2 font-medium">
            Let your resume do the talking.
          </p>
        </div>
        <div className="relative flex justify-center items-center px-4">
          <div className="relative w-full max-w-[420px] aspect-[1/1.414] shadow-2xl rounded-[2px] border border-slate-300 bg-white p-3 sm:p-4">
            <AlexRiveraResumeContent />
            <div className="absolute bottom-10 right-4 pointer-events-none">
              <ShortlistedStamp />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[350vh] bg-[#f8f9ff]"
      aria-label="Interactive Resume Showcase"
    >
      {/* ── STICKY VIEWPORT STAGE ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center select-none">
        
        {/* Soft Lavender to White Ambient Environment */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'linear-gradient(180deg, #070b18 0%, #11162d 10%, #ede9fe 30%, #f8f7ff 60%, #ffffff 100%)',
          }}
        />

        {/* Photorealistic Blue Sky & Soft White Clouds Layer */}
        <motion.div
          style={{ opacity: skyOpacity }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img
            src="/assets/footer-sky-clouds.jpg"
            alt="Clear blue sky with soft white clouds"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* ── SECTION HEADLINE ── */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="absolute top-5 sm:top-7 md:top-9 z-25 text-center px-4 max-w-3xl mx-auto pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md border border-indigo-200/60 shadow-sm text-indigo-700 text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>AI ATS Presentation Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 font-display drop-shadow-sm">
            Crafted with care, shared with confidence.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-700 mt-1 font-medium tracking-tight">
            Let your resume do the talking.
          </p>
        </motion.div>

        {/* ── MAIN STAGE: LAPTOP + EMERGING RESUME + HANDS ── */}
        <div className="relative w-full max-w-4xl h-[560px] sm:h-[610px] md:h-[650px] flex items-center justify-center z-10 px-4">
          
          {/* 1. LAPTOP ANCHOR */}
          <motion.div
            style={{
              scale: laptopScale,
              y: laptopY,
              opacity: laptopOpacity,
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="relative w-full max-w-[700px] sm:max-w-[780px] md:max-w-[850px] aspect-[1376/768]">
              {/* Inside Display Screen: AI ATS Resume Editor Interface */}
              <div
                className="absolute overflow-hidden rounded-t-[7px] bg-[#0c1021] border border-slate-800"
                style={{
                  top: '13.8%',
                  left: '27.7%',
                  width: '44.7%',
                  height: '48.7%',
                }}
              >
                {/* AI ATS Editor Top Bar */}
                <div className="h-6 sm:h-7 bg-[#141933] border-b border-indigo-900/40 px-2 sm:px-2.5 flex items-center justify-between text-[8px] sm:text-[9.5px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-[7px]">
                      AI
                    </div>
                    <span className="font-semibold text-white tracking-tight hidden sm:inline">
                      AI ATS Studio
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[7px] font-bold border border-emerald-500/30 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2 h-2 text-emerald-400" />
                      98 ATS
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600/40 text-indigo-200 text-[7px] font-medium border border-indigo-500/40 flex items-center gap-0.5">
                      <Edit3 className="w-2 h-2" /> Edit
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[7px] font-medium hidden sm:inline-flex items-center gap-0.5">
                      <Sliders className="w-2 h-2" /> Theme
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[7px] font-medium hidden sm:inline-flex items-center gap-0.5">
                      <MessageSquare className="w-2 h-2" /> AI Chat
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[7px] font-bold flex items-center gap-0.5">
                      <Download className="w-2 h-2" /> PDF
                    </span>
                  </div>
                </div>

                {/* Editor Workspace: Left Sections Accordion + Canvas */}
                <div className="relative h-full flex bg-[#090d1a] overflow-hidden">
                  <div className="w-24 sm:w-28 border-r border-slate-800/80 bg-[#0e1326] p-1.5 space-y-1 text-[7px] sm:text-[8px] text-slate-400">
                    <div className="text-[6.5px] uppercase font-mono font-bold text-indigo-400 px-1 py-0.5">
                      Sections
                    </div>
                    <div className="p-1 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 font-medium flex items-center justify-between">
                      <span>Personal Info</span>
                      <ChevronRight className="w-2 h-2 text-indigo-400" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/40 text-slate-300 font-medium flex items-center justify-between">
                      <span>Experience (2)</span>
                      <ChevronRight className="w-2 h-2 text-slate-500" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/40 text-slate-300 font-medium flex items-center justify-between">
                      <span>Education (1)</span>
                      <ChevronRight className="w-2 h-2 text-slate-500" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/40 text-slate-300 font-medium flex items-center justify-between">
                      <span>Skills & Tech</span>
                      <ChevronRight className="w-2 h-2 text-slate-500" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/40 text-slate-300 font-medium flex items-center justify-between">
                      <span>Key Projects</span>
                      <ChevronRight className="w-2 h-2 text-slate-500" />
                    </div>
                  </div>

                  {/* Empty preview placeholder canvas */}
                  <div className="flex-1 bg-[#13182c]/80 flex items-center justify-center p-1 relative overflow-hidden">
                    <div className="w-[110px] sm:w-[125px] aspect-[1/1.414] border border-dashed border-indigo-500/25 rounded-xs bg-slate-900/30 flex flex-col items-center justify-center text-center p-2 text-slate-500">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400/40 mb-1" />
                      <span className="text-[6.5px] font-mono text-indigo-300/50 uppercase">
                        Active Workspace
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Realistic Dark Graphite Laptop Outer Bezel & Keyboard Frame */}
              <img
                src="/assets/laptop-frame.png"
                alt="Front-facing premium dark laptop"
                className="w-full h-full object-contain pointer-events-none drop-shadow-2xl relative z-10"
              />
            </div>
          </motion.div>

          {/* 2. EMERGING & PRESENTED A4 RESUME (MATCHING IMAGE 2 COMPACT LAYOUT) */}
          <motion.div
            style={{
              x: resumeX,
              y: resumeY,
              scale: resumeScale,
              boxShadow: resumeShadow,
            }}
            className="relative z-30 w-full max-w-[350px] sm:max-w-[390px] md:max-w-[420px] aspect-[1/1.414] bg-white rounded-[2px] border border-slate-300/80 transition-shadow pointer-events-auto"
          >
            {/* The Typeset High-Fidelity A4 Resume */}
            <div className="w-full h-full overflow-hidden p-3 sm:p-3.5 md:p-4 bg-white text-slate-900 select-text flex flex-col justify-start">
              <AlexRiveraResumeContent />
            </div>

            {/* 3. "SHORTLISTED" STAMP OVERLAY */}
            <motion.div
              style={{
                opacity: stampOpacity,
                scale: stampScale,
                rotate: -8,
              }}
              className="absolute bottom-9 right-3 sm:bottom-11 sm:right-5 z-40 pointer-events-none"
            >
              <ShortlistedStamp />
            </motion.div>

            {/* 4. REALISTIC HUMAN HANDS HOLDING RESUME */}
            {/* Left Hand */}
            <motion.div
              style={{
                y: handsY,
                opacity: handsOpacity,
              }}
              className="absolute -bottom-6 sm:-bottom-8 md:-bottom-10 right-[calc(100%-20px)] w-[220px] sm:w-[260px] md:w-[300px] z-50 pointer-events-none"
            >
              <img
                src="/assets/hand-left.png"
                alt="Left hand holding resume edge"
                className="w-full object-contain drop-shadow-xl"
              />
            </motion.div>

            {/* Right Hand */}
            <motion.div
              style={{
                y: handsY,
                opacity: handsOpacity,
              }}
              className="absolute -bottom-6 sm:-bottom-8 md:-bottom-10 left-[calc(100%-20px)] w-[220px] sm:w-[260px] md:w-[300px] z-50 pointer-events-none"
            >
              <img
                src="/assets/hand-right.png"
                alt="Right hand holding resume edge"
                className="w-full object-contain drop-shadow-xl"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Note: "SCROLL TO VIEW EMERGING CANDIDATE DOCUMENT" instruction removed per user instruction */}
      </div>
    </section>
  );
};

// ── COMPACT, INFORMATION-RICH RESUME (MATCHING IMAGE 2 EXACT ARCHITECTURE) ──
const AlexRiveraResumeContent: React.FC = () => {
  return (
    <div className="w-full text-slate-900 leading-tight space-y-1 sm:space-y-1.5 font-sans">
      {/* ── HEADER: CANDIDATE IDENTITY (IMAGE 2 STYLE) ── */}
      <div className="text-center pb-1 border-b border-black">
        <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-wide text-black uppercase font-serif">
          Alex Rivera
        </h1>
        <div className="text-[7.5px] sm:text-[8.5px] text-slate-800 font-medium -mt-0.5">
          Software Engineer
        </div>
        <div className="text-[6px] sm:text-[7px] text-slate-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-0.5 font-sans">
          <span>+91-9876543210</span>
          <span>•</span>
          <span>alex.rivera@internal-aiats.dev</span>
          <span>•</span>
          <span>LinkedIn</span>
          <span>•</span>
          <span>GitHub</span>
          <span>•</span>
          <span>Portfolio</span>
        </div>
      </div>

      {/* ── SECTION 1: EXPERIENCE (IMAGE 2 STYLE) ── */}
      <div>
        <h2 className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1 font-serif">
          Experience
        </h2>

        {/* Role 1 */}
        <div className="space-y-0.5 mb-1">
          <div className="flex justify-between items-baseline text-[7px] sm:text-[8px] font-bold text-black">
            <span>CloudScale Systems</span>
            <span className="font-normal text-[6.5px] sm:text-[7.5px] text-slate-700">Bengaluru, India</span>
          </div>
          <div className="flex justify-between items-baseline text-[6.5px] sm:text-[7.5px] italic text-slate-800">
            <span>Software Developer Intern / Senior Platform Engineer</span>
            <span className="not-italic text-[6px] sm:text-[7px] text-slate-600 font-mono">Jan 2022 – Present</span>
          </div>
          <ul className="list-disc pl-3 text-[6px] sm:text-[7px] text-slate-800 space-y-0.5">
            <li>
              Collaboratively developed a <strong>high-throughput event streaming platform</strong> from ground up, used by thousands of users to handle real-time transaction streams.
            </li>
            <li>
              Spearheaded migration to <strong>Go microservices on Kubernetes</strong>, decreasing latency by <strong>40%</strong> and boosting user engagement by <strong>30%</strong>.
            </li>
            <li>
              Optimized database performance by implementing <strong>distributed Redis caching</strong> and connection pooling, resulting in a <strong>40% improvement in response time</strong>.
            </li>
            <li>
              <strong>Technical Skills:</strong> Go, Kubernetes, Kafka, Redis, AWS (EKS, Lambda), Docker, gRPC, Linux
            </li>
          </ul>
        </div>

        {/* Role 2 */}
        <div className="space-y-0.5">
          <div className="flex justify-between items-baseline text-[7px] sm:text-[8px] font-bold text-black">
            <span>Nexus Distributed Labs</span>
            <span className="font-normal text-[6.5px] sm:text-[7.5px] text-slate-700">Hyderabad, India</span>
          </div>
          <div className="flex justify-between items-baseline text-[6.5px] sm:text-[7.5px] italic text-slate-800">
            <span>Software Engineer II</span>
            <span className="not-italic text-[6px] sm:text-[7px] text-slate-600 font-mono">Jul 2019 – Dec 2021</span>
          </div>
          <ul className="list-disc pl-3 text-[6px] sm:text-[7px] text-slate-800 space-y-0.5">
            <li>
              Engineered high-performance <strong>REST and gRPC API gateways</strong> in Java Spring Boot serving <strong>15M+ daily requests</strong> with zero downtime.
            </li>
            <li>
              Designed multi-region failover across <strong>PostgreSQL clusters</strong>, lowering disaster recovery RTO to <strong>&lt; 45 seconds</strong>.
            </li>
            <li>
              Configured distributed telemetry with <strong>OpenTelemetry & Prometheus</strong>, boosting incident MTTR by <strong>52%</strong>.
            </li>
          </ul>
        </div>
      </div>

      {/* ── SECTION 2: EDUCATION (IMAGE 2 STYLE) ── */}
      <div>
        <h2 className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1 font-serif">
          Education
        </h2>
        <div className="space-y-0.5">
          <div className="flex justify-between items-baseline text-[7px] sm:text-[8px] font-bold text-black">
            <span>Indian Institute of Technology (IIT), Delhi</span>
            <span className="font-normal text-[6.5px] sm:text-[7.5px] text-slate-700">New Delhi, India</span>
          </div>
          <div className="flex justify-between items-baseline text-[6.5px] sm:text-[7.5px] italic text-slate-800">
            <span>Bachelor of Technology in Computer Science & Engineering • <strong>CGPA: 9.20 / 10.0</strong></span>
            <span className="not-italic text-[6px] sm:text-[7px] text-slate-600 font-mono">2015 – 2019</span>
          </div>

          <div className="flex justify-between items-baseline text-[7px] sm:text-[8px] font-bold text-black pt-0.5">
            <span>Delhi Public School, R.K. Puram</span>
            <span className="font-normal text-[6.5px] sm:text-[7.5px] text-slate-700">New Delhi, India</span>
          </div>
          <div className="flex justify-between items-baseline text-[6.5px] sm:text-[7.5px] italic text-slate-800">
            <span>Class 12th Boards - PCM • <strong>Percentage: 96.4%</strong></span>
            <span className="not-italic text-[6px] sm:text-[7px] text-slate-600 font-mono">2013 – 2015</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: PROJECTS (IMAGE 2 STYLE) ── */}
      <div>
        <h2 className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1 font-serif">
          Projects
        </h2>
        <div className="space-y-1">
          {/* Project 1 */}
          <div>
            <div className="text-[6.8px] sm:text-[7.8px] font-bold text-black flex items-center gap-1">
              <span>AstraMesh</span>
              <span className="font-normal text-[6px] sm:text-[7px] text-slate-600">
                | Go, eBPF, gRPC, Docker, Linux Kernel
              </span>
            </div>
            <ul className="list-disc pl-3 text-[6px] sm:text-[7px] text-slate-800 space-y-0.5">
              <li>
                Developed a feature-rich <strong>distributed service proxy</strong> supporting dynamic load balancing, circuit breaking, and mTLS security with sub-millisecond overhead.
              </li>
              <li>
                Implemented zero-copy socket filtering using <strong>eBPF kernels</strong>, improving throughput by <strong>35%</strong>; starred by <strong>1,200+ developers</strong> on GitHub.
              </li>
            </ul>
          </div>

          {/* Project 2 */}
          <div>
            <div className="text-[6.8px] sm:text-[7.8px] font-bold text-black flex items-center gap-1">
              <span>ChronoStream</span>
              <span className="font-normal text-[6px] sm:text-[7px] text-slate-600">
                | Rust, RocksDB, Raft Consensus, REST
              </span>
            </div>
            <ul className="list-disc pl-3 text-[6px] sm:text-[7px] text-slate-800 space-y-0.5">
              <li>
                Engineered an append-only <strong>time-series storage engine</strong> handling <strong>500K metrics/sec</strong> with background LSM compaction and compression.
              </li>
              <li>
                Built multi-node consensus via <strong>Raft protocol</strong> ensuring 100% data consistency across distributed simulated network partitions.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: SKILLS (IMAGE 2 STYLE) ── */}
      <div>
        <h2 className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-0.5 font-serif">
          Skills
        </h2>
        <div className="text-[6px] sm:text-[7px] text-slate-800 space-y-0.5">
          <div>
            <strong>Languages:</strong> Go, Java, C++, TypeScript, Python, SQL, Rust, Bash
          </div>
          <div>
            <strong>Technologies & Frameworks:</strong> Kubernetes, Docker, Spring Boot, Kafka, Redis, AWS (EKS, Lambda), Terraform, PostgreSQL, gRPC
          </div>
        </div>
      </div>

      {/* ── SECTION 5: CODING PROFILES (IMAGE 2 STYLE) ── */}
      <div>
        <h2 className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-0.5 font-serif">
          Coding Profiles
        </h2>
        <div className="text-[6px] sm:text-[7px] text-slate-800 space-y-0.5">
          <div className="flex items-baseline gap-1">
            <strong className="text-black">LeetCode - alexrivera</strong>
            <span className="text-slate-600">| Highest Rating - <strong>2240</strong>, Guardian</span>
          </div>
          <ul className="list-disc pl-3 text-[5.8px] sm:text-[6.8px] text-slate-700">
            <li>Secured <strong>140th global rank</strong> and <strong>24th all-India rank</strong> out of 28k participants in Biweekly Contest.</li>
          </ul>

          <div className="flex items-baseline gap-1 pt-0.5">
            <strong className="text-black">Codeforces - alexrivera_cloud</strong>
            <span className="text-slate-600">| Highest Rating - <strong>1720</strong>, Expert</span>
          </div>
          <ul className="list-disc pl-3 text-[5.8px] sm:text-[6.8px] text-slate-700">
            <li>Secured <strong>top 1.5% global rank</strong> out of 35k participants in Educational Round.</li>
          </ul>
        </div>
      </div>

      {/* ── SECTION 6: AWARDS & ACHIEVEMENTS (IMAGE 2 STYLE) ── */}
      <div>
        <h2 className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-0.5 font-serif">
          Awards & Achievements
        </h2>
        <ul className="list-disc pl-3 text-[6px] sm:text-[7px] text-slate-800 space-y-0.5">
          <li>
            <strong>Winner of Smart India Hackathon / National Cloud Challenge 2021</strong>, developed distributed proctored telemetry system.
          </li>
          <li>
            <strong>AWS Certified Solutions Architect – Professional</strong> & <strong>Certified Kubernetes Administrator (CKA)</strong>.
          </li>
          <li>
            Achieved <strong>1st Rank</strong> in university computer engineering cohort during 3rd year (2018).
          </li>
        </ul>
      </div>
    </div>
  );
};

// ── "SHORTLISTED" STAMP COMPONENT (SCREENSHOT 4) ──
const ShortlistedStamp: React.FC = () => {
  return (
    <div
      className="relative select-none flex items-center justify-center p-1"
      style={{
        filter: 'drop-shadow(0 4px 8px rgba(4, 120, 87, 0.35))',
      }}
    >
      <svg
        width="136"
        height="84"
        viewBox="0 0 160 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform -rotate-6"
      >
        {/* Outer Circular Stamp Ring */}
        <ellipse
          cx="80"
          cy="50"
          rx="72"
          ry="44"
          stroke="#047857"
          strokeWidth="3.8"
          strokeDasharray="6 2"
          opacity="0.95"
        />
        {/* Inner Concentric Ring */}
        <ellipse
          cx="80"
          cy="50"
          rx="65"
          ry="37"
          stroke="#059669"
          strokeWidth="1.8"
          opacity="0.92"
        />

        {/* 3 Stars at the Top */}
        <g fill="#047857" opacity="0.95">
          {/* Center Star */}
          <path d="M 80 18 L 82.5 24 L 88.5 24.5 L 84 28.5 L 85.5 34.5 L 80 31 L 74.5 34.5 L 76 28.5 L 71.5 24.5 L 77.5 24 Z" />
          {/* Left Star */}
          <path d="M 62 23 L 64 27.5 L 68.5 28 L 65 31 L 66 35.5 L 62 33 L 58 35.5 L 59 31 L 55.5 28 L 60 27.5 Z" />
          {/* Right Star */}
          <path d="M 98 23 L 100 27.5 L 104.5 28 L 101 31 L 102 35.5 L 98 33 L 94 35.5 L 95 31 L 91.5 28 L 96 27.5 Z" />
        </g>

        {/* Shortlisted Main Banner */}
        <rect
          x="10"
          y="41"
          width="140"
          height="29"
          rx="3"
          fill="#047857"
          opacity="0.96"
        />
        <text
          x="80"
          y="62"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Outfit, sans-serif"
          fontWeight="900"
          fontSize="17.5"
          letterSpacing="1.8"
        >
          SHORTLISTED
        </text>

        {/* Bottom Micro Stamp verification text */}
        <text
          x="80"
          y="81"
          textAnchor="middle"
          fill="#047857"
          fontFamily="monospace"
          fontWeight="800"
          fontSize="7.2"
          letterSpacing="2.2"
          opacity="0.95"
        >
          AI ATS VERIFIED ★ QUALIFIED
        </text>
      </svg>
    </div>
  );
};
