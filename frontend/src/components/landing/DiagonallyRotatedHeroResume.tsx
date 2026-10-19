import React from 'react';
import { motion } from 'framer-motion';

// Recognizable tech companies for the marquee
const COMPANIES = [
  {
    name: 'Google',
    logo: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
    ),
  },
  {
    name: 'Microsoft',
    logo: (
      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z" />
      </svg>
    ),
  },
  {
    name: 'Amazon',
    logo: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M13.957 10.906c0-1.465-.084-2.695-1.503-2.695-1.391 0-1.78 1.172-1.78 2.695v3.914c0 1.57.447 2.668 1.78 2.668 1.363 0 1.503-1.309 1.503-2.732v-3.85zm-4.743 4.148c0-2.828 1.199-6.301 4.551-6.301 2.371 0 3.32 1.363 3.543 2.453h.055V9.062h3.047v10.742h-2.937v-1.883h-.055c-.754 1.254-2.039 2.129-3.793 2.129-3.137 0-4.41-2.672-4.41-4.996zm14.164 5.371c-3.109 1.418-6.91 2.152-10.793 2.152-5.457 0-10.367-1.777-12.578-4.527-.168-.223-.023-.527.246-.426 3.164 1.145 6.883 1.797 10.684 1.797 3.52 0 7.371-.629 10.742-1.996.387-.16.656.246.246.523l1.453-.523z" />
      </svg>
    ),
  },
  {
    name: 'Adobe',
    logo: (
      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M13.966 22h10.034l-9.333-22h-6.701l6 22zm-7.932-22h-6.034l9.333 22h6.701l-10-22zm3.966 13.915l2.427 5.745h-4.854l2.427-5.745z" />
      </svg>
    ),
  },
  {
    name: 'Stripe',
    logo: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.652.703 15.364.3 12.568.3 6.942.3 3.125 3.23 3.125 8.286c0 6.643 9.162 5.568 9.162 8.435 0 .983-.807 1.485-2.227 1.485-2.518 0-5.467-1.127-7.23-2.148l-.946 5.64C3.896 22.84 6.772 23.7 10.024 23.7c5.85 0 9.873-2.88 9.873-8.082 0-7.05-5.92-6.468-5.92-6.468z" />
      </svg>
    ),
  },
  {
    name: 'Uber',
    logo: (
      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.8c3.976 0 7.2 3.224 7.2 7.2s-3.224 7.2-7.2 7.2-7.2-3.224-7.2-7.2 3.224-7.2 7.2-7.2zm-2.4 3.6v7.2h4.8V8.4H9.6z" />
      </svg>
    ),
  },
  {
    name: 'Coinbase',
    logo: (
      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.8a7.2 7.2 0 1 1 0 14.4 7.2 7.2 0 0 1 0-14.4zm-2.4 4.8a2.4 2.4 0 1 0 0 4.8h4.8a2.4 2.4 0 1 0 0-4.8H9.6z" />
      </svg>
    ),
  },
  {
    name: 'Atlassian',
    logo: (
      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M11.53 2c-.37 0-.72.19-.91.52L5.13 12.18c-.37.66.1 1.48.86 1.48h6.29c.41 0 .75-.34.75-.75V2.75c0-.41-.34-.75-.75-.75h-.75zm.94 8.34v10.91c0 .41.34.75.75.75h.75c.37 0 .72-.19.91-.52l5.49-9.66c.37-.66-.1-1.48-.86-1.48h-6.29c-.41 0-.75.34-.75.75z" />
      </svg>
    ),
  },
  {
    name: 'NVIDIA',
    logo: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M8.947 7.747c-.208.067-.534.22-.724.341l-.345.22-.055 3.692-.054 3.693.308.232c.394.298 1.05.518 1.637.549 1.15.061 2.274-.32 3.067-1.038.56-.507.904-1.168.995-1.916.036-.301.036-.888 0-1.189-.148-1.218-.946-2.18-2.182-2.628-.686-.248-1.986-.24-2.647.042zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.896 17.525c-1.492 1.054-3.414 1.543-5.323 1.353-1.634-.162-3.15-.916-4.218-2.094l-.328-.363v-8.842l.328-.363c1.068-1.178 2.584-1.932 4.218-2.094 1.909-.19 3.831.299 5.323 1.353.473.334.896.72 1.258 1.147l-.936.936c-.282-.323-.608-.619-.972-.876-1.183-.837-2.709-1.225-4.223-1.074-1.297.129-2.5 1.733-3.348 1.668l-.26.288v6.796l.26.288c.848.935 2.051 1.539 3.348 1.668 1.514.151 3.04-.237 4.223-1.074.364-.257.69-.553.972-.876l.936.936c-.362.427-.785.813-1.258 1.147z" />
      </svg>
    ),
  },
  {
    name: 'Salesforce',
    logo: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M10.15 4.35a5.55 5.55 0 0 1 5.35 3.75 4.4 4.4 0 0 1 3.35 1.5 4.3 4.3 0 0 1 1 3.6 4.3 4.3 0 0 1-2.85 3.3 5 5 0 0 1-2.1.2H6.9a5.3 5.3 0 0 1-3.75-1.55 5.3 5.3 0 0 1-1.55-3.75 5.3 5.3 0 0 1 2.3-4.4 5.55 5.55 0 0 1 6.25-2.65z" />
      </svg>
    ),
  },
];

export const DiagonallyRotatedHeroResume: React.FC = () => {
  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-1">
      {/* 1. Subtle Atmospheric Radial Ambient Glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[520px] h-[420px] sm:h-[520px] rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -top-12 -right-8 w-[280px] h-[280px] rounded-full bg-purple-600/15 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. THE HIGH-DENSITY DIAGONAL RESUME VISUAL (Following Reference Image 2) */}
      <div className="relative z-10 w-full flex justify-center items-center py-2 overflow-visible">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: 22 }}
          animate={{ opacity: 1, scale: 1, rotate: 28 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ rotate: 26, scale: 1.012 }}
          className="relative origin-center transition-transform duration-500 ease-out cursor-default"
          style={{
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 25px 45px rgba(0, 0, 0, 0.7)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.35))',
          }}
        >
          {/* Subtle paper stack layer for authentic physical document depth */}
          <div
            className="absolute inset-0 bg-slate-200/70 rounded-[3px] translate-x-2 translate-y-2.5 -z-10 border border-slate-300/40 shadow-sm"
            aria-hidden="true"
          />

          {/* Genuine Ivy-League / Stanford LaTeX Standard White A4 Resume Document */}
          <article
            className="w-[325px] xs:w-[355px] sm:w-[385px] md:w-[410px] lg:w-[430px] h-[520px] xs:h-[560px] sm:h-[610px] md:h-[650px] lg:h-[685px] bg-white text-[#111827] rounded-[3px] border border-slate-300/80 shadow-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-between overflow-hidden font-serif select-text"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.95), 0 20px 45px -15px rgba(0, 0, 0, 0.75)',
            }}
          >
            {/* Header: Classic Centered LaTeX Resume Heading */}
            <header className="text-center pb-1.5 border-b-2 border-black/90">
              <h1 className="text-base sm:text-lg md:text-xl font-black text-black tracking-wider uppercase font-serif">
                Alex Rivera
              </h1>
              <p className="text-[8.5px] sm:text-[9.5px] font-semibold text-slate-800 tracking-wide mt-0.5 font-sans">
                Senior Software Engineer | Backend & Distributed Systems
              </p>
              {/* Contact Information Row */}
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[7px] sm:text-[7.8px] md:text-[8.2px] text-slate-700 font-sans">
                <span>+91 90000 12345</span>
                <span>•</span>
                <span>alex.rivera@example.com</span>
                <span>•</span>
                <span className="font-medium text-slate-900">linkedin.com/in/alex-rivera</span>
                <span>•</span>
                <span className="font-medium text-slate-900">github.com/alexrivera</span>
                <span>•</span>
                <span className="font-medium text-indigo-700 font-mono">alexrivera.dev</span>
                <span>•</span>
                <span>Bengaluru, India</span>
              </div>
            </header>

            {/* Document Body: Dense, structured academic/FAANG single-column layout */}
            <div className="space-y-1.5 sm:space-y-2 flex-1 mt-1.5 text-[7px] sm:text-[7.8px] md:text-[8.3px] leading-[1.28] sm:leading-[1.32] text-slate-900">
              
              {/* A. PROFESSIONAL SUMMARY */}
              <section>
                <h2 className="text-[7.8px] sm:text-[8.8px] md:text-[9.2px] font-bold text-black uppercase tracking-wider border-b border-black/80 pb-0.5 mb-0.5 font-serif">
                  Professional Summary
                </h2>
                <p className="text-slate-700 text-justify font-sans leading-tight">
                  Senior Software Engineer with 6+ years of expertise in building enterprise-grade backend services, distributed systems, and scalable REST APIs using Java and Spring Boot. Proven record in query optimization, microservices orchestration, and delivering high-throughput, fault-tolerant cloud platforms.
                </p>
              </section>

              {/* B. PROFESSIONAL EXPERIENCE (Two Detailed Positions) */}
              <section>
                <h2 className="text-[7.8px] sm:text-[8.8px] md:text-[9.2px] font-bold text-black uppercase tracking-wider border-b border-black/80 pb-0.5 mb-0.5 font-serif">
                  Professional Experience
                </h2>

                {/* Position 1 */}
                <div className="mb-1">
                  <div className="flex justify-between items-baseline font-sans text-[7.8px] sm:text-[8.5px]">
                    <span className="font-bold text-black">Senior Software Engineer — CloudScale Technologies</span>
                    <span className="font-serif italic text-slate-600">Bengaluru, India | 2022 – Present</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 mt-0.5 pl-0.5 text-slate-700 font-sans text-[6.8px] sm:text-[7.6px]">
                    <li>Architected core Java & Spring Boot microservices processing 25M+ daily requests with 99.99% uptime.</li>
                    <li>Designed low-latency RESTful APIs and distributed Kafka event pipelines across multi-region deployments.</li>
                    <li>Optimized complex PostgreSQL queries and integrated Redis caching, reducing p99 response times by 42%.</li>
                    <li>Standardized CI/CD automated test suites with JUnit, mentoring team members on clean system design.</li>
                  </ul>
                </div>

                {/* Position 2 */}
                <div>
                  <div className="flex justify-between items-baseline font-sans text-[7.8px] sm:text-[8.5px]">
                    <span className="font-bold text-black">Software Engineer — FinTech Solutions</span>
                    <span className="font-serif italic text-slate-600">Hyderabad, India | 2019 – 2022</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 mt-0.5 pl-0.5 text-slate-700 font-sans text-[6.8px] sm:text-[7.6px]">
                    <li>Developed high-volume transaction processing modules in Java, ensuring ACID compliance and zero loss.</li>
                    <li>Engineered secure authentication and RBAC authorization protocols leveraging Spring Security and JWT.</li>
                    <li>Integrated relational database schema migrations, resolved bottlenecks, and maintained 99.95% API reliability.</li>
                  </ul>
                </div>
              </section>

              {/* C. TECHNICAL SKILLS (Categorized Compact Lines) */}
              <section>
                <h2 className="text-[7.8px] sm:text-[8.8px] md:text-[9.2px] font-bold text-black uppercase tracking-wider border-b border-black/80 pb-0.5 mb-0.5 font-serif">
                  Technical Skills
                </h2>
                <div className="space-y-0.5 font-sans text-[6.8px] sm:text-[7.6px] text-slate-800">
                  <p>
                    <strong className="text-black font-semibold">Programming Languages:</strong> Java, JavaScript, Python, SQL
                  </p>
                  <p>
                    <strong className="text-black font-semibold">Frameworks & Libraries:</strong> Spring Boot, Hibernate, React, JUnit
                  </p>
                  <p>
                    <strong className="text-black font-semibold">Backend & Architecture:</strong> REST APIs, Microservices, Distributed Systems
                  </p>
                  <p>
                    <strong className="text-black font-semibold">Databases:</strong> PostgreSQL, MySQL, MongoDB, Redis
                  </p>
                  <p>
                    <strong className="text-black font-semibold">Tools & Platforms:</strong> Git, GitHub, Docker, Kubernetes, Maven, Linux
                  </p>
                  <p>
                    <strong className="text-black font-semibold">Core Concepts:</strong> Data Structures, Algorithms, OOP, DBMS, System Design
                  </p>
                </div>
              </section>

              {/* D. PROJECTS (Three Detailed Projects) */}
              <section>
                <h2 className="text-[7.8px] sm:text-[8.8px] md:text-[9.2px] font-bold text-black uppercase tracking-wider border-b border-black/80 pb-0.5 mb-0.5 font-serif">
                  Technical Projects
                </h2>
                <div className="space-y-1 font-sans text-[6.8px] sm:text-[7.6px] text-slate-800">
                  <div>
                    <div className="flex justify-between items-baseline font-bold text-black text-[7.2px] sm:text-[8px]">
                      <span>Distributed Order Management System</span>
                      <span className="font-normal font-mono text-[6.5px] sm:text-[7px] text-slate-600">Java, Spring Boot, Kafka, PostgreSQL</span>
                    </div>
                    <p className="text-slate-700 pl-1 text-justify">
                      • Built high-throughput backend with REST APIs, Kafka event ordering, and persistence ensuring sub-50ms latency.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline font-bold text-black text-[7.2px] sm:text-[8px]">
                      <span>Secure Identity & Access Service</span>
                      <span className="font-normal font-mono text-[6.5px] sm:text-[7px] text-slate-600">Spring Security, JWT, Redis, OAuth2</span>
                    </div>
                    <p className="text-slate-700 pl-1 text-justify">
                      • Implemented token-based authentication microservice with Redis session invalidation and role-based access control.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline font-bold text-black text-[7.2px] sm:text-[8px]">
                      <span>Real-Time Analytics Dashboard</span>
                      <span className="font-normal font-mono text-[6.5px] sm:text-[7px] text-slate-600">Java, WebSocket, React, Redis Pub/Sub</span>
                    </div>
                    <p className="text-slate-700 pl-1 text-justify">
                      • Engineered telemetry consumer streaming metrics via WebSocket channels to a reactive operational dashboard.
                    </p>
                  </div>
                </div>
              </section>

              {/* E. EDUCATION */}
              <section>
                <h2 className="text-[7.8px] sm:text-[8.8px] md:text-[9.2px] font-bold text-black uppercase tracking-wider border-b border-black/80 pb-0.5 mb-0.5 font-serif">
                  Education
                </h2>
                <div className="flex justify-between items-baseline font-sans text-[7.2px] sm:text-[8px]">
                  <span className="font-bold text-black">National Institute of Technology (NIT)</span>
                  <span className="font-serif italic text-slate-600">2015 – 2019</span>
                </div>
                <p className="font-sans text-[6.8px] sm:text-[7.6px] text-slate-700">
                  Bachelor of Technology in Computer Science and Engineering
                </p>
              </section>

              {/* F. CODING PROFILES */}
              <section>
                <h2 className="text-[7.8px] sm:text-[8.8px] md:text-[9.2px] font-bold text-black uppercase tracking-wider border-b border-black/80 pb-0.5 mb-0.5 font-serif">
                  Coding Profiles
                </h2>
                <p className="font-sans text-[6.8px] sm:text-[7.6px] text-slate-700">
                  <strong className="text-black">LeetCode:</strong> leetcode.com/alexrivera &nbsp;•&nbsp; <strong className="text-black">Codeforces:</strong> codeforces.com/alexrivera &nbsp;•&nbsp; <strong className="text-black">GitHub:</strong> github.com/alexrivera
                </p>
              </section>

              {/* G. ACHIEVEMENTS & CERTIFICATIONS */}
              <section className="pt-0.5">
                <h2 className="text-[7.8px] sm:text-[8.8px] md:text-[9.2px] font-bold text-black uppercase tracking-wider border-b border-black/80 pb-0.5 mb-0.5 font-serif">
                  Achievements & Certifications
                </h2>
                <p className="font-sans text-[6.8px] sm:text-[7.6px] text-slate-700">
                  • Backend Engineering Certification &nbsp;•&nbsp; Cloud Fundamentals Certification &nbsp;•&nbsp; Technical Project Recognition
                </p>
              </section>

            </div>

            {/* Document Footer */}
            <footer className="pt-1 border-t border-slate-300 flex justify-between items-center text-[6.5px] sm:text-[7.5px] text-slate-500 font-sans">
              <span>Standard 1-Page Layout</span>
              <span>100% ATS Verified</span>
            </footer>
          </article>
        </motion.div>
      </div>

      {/* 3. CONTINUOUS DIAGONAL COMPANY NAMES MARQUEE */}
      {/* Positioned directly beneath the resume's lower diagonal edge, aligned to the matching diagonal angle (28°) */}
      <div
        className="w-full max-w-xl -mt-2 sm:-mt-4 relative z-20 overflow-hidden"
        style={{
          transform: 'rotate(28deg)',
        }}
      >
        {/* Soft edge gradient fade to ensure elegant entry and exit */}
        <div
          className="relative w-full overflow-hidden py-1.5"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          }}
        >
          {/* Continuous scrolling marquee track */}
          <div
            className="flex items-center gap-12 sm:gap-14 w-max logo-strip-track"
            style={{
              willChange: 'transform',
            }}
          >
            {/* Repeated twice for seamless infinite continuous loop without jumps */}
            {[...COMPANIES, ...COMPANIES].map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex items-center gap-2.5 text-slate-300/70 hover:text-white transition-colors duration-200 shrink-0 select-none cursor-default group"
              >
                <div className="text-slate-400 group-hover:text-white transition-colors">
                  {company.logo}
                </div>
                <span className="text-[20px] sm:text-[22px] lg:text-[24px] font-semibold tracking-tight font-sans text-slate-200/70 group-hover:text-white transition-colors">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
